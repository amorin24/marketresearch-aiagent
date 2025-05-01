const { validationResult } = require('express-validator');
const { ValidationError } = require('../../utils/errorHandler');

/**
 * Middleware to validate request data
 * @returns {Function} - Express middleware
 */
const validateRequest = () => {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError('Validation failed', errors.array()));
    }
    next();
  };
};

module.exports = {
  validateRequest
};
