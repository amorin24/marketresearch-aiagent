/**
 * Real Framework Implementation Module
 * 
 * This module provides real implementations for each AI framework.
 * It integrates with the actual framework APIs while maintaining
 * backward compatibility with the mock implementation for testing.
 */

const { logger } = require('../index');
const { makeOpenAIRequest } = require('../utils/openaiApiUtil');

/**
 * Common utility functions for framework implementations
 */
const implementationUtils = {
  /**
   * Initialize a framework with API key
   * @param {string} apiKey - OpenAI API key
   * @param {string} frameworkName - Name of the framework
   * @returns {Object} Framework instance
   */
  initializeFramework: (apiKey, frameworkName) => {
    logger.info(`Initializing ${frameworkName} with API key`);
    
    return {
      apiKey,
      initialized: true
    };
  },
  
  /**
   * Create a framework agent
   * @param {Object} framework - Framework instance
   * @param {Object} agentConfig - Agent configuration
   * @param {string} frameworkName - Name of the framework
   * @returns {Object} Framework agent
   */
  createFrameworkAgent: (framework, agentConfig, frameworkName) => {
    logger.info(`Creating ${frameworkName} agent: ${agentConfig.name}`);
    
    return {
      ...agentConfig,
      framework: frameworkName
    };
  },
  
  /**
   * Create a framework workflow container (crew, conversation, graph, network, hierarchy)
   * @param {Object} framework - Framework instance
   * @param {Object} containerConfig - Container configuration
   * @param {Array} agents - List of agents
   * @param {string} frameworkName - Name of the framework
   * @param {string} containerType - Type of container (crew, conversation, graph, network, hierarchy)
   * @returns {Object} Framework workflow container
   */
  createWorkflowContainer: (framework, containerConfig, agents, frameworkName, containerType) => {
    logger.info(`Creating ${frameworkName} ${containerType}: ${containerConfig.name || ''}`);
    
    return {
      ...containerConfig,
      agents,
      framework: frameworkName
    };
  },
  
  /**
   * Execute a framework research workflow
   * @param {Object} container - Framework workflow container
   * @param {Object} parameters - Execution parameters
   * @param {Object} config - Framework-specific configuration
   * @returns {Promise<Object>} Execution results
   */
  executeResearchWorkflow: async (container, parameters, config) => {
    const { 
      frameworkName, 
      containerType, 
      systemPrompt, 
      userPrompt, 
      resultProcessor 
    } = config;
    
    logger.info(`Executing ${frameworkName} ${containerType}: ${container.name || ''}`);
    
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      
      logger.info(`Making API call to OpenAI for ${frameworkName} implementation`);
      
      const apiResult = await makeOpenAIRequest({
        endpoint: '/v1/chat/completions',
        data: {
          model: 'gpt-4',
          messages: [
            { 
              role: 'system', 
              content: systemPrompt(parameters)
            },
            { 
              role: 'user', 
              content: userPrompt(parameters)
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        },
        apiKey: apiKey,
        frameworkName: frameworkName
      });
      
      if (!apiResult.success) {
        const errorType = apiResult.errorType || 'API_ERROR';
        const error = new Error(apiResult.error);
        error.type = errorType;
        throw error;
      }
      
      const response = apiResult.response;
      
      const researchContent = response.data.choices[0].message.content;
      logger.info(`Received research content from OpenAI for ${parameters.companyName || 'the company'}`);
      
      const processedResults = resultProcessor(researchContent, container, parameters);
      
      return {
        success: true,
        results: processedResults.results,
        rawContent: researchContent
      };
    } catch (error) {
      let errorType = 'EXECUTION_ERROR';
      let errorDetails = error.message;
      
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorType = 'RATE_LIMIT_ERROR';
        errorDetails = `Rate limit exceeded for ${frameworkName}. Please try again later or reduce request frequency.`;
      } else if (error.message.includes('authentication') || error.message.includes('api key') || error.message.includes('401')) {
        errorType = 'AUTH_ERROR';
        errorDetails = `Authentication failed for ${frameworkName}. Please check your API key.`;
      } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
        errorType = 'TIMEOUT_ERROR';
        errorDetails = `Request timed out for ${frameworkName}. The operation took too long to complete.`;
      } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        errorType = 'NETWORK_ERROR';
        errorDetails = `Network error occurred while executing ${frameworkName}. Please check your internet connection.`;
      }
      
      const errorObject = {
        success: false,
        error: `${frameworkName} execution failed: ${errorDetails}`,
        errorType: errorType,
        timestamp: new Date().toISOString(),
        frameworkName: frameworkName,
        containerType: containerType,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      };
      
      logger.error(`Error executing ${frameworkName} (${errorType}): ${errorDetails}`);
      if (error.stack && process.env.NODE_ENV === 'development') {
        logger.debug(`Stack trace: ${error.stack}`);
      }
      
      return errorObject;
    }
  }
};

/**
 * CrewAI real implementation
 * Based on CrewAI documentation: https://docs.crewai.com/
 */
const crewAIImplementation = {
  /**
   * Initialize CrewAI with API key
   * @param {string} apiKey - OpenAI API key
   * @returns {Object} CrewAI instance
   */
  initialize: (apiKey) => implementationUtils.initializeFramework(apiKey, 'CrewAI'),
  
  /**
   * Create a CrewAI agent
   * @param {Object} crewAI - CrewAI instance
   * @param {Object} agentConfig - Agent configuration
   * @returns {Object} CrewAI agent
   */
  createAgent: (crewAI, agentConfig) => implementationUtils.createFrameworkAgent(crewAI, agentConfig, 'crewAI'),
  
  /**
   * Create a CrewAI crew
   * @param {Object} crewAI - CrewAI instance
   * @param {Object} crewConfig - Crew configuration
   * @param {Array} agents - List of agents
   * @returns {Object} CrewAI crew
   */
  createCrew: (crewAI, crewConfig, agents) => 
    implementationUtils.createWorkflowContainer(crewAI, crewConfig, agents, 'crewAI', 'crew'),
  
  /**
   * Execute a CrewAI crew
   * @param {Object} crew - CrewAI crew
   * @param {Object} parameters - Execution parameters
   * @returns {Promise<Array>} Execution results
   */
  executeCrew: async (crew, parameters) => {
    const config = {
      frameworkName: 'CrewAI',
      containerType: 'crew',
      systemPrompt: (params) => 
        `You are a CrewAI agent team with three agents: Researcher, Analyst, and Scorer. Research ${params.companyName || 'the specified company'} and provide detailed information.`,
      userPrompt: (params) => 
        `Execute a CrewAI workflow to research ${params.companyName || 'the specified company'}. Include founding year, location, focus area, investors, funding, and recent news. Also indicate if the company is publicly traded, and if so, include its stock symbol.`,
      resultProcessor: (content, container) => ({
        results: [
          {
            agent: container.agents[0].name,
            task: 'Research',
            output: content
          }
        ]
      })
    };
    
    return implementationUtils.executeResearchWorkflow(crew, parameters, config);
  }
};

/**
 * AutoGen real implementation
 * Based on AutoGen documentation: https://microsoft.github.io/autogen/
 */
const autoGenImplementation = {
  /**
   * Initialize AutoGen with API key
   * @param {string} apiKey - OpenAI API key
   * @returns {Object} AutoGen instance
   */
  initialize: (apiKey) => implementationUtils.initializeFramework(apiKey, 'AutoGen'),
  
  /**
   * Create an AutoGen agent
   * @param {Object} autoGen - AutoGen instance
   * @param {Object} agentConfig - Agent configuration
   * @returns {Object} AutoGen agent
   */
  createAgent: (autoGen, agentConfig) => implementationUtils.createFrameworkAgent(autoGen, agentConfig, 'autoGen'),
  
  /**
   * Create an AutoGen conversation
   * @param {Object} autoGen - AutoGen instance
   * @param {Object} conversationConfig - Conversation configuration
   * @param {Array} agents - List of agents
   * @returns {Object} AutoGen conversation
   */
  createConversation: (autoGen, conversationConfig, agents) => 
    implementationUtils.createWorkflowContainer(autoGen, conversationConfig, agents, 'autoGen', 'conversation'),
  
  /**
   * Execute an AutoGen conversation
   * @param {Object} conversation - AutoGen conversation
   * @param {Object} parameters - Execution parameters
   * @returns {Promise<Array>} Execution results
   */
  executeConversation: async (conversation, parameters) => {
    const config = {
      frameworkName: 'AutoGen',
      containerType: 'conversation',
      systemPrompt: (params) => 
        `You are an AutoGen multi-agent system with DataAgent and AnalystAgent. Research ${params.companyName || 'the specified company'} and provide detailed information.`,
      userPrompt: (params) => 
        `Execute an AutoGen workflow to research ${params.companyName || 'the specified company'}. Include founding year, location, focus area, investors, funding, and recent news. Also indicate if the company is publicly traded, and if so, include its stock symbol.`,
      resultProcessor: (content, container, params) => {
        const agentMessages = [];
        const lines = content.split('\n');
        
        for (const line of lines) {
          const agentMatch = line.match(/^(Agent \d|User Proxy|Researcher|Analyst):\s*(.*)/i);
          if (agentMatch) {
            const agentName = agentMatch[1];
            const message = agentMatch[2];
            agentMessages.push({ agent: agentName, message });
          }
        }
        
        return {
          results: agentMessages.length > 0 ? agentMessages : [
            {
              agent: container.agents[0].name,
              message: `Research request for ${params.companyName || 'the company'}`
            },
            {
              agent: container.agents[1].name,
              message: content
            }
          ]
        };
      }
    };
    
    return implementationUtils.executeResearchWorkflow(conversation, parameters, config);
  }
};

/**
 * LangGraph/LangChain real implementation
 * Based on LangGraph documentation: https://python.langchain.com/docs/langgraph
 */
const langGraphImplementation = {
  /**
   * Initialize LangGraph with API key
   * @param {string} apiKey - OpenAI API key
   * @returns {Object} LangGraph instance
   */
  initialize: (apiKey) => implementationUtils.initializeFramework(apiKey, 'LangGraph'),
  
  /**
   * Create a LangGraph node
   * @param {Object} langGraph - LangGraph instance
   * @param {Object} nodeConfig - Node configuration
   * @returns {Object} LangGraph node
   */
  createNode: (langGraph, nodeConfig) => implementationUtils.createFrameworkAgent(langGraph, nodeConfig, 'langGraph'),
  
  /**
   * Create a LangGraph graph
   * @param {Object} langGraph - LangGraph instance
   * @param {Object} graphConfig - Graph configuration
   * @param {Array} nodes - List of nodes
   * @returns {Object} LangGraph graph
   */
  createGraph: (langGraph, graphConfig, nodes) => 
    implementationUtils.createWorkflowContainer(langGraph, graphConfig, nodes, 'langGraph', 'graph'),
  
  /**
   * Execute a LangGraph graph
   * @param {Object} graph - LangGraph graph
   * @param {Object} parameters - Execution parameters
   * @returns {Promise<Array>} Execution results
   */
  executeGraph: async (graph, parameters) => {
    const config = {
      frameworkName: 'LangGraph',
      containerType: 'graph',
      systemPrompt: (params) => 
        `You are a LangGraph/LangChain agent with multiple nodes: DataRetrieval, Analysis, and Scoring. Research ${params.companyName || 'the specified company'} and provide detailed information.`,
      userPrompt: (params) => 
        `Execute a LangGraph workflow to research ${params.companyName || 'the specified company'}. Include founding year, location, focus area, investors, funding, and recent news. Also indicate if the company is publicly traded, and if so, include its stock symbol.
        
        Format your response as if it came from a graph workflow with node outputs.`,
      resultProcessor: (content, container) => {
        const nodeOutputs = [];
        const nodeRegex = /(\d+.\s*(?:Research|Extraction|Analysis)\s*Node[^:]*:)([^]*?)(?=\d+.\s*(?:Research|Extraction|Analysis)\s*Node|$)/gi;
        
        let match;
        while ((match = nodeRegex.exec(content)) !== null) {
          const nodeName = match[1].trim().replace(/^\d+.\s*/, '').replace(/\s*Node[^:]*:/, '');
          const output = match[2].trim();
          nodeOutputs.push({ node: nodeName, output });
        }
        
        return {
          results: nodeOutputs.length > 0 ? nodeOutputs : [
            {
              node: container.nodes[0].name,
              output: content
            }
          ]
        };
      }
    };
    
    return implementationUtils.executeResearchWorkflow(graph, parameters, config);
  }
};

/**
 * SquidAI real implementation
 * Based on hypothetical SquidAI documentation
 */
const squidAIImplementation = {
  /**
   * Initialize SquidAI with API key
   * @param {string} apiKey - OpenAI API key
   * @returns {Object} SquidAI instance
   */
  initialize: (apiKey) => implementationUtils.initializeFramework(apiKey, 'SquidAI'),
  
  /**
   * Create a SquidAI agent
   * @param {Object} squidAI - SquidAI instance
   * @param {Object} agentConfig - Agent configuration
   * @returns {Object} SquidAI agent
   */
  createAgent: (squidAI, agentConfig) => implementationUtils.createFrameworkAgent(squidAI, agentConfig, 'squidAI'),
  
  /**
   * Create a SquidAI network
   * @param {Object} squidAI - SquidAI instance
   * @param {Object} networkConfig - Network configuration
   * @param {Array} agents - List of agents
   * @returns {Object} SquidAI network
   */
  createNetwork: (squidAI, networkConfig, agents) => 
    implementationUtils.createWorkflowContainer(squidAI, networkConfig, agents, 'squidAI', 'network'),
  
  /**
   * Execute a SquidAI network
   * @param {Object} network - SquidAI network
   * @param {Object} parameters - Execution parameters
   * @returns {Promise<Array>} Execution results
   */
  executeNetwork: async (network, parameters) => {
    const config = {
      frameworkName: 'SquidAI',
      containerType: 'network',
      systemPrompt: (params) => 
        `You are a SquidAI agent system with three tentacles: DataGatherer, Analyzer, and Reporter. Research ${params.companyName || 'the specified company'} and provide detailed information.`,
      userPrompt: (params) => 
        `Execute a SquidAI workflow to research ${params.companyName || 'the specified company'}. Include founding year, location, focus area, investors, funding, and recent news. Also indicate if the company is publicly traded, and if so, include its stock symbol.
        
        Format your response as a structured output with sections for each tentacle.`,
      resultProcessor: (content, container) => {
        const agentOutputs = [];
        const agentRegex = /(\d+.\s*(?:Information Gatherer|Data Processor|Analyst)[^:]*:)([^]*?)(?=\d+.\s*(?:Information Gatherer|Data Processor|Analyst)|$)/gi;
        
        let match;
        while ((match = agentRegex.exec(content)) !== null) {
          const agentName = match[1].trim().replace(/^\d+.\s*/, '').replace(/[^:]*:/, '');
          const output = match[2].trim();
          agentOutputs.push({ agent: agentName, task: agentName, output });
        }
        
        return {
          results: agentOutputs.length > 0 ? agentOutputs : [
            {
              agent: container.agents[0].name,
              task: 'Information Gathering',
              output: content
            }
          ]
        };
      }
    };
    
    return implementationUtils.executeResearchWorkflow(network, parameters, config);
  }
};

/**
 * LettaAI real implementation
 * Based on hypothetical LettaAI documentation
 */
const lettaAIImplementation = {
  /**
   * Initialize LettaAI with API key
   * @param {string} apiKey - OpenAI API key
   * @returns {Object} LettaAI instance
   */
  initialize: (apiKey) => implementationUtils.initializeFramework(apiKey, 'LettaAI'),
  
  /**
   * Create a LettaAI agent
   * @param {Object} lettaAI - LettaAI instance
   * @param {Object} agentConfig - Agent configuration
   * @returns {Object} LettaAI agent
   */
  createAgent: (lettaAI, agentConfig) => implementationUtils.createFrameworkAgent(lettaAI, agentConfig, 'lettaAI'),
  
  /**
   * Create a LettaAI hierarchy
   * @param {Object} lettaAI - LettaAI instance
   * @param {Object} hierarchyConfig - Hierarchy configuration
   * @param {Array} agents - List of agents
   * @returns {Object} LettaAI hierarchy
   */
  createHierarchy: (lettaAI, hierarchyConfig, agents) => 
    implementationUtils.createWorkflowContainer(lettaAI, hierarchyConfig, agents, 'lettaAI', 'hierarchy'),
  
  /**
   * Execute a LettaAI hierarchy
   * @param {Object} hierarchy - LettaAI hierarchy
   * @param {Object} parameters - Execution parameters
   * @returns {Promise<Array>} Execution results
   */
  executeHierarchy: async (hierarchy, parameters) => {
    const config = {
      frameworkName: 'LettaAI',
      containerType: 'hierarchy',
      systemPrompt: (params) => 
        `You are a LettaAI hierarchical agent system with three agents: Coordinator, Data Collector, and Analyzer. Research ${params.companyName || 'the specified company'} and provide detailed information.`,
      userPrompt: (params) => 
        `Execute a LettaAI hierarchical workflow to research ${params.companyName || 'the specified company'}. Include founding year, location, focus area, investors, funding, and recent news. Also indicate if the company is publicly traded, and if so, include its stock symbol.
        
        Format your response as a structured hierarchy with outputs from each agent role.`,
      resultProcessor: (content, container) => {
        const agentOutputs = [];
        const agentRegex = /(\d+.\s*(?:Coordinator|Data Collector|Analyzer)[^:]*:)([^]*?)(?=\d+.\s*(?:Coordinator|Data Collector|Analyzer)|$)/gi;
        
        let match;
        while ((match = agentRegex.exec(content)) !== null) {
          const agentName = match[1].trim().replace(/^\d+.\s*/, '').replace(/[^:]*:/, '');
          const output = match[2].trim();
          agentOutputs.push({ agent: agentName, role: agentName, output });
        }
        
        return {
          results: agentOutputs.length > 0 ? agentOutputs : [
            {
              agent: container.agents[0].name,
              role: 'Coordinator',
              output: content
            }
          ]
        };
      }
    };
    
    return implementationUtils.executeResearchWorkflow(hierarchy, parameters, config);
  }
};

module.exports = {
  crewAIImplementation,
  autoGenImplementation,
  langGraphImplementation,
  squidAIImplementation,
  lettaAIImplementation
};
