const frameworkService = require('../../services/frameworkService');

jest.mock('../../adapters/crewAIAdapter', () => ({
  description: 'CrewAI Framework Adapter',
  discoverCompanies: jest.fn().mockResolvedValue([{ name: 'MockCompany' }])
}));

jest.mock('../../adapters/squidAIAdapter', () => ({
  description: 'SquidAI Framework Adapter',
  discoverCompanies: jest.fn().mockResolvedValue([{ name: 'MockCompany' }])
}));

jest.mock('../../adapters/lettaAIAdapter', () => ({
  description: 'LettaAI Framework Adapter',
  discoverCompanies: jest.fn().mockResolvedValue([{ name: 'MockCompany' }])
}));

jest.mock('../../adapters/autoGenAdapter', () => ({
  description: 'AutoGen Framework Adapter',
  discoverCompanies: jest.fn().mockResolvedValue([{ name: 'MockCompany' }])
}));

jest.mock('../../adapters/langGraphAdapter', () => ({
  description: 'LangGraph/LangChain Framework Adapter',
  discoverCompanies: jest.fn().mockResolvedValue([{ name: 'MockCompany' }])
}));

describe('Framework Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableFrameworks', () => {
    it('should return all available frameworks', () => {
      const frameworks = frameworkService.getAvailableFrameworks();
      expect(frameworks).toContain('crewAI');
      expect(frameworks).toContain('squidAI');
      expect(frameworks).toContain('lettaAI');
      expect(frameworks).toContain('autoGen');
      expect(frameworks).toContain('langGraph');
    });
  });

  describe('getFrameworkDetails', () => {
    it('should return details for a valid framework', () => {
      const details = frameworkService.getFrameworkDetails('crewAI');
      expect(details).toHaveProperty('description');
      expect(details.description).toBe('CrewAI Framework Adapter');
    });

    it('should throw an error for an invalid framework', () => {
      expect(() => {
        frameworkService.getFrameworkDetails('invalidFramework');
      }).toThrow('Framework not found: invalidFramework');
    });
  });

  describe('discoverCompanies', () => {
    it('should discover companies using the specified framework', async () => {
      const companies = await frameworkService.discoverCompanies('crewAI', { companyName: 'TestCompany' });
      expect(companies).toHaveLength(1);
      expect(companies[0].name).toBe('MockCompany');
    });

    it('should throw an error for an invalid framework', async () => {
      await expect(
        frameworkService.discoverCompanies('invalidFramework', {})
      ).rejects.toThrow('Framework not found: invalidFramework');
    });
  });

  describe('compareFrameworks', () => {
    it('should compare multiple frameworks', async () => {
      const results = await frameworkService.compareFrameworks(['crewAI', 'squidAI'], { companyName: 'TestCompany' });
      expect(results).toHaveLength(2);
      expect(results[0].framework).toBe('crewAI');
      expect(results[1].framework).toBe('squidAI');
      expect(results[0].companies).toHaveLength(1);
      expect(results[1].companies).toHaveLength(1);
    });

    it('should handle empty framework list', async () => {
      const results = await frameworkService.compareFrameworks([], {});
      expect(results).toHaveLength(0);
    });
  });
});
