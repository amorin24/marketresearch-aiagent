/**
 * Error handling utility for the Market Research AI Agent Testing Platform
 * Provides standardized error classes and error handling functions
 */

const winston = require('winston');
const localLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

/**
 * Base error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for invalid input data
 */
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Error for resource not found
 */
class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Error for unauthorized access
 */
class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error for forbidden access
 */
class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Error for service unavailable
 */
class ServiceUnavailableError extends AppError {
  constructor(message) {
    super(message, 503);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Error for external service failures
 */
class ExternalServiceError extends AppError {
  constructor(message, statusCode = 502) {
    super(message, statusCode);
    this.name = 'ExternalServiceError';
  }
}

/**
 * Error for rate limiting from external services
 */
class RateLimitError extends ExternalServiceError {
  constructor(message, retryAfter = null) {
    super(message, 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Handles errors in async functions
 * @param {Function} fn - Async function to handle errors for
 * @returns {Function} - Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Sanitizes error messages for production environment
 * @param {Error} err - Error object
 * @returns {string} - Sanitized error message
 */
const sanitizeErrorMessage = (err) => {
  if (process.env.NODE_ENV === 'production') {
    if (err.statusCode === 500) {
      return 'An unexpected error occurred';
    } else if (err.statusCode === 404) {
      return 'Resource not found';
    } else if (err.statusCode === 400) {
      return 'Invalid request parameters';
    } else if (err.statusCode === 401) {
      return 'Authentication required';
    } else if (err.statusCode === 403) {
      return 'Access forbidden';
    } else if (err.statusCode === 503 || err.statusCode === 502) {
      return 'Service temporarily unavailable';
    }
    return 'An error occurred';
  }
  
  return err.message;
};

/**
 * Global error handler middleware for Express
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (err, req, res, next) => {
  if (!err) {
    err = new Error('Unknown error occurred');
  }
  
  if (req.url.includes('/api/companies/discover/') && req.url.includes('undefined')) {
    err = new ValidationError('Invalid job ID: undefined is not a valid job identifier');
  }
  
  let statusCode = err.statusCode || 500;
  let errorName = err.name || 'Error';
  
  try {
    localLogger.error(`${errorName}: ${err.message || 'Unknown error'}\n${err.stack || 'No stack trace available'}`);
  } catch (logError) {
    console.error('Error in error logger:', logError);
    console.error('Original error:', err);
  }
  
  if (!(err instanceof AppError)) {
    // Check for rate limiting errors from external services
    if (err.message && (
      err.message.includes('rate limit') || 
      err.message.includes('too many requests') || 
      err.message.toLowerCase().includes('429')
    )) {
      err = new RateLimitError(
        'Rate limit exceeded. Please try again later.',
        err.headers?.['retry-after'] || null
      );
    } else {
      const message = err.message || 'Internal Server Error';
      err = new AppError(message, statusCode);
    }
  }
  
  const sanitizedMessage = sanitizeErrorMessage(err);
  
  const responseBody = {
    status: 'error',
    statusCode: err.statusCode,
    message: sanitizedMessage,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  };
  
  if (err instanceof RateLimitError && err.retryAfter) {
    res.set('Retry-After', err.retryAfter);
    responseBody.retryAfter = err.retryAfter;
  }
  
  res.status(err.statusCode).json(responseBody);
};

/**
 * Validates request data against a schema
 * @param {Object} schema - Joi schema
 * @param {string} property - Request property to validate (body, params, query)
 * @returns {Function} - Express middleware function
 */
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    if (!schema) return next();
    
    const { error, value } = schema.validate(req[property]);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new ValidationError(message));
    }
    
    req[property] = value;
    next();
  };
};

/**
 * Handle API key validation errors more descriptively
 * @param {string} key - The API key to validate
 * @param {string} service - The service name (e.g., 'OpenAI')
 * @returns {string|null} - Error message if validation fails, null otherwise
 */
const validateApiKey = (key, service) => {
  if (!key) return `No ${service} API key provided`;
  if (key.includes('your') || key.includes('actual') || key.includes('goes-here')) 
    return `Invalid ${service} API key: placeholder detected`;
  if (service === 'OpenAI' && !key.startsWith('sk-')) 
    return `Invalid OpenAI API key format: should start with 'sk-'`;
  return null;
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ServiceUnavailableError,
  ExternalServiceError,
  RateLimitError,
  asyncHandler,
  sanitizeErrorMessage,
  globalErrorHandler,
  validateRequest,
  validateApiKey
};
