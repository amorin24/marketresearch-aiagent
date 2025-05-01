const configService = require('../../services/configService');
const fs = require('fs');
const path = require('path');

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}));

describe('Config Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getScoringWeights', () => {
    it('should return scoring weights from config file', () => {
      fs.readFileSync.mockReturnValue(JSON.stringify({
        fundingStage: 0.3,
        marketBuzz: 0.3,
        strategicRelevance: 0.4
      }));

      const weights = configService.getScoringWeights();

      expect(weights).toEqual({
        fundingStage: 0.3,
        marketBuzz: 0.3,
        strategicRelevance: 0.4
      });
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('scoring.json'),
        'utf8'
      );
    });

    it('should return default weights if config file cannot be read', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const weights = configService.getScoringWeights();

      expect(weights).toEqual({
        fundingStage: 0.3,
        marketBuzz: 0.3,
        strategicRelevance: 0.4
      });
    });
  });

  describe('updateScoringWeights', () => {
    it('should update scoring weights in config file', () => {
      const newWeights = {
        fundingStage: 0.25,
        marketBuzz: 0.35,
        strategicRelevance: 0.4
      };

      configService.updateScoringWeights(newWeights);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('scoring.json'),
        JSON.stringify(newWeights, null, 2),
        'utf8'
      );
    });

    it('should validate that weights sum to 1.0', () => {
      const invalidWeights = {
        fundingStage: 0.2,
        marketBuzz: 0.2,
        strategicRelevance: 0.2
      };

      expect(() => {
        configService.updateScoringWeights(invalidWeights);
      }).toThrow('Weights must sum to 1.0');

      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('getDataSourceConfig', () => {
    it('should return data source configuration from environment variables', () => {
      process.env.ENABLE_CRUNCHBASE = 'true';
      process.env.ENABLE_TECHCRUNCH = 'true';
      process.env.ENABLE_LINKEDIN = 'false';
      process.env.ENABLE_ANGELLIST = 'true';
      process.env.ENABLE_NEWS = 'true';

      const config = configService.getDataSourceConfig();

      expect(config).toEqual({
        crunchbase: true,
        techcrunch: true,
        linkedin: false,
        angellist: true,
        news: true
      });
    });

    it('should return default values if environment variables are not set', () => {
      delete process.env.ENABLE_CRUNCHBASE;
      delete process.env.ENABLE_TECHCRUNCH;
      delete process.env.ENABLE_LINKEDIN;
      delete process.env.ENABLE_ANGELLIST;
      delete process.env.ENABLE_NEWS;

      const config = configService.getDataSourceConfig();

      expect(config).toEqual({
        crunchbase: true,
        techcrunch: true,
        linkedin: true,
        angellist: true,
        news: true
      });
    });
  });
});
