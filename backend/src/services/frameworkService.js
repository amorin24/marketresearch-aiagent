const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../index');

let frameworkAdapters = {};

const frameworkMetrics = new Map();

/**
 * Initialize framework adapters
 */
const initializeFrameworks = async () => {
  try {
    const adaptersDir = path.join(__dirname, '../adapters');
    const files = await fs.readdir(adaptersDir);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const adapterName = file.replace('.js', '');
        const adapter = require(`../adapters/${file}`);
        
        let envKey;
        if (adapterName === 'autoGenAdapter') {
          envKey = 'AUTOGEN_ENABLED';
        } else if (adapterName === 'langGraphAdapter') {
          envKey = 'LANGGRAPH_ENABLED';
        } else {
          envKey = `${adapterName.toUpperCase()}_ENABLED`;
        }
        
        if (process.env[envKey] === 'true') {
          frameworkAdapters[adapterName] = adapter;
          logger.info(`Loaded framework adapter: ${adapterName}`);
          
          frameworkMetrics.set(adapterName, {
            name: adapterName,
            avgRunTime: 0,
            completionRate: 100,
            apiSuccessRate: 100,
            totalRuns: 0,
            successfulRuns: 0,
            failedRuns: 0
          });
        } else {
          logger.info(`Framework adapter ${adapterName} is disabled`);
        }
      }
    }
    
    logger.info(`Initialized ${Object.keys(frameworkAdapters).length} framework adapters`);
  } catch (error) {
    logger.error(`Error initializing framework adapters: ${error.message}`);
    throw error;
  }
};

/**
 * Get all available frameworks
 * @returns {Array} List of available frameworks
 */
const getAvailableFrameworks = async () => {
  if (Object.keys(frameworkAdapters).length === 0) {
    await initializeFrameworks();
  }
  
  return Object.keys(frameworkAdapters).map(name => ({
    name,
    description: frameworkAdapters[name].description || '',
    version: frameworkAdapters[name].version || '1.0.0'
  }));
};

/**
 * Get framework details
 * @param {string} name - Framework name
 * @returns {Object|null} Framework details or null if not found
 */
const getFrameworkDetails = async (name) => {
  if (Object.keys(frameworkAdapters).length === 0) {
    await initializeFrameworks();
  }
  
  if (!frameworkAdapters[name]) {
    return null;
  }
  
  return {
    name,
    description: frameworkAdapters[name].description || '',
    version: frameworkAdapters[name].version || '1.0.0',
    capabilities: frameworkAdapters[name].capabilities || [],
    limitations: frameworkAdapters[name].limitations || []
  };
};

/**
 * Get framework adapter
 * @param {string} name - Framework name
 * @returns {Object|null} Framework adapter or null if not found
 */
const getFrameworkAdapter = async (name) => {
  if (Object.keys(frameworkAdapters).length === 0) {
    await initializeFrameworks();
  }
  
  return frameworkAdapters[name] || null;
};

/**
 * Get framework performance metrics
 * @param {string} name - Framework name
 * @returns {Object|null} Performance metrics or null if not found
 */
const getFrameworkPerformance = async (name) => {
  if (Object.keys(frameworkAdapters).length === 0) {
    await initializeFrameworks();
  }
  
  return frameworkMetrics.get(name) || null;
};

/**
 * Update framework performance metrics
 * @param {string} name - Framework name
 * @param {Object} metrics - Performance metrics to update
 */
const updateFrameworkPerformance = async (name, metrics) => {
  if (!frameworkMetrics.has(name)) {
    frameworkMetrics.set(name, {
      name,
      avgRunTime: 0,
      completionRate: 100,
      apiSuccessRate: 100,
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0
    });
  }
  
  const currentMetrics = frameworkMetrics.get(name);
  frameworkMetrics.set(name, { ...currentMetrics, ...metrics });
};

/**
 * Compare frameworks
 * @param {Array} frameworkNames - List of framework names to compare
 * @returns {Object} Comparison results
 */
const compareFrameworks = async (frameworkNames) => {
  if (Object.keys(frameworkAdapters).length === 0) {
    await initializeFrameworks();
  }
  
  const results = {};
  
  for (const name of frameworkNames) {
    if (frameworkAdapters[name]) {
      results[name] = {
        details: await getFrameworkDetails(name),
        performance: await getFrameworkPerformance(name)
      };
    }
  }
  
  return results;
};

module.exports = {
  initializeFrameworks,
  getAvailableFrameworks,
  getFrameworkDetails,
  getFrameworkAdapter,
  getFrameworkPerformance,
  updateFrameworkPerformance,
  compareFrameworks
};
