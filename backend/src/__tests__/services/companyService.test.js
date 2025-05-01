const companyService = require('../../services/companyService');
const stockPriceService = require('../../services/stockPriceService');
const emailService = require('../../services/emailService');

jest.mock('../../services/stockPriceService', () => ({
  getStockPrice: jest.fn().mockResolvedValue({
    symbol: 'AAPL',
    currentPrice: 150.25,
    change: 2.5,
    changePercent: 1.75,
    marketCap: '$2.5T',
    lastUpdated: '2023-01-01T12:00:00Z'
  })
}));

jest.mock('../../services/emailService', () => ({
  sendResearchCompletionEmail: jest.fn().mockResolvedValue(true)
}));

describe('Company Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompanyDetails', () => {
    it('should return company details with stock price for public companies', async () => {
      const mockCompany = {
        name: 'Apple',
        isPublic: true,
        stockSymbol: 'AAPL'
      };

      const result = await companyService.getCompanyDetails(mockCompany);

      expect(result).toEqual({
        ...mockCompany,
        stockPrice: {
          symbol: 'AAPL',
          currentPrice: 150.25,
          change: 2.5,
          changePercent: 1.75,
          marketCap: '$2.5T',
          lastUpdated: '2023-01-01T12:00:00Z'
        }
      });
      expect(stockPriceService.getStockPrice).toHaveBeenCalledWith('AAPL');
    });

    it('should return company details without stock price for private companies', async () => {
      const mockCompany = {
        name: 'Private Company',
        isPublic: false,
        stockSymbol: null
      };

      const result = await companyService.getCompanyDetails(mockCompany);

      expect(result).toEqual(mockCompany);
      expect(stockPriceService.getStockPrice).not.toHaveBeenCalled();
    });
  });

  describe('notifyResearchCompletion', () => {
    it('should send email notification when email is provided', async () => {
      const email = 'user@example.com';
      const companyName = 'Apple';
      const framework = 'crewAI';

      await companyService.notifyResearchCompletion(email, companyName, framework);

      expect(emailService.sendResearchCompletionEmail).toHaveBeenCalledWith(
        email,
        expect.objectContaining({
          companyName,
          framework
        })
      );
    });

    it('should not send email notification when email is not provided', async () => {
      await companyService.notifyResearchCompletion(null, 'Apple', 'crewAI');

      expect(emailService.sendResearchCompletionEmail).not.toHaveBeenCalled();
    });
  });

  describe('calculateScores', () => {
    it('should calculate weighted scores correctly', () => {
      const company = {
        fundingAmount: '$50M',
        newsHeadlines: ['Company X raises $50M', 'Company X expands to Europe'],
        focusArea: 'Payments'
      };

      const weights = {
        fundingStage: 0.3,
        marketBuzz: 0.3,
        strategicRelevance: 0.4
      };

      const scores = companyService.calculateScores(company, weights);

      expect(scores).toHaveProperty('fundingScore');
      expect(scores).toHaveProperty('buzzScore');
      expect(scores).toHaveProperty('relevanceScore');
      expect(scores).toHaveProperty('totalScore');
      
      expect(scores.fundingScore).toBeGreaterThanOrEqual(0);
      expect(scores.fundingScore).toBeLessThanOrEqual(30);
      expect(scores.buzzScore).toBeGreaterThanOrEqual(0);
      expect(scores.buzzScore).toBeLessThanOrEqual(30);
      expect(scores.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(scores.relevanceScore).toBeLessThanOrEqual(40);
      expect(scores.totalScore).toBeGreaterThanOrEqual(0);
      expect(scores.totalScore).toBeLessThanOrEqual(100);
    });
  });
});
