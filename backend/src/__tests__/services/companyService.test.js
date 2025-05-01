const companyService = require('../../services/companyService');
const frameworkService = require('../../services/frameworkService');
const emailService = require('../../services/emailService');
const stockPriceService = require('../../services/stockPriceService');
const { logger } = require('../../index');

jest.mock('../../services/frameworkService', () => ({
  getFrameworkAdapter: jest.fn()
}));

jest.mock('../../services/emailService', () => ({
  sendResearchCompletionEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../services/stockPriceService', () => ({
  getStockSymbol: jest.fn(),
  getStockPrice: jest.fn()
}));

jest.mock('../../index', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-1234')
}));

describe('Company Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCompanies', () => {
    it('should return all companies', async () => {
      const result = await companyService.getAllCompanies();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getCompanyById', () => {
    it('should return null for non-existent company ID', async () => {
      const result = await companyService.getCompanyById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('startDiscovery', () => {
    it('should throw error if framework not found', async () => {
      frameworkService.getFrameworkAdapter.mockResolvedValue(null);

      await expect(companyService.startDiscovery('invalidFramework')).rejects.toThrow(
        'Framework invalidFramework not found or not enabled'
      );
    });

    it('should return a job ID and start discovery process', async () => {
      const mockAdapter = {
        discoverCompanies: jest.fn().mockResolvedValue([
          { name: 'TestCompany', focusArea: 'Technology' }
        ])
      };

      frameworkService.getFrameworkAdapter.mockResolvedValue(mockAdapter);

      const jobId = await companyService.startDiscovery('crewAI', { query: 'test' });

      expect(typeof jobId).toBe('string');
      expect(jobId).toBe('test-uuid-1234');
      
      await new Promise(resolve => process.nextTick(resolve));
      
      expect(mockAdapter.discoverCompanies).toHaveBeenCalledWith({ query: 'test' });
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Starting discovery job'));
    });
  });

  describe('getDiscoveryStatus', () => {
    it('should return null for non-existent job ID', async () => {
      const result = await companyService.getDiscoveryStatus('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('exportCompanies', () => {
    it('should export companies as JSON', async () => {
      const result = await companyService.exportCompanies('json');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should export companies as CSV', async () => {
      const result = await companyService.exportCompanies('csv');
      expect(typeof result).toBe('string');
      expect(result).toContain('ID,Name,FoundingYear,Location,FocusArea,Investors,FundingAmount,Score');
    });

    it('should throw error for unsupported format', async () => {
      await expect(companyService.exportCompanies('xml')).rejects.toThrow(
        'Unsupported export format: xml'
      );
    });
  });

  describe('startCompanyResearch', () => {
    it('should return a job ID and start research process', async () => {
      const mockAdapter = {
        discoverCompanies: jest.fn().mockResolvedValue([
          { 
            name: 'TestCompany', 
            focusArea: 'Technology',
            agentSteps: [{ id: 1, name: 'step1', description: 'Step 1', completed: true }]
          }
        ])
      };

      frameworkService.getFrameworkAdapter.mockResolvedValue(mockAdapter);
      stockPriceService.getStockSymbol.mockResolvedValue(null);

      const jobId = await companyService.startCompanyResearch('TestCompany', ['crewAI'], 'user@example.com');

      expect(typeof jobId).toBe('string');
      expect(jobId).toBe('test-uuid-1234');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockAdapter.discoverCompanies).toHaveBeenCalledWith({ companyName: 'TestCompany' });
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Starting company research job'));
    });

    it('should handle framework errors gracefully', async () => {
      frameworkService.getFrameworkAdapter.mockImplementation(() => {
        throw new Error('Framework error');
      });

      const jobId = await companyService.startCompanyResearch('TestCompany', ['crewAI'], null);
      
      expect(typeof jobId).toBe('string');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error in company research'));
    });
  });

  describe('getCompanyResearchStatus', () => {
    it('should return null for non-existent job ID', async () => {
      const result = await companyService.getCompanyResearchStatus('non-existent-id');
      expect(result).toBeNull();
    });
  });
});
