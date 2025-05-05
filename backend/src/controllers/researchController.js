const express = require('express');
const router = express.Router();
const researchOrchestrator = require('../services/researchOrchestrator');
const benchmarkService = require('../services/benchmarkService');
const { 
  asyncHandler, 
  ValidationError 
} = require('../utils/errorHandler');

router.post('/parallel', asyncHandler(async (req, res) => {
  const { companyName, frameworks, options } = req.body;
  
  if (!companyName) {
    throw new ValidationError('Company name is required');
  }
  
  if (!frameworks || !Array.isArray(frameworks) || frameworks.length === 0) {
    throw new ValidationError('At least one framework must be specified');
  }
  
  const researchJob = await researchOrchestrator.executeParallelResearch(
    companyName,
    frameworks,
    options || {}
  );
  
  res.json(researchJob);
}));

router.post('/sequential', asyncHandler(async (req, res) => {
  const { companyName, frameworks, options } = req.body;
  
  if (!companyName) {
    throw new ValidationError('Company name is required');
  }
  
  if (!frameworks || !Array.isArray(frameworks) || frameworks.length === 0) {
    throw new ValidationError('At least one framework must be specified');
  }
  
  const researchJob = await researchOrchestrator.executeSequentialResearch(
    companyName,
    frameworks,
    options || {}
  );
  
  res.json(researchJob);
}));

router.post('/benchmark', asyncHandler(async (req, res) => {
  const { frameworks, testCases } = req.body;
  
  if (!frameworks || !Array.isArray(frameworks) || frameworks.length === 0) {
    throw new ValidationError('At least one framework must be specified');
  }
  
  const benchmarkResults = await benchmarkService.runBenchmark(
    frameworks,
    testCases || null
  );
  
  res.json(benchmarkResults);
}));

router.get('/benchmark/testcases', asyncHandler(async (req, res) => {
  const testCases = await benchmarkService.getTestCases();
  res.json(testCases);
}));

module.exports = router;
