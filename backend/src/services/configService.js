const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../index');
const { 
  ValidationError, 
  ServiceUnavailableError 
} = require('../utils/errorHandler');

const SCORING_CONFIG_PATH = path.join(__dirname, '../config/scoring.json');
const DATA_SOURCE_CONFIG_PATH = path.join(__dirname, '../config/datasources.json');

const DEFAULT_DATA_SOURCE_CONFIG = {
  sources: {
    crunchbase: {
      enabled: true,
      weight: 1.0
    },
    techcrunch: {
      enabled: true,
      weight: 1.0
    },
    linkedin: {
      enabled: true,
      weight: 1.0
    },
    angellist: {
      enabled: true,
      weight: 1.0
    },
    news: {
      enabled: true,
      weight: 1.0
    }
  }
};

/**
 * Get scoring configuration
 * @returns {Object} Scoring configuration
 */
const getScoringConfig = async () => {
  try {
    const data = await fs.readFile(SCORING_CONFIG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error(`Error reading scoring config: ${error.message}`);
    throw new ServiceUnavailableError('Failed to read scoring configuration');
  }
};

/**
 * Update scoring configuration
 * @param {Object} weights - Updated weights
 * @returns {Object} Updated scoring configuration
 */
const updateScoringConfig = async (weights) => {
  try {
    const config = await getScoringConfig();
    
    const updatedConfig = {
      ...config,
      weights: {
        ...config.weights,
        ...weights
      }
    };
    
    const sum = Object.values(updatedConfig.weights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1) > 0.001) {
      throw new ValidationError(`Weights must sum to 1, got ${sum}`);
    }
    
    await fs.writeFile(SCORING_CONFIG_PATH, JSON.stringify(updatedConfig, null, 2), 'utf8');
    
    return updatedConfig;
  } catch (error) {
    logger.error(`Error updating scoring config: ${error.message}`);
    throw new ServiceUnavailableError('Failed to update scoring configuration');
  }
};

/**
 * Get data source configuration
 * @returns {Object} Data source configuration
 */
const getDataSourceConfig = async () => {
  try {
    try {
      const data = await fs.readFile(DATA_SOURCE_CONFIG_PATH, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.writeFile(DATA_SOURCE_CONFIG_PATH, JSON.stringify(DEFAULT_DATA_SOURCE_CONFIG, null, 2), 'utf8');
        return DEFAULT_DATA_SOURCE_CONFIG;
      }
      throw new ServiceUnavailableError('Failed to access data source configuration file');
    }
  } catch (error) {
    logger.error(`Error reading data source config: ${error.message}`);
    throw new ServiceUnavailableError('Failed to read data source configuration');
  }
};

/**
 * Update data source configuration
 * @param {Object} sources - Updated sources
 * @returns {Object} Updated data source configuration
 */
const updateDataSourceConfig = async (sources) => {
  try {
    const config = await getDataSourceConfig();
    
    const updatedConfig = {
      ...config,
      sources: {
        ...config.sources,
        ...sources
      }
    };
    
    await fs.writeFile(DATA_SOURCE_CONFIG_PATH, JSON.stringify(updatedConfig, null, 2), 'utf8');
    
    return updatedConfig;
  } catch (error) {
    logger.error(`Error updating data source config: ${error.message}`);
    throw new ServiceUnavailableError('Failed to update data source configuration');
  }
};

module.exports = {
  getScoringConfig,
  updateScoringConfig,
  getDataSourceConfig,
  updateDataSourceConfig
};
