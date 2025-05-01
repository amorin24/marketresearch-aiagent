const helmet = require('helmet');

/**
 * Configure Helmet middleware for security headers
 * @param {Object} options - Helmet configuration options
 * @returns {Function} - Helmet middleware
 */
const configureHelmet = (options = {}) => {
  const defaultOptions = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'same-origin' }
  };

  return helmet({
    ...defaultOptions,
    ...options
  });
};

module.exports = configureHelmet;
