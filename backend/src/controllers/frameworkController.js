const express = require('express');
const router = express.Router();
const frameworkService = require('../services/frameworkService');
const { 
  asyncHandler, 
  NotFoundError, 
  ValidationError 
} = require('../utils/errorHandler');

router.get('/', asyncHandler(async (req, res) => {
  const frameworks = await frameworkService.getAvailableFrameworks();
  res.json(frameworks);
}));

router.get('/:name', asyncHandler(async (req, res) => {
  const framework = await frameworkService.getFrameworkDetails(req.params.name);
  if (!framework) {
    throw new NotFoundError('Framework not found');
  }
  res.json(framework);
}));

router.get('/:name/performance', asyncHandler(async (req, res) => {
  const metrics = await frameworkService.getFrameworkPerformance(req.params.name);
  if (!metrics) {
    throw new NotFoundError('Framework metrics not found');
  }
  res.json(metrics);
}));

router.post('/compare', asyncHandler(async (req, res) => {
  const { frameworks } = req.body;
  
  if (!frameworks || !Array.isArray(frameworks) || frameworks.length < 2) {
    throw new ValidationError('At least two frameworks must be specified for comparison');
  }
  
  const comparison = await frameworkService.compareFrameworks(frameworks);
  res.json(comparison);
}));

router.post('/benchmark', asyncHandler(async (req, res) => {
  const { frameworks, testCases } = req.body;
  
  if (!frameworks || !Array.isArray(frameworks) || frameworks.length < 1) {
    throw new ValidationError('At least one framework must be specified for benchmarking');
  }
  
  if (!testCases || !Array.isArray(testCases) || testCases.length < 1) {
    throw new ValidationError('At least one test case must be provided for benchmarking');
  }
  
  const benchmarkResults = await frameworkService.benchmarkFrameworks(frameworks, testCases);
  res.json(benchmarkResults);
}));

module.exports = router;
