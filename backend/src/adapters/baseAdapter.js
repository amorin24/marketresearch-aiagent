/**
 * Base Framework Adapter
 * 
 * This module provides a base implementation for all framework adapters.
 * It reduces code duplication by implementing common functionality while
 * allowing framework-specific customization.
 */

const { logger } = require('../index');

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
    _internal // Expose internal functions for framework-specific overrides
  };
};

module.exports = {
  createBaseAdapter
};
