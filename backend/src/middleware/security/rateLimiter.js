const rateLimit = require('express-rate-limit');

/**
 * Configure rate limiting to prevent API abuse
 * @param {Object} options - Rate limiting configuration options
 * @returns {Function} - Rate limiting middleware
 */
const configureRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      status: 'error',
      message: 'Too many requests from this IP, please try again later'
    }
  };

  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

module.exports = configureRateLimit;
