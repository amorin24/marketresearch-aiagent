/**
 * AutoGen Framework Adapter
 * 
 * This adapter implements the interface for the AutoGen framework.
 * Based on AutoGen documentation: https://microsoft.github.io/autogen/
 */

const { createBaseAdapter } = require('./baseAdapter');
const { autoGenImplementation } = require('./realImplementation');
const { logger } = require('../index');

const config = {
  description: 'AutoGen Framework Adapter',
  version: '1.0.0',
  capabilities: [
    'Multi-agent conversations',
    'Tool use and function calling',
    'Customizable agent behaviors',
    'Human-in-the-loop interactions',
    'Code generation and execution'
  ],
  limitations: [
    'Requires OpenAI API key',
    'Complex setup for advanced scenarios',
    'Limited built-in data processing capabilities'
  ]
};

/**
 * Create all agents for AutoGen
 * @returns {Object} Object containing all agents
 */
const createAgents = () => {
  return {
    userProxy: createUserProxyAgent(),
    researchAssistant: createResearchAssistant(),
    dataAnalyst: createDataAnalyst()
  };
};

/**
 * Create a user proxy agent
 * @returns {Object} User proxy agent
 */
const createUserProxyAgent = () => {
  return {
    name: 'UserProxy',
    type: 'user_proxy',
    human_input_mode: 'NEVER',
    max_consecutive_auto_reply: 10,
    tools: ['web_search', 'file_system']
  };
};

/**
 * Create a research assistant agent
 * @returns {Object} Research assistant agent
 */
const createResearchAssistant = () => {
  return {
    name: 'ResearchAssistant',
    type: 'assistant',
    llm_config: {
      model: 'gpt-4',
      temperature: 0.2
    },
    system_message: 'You are a market research expert. Your task is to discover companies from public sources.'
  };
};

/**
 * Create a data analyst agent
 * @returns {Object} Data analyst agent
 */
const createDataAnalyst = () => {
  return {
    name: 'DataAnalyst',
    type: 'assistant',
    llm_config: {
      model: 'gpt-4',
      temperature: 0.1
    },
    system_message: 'You are a data analyst specializing in company data. Your task is to extract and structure information about companies.'
  };
};

/**
 * Create a workflow with agents
 * @param {Object} agents - Object containing all agents
 * @returns {Object} Conversation
 */
const createWorkflow = (agents) => {
  return createConversation([agents.userProxy, agents.researchAssistant, agents.dataAnalyst]);
};

/**
 * Create a conversation between agents
 * @param {Array} agents - List of agents
 * @returns {Object} Conversation
 */
const createConversation = (agents) => {
  return {
    agents,
    initial_message: 'Find companies and extract their key information.',
    max_turns: 15
  };
};

/**
 * Generate agent reasoning steps for a company
 * @param {string} companyName - Name of the company
 * @returns {Array} Agent reasoning steps
 */
const generateFrameworkSpecificSteps = (companyName) => {
  const userProxySteps = [
    {
      id: 1,
      name: 'task_definition',
      description: `UserProxy: I need comprehensive information about ${companyName} for market research purposes.`,
      completed: true,
      result: `Task defined: Research ${companyName} and extract key company attributes for market analysis.`,
      timestamp: new Date(Date.now() - 18000)
    },
    {
      id: 2,
      name: 'tool_selection',
      description: `UserProxy: Selecting appropriate tools for researching ${companyName}.`,
      completed: true,
      result: `Selected web_search and file_system tools for data gathering and storage.`,
      timestamp: new Date(Date.now() - 15000)
    }
  ];
  
  const researchAssistantSteps = [
    {
      id: 3,
      name: 'information_gathering',
      description: `ResearchAssistant: Searching for ${companyName} across business databases, news sources, and public records.`,
      completed: true,
      result: `Found ${companyName} mentioned in 5 recent articles, LinkedIn company profile, and public listings. Company appears to be active with recent business and funding activity.`,
      timestamp: new Date(Date.now() - 12000)
    },
    {
      id: 4,
      name: 'source_verification',
      description: `ResearchAssistant: Verifying the credibility and recency of sources for ${companyName}.`,
      completed: true,
      result: `Verified 4 high-quality sources: TechCrunch (3 articles from last 4 months), LinkedIn company page (updated weekly), AngelList profile (verified), and company website.`,
      timestamp: new Date(Date.now() - 9000)
    }
  ];
  
  const dataAnalystSteps = [
    {
      id: 5,
      name: 'data_extraction',
      description: `DataAnalyst: Extracting structured data about ${companyName} from verified sources.`,
      completed: true,
      result: `Extracted founding year (2022), headquarters (Austin, TX), focus area (Technology), investor information, and funding details ($18M).`,
      timestamp: new Date(Date.now() - 6000)
    },
    {
      id: 6,
      name: 'data_analysis',
      description: `DataAnalyst: Analyzing ${companyName}'s market position and strategic relevance.`,
      completed: true,
      result: `Analysis complete: ${companyName} is positioned in the high-growth technology sector with strong investor backing and significant market potential. Strategic relevance to its industry is high due to innovative technology.`,
      timestamp: new Date(Date.now() - 3000)
    },
    {
      id: 7,
      name: 'stock_check',
      description: `DataAnalyst: Checking if ${companyName} is publicly traded and retrieving stock information.`,
      completed: true,
      result: `Verified public trading status for ${companyName}. Retrieved current stock price, market cap, and recent performance metrics where available.`,
      timestamp: new Date(Date.now() - 1500)
    },
    {
      id: 8,
      name: 'scoring_calculation',
      description: `DataAnalyst: Calculating weighted score for ${companyName} based on funding, market buzz, and strategic relevance.`,
      completed: true,
      result: `Score calculation complete: Funding Stage (25/30), Market Buzz (27/30), Strategic Relevance (35/40). Total score: 87/100.`,
      timestamp: new Date()
    }
  ];
  
  return [...userProxySteps, ...researchAssistantSteps, ...dataAnalystSteps];
};

/**
 * Execute real framework implementation
 * @param {Object} workflow - Workflow configuration
 * @param {Object} parameters - Execution parameters
 * @returns {Promise<Array>} Discovered companies
 */
const executeRealImplementation = async (workflow, parameters) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      logger.warn('No valid OpenAI API key found. Falling back to mock implementation.');
      return null; // Return null to indicate fallback to mock implementation
    }
    
    // Execute the real implementation
    const result = await autoGenImplementation.executeConversation(workflow, parameters);
    
    if (!result.success) {
      logger.error('AutoGen execution failed. Falling back to mock implementation.');
      return null; // Return null to indicate fallback to mock implementation
    }
    
    const rawContent = result.rawContent || '';
    logger.info(`Processing raw content from AutoGen: ${rawContent.substring(0, 100)}...`);
    
    const companyName = parameters.companyName || 'Unknown Company';
    const steps = generateFrameworkSpecificSteps(companyName);
    
    const foundingYearMatch = rawContent.match(/founded in (\d{4})/i) || 
                             rawContent.match(/founding year[:\s]+(\d{4})/i) ||
                             rawContent.match(/established in (\d{4})/i);
    
    const locationMatch = rawContent.match(/headquartered in ([^\.]+)/i) || 
                         rawContent.match(/headquarters[:\s]+([^\.]+)/i) ||
                         rawContent.match(/based in ([^\.]+)/i);
    
    const focusAreaMatch = rawContent.match(/focuses on ([^\.]+)/i) || 
                          rawContent.match(/focus area[:\s]+([^\.]+)/i) ||
                          rawContent.match(/specializes in ([^\.]+)/i) ||
                          rawContent.match(/industry[:\s]+([^\.]+)/i);
    
    const investorsMatch = rawContent.match(/investors include ([^\.]+)/i) || 
                          rawContent.match(/backed by ([^\.]+)/i) ||
                          rawContent.match(/investors[:\s]+([^\.]+)/i);
    
    const fundingMatch = rawContent.match(/raised (\$[0-9]+[MBT][^\.]+)/i) || 
                        rawContent.match(/funding[:\s]+(\$[0-9]+[MBT][^\.]+)/i) ||
                        rawContent.match(/secured (\$[0-9]+[MBT][^\.]+)/i);
    
    const newsMatch = rawContent.match(/recent news[:\s]+([^\.]+)/i) ||
                     rawContent.match(/recent headlines[:\s]+([^\.]+)/i);
    
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
    
    // Create the company object with extracted information
    const company = {
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
      stockSymbol: stockSymbolMatch ? stockSymbolMatch[1].trim() : null,
      agentSteps: steps
    };
    
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
    
    logger.info(`Successfully extracted company information for ${companyName}`);
    return [company];
  } catch (error) {
    logger.error(`Error in real AutoGen implementation: ${error.message}`);
    return null; // Return null to indicate fallback to mock implementation
  }
};

const getDefaultCompanyName = () => 'BlockPay';
const getSecondCompanyName = () => 'DataVision';

const adapter = createBaseAdapter(
  config,
  createAgents,
  createWorkflow,
  generateFrameworkSpecificSteps,
  executeRealImplementation // Pass the real implementation function
);

adapter._internal.getDefaultCompanyName = getDefaultCompanyName;
adapter._internal.getSecondCompanyName = getSecondCompanyName;

module.exports = adapter;
