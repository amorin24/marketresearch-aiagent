const { v4: uuidv4 } = require('uuid');
const frameworkService = require('./frameworkService');
const emailService = require('./emailService');
const stockPriceService = require('./stockPriceService');
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
  
  const industryScores = {
    'software': 0.8,
    'hardware': 0.7,
    'cloud': 0.9,
    'ai': 0.9,
    'blockchain': 0.8,
    'internet': 0.7,
    
    'payments': 0.9,
    'lending': 0.8,
    'banking': 0.9,
    'insurance': 0.7,
    'wealth': 0.8,
    'crypto': 0.7,
    
    'healthcare': 0.7,
    'retail': 0.6,
    'manufacturing': 0.5,
    'energy': 0.6,
    'transportation': 0.6,
    'media': 0.5,
    'education': 0.5
  };
  
  const focusLower = company.focusArea.toLowerCase();
  
  for (const [industry, score] of Object.entries(industryScores)) {
    if (focusLower.includes(industry)) {
      return score;
    }
  }
  
  return 0.6; // Default score for unknown industries
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

/**
 * Start company research process using multiple frameworks
 * @param {string} companyName - Name of the company to research
 * @param {Array} frameworkNames - Names of the frameworks to use
 * @param {string} [email] - Optional email for notifications
 * @returns {string} Job ID
 */
const startCompanyResearch = async (companyName, frameworkNames, email = null) => {
  const jobId = uuidv4();
  
  const researchJob = {
    id: jobId,
    companyName,
    frameworks: frameworkNames,
    status: 'running',
    startTime: new Date(),
    endTime: null,
    error: null,
    frameworkResults: {},
    frameworkStatuses: {},
    notificationEmail: email
  };
  
  // Initialize status for each framework
  frameworkNames.forEach(name => {
    researchJob.frameworkStatuses[name] = {
      status: 'pending',
      progress: 0,
      steps: [],
      error: null
    };
  });
  
  discoveryJobs.set(jobId, researchJob);
  
  process.nextTick(async () => {
    logger.info(`Starting company research job ${jobId} for company "${companyName}" with frameworks: ${frameworkNames.join(', ')}`);
    
    await Promise.all(frameworkNames.map(async (frameworkName) => {
      try {
        const framework = await frameworkService.getFrameworkAdapter(frameworkName);
        if (!framework) {
          throw new Error(`Framework ${frameworkName} not found or not enabled`);
        }
        
        let jobData = discoveryJobs.get(jobId);
        jobData.frameworkStatuses[frameworkName].status = 'running';
        discoveryJobs.set(jobId, jobData);
        
        const discoveredCompanies = await framework.discoverCompanies({ companyName });
        
        let agentSteps = [];
        if (!discoveredCompanies || !discoveredCompanies[0]) {
          logger.warn(`No companies discovered for "${companyName}" using framework "${frameworkName}". Defaulting agentSteps to an empty array.`);
        } else if (!discoveredCompanies[0].agentSteps) {
          logger.warn(`No agentSteps found for the first discovered company for "${companyName}" using framework "${frameworkName}". Defaulting agentSteps to an empty array.`);
        } else {
          agentSteps = discoveredCompanies[0].agentSteps;
        }
        
        jobData.frameworkStatuses[frameworkName].steps = agentSteps;
        discoveryJobs.set(jobId, jobData);
        
        // Update progress based on the number of steps
        jobData = discoveryJobs.get(jobId);
        jobData.frameworkStatuses[frameworkName].progress = 100; // All steps are already completed
        discoveryJobs.set(jobId, jobData);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate a company result for this framework
        const company = {
          id: uuidv4(),
          name: companyName,
          discoveredBy: frameworkName,
          discoveredAt: new Date(),
          foundingYear: 2010 + Math.floor(Math.random() * 10),
          location: ['San Francisco, CA', 'New York, NY', 'London, UK', 'Berlin, Germany', 'Toronto, Canada'][Math.floor(Math.random() * 5)],
          focusArea: ['Software', 'Retail', 'Healthcare', 'Energy', 'Transportation', 'Media', 'AI', 'Cloud Computing'][Math.floor(Math.random() * 8)],
          investors: ['Sequoia Capital', 'Andreessen Horowitz', 'Y Combinator', 'SoftBank', 'Tiger Global'].slice(0, 1 + Math.floor(Math.random() * 3)),
          fundingAmount: `$${(5 + Math.floor(Math.random() * 95))}M`,
          newsHeadlines: [
            `${companyName} raises new funding round`,
            `${companyName} launches new product`,
            `${companyName} expands to new markets`
          ],
          websiteUrl: `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
          isPublic: false,
          stockSymbol: null,
          stockPrice: null
        };
        
        try {
          const stockSymbolData = await stockPriceService.getStockSymbol(companyName);
          if (stockSymbolData) {
            company.isPublic = true;
            company.stockSymbol = stockSymbolData.symbol;
            
            const stockPriceData = await stockPriceService.getStockPrice(stockSymbolData.symbol);
            if (stockPriceData) {
              company.stockPrice = stockPriceData;
            }
          }
        } catch (error) {
          logger.error(`Error retrieving stock data for ${companyName}: ${error.message}`);
        }
        
        company.score = calculateScore(company);
        
        const fundingScore = calculateFundingScore(company) * 30;
        const buzzScore = calculateBuzzScore(company) * 30;
        const relevanceScore = calculateRelevanceScore(company) * 40;
        
        company.scoreBreakdown = {
          fundingScore: Math.round(fundingScore),
          buzzScore: Math.round(buzzScore),
          relevanceScore: Math.round(relevanceScore),
          totalScore: company.score
        };
        
        company.summary = `${companyName} is a ${company.focusArea.toLowerCase()} company founded in ${company.foundingYear}. ` +
                        `They have raised ${company.fundingAmount} from ${company.investors.join(', ')}. ` +
                        `The company shows strong potential in the banking sector with a strategic relevance score of ${Math.round(relevanceScore)}/40.`;
        
        jobData = discoveryJobs.get(jobId);
        jobData.frameworkStatuses[frameworkName].status = 'completed';
        jobData.frameworkStatuses[frameworkName].progress = 100;
        jobData.frameworkResults[frameworkName] = company;
        discoveryJobs.set(jobId, jobData);
        
        logger.info(`Research for ${companyName} completed with framework ${frameworkName}`);
      } catch (error) {
        logger.error(`Error in company research for ${companyName} with framework ${frameworkName}: ${error.message}`);
        
        const jobData = discoveryJobs.get(jobId);
        jobData.frameworkStatuses[frameworkName].status = 'failed';
        jobData.frameworkStatuses[frameworkName].error = error.message;
        discoveryJobs.set(jobId, jobData);
      }
    }));
    
    const allFrameworksComplete = () => {
      const job = discoveryJobs.get(jobId);
      return Object.values(job.frameworkStatuses).every(
        status => status.status === 'completed' || status.status === 'failed'
      );
    };
    
    // Update overall job status
    let jobData = discoveryJobs.get(jobId);
    if (allFrameworksComplete()) {
      jobData.status = 'completed';
      jobData.endTime = new Date();
      
      if (jobData.notificationEmail) {
        await emailService.sendResearchCompletionEmail(
          jobData.notificationEmail,
          jobData.companyName,
          jobData
        );
      }
    } else {
      jobData.status = 'partial';
    }
    discoveryJobs.set(jobId, jobData);
    
    logger.info(`Company research job ${jobId} completed for company "${companyName}"`);
  });
  
  return jobId;
};

/**
 * Get company research job status
 * @param {string} jobId - Job ID
 * @returns {Object|null} Job status or null if not found
 */
const getCompanyResearchStatus = async (jobId) => {
  return discoveryJobs.get(jobId) || null;
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  startDiscovery,
  getDiscoveryStatus,
  exportCompanies,
  startCompanyResearch,
  getCompanyResearchStatus
};
