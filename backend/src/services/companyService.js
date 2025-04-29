const { v4: uuidv4 } = require('uuid');
const frameworkService = require('./frameworkService');
const { logger } = require('../index');

const companies = [];
const discoveryJobs = new Map();

/**
 * Get all companies
 * @returns {Array} List of companies
 */
const getAllCompanies = async () => {
  return companies;
};

/**
 * Get company by ID
 * @param {string} id - Company ID
 * @returns {Object|null} Company object or null if not found
 */
const getCompanyById = async (id) => {
  return companies.find(company => company.id === id) || null;
};

/**
 * Start company discovery process using specified framework
 * @param {string} frameworkName - Name of the framework to use
 * @param {Object} parameters - Discovery parameters
 * @returns {string} Job ID
 */
const startDiscovery = async (frameworkName, parameters = {}) => {
  const framework = await frameworkService.getFrameworkAdapter(frameworkName);
  if (!framework) {
    throw new Error(`Framework ${frameworkName} not found or not enabled`);
  }
  
  const jobId = uuidv4();
  
  discoveryJobs.set(jobId, {
    id: jobId,
    framework: frameworkName,
    status: 'running',
    progress: 0,
    startTime: new Date(),
    endTime: null,
    error: null,
    parameters
  });
  
  process.nextTick(async () => {
    try {
      logger.info(`Starting discovery job ${jobId} with framework ${frameworkName}`);
      
      const discoveredCompanies = await framework.discoverCompanies(parameters);
      
      const processedCompanies = discoveredCompanies.map(company => ({
        id: uuidv4(),
        ...company,
        discoveredBy: frameworkName,
        discoveredAt: new Date(),
        score: calculateScore(company)
      }));
      
      companies.push(...processedCompanies);
      
      discoveryJobs.set(jobId, {
        ...discoveryJobs.get(jobId),
        status: 'completed',
        progress: 100,
        endTime: new Date(),
        companiesCount: processedCompanies.length
      });
      
      logger.info(`Discovery job ${jobId} completed, found ${processedCompanies.length} companies`);
    } catch (error) {
      logger.error(`Error in discovery job ${jobId}: ${error.message}`);
      
      discoveryJobs.set(jobId, {
        ...discoveryJobs.get(jobId),
        status: 'failed',
        endTime: new Date(),
        error: error.message
      });
    }
  });
  
  return jobId;
};

/**
 * Get discovery job status
 * @param {string} jobId - Job ID
 * @returns {Object|null} Job status or null if not found
 */
const getDiscoveryStatus = async (jobId) => {
  return discoveryJobs.get(jobId) || null;
};

/**
 * Calculate company score based on configured weights
 * @param {Object} company - Company data
 * @returns {number} Score between 0 and 100
 */
const calculateScore = (company) => {
  let score = 0;
  
  const fundingScore = calculateFundingScore(company);
  
  const buzzScore = calculateBuzzScore(company);
  
  const relevanceScore = calculateRelevanceScore(company);
  
  score = (fundingScore * 0.3) + (buzzScore * 0.3) + (relevanceScore * 0.4);
  
  return Math.round(score * 100);
};

/**
 * Calculate funding stage score
 * @param {Object} company - Company data
 * @returns {number} Score between 0 and 1
 */
const calculateFundingScore = (company) => {
  if (!company.fundingAmount) return 0.2;
  
  const amount = parseFloat(company.fundingAmount.replace(/[^0-9.]/g, ''));
  
  if (amount < 1000000) return 0.2; // Seed
  if (amount < 10000000) return 0.4; // Series A
  if (amount < 50000000) return 0.6; // Series B
  if (amount < 100000000) return 0.8; // Series C
  return 1.0; // Series D+
};

/**
 * Calculate market buzz score
 * @param {Object} company - Company data
 * @returns {number} Score between 0 and 1
 */
const calculateBuzzScore = (company) => {
  let score = 0;
  
  if (company.newsHeadlines && Array.isArray(company.newsHeadlines)) {
    score += Math.min(company.newsHeadlines.length / 10, 1);
  }
  
  return score;
};

/**
 * Calculate strategic relevance score
 * @param {Object} company - Company data
 * @returns {number} Score between 0 and 1
 */
const calculateRelevanceScore = (company) => {
  if (!company.focusArea) return 0.5;
  
  const focusAreaScores = {
    'payments': 0.9,
    'lending': 0.8,
    'crypto': 0.7,
    'wealthtech': 0.8,
    'insurtech': 0.7,
    'regtech': 0.6,
    'banking': 0.9
  };
  
  const focusLower = company.focusArea.toLowerCase();
  return focusAreaScores[focusLower] || 0.5;
};

/**
 * Export companies data in specified format
 * @param {string} format - 'json' or 'csv'
 * @returns {string|Array} Exported data
 */
const exportCompanies = async (format) => {
  if (format === 'json') {
    return companies;
  } else if (format === 'csv') {
    const headers = 'ID,Name,FoundingYear,Location,FocusArea,Investors,FundingAmount,Score\n';
    const rows = companies.map(company => {
      return `${company.id},"${company.name}",${company.foundingYear || ''},"${company.location || ''}","${company.focusArea || ''}","${(company.investors || []).join('; ')}","${company.fundingAmount || ''}",${company.score}`;
    }).join('\n');
    
    return headers + rows;
  } else {
    throw new Error(`Unsupported export format: ${format}`);
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  startDiscovery,
  getDiscoveryStatus,
  exportCompanies
};
