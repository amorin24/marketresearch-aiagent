const express = require('express');
const router = express.Router();
const companyService = require('../services/companyService');
const { 
  asyncHandler, 
  NotFoundError, 
  ValidationError 
} = require('../utils/errorHandler');

router.get('/', asyncHandler(async (req, res) => {
  const companies = await companyService.getAllCompanies();
  res.json(companies);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyById(req.params.id);
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  res.json(company);
}));

router.post('/discover', asyncHandler(async (req, res) => {
  const { framework, parameters } = req.body;
  
  if (!framework) {
    throw new ValidationError('Framework must be specified');
  }
  
  const jobId = await companyService.startDiscovery(framework, parameters);
  res.json({ jobId, status: 'discovery_started' });
}));

router.get('/discover/:jobId', asyncHandler(async (req, res) => {
  const status = await companyService.getDiscoveryStatus(req.params.jobId);
  if (!status) {
    throw new NotFoundError('Discovery job not found');
  }
  res.json(status);
}));

router.get('/export/:format', asyncHandler(async (req, res) => {
  const format = req.params.format.toLowerCase();
  
  if (!['json', 'csv'].includes(format)) {
    throw new ValidationError('Format must be either JSON or CSV');
  }
  
  const data = await companyService.exportCompanies(format);
  
  if (format === 'json') {
    res.json(data);
  } else {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=companies.csv');
    res.send(data);
  }
}));

router.post('/research-company', asyncHandler(async (req, res) => {
  const { companyName, frameworks, email } = req.body;
  
  if (!companyName) {
    throw new ValidationError('Company name must be specified');
  }
  
  if (!frameworks || !Array.isArray(frameworks) || frameworks.length === 0) {
    throw new ValidationError('At least one framework must be specified');
  }
  
  const jobId = await companyService.startCompanyResearch(companyName, frameworks, email);
  res.json({ jobId, status: 'research_started' });
}));

router.get('/research-company/:jobId', asyncHandler(async (req, res) => {
  const status = await companyService.getCompanyResearchStatus(req.params.jobId);
  if (!status) {
    throw new NotFoundError('Research job not found');
  }
  res.json(status);
}));

module.exports = router;
