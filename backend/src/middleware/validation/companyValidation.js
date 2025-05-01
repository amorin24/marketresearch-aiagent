const { body, param } = require('express-validator');

/**
 * Validation rules for company-related endpoints
 */
const companyValidation = {
  discover: [
    body('framework')
      .notEmpty().withMessage('Framework must be specified')
      .isString().withMessage('Framework must be a string'),
    body('parameters')
      .optional()
      .isObject().withMessage('Parameters must be an object'),
    body('email')
      .optional()
      .isEmail().withMessage('Invalid email format')
  ],
  
  getDiscoveryStatus: [
    param('jobId')
      .notEmpty().withMessage('Job ID is required')
      .isString().withMessage('Job ID must be a string')
  ],
  
  exportCompanies: [
    param('format')
      .notEmpty().withMessage('Format is required')
      .isIn(['json', 'csv']).withMessage('Format must be either JSON or CSV')
  ],
  
  researchCompany: [
    body('companyName')
      .notEmpty().withMessage('Company name must be specified')
      .isString().withMessage('Company name must be a string')
      .trim(),
    body('frameworks')
      .notEmpty().withMessage('At least one framework must be specified')
      .isArray().withMessage('Frameworks must be an array')
      .custom(value => value.length > 0).withMessage('At least one framework must be specified'),
    body('email')
      .optional()
      .isEmail().withMessage('Invalid email format')
  ],
  
  getResearchStatus: [
    param('jobId')
      .notEmpty().withMessage('Job ID is required')
      .isString().withMessage('Job ID must be a string')
  ]
};

module.exports = companyValidation;
