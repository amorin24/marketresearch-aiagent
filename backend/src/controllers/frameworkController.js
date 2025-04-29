const express = require('express');
const router = express.Router();
const frameworkService = require('../services/frameworkService');
const { logger } = require('../index');

router.get('/', async (req, res) => {
  try {
    const frameworks = await frameworkService.getAvailableFrameworks();
    res.json(frameworks);
  } catch (error) {
    logger.error(`Error fetching frameworks: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch frameworks' });
  }
});

router.get('/:name', async (req, res) => {
  try {
    const framework = await frameworkService.getFrameworkDetails(req.params.name);
    if (!framework) {
      return res.status(404).json({ error: 'Framework not found' });
    }
    res.json(framework);
  } catch (error) {
    logger.error(`Error fetching framework ${req.params.name}: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch framework details' });
  }
});

router.get('/:name/performance', async (req, res) => {
  try {
    const metrics = await frameworkService.getFrameworkPerformance(req.params.name);
    if (!metrics) {
      return res.status(404).json({ error: 'Framework metrics not found' });
    }
    res.json(metrics);
  } catch (error) {
    logger.error(`Error fetching framework metrics for ${req.params.name}: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch framework performance metrics' });
  }
});

router.post('/compare', async (req, res) => {
  try {
    const { frameworks } = req.body;
    if (!frameworks || !Array.isArray(frameworks) || frameworks.length < 2) {
      return res.status(400).json({ error: 'At least two frameworks must be specified for comparison' });
    }
    
    const comparison = await frameworkService.compareFrameworks(frameworks);
    res.json(comparison);
  } catch (error) {
    logger.error(`Error comparing frameworks: ${error.message}`);
    res.status(500).json({ error: 'Failed to compare frameworks' });
  }
});

module.exports = router;
