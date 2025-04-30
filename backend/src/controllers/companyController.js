const express = require('express');
const router = express.Router();
const companyService = require('../services/companyService');
const { logger } = require('../index');

router.get('/', async (req, res) => {
  try {
    const companies = await companyService.getAllCompanies();
    res.json(companies);
  } catch (error) {
    logger.error(`Error fetching companies: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const company = await companyService.getCompanyById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    logger.error(`Error fetching company ${req.params.id}: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

router.post('/discover', async (req, res) => {
  try {
    const { framework, parameters } = req.body;
    if (!framework) {
      return res.status(400).json({ error: 'Framework must be specified' });
    }
    
    const jobId = await companyService.startDiscovery(framework, parameters);
    res.json({ jobId, status: 'discovery_started' });
  } catch (error) {
    logger.error(`Error starting discovery: ${error.message}`);
    res.status(500).json({ error: 'Failed to start discovery' });
  }
});

router.get('/discover/:jobId', async (req, res) => {
  try {
    const status = await companyService.getDiscoveryStatus(req.params.jobId);
    res.json(status);
  } catch (error) {
    logger.error(`Error fetching discovery status: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch discovery status' });
  }
});

router.get('/export/:format', async (req, res) => {
  try {
    const format = req.params.format.toLowerCase();
    if (!['json', 'csv'].includes(format)) {
      return res.status(400).json({ error: 'Format must be either JSON or CSV' });
    }
    
    const data = await companyService.exportCompanies(format);
    
    if (format === 'json') {
      res.json(data);
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=companies.csv');
      res.send(data);
    }
  } catch (error) {
    logger.error(`Error exporting companies: ${error.message}`);
    res.status(500).json({ error: 'Failed to export companies' });
  }
});

router.post('/research-company', async (req, res) => {
  try {
    const { companyName, frameworks } = req.body;
    if (!companyName) {
      return res.status(400).json({ error: 'Company name must be specified' });
    }
    
    if (!frameworks || !Array.isArray(frameworks) || frameworks.length === 0) {
      return res.status(400).json({ error: 'At least one framework must be specified' });
    }
    
    const jobId = await companyService.startCompanyResearch(companyName, frameworks);
    res.json({ jobId, status: 'research_started' });
  } catch (error) {
    logger.error(`Error starting company research: ${error.message}`);
    res.status(500).json({ error: 'Failed to start company research' });
  }
});

router.get('/research-company/:jobId', async (req, res) => {
  try {
    const status = await companyService.getCompanyResearchStatus(req.params.jobId);
    res.json(status);
  } catch (error) {
    logger.error(`Error fetching company research status: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch company research status' });
  }
});

module.exports = router;
