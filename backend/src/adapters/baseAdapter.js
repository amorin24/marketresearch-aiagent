/**
 * Base Framework Adapter
 * 
 * This module provides a base implementation for all framework adapters.
 * It reduces code duplication by implementing common functionality while
 * allowing framework-specific customization.
 */

const { logger } = require('../index');

/**
 * Utility functions for framework adapters
 */
const adapterUtils = {
  /**
   * Validate OpenAI API key
   * @param {string} apiKey - OpenAI API key
   * @returns {boolean} Whether the API key is valid
   * @throws {Error} If the API key is invalid
   */
  validateOpenAIApiKey: (apiKey) => {
    if (!apiKey || 
        apiKey === 'your_openai_api_key_here' || 
        apiKey.includes('your_actual_openai_api_key_here') || 
        !apiKey.startsWith('sk-')) {
      const error = 'No valid OpenAI API key found. OpenAI keys should start with sk-. Please provide a valid API key.';
      logger.error(error);
      throw new Error(error);
    }
    return true;
  },

  /**
   * Extract company information from raw content using regex patterns
   * @param {string} rawContent - Raw content to extract information from
   * @param {string} companyName - Name of the company
   * @returns {Object} Extracted company information
   */
  extractCompanyInfo: (rawContent, companyName) => {
    const foundingYearMatch = rawContent.match(/founded in (\d{4})/i) || 
                             rawContent.match(/founding year[:\s]+(\d{4})/i) ||
                             rawContent.match(/established in (\d{4})/i);
    
    const locationMatch = rawContent.match(/headquartered in ([^.]+)/i) || 
                         rawContent.match(/headquarters[:\s]+([^.]+)/i) ||
                         rawContent.match(/based in ([^.]+)/i);
    
    const focusAreaMatch = rawContent.match(/focuses on ([^.]+)/i) || 
                          rawContent.match(/focus area[:\s]+([^.]+)/i) ||
                          rawContent.match(/specializes in ([^.]+)/i) ||
                          rawContent.match(/industry[:\s]+([^.]+)/i);
    
    const investorsMatch = rawContent.match(/investors include ([^.]+)/i) || 
                          rawContent.match(/backed by ([^.]+)/i) ||
                          rawContent.match(/investors[:\s]+([^.]+)/i);
    
    const fundingMatch = rawContent.match(/raised (\$[0-9]+[MBT][^.]+)/i) || 
                        rawContent.match(/funding[:\s]+(\$[0-9]+[MBT][^.]+)/i) ||
                        rawContent.match(/secured (\$[0-9]+[MBT][^.]+)/i);
    
    const newsMatch = rawContent.match(/recent news[:\s]+([^.]+)/i) ||
                     rawContent.match(/recent headlines[:\s]+([^.]+)/i);
    
    const websiteMatch = rawContent.match(/website[:\s]+(https?:\/\/[^\s]+)/i) ||
                        rawContent.match(/url[:\s]+(https?:\/\/[^\s]+)/i);
    
    const isPublic = rawContent.toLowerCase().includes('publicly traded') || 
                    rawContent.toLowerCase().includes('public company') ||
                    rawContent.toLowerCase().includes('stock symbol') ||
                    rawContent.toLowerCase().includes('stock ticker');
    
    const stockSymbolMatch = rawContent.match(/stock symbol[:\s]+([A-Z]+)/i) ||
                            rawContent.match(/ticker symbol[:\s]+([A-Z]+)/i) ||
                            rawContent.match(/trades under the symbol[:\s]+([A-Z]+)/i) ||
                            rawContent.match(/stock ticker[:\s]+([A-Z]+)/i);
    
    return {
      name: companyName,
      foundingYear: foundingYearMatch ? parseInt(foundingYearMatch[1]) : null,
      location: locationMatch ? locationMatch[1].trim() : null,
      focusArea: focusAreaMatch ? focusAreaMatch[1].trim() : null,
      investors: investorsMatch ? investorsMatch[1].split(/,|\sand\s/).map(i => i.trim()) : [],
      fundingAmount: fundingMatch ? fundingMatch[1].trim() : null,
      newsHeadlines: newsMatch ? [newsMatch[1].trim()] : [],
      websiteUrl: websiteMatch ? websiteMatch[1] : 
                 `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      isPublic: isPublic,
      stockSymbol: stockSymbolMatch ? stockSymbolMatch[1].trim() : null
    };
  },

  /**
   * Fetch stock price data for a company
   * @param {Object} company - Company object
   * @returns {Promise<Object>} Updated company object with stock price data
   */
  fetchStockPrice: async (company) => {
    if (company.isPublic && company.stockSymbol) {
      try {
        const stockPriceService = require('../services/stockPriceService');
        const stockData = await stockPriceService.getStockPrice(company.stockSymbol);
        if (stockData) {
          company.stockPrice = stockData;
        }
      } catch (stockError) {
        logger.error(`Error fetching stock data: ${stockError.message}`);
      }
    }
    return company;
  },

  /**
   * Handle API execution result
   * @param {Object} result - API execution result
   * @param {string} frameworkName - Name of the framework
   * @throws {Error} If the API execution failed
   */
  handleApiResult: (result, frameworkName) => {
    if (!result.success) {
      const errorMessage = result.error || `${frameworkName} execution failed. Please check the logs for more details.`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    return result;
  },

  /**
   * Create a company object with extracted information and agent steps
   * @param {Object} extractedInfo - Extracted company information
   * @param {Array} steps - Agent reasoning steps
   * @returns {Object} Company object
   */
  createCompanyObject: (extractedInfo, steps) => {
    return {
      ...extractedInfo,
      agentSteps: steps
    };
  }
};

/**
 * Create a base adapter with framework-specific customizations
 * @param {Object} config - Framework configuration
 * @param {Function} createAgents - Function to create framework-specific agents
 * @param {Function} createWorkflow - Function to create a workflow with agents
 * @param {Function} generateFrameworkSpecificSteps - Function to generate framework-specific steps
 * @param {Function} executeRealImplementation - Optional function to execute real framework implementation
 * @returns {Object} Framework adapter
 */
const createBaseAdapter = (
  config,
  createAgents,
  createWorkflow,
  generateFrameworkSpecificSteps,
  executeRealImplementation
) => {
  /**
   * Discover companies using the framework
   * @param {Object} parameters - Discovery parameters
   * @returns {Promise<Array>} Discovered companies
   */
  const discoverCompanies = async (parameters = {}) => {
    try {
      logger.info(`Starting company discovery with ${config.description}`);
      
      const agents = createAgents();
      
      const workflow = createWorkflow(agents);
      
      const adapterName = config.name || config.description.replace(' Framework Adapter', '');
      if (executeRealImplementation && process.env[`${adapterName.toUpperCase().replace(/\s+/g, '')}_ENABLED`] === 'true') {
        try {
          logger.info(`Attempting to use real implementation for ${config.description}`);
          const realResults = await executeRealImplementation(workflow, parameters);
          
          if (realResults) {
            logger.info(`${config.description} discovered ${realResults.length} companies using real implementation`);
            return realResults;
          }
          
          logger.info(`Real implementation for ${config.description} returned no results, falling back to mock implementation`);
        } catch (realImplError) {
          logger.warn(`Error in real implementation for ${config.description}: ${realImplError.message}. Falling back to mock implementation.`);
        }
      }
      
      // Fall back to mock implementation
      const companies = await simulateExecution(workflow, parameters);
      
      logger.info(`${config.description} discovered ${companies.length} companies using mock implementation`);
      return companies;
    } catch (error) {
      logger.error(`Error in ${config.description} discovery: ${error.message}`);
      throw error;
    }
  };

  /**
   * Simulate framework execution
   * @param {Object} workflow - Framework-specific workflow
   * @param {Object} parameters - Discovery parameters
   * @returns {Promise<Array>} Discovered companies
   */
  const simulateExecution = async (workflow, parameters) => {
    const companyName = parameters.companyName || _internal.getDefaultCompanyName();
    
    const steps = generateFrameworkSpecificSteps(companyName);
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const mockCompanies = [
      generateMockCompany(companyName, steps)
    ];
    
    if (companyName === _internal.getDefaultCompanyName()) {
      const secondCompanyName = _internal.getSecondCompanyName();
      mockCompanies.push(
        generateMockCompany(
          secondCompanyName, 
          generateFrameworkSpecificSteps(secondCompanyName)
        )
      );
    }
    
    return mockCompanies;
  };

  /**
   * Generate a mock company
   * @param {string} companyName - Name of the company
   * @param {Array} steps - Agent reasoning steps
   * @returns {Object} Mock company
   */
  const generateMockCompany = (companyName, steps) => {
    const isPublic = Math.random() > 0.5;
    const stockSymbol = companyName.substring(0, 4).toUpperCase();
    
    return {
      name: companyName,
      foundingYear: 2018 + Math.floor(Math.random() * 5),
      location: _internal.getRandomLocation(),
      focusArea: 'Technology',
      investors: _internal.getRandomInvestors(),
      fundingAmount: `$${(Math.floor(Math.random() * 30) + 5)}M`,
      newsHeadlines: [
        `${companyName} introduces innovative technology solution`,
        `${companyName} expands to new markets with recent funding`
      ],
      websiteUrl: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      isPublic: isPublic,
      stockSymbol: isPublic ? stockSymbol : null,
      stockPrice: isPublic ? {
        symbol: stockSymbol,
        currentPrice: 50 + (Math.random() * 50),
        change: Math.random() * 5 - 2.5,
        changePercent: Math.random() * 4 - 2,
        marketCap: `$${(Math.floor(Math.random() * 5) + 1)}.${Math.floor(Math.random() * 9)}B`,
        lastUpdated: new Date().toISOString()
      } : null,
      agentSteps: steps
    };
  };

  const _internal = {
    getDefaultCompanyName: () => 'DefaultCompany',
    getSecondCompanyName: () => 'SecondCompany',
    getRandomLocation: () => {
      const locations = [
        'San Francisco, CA',
        'New York, NY',
        'London, UK',
        'Berlin, Germany',
        'Singapore',
        'Tokyo, Japan',
        'Toronto, Canada',
        'Sydney, Australia'
      ];
      return locations[Math.floor(Math.random() * locations.length)];
    },
    getRandomInvestors: () => {
      const investors = [
        ['Sequoia Capital', 'Andreessen Horowitz'],
        ['Y Combinator', 'Founders Fund'],
        ['Accel', 'Index Ventures'],
        ['Kleiner Perkins', 'GV'],
        ['Tiger Global', 'SoftBank Vision Fund'],
        ['Benchmark', 'Lightspeed Venture Partners']
      ];
      return investors[Math.floor(Math.random() * investors.length)];
    }
  };

  return {
    ...config,
    discoverCompanies,
    _internal, // Expose internal functions for framework-specific overrides
    utils: adapterUtils // Expose utility functions for framework adapters
  };
};

module.exports = {
  createBaseAdapter,
  adapterUtils
};
