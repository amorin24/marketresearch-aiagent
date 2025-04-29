const express = require('express');
const router = express.Router();
const configService = require('../services/configService');
const { logger } = require('../index');

router.get('/scoring', async (req, res) => {
  try {
    const config = await configService.getScoringConfig();
    res.json(config);
  } catch (error) {
    logger.error(`Error fetching scoring config: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch scoring configuration' });
  }
});

router.put('/scoring', async (req, res) => {
  try {
    const { weights } = req.body;
    if (!weights) {
      return res.status(400).json({ error: 'Weights must be specified' });
    }
    
    const updatedConfig = await configService.updateScoringConfig(weights);
    res.json(updatedConfig);
  } catch (error) {
    logger.error(`Error updating scoring config: ${error.message}`);
    res.status(500).json({ error: 'Failed to update scoring configuration' });
  }
});

router.get('/datasources', async (req, res) => {
  try {
    const config = await configService.getDataSourceConfig();
    res.json(config);
  } catch (error) {
    logger.error(`Error fetching data source config: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch data source configuration' });
  }
});

router.put('/datasources', async (req, res) => {
  try {
    const { sources } = req.body;
    if (!sources) {
      return res.status(400).json({ error: 'Sources must be specified' });
    }
    
    const updatedConfig = await configService.updateDataSourceConfig(sources);
    res.json(updatedConfig);
  } catch (error) {
    logger.error(`Error updating data source config: ${error.message}`);
    res.status(500).json({ error: 'Failed to update data source configuration' });
  }
});

module.exports = router;
