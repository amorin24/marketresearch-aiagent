const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../index');
const { ServiceUnavailableError } = require('../utils/errorHandler');

const frameworkAdapters = new Map();
const frameworkMetrics = new Map();

const frameworkDetailsCache = new Map();

let isInitialized = false;

const adapterEnvKeyMap = {
  'autoGenAdapter': 'AUTOGEN_ENABLED',
  'langGraphAdapter': 'LANGGRAPH_ENABLED',
  'crewAIAdapter': 'CREWAI_ENABLED',
  'squidAIAdapter': 'SQUIDAI_ENABLED',
  'lettaAIAdapter': 'LETTAAI_ENABLED'
};

/**
 * Initialize framework adapters
 * @returns {Promise<boolean>} - Whether initialization was successful
 */
const initializeFrameworks = async () => {
  if (isInitialized) {
    return true;
  }
  
  try {
    const adaptersDir = path.join(__dirname, '../adapters');
    const files = await fs.readdir(adaptersDir);
    
    const adapterFiles = files.filter(file => file.endsWith('.js'));
    
    const adapterPromises = adapterFiles.map(async (file) => {
      const adapterName = file.replace('.js', '');
      
      const envKey = adapterEnvKeyMap[adapterName] || `${adapterName.toUpperCase()}_ENABLED`;
      
      if (process.env[envKey] === 'true') {
        try {
          const adapter = require(`../adapters/${file}`);
          return { adapterName, adapter, enabled: true };
        } catch (err) {
          logger.error(`Failed to load adapter ${adapterName}: ${err.message}`);
          return { adapterName, enabled: false };
        }
      } else {
        return { adapterName, enabled: false };
      }
    });
    
    const adapters = await Promise.all(adapterPromises);
    
    for (const { adapterName, adapter, enabled } of adapters) {
      if (enabled && adapter) {
        frameworkAdapters.set(adapterName, adapter);
        
        frameworkMetrics.set(adapterName, {
          name: adapterName,
          avgRunTime: 0,
          completionRate: 100,
          apiSuccessRate: 100,
          totalRuns: 0,
          successfulRuns: 0,
          failedRuns: 0
        });
        
        logger.info(`Loaded framework adapter: ${adapterName}`);
      } else if (!enabled) {
        logger.info(`Framework adapter ${adapterName} is disabled`);
      }
    }
    
    logger.info(`Initialized ${frameworkAdapters.size} framework adapters`);
    isInitialized = true;
    return true;
  } catch (error) {
    logger.error(`Error initializing framework adapters: ${error.message}`);
    throw new ServiceUnavailableError('Failed to initialize framework adapters');
  }
};

/**
 * Get all available frameworks
 * @returns {Promise<Array>} List of available frameworks
 */
const getAvailableFrameworks = async () => {
  if (!isInitialized) {
    await initializeFrameworks();
  }
  
  return Array.from(frameworkAdapters, ([name, adapter]) => ({
    name,
    description: adapter.description || '',
    version: adapter.version || '1.0.0'
  }));
};

/**
 * Get framework details
 * @param {string} name - Framework name
 * @returns {Promise<Object|null>} Framework details or null if not found
 */
const getFrameworkDetails = async (name) => {
  if (!isInitialized) {
    await initializeFrameworks();
  }
  
  if (frameworkDetailsCache.has(name)) {
    return frameworkDetailsCache.get(name);
  }
  
  const adapter = frameworkAdapters.get(name);
  if (!adapter) {
    return null;
  }
  
  const details = {
    name,
    description: adapter.description || '',
    version: adapter.version || '1.0.0',
    capabilities: adapter.capabilities || [],
    limitations: adapter.limitations || []
  };
  
  frameworkDetailsCache.set(name, details);
  
  return details;
};

/**
 * Get framework adapter
 * @param {string} name - Framework name
 * @returns {Promise<Object|null>} Framework adapter or null if not found
 */
const getFrameworkAdapter = async (name) => {
  if (!isInitialized) {
    await initializeFrameworks();
  }
  
  return frameworkAdapters.get(name) || null;
};

/**
 * Get framework performance metrics
 * @param {string} name - Framework name
 * @returns {Promise<Object|null>} Performance metrics or null if not found
 */
const getFrameworkPerformance = async (name) => {
  if (!isInitialized) {
    await initializeFrameworks();
  }
  
  return frameworkMetrics.get(name) || null;
};

/**
 * Update framework performance metrics
 * @param {string} name - Framework name
 * @param {Object|Function} metrics - Performance metrics to update or function to transform metrics
 * @returns {Promise<boolean>} Whether the update was successful
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
  
  if (typeof metrics === 'function') {
    const updatedMetrics = { ...currentMetrics };
    
    Object.keys(metrics).forEach(key => {
      if (typeof metrics[key] === 'function') {
        updatedMetrics[key] = metrics[key](currentMetrics[key]);
      } else {
        updatedMetrics[key] = metrics[key];
      }
    });
    
    frameworkMetrics.set(name, updatedMetrics);
  } else {
    frameworkMetrics.set(name, { ...currentMetrics, ...metrics });
  }
  
  return true;
};

/**
 * Compare frameworks
 * @param {Array} frameworkNames - List of framework names to compare
 * @returns {Promise<Object>} Comparison results
 */
const compareFrameworks = async (frameworkNames) => {
  if (!isInitialized) {
    await initializeFrameworks();
  }
  
  const resultsPromises = frameworkNames
    .filter(name => frameworkAdapters.has(name))
    .map(async name => {
      const [details, performance] = await Promise.all([
        getFrameworkDetails(name),
        getFrameworkPerformance(name)
      ]);
      
      return [name, { details, performance }];
    });
  
  const resultsEntries = await Promise.all(resultsPromises);
  
  return Object.fromEntries(resultsEntries);
};

/**
 * Benchmark multiple frameworks with a set of test cases
 * @param {Array} frameworkNames - List of framework names to benchmark
 * @param {Array} testCases - List of test cases to run
 * @param {Object} options - Benchmark options
 * @param {boolean} options.parallel - Whether to run benchmarks in parallel (default: true)
 * @param {boolean} options.parallelTestCases - Whether to run test cases in parallel (default: false)
 * @returns {Promise<Object>} Benchmark results
 */
const benchmarkFrameworks = async (frameworkNames, testCases, options = {}) => {
  if (!isInitialized) {
    await initializeFrameworks();
  }
  
  const {
    parallel = true,
    parallelTestCases = false
  } = options;
  
  const startTime = Date.now();
  
  const validFrameworkNames = frameworkNames.filter(name => frameworkAdapters.has(name));
  
  const benchmarkFramework = async (name) => {
    const adapter = frameworkAdapters.get(name);
    
    const runTestCases = async () => {
      if (parallelTestCases) {
        const testPromises = testCases.map(async (testCase) => {
          try {
            const caseStartTime = Date.now();
            const companies = await adapter.discoverCompanies({ 
              companyName: testCase.companyName 
            });
            const caseEndTime = Date.now();
            
            return {
              testCase: testCase.name,
              success: companies && companies.length > 0,
              executionTime: caseEndTime - caseStartTime,
              companies
            };
          } catch (error) {
            return {
              testCase: testCase.name,
              success: false,
              error: error.message
            };
          }
        });
        
        return Promise.all(testPromises);
      } else {
        const results = [];
        
        for (const testCase of testCases) {
          try {
            const caseStartTime = Date.now();
            const companies = await adapter.discoverCompanies({ 
              companyName: testCase.companyName 
            });
            const caseEndTime = Date.now();
            
            results.push({
              testCase: testCase.name,
              success: companies && companies.length > 0,
              executionTime: caseEndTime - caseStartTime,
              companies
            });
          } catch (error) {
            results.push({
              testCase: testCase.name,
              success: false,
              error: error.message
            });
          }
        }
        
        return results;
      }
    };
    
    // Run the test cases
    const adapterResults = await runTestCases();
    
    const successfulTests = adapterResults.filter(r => r.success).length;
    const totalExecutionTime = adapterResults.reduce((acc, r) => acc + (r.executionTime || 0), 0);
    const averageExecutionTime = testCases.length > 0 ? totalExecutionTime / testCases.length : 0;
    
    // Update performance metrics
    await updateFrameworkPerformance(name, {
      avgRunTime: averageExecutionTime,
      completionRate: (successfulTests / testCases.length) * 100,
      totalRuns: currentMetrics => currentMetrics.totalRuns + testCases.length,
      successfulRuns: currentMetrics => currentMetrics.successfulRuns + successfulTests,
      failedRuns: currentMetrics => currentMetrics.failedRuns + (testCases.length - successfulTests)
    });
    
    // Return framework results
    return [name, {
      totalTests: testCases.length,
      successfulTests,
      averageExecutionTime,
      results: adapterResults
    }];
  };
  
  let frameworkResults;
  
  if (parallel) {
    const benchmarkPromises = validFrameworkNames.map(benchmarkFramework);
    frameworkResults = await Promise.all(benchmarkPromises);
  } else {
    frameworkResults = [];
    
    for (const name of validFrameworkNames) {
      frameworkResults.push(await benchmarkFramework(name));
    }
  }
  
  const results = Object.fromEntries(frameworkResults);
  
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
