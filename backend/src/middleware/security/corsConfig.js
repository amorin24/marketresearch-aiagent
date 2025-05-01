const cors = require('cors');

/**
 * Configure CORS with proper origin restrictions
 * @param {Object} options - CORS configuration options
 * @returns {Function} - CORS middleware
 */
const configureCors = (options = {}) => {
  const defaultOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
  };

  return cors({
    ...defaultOptions,
    ...options
  });
};

module.exports = configureCors;
