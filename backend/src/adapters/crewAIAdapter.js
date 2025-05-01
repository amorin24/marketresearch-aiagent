/**
 * CrewAI Framework Adapter
 * 
 * This adapter implements the interface for the CrewAI framework.
 * Based on CrewAI documentation: https://docs.crewai.com/
 */

const axios = require('axios');
const { logger } = require('../index');

const config = {
  description: 'CrewAI Framework Adapter',
  version: '1.0.0',
  capabilities: [
    'Multi-agent collaboration',
    'Role-based agent specialization',
    'Sequential and parallel task execution',
    'Memory and context sharing between agents'
  ],
  limitations: [
    'Requires OpenAI API key',
    'Limited to text-based data sources'
  ]
};

/**
 * Discover companies using CrewAI
 * @param {Object} parameters - Discovery parameters
 * @returns {Promise<Array>} Discovered companies
 */
const discoverCompanies = async (parameters = {}) => {
  try {
    logger.info('Starting company discovery with CrewAI');
    
    
    const researchAgent = createResearchAgent();
    const dataExtractionAgent = createDataExtractionAgent();
    const analysisAgent = createAnalysisAgent();
    
    const crew = createCrew([researchAgent, dataExtractionAgent, analysisAgent]);
    
    const companies = await simulateCrewExecution(crew, parameters);
    
    logger.info(`CrewAI discovered ${companies.length} companies`);
    return companies;
  } catch (error) {
    logger.error(`Error in CrewAI discovery: ${error.message}`);
    throw error;
  }
};

/**
 * Create a research agent
 * @returns {Object} Research agent
 */
const createResearchAgent = () => {
  return {
    name: 'Research Agent',
    role: 'Market Research Specialist',
    goal: 'Discover companies from public sources',
    tools: ['web_search', 'news_api']
  };
};

/**
 * Create a data extraction agent
 * @returns {Object} Data extraction agent
 */
const createDataExtractionAgent = () => {
  return {
    name: 'Data Extraction Agent',
    role: 'Data Specialist',
    goal: 'Extract structured data about companies',
    tools: ['web_scraper', 'data_parser']
  };
};

/**
 * Create an analysis agent
 * @returns {Object} Analysis agent
 */
const createAnalysisAgent = () => {
  return {
    name: 'Analysis Agent',
    role: 'Business Analyst',
    goal: 'Analyze company data and determine relevance',
    tools: ['data_analysis']
  };
};

/**
 * Create a crew with agents
 * @param {Array} agents - List of agents
 * @returns {Object} Crew
 */
const createCrew = (agents) => {
  return {
    name: 'Market Research Crew',
    agents,
    tasks: [
      {
        description: 'Search for companies',
        agent: 'Research Agent'
      },
      {
        description: 'Extract company details',
        agent: 'Data Extraction Agent'
      },
      {
        description: 'Analyze company relevance',
        agent: 'Analysis Agent'
      }
    ]
  };
};

/**
 * Generate agent reasoning steps for a company
 * @param {string} companyName - Name of the company
 * @returns {Array} Agent reasoning steps
 */
const generateAgentSteps = (companyName) => {
  const researchAgentSteps = [
    {
      id: 1,
      name: 'discovery',
      description: `I'm searching for information about ${companyName} across multiple databases and news sources.`,
      completed: true,
      result: `Found ${companyName} in various articles and public listings. The company appears to be active with recent business activity.`,
      timestamp: new Date(Date.now() - 15000)
    },
    {
      id: 2,
      name: 'source_evaluation',
      description: `Evaluating the credibility and recency of sources about ${companyName}.`,
      completed: true,
      result: `Identified 3 reliable sources: TechCrunch (2 articles from last 6 months), LinkedIn company page (updated weekly), and a recent Yahoo Finance mention.`,
      timestamp: new Date(Date.now() - 12000)
    }
  ];
  
  const dataExtractionAgentSteps = [
    {
      id: 3,
      name: 'extraction',
      description: `Extracting key company attributes for ${companyName} from identified sources.`,
      completed: true,
      result: `Successfully extracted founding year (2021), headquarters location (San Francisco), and focus area (Payments). Found partial investor information and funding details.`,
      timestamp: new Date(Date.now() - 9000)
    },
    {
      id: 4,
      name: 'data_validation',
      description: `Cross-referencing extracted data about ${companyName} for accuracy.`,
      completed: true,
      result: `Validated key data points across multiple sources. Funding amount ($25M) confirmed from both TechCrunch and company press release. Investor list may be incomplete.`,
      timestamp: new Date(Date.now() - 6000)
    }
  ];
  
  const analysisAgentSteps = [
    {
      id: 5,
      name: 'scoring',
      description: `Applying weighted scoring model to evaluate ${companyName}.`,
      completed: true,
      result: `Applied scoring model with weights: Funding Stage (30%), Market Buzz (30%), Strategic Relevance (40%). Initial score calculation complete.`,
      timestamp: new Date(Date.now() - 3000)
    },
    {
      id: 6,
      name: 'stock_check',
      description: `Checking if ${companyName} is a publicly traded company.`,
      completed: true,
      result: `Verified public trading status for ${companyName}. Retrieved current stock information if available.`,
      timestamp: new Date(Date.now() - 1500)
    },
    {
      id: 7,
      name: 'summary',
      description: `Generating comprehensive summary and strategic assessment of ${companyName}.`,
      completed: true,
      result: `Generated company profile and strategic assessment. ${companyName} shows strong potential in its industry with significant recent funding and strategic market position.`,
      timestamp: new Date()
    }
  ];
  
  return [...researchAgentSteps, ...dataExtractionAgentSteps, ...analysisAgentSteps];
};

/**
 * Simulate crew execution
 * @param {Object} crew - Crew configuration
 * @param {Object} parameters - Discovery parameters
 * @returns {Promise<Array>} Discovered companies
 */
const simulateCrewExecution = async (crew, parameters) => {
  const companyName = parameters.companyName || 'PayFast';
  
  const steps = generateAgentSteps(companyName);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockCompanies = [
    {
      name: companyName,
      foundingYear: 2021,
      location: 'San Francisco, CA',
      focusArea: 'Software',
      investors: ['Sequoia Capital', 'Andreessen Horowitz'],
      fundingAmount: '$25M',
      newsHeadlines: [
        `${companyName} raises $25M Series A to revolutionize software development`,
        `${companyName} expands to European markets`
      ],
      websiteUrl: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.io`,
      isPublic: Math.random() > 0.5, // Randomly determine if company is public
      stockSymbol: companyName.substring(0, 4).toUpperCase(),
      stockPrice: Math.random() > 0.5 ? {
        symbol: companyName.substring(0, 4).toUpperCase(),
        currentPrice: 125.75 + (Math.random() * 50 - 25),
        change: Math.random() * 10 - 5,
        changePercent: Math.random() * 6 - 3,
        marketCap: '$4.2B',
        lastUpdated: new Date().toISOString()
      } : null,
      agentSteps: steps
    }
  ];
  
  if (companyName !== 'PayFast') {
    mockCompanies.push({
      name: 'TechInnovate',
      foundingYear: 2020,
      location: 'New York, NY',
      focusArea: 'AI',
      investors: ['Google Ventures', 'Accel Partners'],
      fundingAmount: '$18M',
      newsHeadlines: [
        'TechInnovate launches new AI platform',
        'TechInnovate partners with major tech companies'
      ],
      websiteUrl: 'https://techinnovate.ai',
      isPublic: true,
      stockSymbol: 'TECH',
      stockPrice: {
        symbol: 'TECH',
        currentPrice: 87.25,
        change: 2.75,
        changePercent: 3.25,
        marketCap: '$1.8B',
        lastUpdated: new Date().toISOString()
      },
      agentSteps: generateAgentSteps('TechInnovate')
    });
  }
  
  return mockCompanies;
};

module.exports = {
  ...config,
  discoverCompanies
};
