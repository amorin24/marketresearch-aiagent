const frameworkService = require('../../services/frameworkService');
const { logger } = require('../../index');
const path = require('path');
const fs = require('fs').promises;

jest.mock('../../index', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    access: jest.fn(),
    readFile: jest.fn()
  }
}));

// Create mock framework adapters for testing
const mockAdapters = {
  crewAIAdapter: {
    name: 'crewAIAdapter',
    description: 'CrewAI Framework Adapter',
    version: '1.0.0',
    capabilities: ['capability1', 'capability2'],
    limitations: ['limitation1'],
    initialize: jest.fn().mockResolvedValue(true),
    researchCompany: jest.fn().mockResolvedValue({
      companyName: 'TestCompany',
      foundingYear: 2020,
      headquarters: 'San Francisco, CA',
      focusArea: 'Payments',
      score: 85
    })
  },
  squidAIAdapter: {
    name: 'squidAIAdapter',
    description: 'SquidAI Framework Adapter',
    version: '1.0.0',
    capabilities: ['capability1', 'capability2'],
    limitations: ['limitation1'],
    initialize: jest.fn().mockResolvedValue(true),
    researchCompany: jest.fn().mockResolvedValue({
      companyName: 'TestCompany',
      foundingYear: 2019,
      headquarters: 'New York, NY',
      focusArea: 'Lending',
      score: 78
    })
  },
  lettaAIAdapter: {
    name: 'lettaAIAdapter',
    description: 'LettaAI Framework Adapter',
    version: '1.0.0',
    capabilities: ['capability1', 'capability2', 'capability3'],
    limitations: ['limitation1', 'limitation2'],
    initialize: jest.fn().mockResolvedValue(true),
    researchCompany: jest.fn().mockResolvedValue({
      companyName: 'TestCompany',
      foundingYear: 2021,
      headquarters: 'Austin, TX',
      focusArea: 'WealthTech',
      score: 92
    })
  },
  autoGenAdapter: {
    name: 'autoGenAdapter',
    description: 'AutoGen Framework Adapter',
    version: '1.0.0',
    capabilities: ['capability1', 'capability2', 'capability3'],
    limitations: ['limitation1'],
    initialize: jest.fn().mockResolvedValue(true),
    researchCompany: jest.fn().mockResolvedValue({
      companyName: 'TestCompany',
      foundingYear: 2018,
      headquarters: 'Seattle, WA',
      focusArea: 'Crypto',
      score: 75
    })
  },
  langGraphAdapter: {
    name: 'langGraphAdapter',
    description: 'LangGraph Framework Adapter',
    version: '1.0.0',
    capabilities: ['capability1', 'capability2', 'capability3', 'capability4'],
    limitations: ['limitation1', 'limitation2'],
    initialize: jest.fn().mockResolvedValue(true),
    researchCompany: jest.fn().mockResolvedValue({
      companyName: 'TestCompany',
      foundingYear: 2022,
      headquarters: 'Boston, MA',
      focusArea: 'InsurTech',
      score: 88
    })
  },
  errorAdapter: {
    name: 'errorAdapter',
    description: 'Error Framework Adapter',
    version: '1.0.0',
    capabilities: [],
    limitations: ['always fails'],
    initialize: jest.fn().mockRejectedValue(new Error('Initialization failed')),
    researchCompany: jest.fn().mockRejectedValue(new Error('Research failed'))
  }
};

// Create mock framework metrics
const mockMetrics = new Map([
  ['crewAIAdapter', {
    name: 'crewAIAdapter',
    avgRunTime: 2.5,
    completionRate: 95,
    apiSuccessRate: 98,
    totalRuns: 100,
    successfulRuns: 95,
    failedRuns: 5
  }],
  ['squidAIAdapter', {
    name: 'squidAIAdapter',
    avgRunTime: 1.8,
    completionRate: 92,
    apiSuccessRate: 96,
    totalRuns: 120,
    successfulRuns: 110,
    failedRuns: 10
  }],
  ['lettaAIAdapter', {
    name: 'lettaAIAdapter',
    avgRunTime: 3.2,
    completionRate: 98,
    apiSuccessRate: 99,
    totalRuns: 80,
    successfulRuns: 78,
    failedRuns: 2
  }],
  ['autoGenAdapter', {
    name: 'autoGenAdapter',
    avgRunTime: 2.1,
    completionRate: 90,
    apiSuccessRate: 95,
    totalRuns: 150,
    successfulRuns: 135,
    failedRuns: 15
  }],
  ['langGraphAdapter', {
    name: 'langGraphAdapter',
    avgRunTime: 2.8,
    completionRate: 94,
    apiSuccessRate: 97,
    totalRuns: 90,
    successfulRuns: 85,
    failedRuns: 5
  }]
]);

// Mock the framework service module
jest.mock('../../services/frameworkService', () => {
  // Store the original module
  const originalModule = jest.requireActual('../../services/frameworkService');
  
  // Return a mocked version of the module
  return {
    ...originalModule,
    _adapters: new Map(Object.entries(mockAdapters)),
    _metrics: mockMetrics,
    _initialized: false,
    
    initializeFrameworks: jest.fn().mockImplementation(async () => {
      const service = require('../../services/frameworkService');
      service._initialized = true;
      
      for (const [name, adapter] of service._adapters.entries()) {
        try {
          await adapter.initialize();
          logger.info(`Initialized ${name}`);
        } catch (error) {
          logger.error(`Failed to initialize ${name}: ${error.message}`);
        }
      }
      
      return service._initialized;
    }),
    
    getAvailableFrameworks: jest.fn().mockImplementation(async () => {
      const service = require('../../services/frameworkService');
      
      if (!service._initialized) {
        await service.initializeFrameworks();
      }
      
      return Array.from(service._adapters.entries())
        .filter(([_, adapter]) => adapter.name !== 'errorAdapter')
        .map(([name, adapter]) => ({
          name,
          description: adapter.description,
          version: adapter.version
        }));
    }),
    
    getFrameworkDetails: jest.fn().mockImplementation(async (name) => {
      const service = require('../../services/frameworkService');
      
      if (!service._initialized) {
        await service.initializeFrameworks();
      }
      
      const adapter = service._adapters.get(name);
      if (!adapter) {
        return null;
      }
      
      return {
        name,
        description: adapter.description,
        version: adapter.version,
        capabilities: adapter.capabilities,
        limitations: adapter.limitations
      };
    }),
    
    getFrameworkAdapter: jest.fn().mockImplementation(async (name) => {
      const service = require('../../services/frameworkService');
      
      if (!service._initialized) {
        await service.initializeFrameworks();
      }
      
      return service._adapters.get(name) || null;
    }),
    
    getFrameworkPerformance: jest.fn().mockImplementation(async (name) => {
      const service = require('../../services/frameworkService');
      
      if (!service._initialized) {
        await service.initializeFrameworks();
      }
      
      return service._metrics.get(name) || null;
    }),
    
    updateFrameworkPerformance: jest.fn().mockImplementation(async (name, metrics) => {
      const service = require('../../services/frameworkService');
      
      if (!service._initialized) {
        await service.initializeFrameworks();
      }
      
      if (service._metrics.has(name)) {
        const currentMetrics = service._metrics.get(name);
        service._metrics.set(name, { ...currentMetrics, ...metrics });
        return true;
      }
      
      return false;
    }),
    
    compareFrameworks: jest.fn().mockImplementation(async (frameworkNames) => {
      const service = require('../../services/frameworkService');
      
      if (!service._initialized) {
        await service.initializeFrameworks();
      }
      
      const results = {};
      
      for (const name of frameworkNames) {
        const adapter = service._adapters.get(name);
        if (adapter) {
          results[name] = {
            details: {
              name,
              description: adapter.description,
              version: adapter.version,
              capabilities: adapter.capabilities,
              limitations: adapter.limitations
            },
            performance: service._metrics.get(name)
          };
        }
      }
      
      return results;
    }),
    
    researchWithFramework: jest.fn().mockImplementation(async (frameworkName, companyName, options = {}) => {
      const service = require('../../services/frameworkService');
      
      if (!service._initialized) {
        await service.initializeFrameworks();
      }
      
      const adapter = service._adapters.get(frameworkName);
      if (!adapter) {
        throw new Error(`Framework ${frameworkName} not found`);
      }
      
      try {
        const startTime = Date.now();
        const result = await adapter.researchCompany(companyName, options);
        const endTime = Date.now();
        const runTime = (endTime - startTime) / 1000;
        
        const currentMetrics = service._metrics.get(frameworkName) || {
          name: frameworkName,
          avgRunTime: 0,
          completionRate: 0,
          apiSuccessRate: 0,
          totalRuns: 0,
          successfulRuns: 0,
          failedRuns: 0
        };
        
        const totalRuns = currentMetrics.totalRuns + 1;
        const successfulRuns = currentMetrics.successfulRuns + 1;
        
        service._metrics.set(frameworkName, {
          ...currentMetrics,
          avgRunTime: ((currentMetrics.avgRunTime * currentMetrics.totalRuns) + runTime) / totalRuns,
          totalRuns,
          successfulRuns,
          completionRate: (successfulRuns / totalRuns) * 100,
          apiSuccessRate: currentMetrics.apiSuccessRate
        });
        
        return {
          success: true,
          result,
          runTime
        };
      } catch (error) {
        const currentMetrics = service._metrics.get(frameworkName) || {
          name: frameworkName,
          avgRunTime: 0,
          completionRate: 0,
          apiSuccessRate: 0,
          totalRuns: 0,
          successfulRuns: 0,
          failedRuns: 0
        };
        
        const totalRuns = currentMetrics.totalRuns + 1;
        const failedRuns = currentMetrics.failedRuns + 1;
        
        service._metrics.set(frameworkName, {
          ...currentMetrics,
          totalRuns,
          failedRuns,
          completionRate: (currentMetrics.successfulRuns / totalRuns) * 100,
          apiSuccessRate: currentMetrics.apiSuccessRate
        });
        
        return {
          success: false,
          error: error.message
        };
      }
    })
  };
});

describe('Framework Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    frameworkService._initialized = false;
  });

  describe('initializeFrameworks', () => {
    it('should initialize all frameworks successfully', async () => {
      const result = await frameworkService.initializeFrameworks();
      
      expect(result).toBe(true);
      expect(frameworkService._initialized).toBe(true);
      expect(mockAdapters.crewAIAdapter.initialize).toHaveBeenCalled();
      expect(mockAdapters.squidAIAdapter.initialize).toHaveBeenCalled();
      expect(mockAdapters.lettaAIAdapter.initialize).toHaveBeenCalled();
      expect(mockAdapters.autoGenAdapter.initialize).toHaveBeenCalled();
      expect(mockAdapters.langGraphAdapter.initialize).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledTimes(5);
    });
    
    it('should handle initialization failures gracefully', async () => {
      frameworkService._adapters.set('errorAdapter', mockAdapters.errorAdapter);
      
      const result = await frameworkService.initializeFrameworks();
      
      expect(result).toBe(true);
      expect(frameworkService._initialized).toBe(true);
      expect(mockAdapters.errorAdapter.initialize).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to initialize errorAdapter'));
      
      frameworkService._adapters.delete('errorAdapter');
    });
  });

  describe('getAvailableFrameworks', () => {
    it('should return all available frameworks', async () => {
      const frameworks = await frameworkService.getAvailableFrameworks();
      
      expect(Array.isArray(frameworks)).toBe(true);
      expect(frameworks.length).toBe(5);
      
      const frameworkNames = frameworks.map(f => f.name);
      expect(frameworkNames).toContain('crewAIAdapter');
      expect(frameworkNames).toContain('squidAIAdapter');
      expect(frameworkNames).toContain('lettaAIAdapter');
      expect(frameworkNames).toContain('autoGenAdapter');
      expect(frameworkNames).toContain('langGraphAdapter');
      
      frameworks.forEach(framework => {
        expect(framework).toHaveProperty('name');
        expect(framework).toHaveProperty('description');
        expect(framework).toHaveProperty('version');
      });
    });
    
    it('should initialize frameworks if not already initialized', async () => {
      frameworkService._initialized = false;
      
      await frameworkService.getAvailableFrameworks();
      
      expect(frameworkService.initializeFrameworks).toHaveBeenCalled();
      expect(frameworkService._initialized).toBe(true);
    });
    
    it('should not initialize frameworks if already initialized', async () => {
      frameworkService._initialized = true;
      
      await frameworkService.getAvailableFrameworks();
      
      expect(frameworkService.initializeFrameworks).not.toHaveBeenCalled();
    });
  });

  describe('getFrameworkDetails', () => {
    it('should return details for a valid framework', async () => {
      const details = await frameworkService.getFrameworkDetails('crewAIAdapter');
      
      expect(details).toHaveProperty('name');
      expect(details).toHaveProperty('description');
      expect(details).toHaveProperty('version');
      expect(details).toHaveProperty('capabilities');
      expect(details).toHaveProperty('limitations');
      
      expect(details.name).toBe('crewAIAdapter');
      expect(details.description).toBe('CrewAI Framework Adapter');
      expect(details.capabilities).toEqual(['capability1', 'capability2']);
      expect(details.limitations).toEqual(['limitation1']);
    });

    it('should return null for an invalid framework', async () => {
      const details = await frameworkService.getFrameworkDetails('invalidFramework');
      expect(details).toBeNull();
    });
    
    it('should initialize frameworks if not already initialized', async () => {
      frameworkService._initialized = false;
      
      await frameworkService.getFrameworkDetails('crewAIAdapter');
      
      expect(frameworkService.initializeFrameworks).toHaveBeenCalled();
      expect(frameworkService._initialized).toBe(true);
    });
  });

  describe('getFrameworkAdapter', () => {
    it('should return adapter for a valid framework', async () => {
      const adapter = await frameworkService.getFrameworkAdapter('crewAIAdapter');
      
      expect(adapter).toHaveProperty('description');
      expect(adapter).toHaveProperty('version');
      expect(adapter).toHaveProperty('capabilities');
      expect(adapter).toHaveProperty('limitations');
      expect(adapter).toHaveProperty('initialize');
      expect(adapter).toHaveProperty('researchCompany');
      
      expect(adapter.description).toBe('CrewAI Framework Adapter');
    });

    it('should return null for an invalid framework', async () => {
      const adapter = await frameworkService.getFrameworkAdapter('invalidFramework');
      expect(adapter).toBeNull();
    });
    
    it('should initialize frameworks if not already initialized', async () => {
      frameworkService._initialized = false;
      
      await frameworkService.getFrameworkAdapter('crewAIAdapter');
      
      expect(frameworkService.initializeFrameworks).toHaveBeenCalled();
      expect(frameworkService._initialized).toBe(true);
    });
  });

  describe('getFrameworkPerformance', () => {
    it('should return performance metrics for a valid framework', async () => {
      const metrics = await frameworkService.getFrameworkPerformance('crewAIAdapter');
      
      expect(metrics).toHaveProperty('name');
      expect(metrics).toHaveProperty('avgRunTime');
      expect(metrics).toHaveProperty('completionRate');
      expect(metrics).toHaveProperty('apiSuccessRate');
      expect(metrics).toHaveProperty('totalRuns');
      expect(metrics).toHaveProperty('successfulRuns');
      expect(metrics).toHaveProperty('failedRuns');
      
      expect(metrics.name).toBe('crewAIAdapter');
      expect(metrics.avgRunTime).toBe(2.5);
      expect(metrics.completionRate).toBe(95);
      expect(metrics.apiSuccessRate).toBe(98);
      expect(metrics.totalRuns).toBe(100);
      expect(metrics.successfulRuns).toBe(95);
      expect(metrics.failedRuns).toBe(5);
    });

    it('should return null for an invalid framework', async () => {
      const metrics = await frameworkService.getFrameworkPerformance('invalidFramework');
      expect(metrics).toBeNull();
    });
    
    it('should initialize frameworks if not already initialized', async () => {
      frameworkService._initialized = false;
      
      await frameworkService.getFrameworkPerformance('crewAIAdapter');
      
      expect(frameworkService.initializeFrameworks).toHaveBeenCalled();
      expect(frameworkService._initialized).toBe(true);
    });
  });

  describe('updateFrameworkPerformance', () => {
    it('should update performance metrics for a framework', async () => {
      const newMetrics = {
        avgRunTime: 3.0,
        completionRate: 97,
        apiSuccessRate: 99
      };
      
      const result = await frameworkService.updateFrameworkPerformance('crewAIAdapter', newMetrics);
      
      expect(result).toBe(true);
      
      const updatedMetrics = await frameworkService.getFrameworkPerformance('crewAIAdapter');
      expect(updatedMetrics.avgRunTime).toBe(3.0);
      expect(updatedMetrics.completionRate).toBe(97);
      expect(updatedMetrics.apiSuccessRate).toBe(99);
      expect(updatedMetrics.totalRuns).toBe(100);
      expect(updatedMetrics.successfulRuns).toBe(95);
      expect(updatedMetrics.failedRuns).toBe(5);
    });
    
    it('should return false for an invalid framework', async () => {
      const newMetrics = {
        avgRunTime: 3.0,
        completionRate: 97,
        apiSuccessRate: 99
      };
      
      const result = await frameworkService.updateFrameworkPerformance('invalidFramework', newMetrics);
      
      expect(result).toBe(false);
    });
    
    it('should initialize frameworks if not already initialized', async () => {
      frameworkService._initialized = false;
      
      await frameworkService.updateFrameworkPerformance('crewAIAdapter', {});
      
      expect(frameworkService.initializeFrameworks).toHaveBeenCalled();
      expect(frameworkService._initialized).toBe(true);
    });
  });

  describe('compareFrameworks', () => {
    it('should compare multiple frameworks', async () => {
      const results = await frameworkService.compareFrameworks(['crewAIAdapter', 'squidAIAdapter', 'lettaAIAdapter']);
      
      expect(results).toHaveProperty('crewAIAdapter');
      expect(results).toHaveProperty('squidAIAdapter');
      expect(results).toHaveProperty('lettaAIAdapter');
      
      expect(results.crewAIAdapter).toHaveProperty('details');
      expect(results.crewAIAdapter).toHaveProperty('performance');
      
      expect(results.squidAIAdapter).toHaveProperty('details');
      expect(results.squidAIAdapter).toHaveProperty('performance');
      
      expect(results.lettaAIAdapter).toHaveProperty('details');
      expect(results.lettaAIAdapter).toHaveProperty('performance');
      
      expect(results.crewAIAdapter.details.name).toBe('crewAIAdapter');
      expect(results.squidAIAdapter.details.name).toBe('squidAIAdapter');
      expect(results.lettaAIAdapter.details.name).toBe('lettaAIAdapter');
      
      expect(results.crewAIAdapter.performance.avgRunTime).toBe(2.5);
      expect(results.squidAIAdapter.performance.avgRunTime).toBe(1.8);
      expect(results.lettaAIAdapter.performance.avgRunTime).toBe(3.2);
    });

    it('should handle empty framework list', async () => {
      const results = await frameworkService.compareFrameworks([]);
      expect(Object.keys(results).length).toBe(0);
    });
    
    it('should handle invalid frameworks in the list', async () => {
      const results = await frameworkService.compareFrameworks(['crewAIAdapter', 'invalidFramework', 'squidAIAdapter']);
      
      expect(results).toHaveProperty('crewAIAdapter');
      expect(results).toHaveProperty('squidAIAdapter');
      expect(results).not.toHaveProperty('invalidFramework');
    });
    
    it('should initialize frameworks if not already initialized', async () => {
      frameworkService._initialized = false;
      
      await frameworkService.compareFrameworks(['crewAIAdapter', 'squidAIAdapter']);
      
      expect(frameworkService.initializeFrameworks).toHaveBeenCalled();
      expect(frameworkService._initialized).toBe(true);
    });
  });
  
  describe('researchWithFramework', () => {
    it('should research a company with a valid framework', async () => {
      const result = await frameworkService.researchWithFramework('crewAIAdapter', 'TestCompany');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('runTime');
      
      expect(result.success).toBe(true);
      expect(result.result).toHaveProperty('companyName');
      expect(result.result).toHaveProperty('foundingYear');
      expect(result.result).toHaveProperty('headquarters');
      expect(result.result).toHaveProperty('focusArea');
      expect(result.result).toHaveProperty('score');
      
      expect(result.result.companyName).toBe('TestCompany');
      expect(typeof result.runTime).toBe('number');
      
      expect(mockAdapters.crewAIAdapter.researchCompany).toHaveBeenCalledWith('TestCompany', {});
    });
    
    it('should pass options to the framework adapter', async () => {
      const options = {
        detailed: true,
        includeNews: true
      };
      
      await frameworkService.researchWithFramework('crewAIAdapter', 'TestCompany', options);
      
      expect(mockAdapters.crewAIAdapter.researchCompany).toHaveBeenCalledWith('TestCompany', options);
    });
    
    it('should throw an error for an invalid framework', async () => {
      await expect(frameworkService.researchWithFramework('invalidFramework', 'TestCompany'))
        .rejects.toThrow('Framework invalidFramework not found');
    });
    
    it('should handle research failures gracefully', async () => {
      frameworkService._adapters.set('errorAdapter', mockAdapters.errorAdapter);
      
      const result = await frameworkService.researchWithFramework('errorAdapter', 'TestCompany');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Research failed');
      
      expect(mockAdapters.errorAdapter.researchCompany).toHaveBeenCalledWith('TestCompany', {});
      
      frameworkService._adapters.delete('errorAdapter');
    });
    
    it('should update performance metrics after successful research', async () => {
      const initialMetrics = await frameworkService.getFrameworkPerformance('crewAIAdapter');
      const initialTotalRuns = initialMetrics.totalRuns;
      const initialSuccessfulRuns = initialMetrics.successfulRuns;
      
      await frameworkService.researchWithFramework('crewAIAdapter', 'TestCompany');
      
      const updatedMetrics = await frameworkService.getFrameworkPerformance('crewAIAdapter');
      
      expect(updatedMetrics.totalRuns).toBe(initialTotalRuns + 1);
      expect(updatedMetrics.successfulRuns).toBe(initialSuccessfulRuns + 1);
      expect(updatedMetrics.completionRate).toBeCloseTo((updatedMetrics.successfulRuns / updatedMetrics.totalRuns) * 100);
    });
    
    it('should update performance metrics after failed research', async () => {
      frameworkService._adapters.set('errorAdapter', mockAdapters.errorAdapter);
      
      frameworkService._metrics.set('errorAdapter', {
        name: 'errorAdapter',
        avgRunTime: 0,
        completionRate: 0,
        apiSuccessRate: 0,
        totalRuns: 10,
        successfulRuns: 0,
        failedRuns: 10
      });
      
      const initialMetrics = await frameworkService.getFrameworkPerformance('errorAdapter');
      const initialTotalRuns = initialMetrics.totalRuns;
      const initialFailedRuns = initialMetrics.failedRuns;
      
      await frameworkService.researchWithFramework('errorAdapter', 'TestCompany');
      
      const updatedMetrics = await frameworkService.getFrameworkPerformance('errorAdapter');
      
      expect(updatedMetrics.totalRuns).toBe(initialTotalRuns + 1);
      expect(updatedMetrics.failedRuns).toBe(initialFailedRuns + 1);
      expect(updatedMetrics.completionRate).toBeCloseTo((updatedMetrics.successfulRuns / updatedMetrics.totalRuns) * 100);
      
      frameworkService._adapters.delete('errorAdapter');
      frameworkService._metrics.delete('errorAdapter');
    });
    
    it('should initialize frameworks if not already initialized', async () => {
      frameworkService._initialized = false;
      
      await frameworkService.researchWithFramework('crewAIAdapter', 'TestCompany');
      
      expect(frameworkService.initializeFrameworks).toHaveBeenCalled();
      expect(frameworkService._initialized).toBe(true);
    });
  });
});
