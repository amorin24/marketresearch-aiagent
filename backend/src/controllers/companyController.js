const express = require('express');
const router = express.Router();
const companyService = require('../services/companyService');
const { 
  asyncHandler, 
  NotFoundError, 
  ValidationError 
} = require('../utils/errorHandler');
const companyValidation = require('../middleware/validation/companyValidation');
const { validateRequest } = require('../middleware/security/inputValidation');

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

router.post('/discover', 
  companyValidation.discover,
  validateRequest(),
  asyncHandler(async (req, res) => {
    const { framework, parameters } = req.body;
    const jobId = await companyService.startDiscovery(framework, parameters);
    res.json({ jobId, status: 'discovery_started' });
  })
);

router.get('/discover/:jobId', 
  companyValidation.getDiscoveryStatus,
  validateRequest(),
  asyncHandler(async (req, res) => {
    const status = await companyService.getDiscoveryStatus(req.params.jobId);
    if (!status) {
      throw new NotFoundError('Discovery job not found');
    }
    res.json(status);
  })
);

router.get('/export/:format', 
  companyValidation.exportCompanies,
  validateRequest(),
  asyncHandler(async (req, res) => {
    const format = req.params.format.toLowerCase();
    const data = await companyService.exportCompanies(format);
    
    if (format === 'json') {
      res.json(data);
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=companies.csv');
      res.send(data);
    }
  })
);

router.post('/research-company', 
  companyValidation.researchCompany,
  validateRequest(),
  asyncHandler(async (req, res) => {
    const { companyName, frameworks, email } = req.body;
    const jobId = await companyService.startCompanyResearch(companyName, frameworks, email);
    res.json({ jobId, status: 'research_started' });
  })
);

router.get('/research-company/:jobId', 
  companyValidation.getResearchStatus,
  validateRequest(),
  asyncHandler(async (req, res) => {
    const status = await companyService.getCompanyResearchStatus(req.params.jobId);
    if (!status) {
      throw new NotFoundError('Research job not found');
    }
    res.json(status);
  })
);

module.exports = router;
