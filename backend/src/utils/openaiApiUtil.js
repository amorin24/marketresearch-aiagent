/**
 * OpenAI API utility module
 * 
 * Provides functions for making OpenAI API requests with retry logic
 * and handling rate limiting (429) errors.
 * 
 * Security features:
 * - API key validation with format checking
 * - Sensitive information masking in logs
 * - Secure environment variable handling
 * - Rate limit handling with exponential backoff
 */

const axios = require('axios');
const pRetry = require('p-retry');
const winston = require('winston');
const { validateApiKey, RateLimitError } = require('./errorHandler');

const maskSensitiveInfo = winston.format((info) => {
  if (info.message && typeof info.message === 'string') {
    info.message = info.message.replace(
      /(Bearer\s+)[a-zA-Z0-9_.-]{5,}/g, 
      '$1sk-***REDACTED***'
    );
    
    info.message = info.message.replace(
      /(apiKey|key|token|password|secret)(\s*[:=]\s*)["']?[a-zA-Z0-9_.-]{5,}["']?/gi,
      '$1$2"***REDACTED***"'
    );
  }
  return info;
});

const defaultLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    maskSensitiveInfo(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: process.env.OPENAI_LOG_FILE || 'openai-api.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

const getEnvVar = (name, defaultValue, parser = (val) => val) => {
  const value = process.env[name];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  try {
    return parser(value);
  } catch (error) {
    defaultLogger.warn(`Error parsing environment variable ${name}: ${error.message}`);
    return defaultValue;
  }
};

const DEFAULT_RETRY_COUNT = getEnvVar('OPENAI_MAX_RETRIES', 3, (val) => parseInt(val, 10));
const DEFAULT_EXPONENTIAL_BACKOFF_FACTOR = getEnvVar('OPENAI_BACKOFF_FACTOR', 2, (val) => parseInt(val, 10));
const DEFAULT_INITIAL_DELAY_MS = getEnvVar('OPENAI_INITIAL_RETRY_DELAY', 1000, (val) => parseInt(val, 10));

/**
 * Make an OpenAI API request with retry logic for rate limiting
 * 
 * @param {Object} options - Request options
 * @param {string} options.endpoint - OpenAI API endpoint (e.g., '/v1/chat/completions')
 * @param {Object} options.data - Request data
 * @param {string} options.apiKey - OpenAI API key
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelayMs - Initial delay in milliseconds before retrying (default: 1000)
 * @param {string} options.frameworkName - Name of the framework making the request
 * 
 * @returns {Promise<Object>} - API response or error
 */
/**
 * Enhanced OpenAI API request function with improved security and error handling
 * 
 * @param {Object} options - Request options
 * @param {string} options.endpoint - OpenAI API endpoint (e.g., '/v1/chat/completions')
 * @param {Object} options.data - Request data
 * @param {string} options.apiKey - OpenAI API key
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelayMs - Initial delay in milliseconds before retrying (default: 1000)
 * @param {string} options.frameworkName - Name of the framework making the request
 * @param {Object} options.logger - Custom logger instance
 * 
 * @returns {Promise<Object>} - API response or error
 */
const makeOpenAIRequest = async ({
  endpoint,
  data,
  apiKey,
  maxRetries = DEFAULT_RETRY_COUNT,
  initialDelayMs = DEFAULT_INITIAL_DELAY_MS,
  frameworkName,
  logger = defaultLogger
}) => {
  // Enhanced API key validation with format checking
  if (!apiKey || typeof apiKey !== 'string') {
    const error = 'OpenAI API key is missing or invalid';
    logger.error(`${error} for ${frameworkName || 'unknown framework'}`);
    return { success: false, error };
  }
  
  if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
    const error = 'OpenAI API key has invalid format (should start with sk- and be at least 20 chars)';
    logger.error(`${error} for ${frameworkName || 'unknown framework'}`);
    return { success: false, error };
  }
  
  const apiKeyError = validateApiKey(apiKey, 'OpenAI');
  if (apiKeyError) {
    logger.warn(`${apiKeyError} for ${frameworkName || 'Framework'}`);
    return { success: false, error: apiKeyError };
  }

  const baseURL = 'https://api.openai.com';
  const fullUrl = `${baseURL}${endpoint}`;
  
  const sanitizedData = { ...data };
  if (sanitizedData.messages) {
    sanitizedData.messages = sanitizedData.messages.map(msg => ({
      ...msg,
      content: msg.content ? `${msg.content.substring(0, 50)}...` : '[empty]'
    }));
  }
  
  const makeRequest = async (attempt) => {
    try {
      logger.info({
        message: `Making OpenAI API call to ${endpoint} (attempt ${attempt}) for ${frameworkName || 'unknown framework'}`,
        endpoint,
        attempt,
        framework: frameworkName,
        dataSize: JSON.stringify(data).length
      });
      
      const response = await axios.post(fullUrl, data, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MarketResearch-AIAgent/1.0'
        },
        timeout: 30000 // 30 second timeout
      });
      
      logger.info(`OpenAI API call succeeded after ${attempt} attempt(s)`);
      return response;
    } catch (error) {
      const status = error.response?.status;

      if (status === 429) {
        const headers = error.response?.headers || {};
        const resetTime = headers['ratelimit-reset'];
        const retryAfter = headers['retry-after'] || '60';
        const retryAfterSeconds = parseInt(retryAfter, 10) || 60;
        
        logger.warn({
          message: `Rate limit (429) from OpenAI API on attempt ${attempt}`,
          retryAfter: retryAfterSeconds,
          resetTime: resetTime ? new Date(resetTime * 1000).toISOString() : 'unknown'
        });
        
        error.retryAfterSeconds = retryAfterSeconds;
        throw error;
      }
      
      if (status >= 400 && status < 500 && status !== 429) {
        const errorBody = error.response?.data || {};
        const errorMessage = errorBody.error?.message || error.message;
        
        logger.error({
          message: `OpenAI API client error ${status}: ${errorMessage}`,
          status,
          errorType: errorBody.error?.type || 'unknown',
          errorCode: errorBody.error?.code || 'unknown'
        });
        
        const retriableClientErrors = ['insufficient_quota', 'rate_limit_exceeded'];
        if (!retriableClientErrors.includes(errorBody.error?.type)) {
          error.shouldAbort = true;
        }
        
        throw error;
      }
      
      if (status >= 500) {
        logger.warn(`OpenAI API server error (${status}): ${error.message}. Retrying...`);
        throw error;
      }
      
      logger.warn(`OpenAI API network error: ${error.message}. Retrying...`);
      throw error;
    }
  };

  try {
    const response = await pRetry(makeRequest, {
      retries: maxRetries,
      minTimeout: initialDelayMs,
      factor: DEFAULT_EXPONENTIAL_BACKOFF_FACTOR,
      onFailedAttempt: async (error) => {
        if (error.shouldAbort) {
          throw new pRetry.AbortError(error);
        }
        
        const { attemptNumber, retriesLeft } = error;
        
        if (error.retryAfterSeconds && error.response?.status === 429) {
          const retryMs = error.retryAfterSeconds * 1000;
          error.nextTimeout = retryMs;
          logger.warn(
            `Rate limit encountered. Waiting ${error.retryAfterSeconds} seconds before retry. ` +
            `${retriesLeft} retries left.`
          );
        } else {
          logger.warn(
            `OpenAI API call attempt ${attemptNumber} failed. ${retriesLeft} retries left. ` +
            `Waiting ${Math.round(error.nextTimeout / 1000)} seconds...`
          );
        }
        
        if (retriesLeft === 0) {
          logger.error(`All ${maxRetries} retries to OpenAI API failed.`);
        }
      }
    });
    
    return { success: true, response };
  } catch (error) {
    const errorResponse = error.response?.data || {};
    const errorType = errorResponse.error?.type || 'unknown';
    const errorCode = errorResponse.error?.code || 'unknown';
    const message = errorResponse.error?.message || error.message || 'Unknown error in OpenAI API call';
    
    logger.error({
      message: `OpenAI API request ultimately failed: ${message}`,
      errorType,
      errorCode,
      status: error.response?.status || 'network_error'
    });
    
    return { 
      success: false, 
      error: message,
      errorType,
      errorCode,
      status: error.response?.status
    };
  }
};

module.exports = {
  makeOpenAIRequest
};
