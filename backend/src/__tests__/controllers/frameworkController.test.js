const frameworkController = require('../../controllers/frameworkController');
const frameworkService = require('../../services/frameworkService');

jest.mock('../../services/frameworkService', () => ({
  getAvailableFrameworks: jest.fn(),
  getFrameworkDetails: jest.fn(),
  discoverCompanies: jest.fn(),
  compareFrameworks: jest.fn()
}));

describe('Framework Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe('getFrameworks', () => {
    it('should return available frameworks', async () => {
      frameworkService.getAvailableFrameworks.mockReturnValue(['crewAI', 'squidAI']);

      await frameworkController.getFrameworks(req, res, next);

      expect(frameworkService.getAvailableFrameworks).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        frameworks: ['crewAI', 'squidAI']
      });
    });

    it('should handle errors', async () => {
      frameworkService.getAvailableFrameworks.mockImplementation(() => {
        throw new Error('Service error');
      });

      await frameworkController.getFrameworks(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getFrameworkDetails', () => {
    it('should return framework details', async () => {
      req.params.framework = 'crewAI';

      frameworkService.getFrameworkDetails.mockReturnValue({
        description: 'CrewAI Framework',
        capabilities: ['capability1', 'capability2']
      });

      await frameworkController.getFrameworkDetails(req, res, next);

      expect(frameworkService.getFrameworkDetails).toHaveBeenCalledWith('crewAI');
      expect(res.json).toHaveBeenCalledWith({
        description: 'CrewAI Framework',
        capabilities: ['capability1', 'capability2']
      });
    });

    it('should handle framework not found', async () => {
      req.params.framework = 'invalidFramework';

      frameworkService.getFrameworkDetails.mockImplementation(() => {
        throw new Error('Framework not found: invalidFramework');
      });

      await frameworkController.getFrameworkDetails(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('discoverCompanies', () => {
    it('should discover companies using specified framework', async () => {
      req.params.framework = 'crewAI';
      req.body = { companyName: 'TestCompany' };

      frameworkService.discoverCompanies.mockResolvedValue([
        { name: 'TestCompany', focusArea: 'Technology' }
      ]);

      await frameworkController.discoverCompanies(req, res, next);

      expect(frameworkService.discoverCompanies).toHaveBeenCalledWith('crewAI', { companyName: 'TestCompany' });
      expect(res.json).toHaveBeenCalledWith({
        companies: [{ name: 'TestCompany', focusArea: 'Technology' }]
      });
    });

    it('should handle discovery errors', async () => {
      req.params.framework = 'crewAI';
      req.body = { companyName: 'TestCompany' };

      frameworkService.discoverCompanies.mockRejectedValue(new Error('Discovery error'));

      await frameworkController.discoverCompanies(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('compareFrameworks', () => {
    it('should compare multiple frameworks', async () => {
      req.body = {
        frameworks: ['crewAI', 'squidAI'],
        parameters: { companyName: 'TestCompany' }
      };

      frameworkService.compareFrameworks.mockResolvedValue([
        {
          framework: 'crewAI',
          companies: [{ name: 'TestCompany' }]
        },
        {
          framework: 'squidAI',
          companies: [{ name: 'TestCompany' }]
        }
      ]);

      await frameworkController.compareFrameworks(req, res, next);

      expect(frameworkService.compareFrameworks).toHaveBeenCalledWith(
        ['crewAI', 'squidAI'],
        { companyName: 'TestCompany' }
      );
      expect(res.json).toHaveBeenCalledWith({
        results: [
          {
            framework: 'crewAI',
            companies: [{ name: 'TestCompany' }]
          },
          {
            framework: 'squidAI',
            companies: [{ name: 'TestCompany' }]
          }
        ]
      });
    });

    it('should handle comparison errors', async () => {
      req.body = {
        frameworks: ['crewAI', 'invalidFramework'],
        parameters: { companyName: 'TestCompany' }
      };

      frameworkService.compareFrameworks.mockRejectedValue(new Error('Comparison error'));

      await frameworkController.compareFrameworks(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
