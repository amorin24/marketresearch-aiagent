const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../index');
const frameworkService = require('./frameworkService');

let benchmarkConfig = null;

/**
 * Initialize benchmark configuration
 */
const initializeBenchmarkConfig = async () => {
  try {
    const configPath = path.join(__dirname, '../config/benchmark.json');
    const configData = await fs.readFile(configPath, 'utf8');
    benchmarkConfig = JSON.parse(configData);
    logger.info('Benchmark configuration loaded successfully');
    return benchmarkConfig;
  } catch (error) {
    logger.error(`Error loading benchmark configuration: ${error.message}`);
    return {
      testCases: [],
      metrics: {},
      sourceWeights: {}
    };
  }
};

/**
 * Get benchmark test cases
 * @returns {Array} List of test cases
 */
const getTestCases = async () => {
  if (!benchmarkConfig) {
    await initializeBenchmarkConfig();
  }
  return benchmarkConfig.testCases || [];
};

/**
 * Get benchmark metrics configuration
 * @returns {Object} Metrics configuration
 */
const getMetricsConfig = async () => {
  if (!benchmarkConfig) {
    await initializeBenchmarkConfig();
  }
  return benchmarkConfig.metrics || {};
};

/**
 * Get source weights configuration
 * @returns {Object} Source weights configuration
 */
const getSourceWeights = async () => {
  if (!benchmarkConfig) {
    await initializeBenchmarkConfig();
  }
  return benchmarkConfig.sourceWeights || {};
};

/**
 * Run benchmark on specified frameworks
 * @param {Array} frameworks - List of framework names to benchmark
 * @param {Array} testCases - Optional list of test cases (uses default if not provided)
 * @returns {Object} Benchmark results
 */
const runBenchmark = async (frameworks, testCases = null) => {
  if (!benchmarkConfig) {
    await initializeBenchmarkConfig();
  }
  
  const casesToRun = testCases || benchmarkConfig.testCases || [];
  
  if (casesToRun.length === 0) {
    throw new Error('No test cases available for benchmarking');
  }
  
  const benchmarkResults = await frameworkService.benchmarkFrameworks(frameworks, casesToRun);
  const scores = calculateScores(benchmarkResults);
  
  return {
    ...benchmarkResults,
    scores
  };
};

/**
 * Calculate benchmark score based on results
 * @param {Object} benchmarkResults - Benchmark results
 * @returns {Object} Benchmark scores
 */
const calculateScores = (benchmarkResults) => {
  const scores = {};
  const metrics = benchmarkConfig?.metrics || {
    executionTime: { weight: 0.3 },
    dataCompleteness: { weight: 0.4 },
    sourceCredibility: { weight: 0.3 }
  };
  
  for (const [frameworkName, results] of Object.entries(benchmarkResults.frameworks)) {
    const executionTimeScore = results.averageExecutionTime > 0 
      ? Math.min(1, 10000 / results.averageExecutionTime) * (metrics.executionTime?.weight || 0.3)
      : 0;
    
    const successRateScore = results.totalTests > 0 
      ? (results.successfulTests / results.totalTests) * (metrics.dataCompleteness?.weight || 0.4)
      : 0;
    
    let sourceCredibilityScore = 0;
    const sourceWeights = benchmarkConfig?.sourceWeights || {};
    
    sourceCredibilityScore = results.totalTests > 0 
      ? (results.successfulTests / results.totalTests) * (metrics.sourceCredibility?.weight || 0.3)
      : 0;
    
    scores[frameworkName] = {
      totalScore: executionTimeScore + successRateScore + sourceCredibilityScore,
      executionTimeScore,
      successRateScore,
      sourceCredibilityScore,
      details: {
        executionTime: results.averageExecutionTime,
        successRate: results.totalTests > 0 ? (results.successfulTests / results.totalTests) * 100 : 0
      }
    };
  }
  
  return scores;
};

/**
 * Analyze source credibility in benchmark results
 * @param {Array} companies - List of companies from benchmark results
 * @returns {number} Source credibility score
 */
const analyzeSourceCredibility = (companies) => {
  if (!companies || companies.length === 0) return 0;
  
  const sourceWeights = benchmarkConfig?.sourceWeights || {
    yahooFinance: 1.0,
    businessInsider: 0.9,
    bloomberg: 0.9,
    financialTimes: 0.8,
    cnbc: 0.8,
    reuters: 0.8,
    wsj: 0.8,
    techCrunch: 0.7,
    other: 0.5
  };
  
  return 0.7; // Default score
};

module.exports = {
  initializeBenchmarkConfig,
  getTestCases,
  getMetricsConfig,
  getSourceWeights,
  runBenchmark,
  calculateScores,
  analyzeSourceCredibility
};
