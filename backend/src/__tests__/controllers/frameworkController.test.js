const express = require('express');
const request = require('supertest');
const frameworkService = require('../../services/frameworkService');
const { logger } = require('../../index');

jest.mock('../../services/frameworkService', () => ({
  getAvailableFrameworks: jest.fn(),
  getFrameworkDetails: jest.fn(),
  getFrameworkPerformance: jest.fn(),
  discoverCompanies: jest.fn(),
  compareFrameworks: jest.fn()
}));

jest.mock('../../index', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Framework Controller', () => {
  let app;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    const frameworkController = require('../../controllers/frameworkController');
    app.use('/api/frameworks', frameworkController);
    
    const { globalErrorHandler } = require('../../utils/errorHandler');
    app.use(globalErrorHandler);
  });
  
  describe('GET /', () => {
    it('should return available frameworks', async () => {
      frameworkService.getAvailableFrameworks.mockReturnValue(['crewAI', 'squidAI']);
      
      const response = await request(app)
        .get('/api/frameworks')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(frameworkService.getAvailableFrameworks).toHaveBeenCalled();
      expect(response.body).toEqual(['crewAI', 'squidAI']);
    });
    
    it('should handle errors', async () => {
      frameworkService.getAvailableFrameworks.mockImplementation(() => {
        throw new Error('Service error');
      });
      
      const response = await request(app)
        .get('/api/frameworks')
        .expect('Content-Type', /json/)
        .expect(500);
      
      expect(response.body).toEqual({ error: 'Failed to fetch frameworks' });
      expect(logger.error).toHaveBeenCalled();
    });
  });
  
  describe('GET /:name', () => {
    it('should return framework details', async () => {
      const frameworkDetails = {
        description: 'CrewAI Framework',
        capabilities: ['capability1', 'capability2']
      };
      
      frameworkService.getFrameworkDetails.mockReturnValue(frameworkDetails);
      
      const response = await request(app)
        .get('/api/frameworks/crewAI')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(frameworkService.getFrameworkDetails).toHaveBeenCalledWith('crewAI');
      expect(response.body).toEqual(frameworkDetails);
    });
    
    it('should handle framework not found', async () => {
      frameworkService.getFrameworkDetails.mockReturnValue(null);
      
      const response = await request(app)
        .get('/api/frameworks/invalidFramework')
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body).toEqual({ error: 'Framework not found' });
    });
    
    it('should handle errors', async () => {
      frameworkService.getFrameworkDetails.mockImplementation(() => {
        throw new Error('Service error');
      });
      
      const response = await request(app)
        .get('/api/frameworks/crewAI')
        .expect('Content-Type', /json/)
        .expect(500);
      
      expect(response.body).toEqual({ error: 'Failed to fetch framework details' });
      expect(logger.error).toHaveBeenCalled();
    });
  });
  
  describe('GET /:name/performance', () => {
    it('should return framework performance metrics', async () => {
      const performanceMetrics = {
        avgRunTime: 2.5,
        completionRate: 0.95,
        apiSuccessRate: 0.98
      };
      
      frameworkService.getFrameworkPerformance.mockReturnValue(performanceMetrics);
      
      const response = await request(app)
        .get('/api/frameworks/crewAI/performance')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(frameworkService.getFrameworkPerformance).toHaveBeenCalledWith('crewAI');
      expect(response.body).toEqual(performanceMetrics);
    });
    
    it('should handle metrics not found', async () => {
      frameworkService.getFrameworkPerformance.mockReturnValue(null);
      
      const response = await request(app)
        .get('/api/frameworks/crewAI/performance')
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body).toEqual({ error: 'Framework metrics not found' });
    });
  });
  
  describe('POST /compare', () => {
    it('should compare multiple frameworks', async () => {
      const requestBody = {
        frameworks: ['crewAI', 'squidAI'],
        parameters: { companyName: 'TestCompany' }
      };
      
      const comparisonResults = [
        {
          framework: 'crewAI',
          companies: [{ name: 'TestCompany' }]
        },
        {
          framework: 'squidAI',
          companies: [{ name: 'TestCompany' }]
        }
      ];
      
      frameworkService.compareFrameworks.mockResolvedValue(comparisonResults);
      
      const response = await request(app)
        .post('/api/frameworks/compare')
        .send(requestBody)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(frameworkService.compareFrameworks).toHaveBeenCalledWith(
        ['crewAI', 'squidAI']
      );
      expect(response.body).toEqual(comparisonResults);
    });
    
    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/frameworks/compare')
        .send({ frameworks: ['crewAI'] }) // Only one framework
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toEqual({ 
        error: 'At least two frameworks must be specified for comparison' 
      });
    });
    
    it('should handle comparison errors', async () => {
      frameworkService.compareFrameworks.mockRejectedValue(new Error('Comparison error'));
      
      const response = await request(app)
        .post('/api/frameworks/compare')
        .send({
          frameworks: ['crewAI', 'squidAI'],
          parameters: { companyName: 'TestCompany' }
        })
        .expect('Content-Type', /json/)
        .expect(500);
      
      expect(response.body).toEqual({ error: 'Failed to compare frameworks' });
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
