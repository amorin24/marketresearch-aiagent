const { logger } = require('../index');
const frameworkService = require('./frameworkService');
const { v4: uuidv4 } = require('uuid');

/**
 * Research Orchestrator
 * Manages complex research workflows across multiple frameworks
 */

/**
 * Execute a parallel research job across multiple frameworks
 * @param {string} companyName - Company to research
 * @param {Array} frameworks - Frameworks to use
 * @param {Object} options - Research options
 * @returns {Object} Research job
 */
const executeParallelResearch = async (companyName, frameworks, options = {}) => {
  const jobId = uuidv4();
  const startTime = new Date().toISOString();
  
  logger.info(`Starting parallel research job ${jobId} for ${companyName} using ${frameworks.join(', ')}`);
  
  const frameworkStatuses = {};
  frameworks.forEach(framework => {
    frameworkStatuses[framework] = {
      status: 'pending',
      progress: 0,
      steps: [],
      error: null
    };
  });
  
  const job = {
    id: jobId,
    companyName,
    frameworks,
    status: 'running',
    startTime,
    endTime: null,
    error: null,
    frameworkResults: {},
    frameworkStatuses
  };
  
  const researchPromises = frameworks.map(async (framework) => {
    try {
      frameworkStatuses[framework].status = 'running';
      
      const adapter = await frameworkService.getFrameworkAdapter(framework);
      if (!adapter) {
        throw new Error(`Framework ${framework} not found or disabled`);
      }
      
      const companies = await adapter.discoverCompanies({ 
        companyName,
        ...options
      });
      
      if (companies && companies.length > 0) {
        frameworkStatuses[framework].status = 'completed';
        frameworkStatuses[framework].progress = 100;
        frameworkStatuses[framework].steps = companies[0].agentSteps || [];
        
        const company = {
          ...companies[0],
          discoveredBy: framework,
          discoveredAt: new Date().toISOString()
        };
        
        job.frameworkResults[framework] = company;
        return { framework, success: true, company };
      } else {
        throw new Error('No companies found');
      }
    } catch (error) {
      logger.error(`Error in ${framework} research: ${error.message}`);
      frameworkStatuses[framework].status = 'failed';
      frameworkStatuses[framework].error = error.message;
      return { framework, success: false, error: error.message };
    }
  });
  
  const results = await Promise.allSettled(researchPromises);
  
  const anySuccess = results.some(r => r.status === 'fulfilled' && r.value.success);
  const allSuccess = results.every(r => r.status === 'fulfilled' && r.value.success);
  
  job.status = !anySuccess ? 'failed' : (allSuccess ? 'completed' : 'partial');
  job.endTime = new Date().toISOString();
  
  if (!anySuccess) {
    job.error = 'All frameworks failed to complete research';
  }
  
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      const { framework, success } = result.value;
      
      const metrics = {
        totalRuns: 1,
        successfulRuns: success ? 1 : 0,
        failedRuns: success ? 0 : 1
      };
      
      frameworkService.updateFrameworkPerformance(framework, metrics);
    }
  });
  
  logger.info(`Completed research job ${jobId} with status: ${job.status}`);
  return job;
};

/**
 * Execute a sequential research job with feedback between frameworks
 * @param {string} companyName - Company to research
 * @param {Array} frameworks - Frameworks to use in sequence
 * @param {Object} options - Research options
 * @returns {Object} Research job
 */
const executeSequentialResearch = async (companyName, frameworks, options = {}) => {
  const jobId = uuidv4();
  const startTime = new Date().toISOString();
  
  logger.info(`Starting sequential research job ${jobId} for ${companyName} using ${frameworks.join(' -> ')}`);
  
  const frameworkStatuses = {};
  frameworks.forEach(framework => {
    frameworkStatuses[framework] = {
      status: 'pending',
      progress: 0,
      steps: [],
      error: null
    };
  });
  
  const job = {
    id: jobId,
    companyName,
    frameworks,
    status: 'running',
    startTime,
    endTime: null,
    error: null,
    frameworkResults: {},
    frameworkStatuses
  };
  
  let accumulatedData = { companyName };
  let lastSuccessfulFramework = null;
  
  for (const framework of frameworks) {
    try {
      frameworkStatuses[framework].status = 'running';
      
      const adapter = await frameworkService.getFrameworkAdapter(framework);
      if (!adapter) {
        throw new Error(`Framework ${framework} not found or disabled`);
      }
      
      const companies = await adapter.discoverCompanies({ 
        ...accumulatedData,
        ...options
      });
      
      if (companies && companies.length > 0) {
        frameworkStatuses[framework].status = 'completed';
        frameworkStatuses[framework].progress = 100;
        frameworkStatuses[framework].steps = companies[0].agentSteps || [];
        
        const company = {
          ...companies[0],
          discoveredBy: framework,
          discoveredAt: new Date().toISOString()
        };
        
        job.frameworkResults[framework] = company;
        lastSuccessfulFramework = framework;
        
        accumulatedData = {
          ...accumulatedData,
          ...companies[0]
        };
        
        frameworkService.updateFrameworkPerformance(framework, {
          totalRuns: 1,
          successfulRuns: 1,
          failedRuns: 0
        });
      } else {
        throw new Error('No companies found');
      }
    } catch (error) {
      logger.error(`Error in ${framework} research: ${error.message}`);
      frameworkStatuses[framework].status = 'failed';
      frameworkStatuses[framework].error = error.message;
      
      frameworkService.updateFrameworkPerformance(framework, {
        totalRuns: 1,
        successfulRuns: 0,
        failedRuns: 1
      });
    }
  }
  
  job.status = lastSuccessfulFramework ? (lastSuccessfulFramework === frameworks[frameworks.length - 1] ? 'completed' : 'partial') : 'failed';
  job.endTime = new Date().toISOString();
  
  if (!lastSuccessfulFramework) {
    job.error = 'All frameworks failed to complete research';
  }
  
  logger.info(`Completed sequential research job ${jobId} with status: ${job.status}`);
  return job;
};

module.exports = {
  executeParallelResearch,
  executeSequentialResearch
};
