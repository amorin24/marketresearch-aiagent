const express = require('express');
const router = express.Router();
const configService = require('../services/configService');
const { 
  asyncHandler, 
  ValidationError 
} = require('../utils/errorHandler');

router.get('/scoring', asyncHandler(async (req, res) => {
  const config = await configService.getScoringConfig();
  res.json(config);
}));

router.put('/scoring', asyncHandler(async (req, res) => {
  const { weights } = req.body;
  
  if (!weights) {
    throw new ValidationError('Weights must be specified');
  }
  
  const updatedConfig = await configService.updateScoringConfig(weights);
  res.json(updatedConfig);
}));

router.get('/datasources', asyncHandler(async (req, res) => {
  const config = await configService.getDataSourceConfig();
  res.json(config);
}));

router.put('/datasources', asyncHandler(async (req, res) => {
  const { sources } = req.body;
  
  if (!sources) {
    throw new ValidationError('Sources must be specified');
  }
  
  const updatedConfig = await configService.updateDataSourceConfig(sources);
  res.json(updatedConfig);
}));

module.exports = router;
