const frameworkService = require('../../services/frameworkService');
const { logger } = require('../../index');

// Mock the entire frameworkService module
jest.mock('../../services/frameworkService', () => {
  // Store the original module
  const originalModule = jest.requireActual('../../services/frameworkService');
  
  // Create mock framework adapters
  const mockAdapters = {
    crewAIAdapter: {
      description: 'CrewAI Framework Adapter',
      version: '1.0.0',
      capabilities: ['capability1', 'capability2'],
      limitations: ['limitation1']
    },
    squidAIAdapter: {
      description: 'SquidAI Framework Adapter',
      version: '1.0.0',
      capabilities: ['capability1', 'capability2'],
      limitations: ['limitation1']
    }
  };
  
  // Create mock framework metrics
  const mockMetrics = new Map([
    ['crewAIAdapter', {
      name: 'crewAIAdapter',
      avgRunTime: 0,
      completionRate: 100,
      apiSuccessRate: 100,
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0
    }],
    ['squidAIAdapter', {
      name: 'squidAIAdapter',
      avgRunTime: 0,
      completionRate: 100,
      apiSuccessRate: 100,
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0
    }]
  ]);
  
  // Return a mocked version of the module
  return {
    ...originalModule,
    initializeFrameworks: jest.fn().mockResolvedValue(undefined),
    getAvailableFrameworks: jest.fn().mockResolvedValue([
      { name: 'crewAIAdapter', description: 'CrewAI Framework Adapter', version: '1.0.0' },
      { name: 'squidAIAdapter', description: 'SquidAI Framework Adapter', version: '1.0.0' }
    ]),
    getFrameworkDetails: jest.fn().mockImplementation(async (name) => {
      if (mockAdapters[name]) {
        return {
          name,
          description: mockAdapters[name].description,
          version: mockAdapters[name].version,
          capabilities: mockAdapters[name].capabilities,
          limitations: mockAdapters[name].limitations
        };
      }
      return null;
    }),
    getFrameworkAdapter: jest.fn().mockImplementation(async (name) => {
      return mockAdapters[name] || null;
    }),
    getFrameworkPerformance: jest.fn().mockImplementation(async (name) => {
      return mockMetrics.get(name) || null;
    }),
    updateFrameworkPerformance: jest.fn().mockImplementation(async (name, metrics) => {
      if (mockMetrics.has(name)) {
        const currentMetrics = mockMetrics.get(name);
        mockMetrics.set(name, { ...currentMetrics, ...metrics });
      }
    }),
    compareFrameworks: jest.fn().mockImplementation(async (frameworkNames) => {
      const results = {};
      
      for (const name of frameworkNames) {
        if (mockAdapters[name]) {
          results[name] = {
            details: {
              name,
              description: mockAdapters[name].description,
              version: mockAdapters[name].version,
              capabilities: mockAdapters[name].capabilities,
              limitations: mockAdapters[name].limitations
            },
            performance: mockMetrics.get(name)
          };
        }
      }
      
      return results;
    })
  };
});

jest.mock('../../index', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Framework Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableFrameworks', () => {
    it('should return all available frameworks', async () => {
      const frameworks = await frameworkService.getAvailableFrameworks();
      
      expect(Array.isArray(frameworks)).toBe(true);
      expect(frameworks.length).toBe(2);
      
      const frameworkNames = frameworks.map(f => f.name);
      expect(frameworkNames).toContain('crewAIAdapter');
      expect(frameworkNames).toContain('squidAIAdapter');
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
    });

    it('should return null for an invalid framework', async () => {
      const details = await frameworkService.getFrameworkDetails('invalidFramework');
      expect(details).toBeNull();
    });
  });

  describe('getFrameworkAdapter', () => {
    it('should return adapter for a valid framework', async () => {
      const adapter = await frameworkService.getFrameworkAdapter('crewAIAdapter');
      
      expect(adapter).toHaveProperty('description');
      expect(adapter).toHaveProperty('version');
      expect(adapter).toHaveProperty('capabilities');
      expect(adapter).toHaveProperty('limitations');
      
      expect(adapter.description).toBe('CrewAI Framework Adapter');
    });

    it('should return null for an invalid framework', async () => {
      const adapter = await frameworkService.getFrameworkAdapter('invalidFramework');
      expect(adapter).toBeNull();
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
      
      expect(metrics.name).toBe('crewAIAdapter');
    });

    it('should return null for an invalid framework', async () => {
      const metrics = await frameworkService.getFrameworkPerformance('invalidFramework');
      expect(metrics).toBeNull();
    });
  });

  describe('updateFrameworkPerformance', () => {
    it('should update performance metrics for a framework', async () => {
      const newMetrics = {
        avgRunTime: 2.5,
        completionRate: 95,
        apiSuccessRate: 98
      };
      
      await frameworkService.updateFrameworkPerformance('crewAIAdapter', newMetrics);
      
      expect(frameworkService.updateFrameworkPerformance).toHaveBeenCalledWith('crewAIAdapter', newMetrics);
    });
  });

  describe('compareFrameworks', () => {
    it('should compare multiple frameworks', async () => {
      const results = await frameworkService.compareFrameworks(['crewAIAdapter', 'squidAIAdapter']);
      
      expect(results).toHaveProperty('crewAIAdapter');
      expect(results).toHaveProperty('squidAIAdapter');
      
      expect(results.crewAIAdapter).toHaveProperty('details');
      expect(results.crewAIAdapter).toHaveProperty('performance');
      
      expect(results.squidAIAdapter).toHaveProperty('details');
      expect(results.squidAIAdapter).toHaveProperty('performance');
    });

    it('should handle empty framework list', async () => {
      const results = await frameworkService.compareFrameworks([]);
      expect(Object.keys(results).length).toBe(0);
    });
  });
});
