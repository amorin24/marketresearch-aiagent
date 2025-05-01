/**
 * LettaAI Framework Adapter
 * 
 * This adapter implements the interface for the LettaAI framework.
 * Based on LettaAI documentation (hypothetical framework)
 */

const { createBaseAdapter } = require('./baseAdapter');

const config = {
  description: 'LettaAI Framework Adapter',
  version: '1.0.0',
  capabilities: [
    'Hierarchical agent organization',
    'Goal-oriented task planning',
    'Adaptive information retrieval',
    'Continuous learning from feedback'
  ],
  limitations: [
    'Higher computational requirements',
    'Complex setup process'
  ]
};

/**
 * Create all agents for LettaAI
 * @returns {Object} Object containing all agents
 */
const createAgents = () => {
  return {
    agentHierarchy: createAgentHierarchy()
  };
};

/**
 * Create LettaAI agent hierarchy
 * @returns {Object} Agent hierarchy
 */
const createAgentHierarchy = () => {
  return {
    coordinator: {
      name: 'Research Coordinator',
      role: 'Coordinate and oversee the research process',
      subordinates: ['dataCollector', 'dataAnalyzer']
    },
    dataCollector: {
      name: 'Data Collector',
      role: 'Collect data from various sources',
      subordinates: ['webScraper', 'newsReader']
    },
    dataAnalyzer: {
      name: 'Data Analyzer',
      role: 'Analyze and structure collected data',
      subordinates: ['entityExtractor', 'relevanceScorer']
    },
    webScraper: {
      name: 'Web Scraper',
      role: 'Extract data from websites',
      subordinates: []
    },
    newsReader: {
      name: 'News Reader',
      role: 'Extract information from news articles',
      subordinates: []
    },
    entityExtractor: {
      name: 'Entity Extractor',
      role: 'Extract structured entities from text',
      subordinates: []
    },
    relevanceScorer: {
      name: 'Relevance Scorer',
      role: 'Score entities based on relevance',
      subordinates: []
    }
  };
};

/**
 * Create a workflow with agents and goals
 * @param {Object} agents - Object containing all agents
 * @returns {Object} Workflow
 */
const createWorkflow = (agents) => {
  return {
    agentHierarchy: agents.agentHierarchy,
    goals: defineDiscoveryGoals({})
  };
};

/**
 * Define goals for the discovery process
 * @param {Object} parameters - Discovery parameters
 * @returns {Array} List of goals
 */
const defineDiscoveryGoals = (parameters) => {
  return [
    {
      name: 'Identify Companies',
      description: 'Find companies from public sources',
      criteria: {
        minCompanies: parameters.minCompanies || 5,
        maxCompanies: parameters.maxCompanies || 20,
        foundingYearMin: parameters.foundingYearMin || 2018
      }
    },
    {
      name: 'Extract Company Details',
      description: 'Extract key attributes for each company',
      criteria: {
        requiredAttributes: [
          'name',
          'foundingYear',
          'location',
          'focusArea',
          'investors',
          'fundingAmount',
          'newsHeadlines',
          'websiteUrl'
        ]
      }
    },
    {
      name: 'Assess Relevance',
      description: 'Assess the relevance of each company',
      criteria: {
        minRelevanceScore: parameters.minRelevanceScore || 0.6
      }
    }
  ];
};

/**
 * Generate agent reasoning steps for a company
 * @param {string} companyName - Name of the company
 * @returns {Array} Agent reasoning steps
 */
const generateFrameworkSpecificSteps = (companyName) => {
  const coordinatorSteps = [
    {
      id: 1,
      name: 'task_planning',
      description: `Research Coordinator: Planning research strategy for ${companyName}.`,
      completed: true,
      result: `Research plan created with 3 phases: data collection, data analysis, and relevance assessment. Delegating tasks to specialized agents.`,
      timestamp: new Date(Date.now() - 24000)
    },
    {
      id: 2,
      name: 'task_delegation',
      description: `Research Coordinator: Delegating ${companyName} research tasks to specialized agents.`,
      completed: true,
      result: `Tasks delegated: Web Scraper and News Reader assigned to data collection. Entity Extractor and Relevance Scorer assigned to data processing and analysis.`,
      timestamp: new Date(Date.now() - 21000)
    }
  ];
  
  const dataCollectorSteps = [
    {
      id: 3,
      name: 'source_identification',
      description: `Data Collector: Identifying reliable sources for ${companyName} information.`,
      completed: true,
      result: `Identified 8 reliable sources: company website, LinkedIn profile, Crunchbase (public data), TechCrunch (3 articles), Yahoo Finance, and AngelList.`,
      timestamp: new Date(Date.now() - 18000)
    }
  ];
  
  const webScraperSteps = [
    {
      id: 4,
      name: 'website_scraping',
      description: `Web Scraper: Extracting data from ${companyName}'s website and public profiles.`,
      completed: true,
      result: `Successfully scraped company website, LinkedIn profile, and Crunchbase listing. Extracted founding year (2020), headquarters location (Zurich), and focus area (Technology).`,
      timestamp: new Date(Date.now() - 15000)
    }
  ];
  
  const newsReaderSteps = [
    {
      id: 5,
      name: 'news_analysis',
      description: `News Reader: Analyzing recent news articles about ${companyName}.`,
      completed: true,
      result: `Analyzed 5 recent news articles. Extracted key information: funding round ($22M), investor details (Polychain Capital, Paradigm), and recent partnerships with major exchanges.`,
      timestamp: new Date(Date.now() - 12000)
    }
  ];
  
  const dataAnalyzerSteps = [
    {
      id: 6,
      name: 'data_consolidation',
      description: `Data Analyzer: Consolidating collected information about ${companyName}.`,
      completed: true,
      result: `Consolidated all data points from Web Scraper and News Reader. Created structured company profile with 8 key attributes. Identified 2 data conflicts and resolved them.`,
      timestamp: new Date(Date.now() - 9000)
    }
  ];
  
  const entityExtractorSteps = [
    {
      id: 7,
      name: 'entity_extraction',
      description: `Entity Extractor: Identifying key entities related to ${companyName}.`,
      completed: true,
      result: `Extracted 15 key entities: 2 founders, 3 executives, 2 investors, 3 competitors, 3 partners, and 2 products. Created entity relationship map.`,
      timestamp: new Date(Date.now() - 6000)
    }
  ];
  
  const relevanceScorerSteps = [
    {
      id: 8,
      name: 'stock_check',
      description: `Relevance Scorer: Checking if ${companyName} is publicly traded and retrieving stock information.`,
      completed: true,
      result: `Stock check complete. Verified public trading status and retrieved current stock price, market cap, and recent performance metrics where available.`,
      timestamp: new Date(Date.now() - 4000)
    },
    {
      id: 9,
      name: 'relevance_calculation',
      description: `Relevance Scorer: Calculating strategic relevance of ${companyName}.`,
      completed: true,
      result: `Applied weighted scoring model: Funding Stage (28/30), Market Buzz (25/30), Strategic Relevance (36/40). Total score: 89/100. Company shows high strategic relevance due to innovative technology solutions.`,
      timestamp: new Date(Date.now() - 2000)
    },
    {
      id: 10,
      name: 'final_assessment',
      description: `Relevance Scorer: Generating final assessment for ${companyName}.`,
      completed: true,
      result: `Final assessment complete. ${companyName} is a high-potential technology company with strong investor backing and significant strategic relevance to industry operations. Recommended for further evaluation.`,
      timestamp: new Date()
    }
  ];
  
  return [
    ...coordinatorSteps,
    ...dataCollectorSteps,
    ...webScraperSteps,
    ...newsReaderSteps,
    ...dataAnalyzerSteps,
    ...entityExtractorSteps,
    ...relevanceScorerSteps
  ];
};

const getDefaultCompanyName = () => 'BlockSecure';
const getSecondCompanyName = () => 'TechStream';

const adapter = createBaseAdapter(
  config,
  createAgents,
  createWorkflow,
  generateFrameworkSpecificSteps
);

adapter._internal.getDefaultCompanyName = getDefaultCompanyName;
adapter._internal.getSecondCompanyName = getSecondCompanyName;

module.exports = adapter;
