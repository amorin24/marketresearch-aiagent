jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

jest.mock('../../index', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  }
}));

const fs = require('fs');
const path = require('path');
const configService = require('../../services/configService');

describe('Config Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getScoringConfig', () => {
    it('should return scoring config from file', async () => {
      const mockConfig = {
        weights: {
          fundingStage: 0.3,
          marketBuzz: 0.3,
          strategicRelevance: 0.4
        }
      };
      
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockConfig));

      const config = await configService.getScoringConfig();

      expect(config).toEqual(mockConfig);
      expect(fs.promises.readFile).toHaveBeenCalledWith(
        expect.stringContaining('scoring.json'),
        'utf8'
      );
    });

    it('should throw error if config file cannot be read', async () => {
      const error = new Error('File not found');
      fs.promises.readFile.mockRejectedValue(error);

      await expect(configService.getScoringConfig()).rejects.toThrow('Failed to read scoring configuration');
      const { logger } = require('../../index');
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error reading scoring config'));
    });
  });

  describe('updateScoringConfig', () => {
    it('should update scoring config in file', async () => {
      const currentConfig = {
        weights: {
          fundingStage: 0.3,
          marketBuzz: 0.3,
          strategicRelevance: 0.4
        }
      };
      
      const newWeights = {
        fundingStage: 0.25,
        marketBuzz: 0.35,
        strategicRelevance: 0.4
      };
      
      fs.promises.readFile.mockResolvedValue(JSON.stringify(currentConfig));

      await configService.updateScoringConfig(newWeights);

      const expectedConfig = {
        weights: newWeights
      };
      
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('scoring.json'),
        JSON.stringify(expectedConfig, null, 2),
        'utf8'
      );
    });

    it('should throw error if weights do not sum to 1', async () => {
      const currentConfig = {
        weights: {
          fundingStage: 0.3,
          marketBuzz: 0.3,
          strategicRelevance: 0.4
        }
      };
      
      const invalidWeights = {
        fundingStage: 0.2,
        marketBuzz: 0.2,
        strategicRelevance: 0.2
      };
      
      fs.promises.readFile.mockResolvedValue(JSON.stringify(currentConfig));

      await expect(configService.updateScoringConfig(invalidWeights)).rejects.toThrow('Failed to update scoring configuration');
      expect(fs.promises.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('getDataSourceConfig', () => {
    it('should return data source config from file', async () => {
      const mockConfig = {
        sources: {
          crunchbase: { enabled: true, weight: 1.0 },
          techcrunch: { enabled: true, weight: 1.0 },
          linkedin: { enabled: false, weight: 1.0 },
          angellist: { enabled: true, weight: 1.0 },
          news: { enabled: true, weight: 1.0 }
        }
      };
      
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockConfig));

      const config = await configService.getDataSourceConfig();

      expect(config).toEqual(mockConfig);
      expect(fs.promises.readFile).toHaveBeenCalledWith(
        expect.stringContaining('datasources.json'),
        'utf8'
      );
    });

    it('should create default config if file does not exist', async () => {
      const error = { code: 'ENOENT' };
      fs.promises.readFile.mockRejectedValue(error);

      const config = await configService.getDataSourceConfig();

      expect(config).toEqual(expect.objectContaining({
        sources: expect.objectContaining({
          crunchbase: expect.any(Object),
          techcrunch: expect.any(Object),
          linkedin: expect.any(Object),
          angellist: expect.any(Object),
          news: expect.any(Object)
        })
      }));
      
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('datasources.json'),
        expect.any(String),
        'utf8'
      );
    });
  });

  describe('updateDataSourceConfig', () => {
    it('should update data source config in file', async () => {
      const currentConfig = {
        sources: {
          crunchbase: { enabled: true, weight: 1.0 },
          techcrunch: { enabled: true, weight: 1.0 },
          linkedin: { enabled: true, weight: 1.0 },
          angellist: { enabled: true, weight: 1.0 },
          news: { enabled: true, weight: 1.0 }
        }
      };
      
      const newSources = {
        crunchbase: { enabled: false, weight: 0.5 },
        linkedin: { enabled: false, weight: 0.8 }
      };
      
      fs.promises.readFile.mockResolvedValue(JSON.stringify(currentConfig));

      await configService.updateDataSourceConfig(newSources);

      const expectedConfig = {
        sources: {
          crunchbase: { enabled: false, weight: 0.5 },
          techcrunch: { enabled: true, weight: 1.0 },
          linkedin: { enabled: false, weight: 0.8 },
          angellist: { enabled: true, weight: 1.0 },
          news: { enabled: true, weight: 1.0 }
        }
      };
      
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('datasources.json'),
        JSON.stringify(expectedConfig, null, 2),
        'utf8'
      );
    });
  });
});
