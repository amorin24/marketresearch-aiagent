const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../index');
const { ServiceUnavailableError } = require('../utils/errorHandler');

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
        } else if (adapterName === 'crewAIAdapter') {
          envKey = 'CREWAI_ENABLED';
        } else if (adapterName === 'squidAIAdapter') {
          envKey = 'SQUIDAI_ENABLED';
        } else if (adapterName === 'lettaAIAdapter') {
          envKey = 'LETTAAI_ENABLED';
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
    throw new ServiceUnavailableError('Failed to initialize framework adapters');
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

/**
 * Benchmark multiple frameworks with a set of test cases
 * @param {Array} frameworkNames - List of framework names to benchmark
 * @param {Array} testCases - List of test cases to run
 * @returns {Object} Benchmark results
 */
const benchmarkFrameworks = async (frameworkNames, testCases) => {
  if (Object.keys(frameworkAdapters).length === 0) {
    await initializeFrameworks();
  }
  
  const results = {};
  const startTime = Date.now();
  
  for (const name of frameworkNames) {
    if (!frameworkAdapters[name]) continue;
    
    const adapter = frameworkAdapters[name];
    const adapterResults = [];
    
    for (const testCase of testCases) {
      try {
        const caseStartTime = Date.now();
        const companies = await adapter.discoverCompanies({ 
          companyName: testCase.companyName 
        });
        const caseEndTime = Date.now();
        
        adapterResults.push({
          testCase: testCase.name,
          success: companies && companies.length > 0,
          executionTime: caseEndTime - caseStartTime,
          companies
        });
      } catch (error) {
        adapterResults.push({
          testCase: testCase.name,
          success: false,
          error: error.message
        });
      }
    }
    
    // Update performance metrics
    const successfulTests = adapterResults.filter(r => r.success).length;
    const totalExecutionTime = adapterResults.reduce((acc, r) => acc + (r.executionTime || 0), 0);
    const averageExecutionTime = testCases.length > 0 ? totalExecutionTime / testCases.length : 0;
    
    await updateFrameworkPerformance(name, {
      avgRunTime: averageExecutionTime,
      completionRate: (successfulTests / testCases.length) * 100,
      totalRuns: currentMetrics => currentMetrics.totalRuns + testCases.length,
      successfulRuns: currentMetrics => currentMetrics.successfulRuns + successfulTests,
      failedRuns: currentMetrics => currentMetrics.failedRuns + (testCases.length - successfulTests)
    });
    
    results[name] = {
      totalTests: testCases.length,
      successfulTests,
      averageExecutionTime,
      results: adapterResults
    };
  }
  
  const endTime = Date.now();
  return {
    frameworks: results,
    totalExecutionTime: endTime - startTime
  };
};

module.exports = {
  initializeFrameworks,
  getAvailableFrameworks,
  getFrameworkDetails,
  getFrameworkAdapter,
  getFrameworkPerformance,
  updateFrameworkPerformance,
  compareFrameworks,
  benchmarkFrameworks
};
