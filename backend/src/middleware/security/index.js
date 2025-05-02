/**
 * Security middleware index file
 * Exports all security middleware for easy import
 */

const configureCors = require('./corsConfig');
const configureRateLimit = require('./rateLimiter');
const configureHelmet = require('./helmetConfig');
const { validateRequest } = require('./inputValidation');

module.exports = {
  configureCors,
  configureRateLimit,
  configureHelmet,
  validateRequest
};
