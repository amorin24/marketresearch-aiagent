/**
 * OpenAI API utility module
 * 
 * Provides functions for making OpenAI API requests with retry logic
 * and handling rate limiting (429) errors.
 */

const axios = require('axios');
const pRetry = require('p-retry');
const winston = require('winston');
const { validateApiKey } = require('./errorHandler');

const defaultLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'openai-api.log' })
  ]
});

const DEFAULT_RETRY_COUNT = parseInt(process.env.OPENAI_MAX_RETRIES || '3', 10);
const DEFAULT_EXPONENTIAL_BACKOFF_FACTOR = 2;
const DEFAULT_INITIAL_DELAY_MS = parseInt(process.env.OPENAI_INITIAL_RETRY_DELAY || '1000', 10);

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
const makeOpenAIRequest = async ({
  endpoint,
  data,
  apiKey,
  maxRetries = DEFAULT_RETRY_COUNT,
  initialDelayMs = DEFAULT_INITIAL_DELAY_MS,
  frameworkName,
  logger = defaultLogger
}) => {
  const apiKeyError = validateApiKey(apiKey, 'OpenAI');
  if (apiKeyError) {
    logger.warn(`${apiKeyError}. ${frameworkName || 'Framework'} will fall back to mock implementation.`);
    return { success: false, error: apiKeyError };
  }

  const baseURL = 'https://api.openai.com';
  const fullUrl = `${baseURL}${endpoint}`;
  
  const makeRequest = async (attempt) => {
    try {
      logger.info(`Making OpenAI API call to ${endpoint} (attempt ${attempt}) for ${frameworkName || 'unknown framework'}`);
      
      const response = await axios.post(fullUrl, data, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      logger.info(`OpenAI API call succeeded after ${attempt} attempt(s)`);
      return response;
    } catch (error) {
      const status = error.response?.status;

      if (status === 429) {
        logger.warn(`Rate limit (429) from OpenAI API on attempt ${attempt}`);
        
        if (error.response?.headers) {
          const resetTime = error.response.headers['ratelimit-reset'];
          const retryAfter = error.response.headers['retry-after'];
          
          if (resetTime) {
            logger.info(`Rate limit resets at: ${new Date(resetTime * 1000).toISOString()}`);
          }
          if (retryAfter) {
            logger.info(`Retry-After header suggests waiting ${retryAfter} seconds`);
          }
        }
        
        throw error;
      }
      
      if (status >= 400 && status < 500 && status !== 429) {
        logger.error(`OpenAI API returned error ${status}: ${error.message}`);
        error.shouldAbort = true;
        throw error;
      }
      
      logger.warn(`OpenAI API call failed with ${error.message}. Retrying...`);
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
        logger.warn(
          `OpenAI API call attempt ${attemptNumber} failed. ${retriesLeft} retries left. ` +
          `Waiting ${Math.round(error.nextTimeout / 1000)} seconds...`
        );
        
        if (retriesLeft === 0) {
          logger.error(`All ${maxRetries} retries to OpenAI API failed. Falling back to mock implementation.`);
        }
      }
    });
    
    return { success: true, response };
  } catch (error) {
    const message = error.message || 'Unknown error in OpenAI API call';
    logger.error(`OpenAI API request ultimately failed: ${message}`);
    return { success: false, error: message };
  }
};

module.exports = {
  makeOpenAIRequest
};
