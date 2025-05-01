/**
 * Error handling utility for the Market Research AI Agent Testing Platform
 * Provides standardized error classes and error handling functions
 */

const { logger } = require('../index');

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
  constructor(message) {
    super(message, 502);
    this.name = 'ExternalServiceError';
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
  let statusCode = err.statusCode || 500;
  let errorName = err.name || 'Error';
  
  logger.error(`${errorName}: ${err.message}\n${err.stack}`);
  
  if (!(err instanceof AppError)) {
    const message = err.message || 'Internal Server Error';
    err = new AppError(message, statusCode);
  }
  
  const sanitizedMessage = sanitizeErrorMessage(err);
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: sanitizedMessage,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
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

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ServiceUnavailableError,
  ExternalServiceError,
  asyncHandler,
  sanitizeErrorMessage,
  globalErrorHandler,
  validateRequest
};
