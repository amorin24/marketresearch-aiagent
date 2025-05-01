const axios = require('axios');
const { logger } = require('../index');

/**
 * Check if a company is publicly traded and get its stock symbol
 * @param {string} companyName - Name of the company
 * @returns {Promise<Object|null>} Stock symbol or null if not public
 */
const getStockSymbol = async (companyName) => {
  try {
    if (!process.env.ALPHA_VANTAGE_API_KEY) {
      logger.warn('Alpha Vantage API key not configured. Stock price retrieval disabled.');
      return null;
    }
    
    const response = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: companyName,
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      }
    });
    
    if (response.data && response.data.bestMatches && response.data.bestMatches.length > 0) {
      const bestMatch = response.data.bestMatches[0];
      return {
        symbol: bestMatch['1. symbol'],
        name: bestMatch['2. name'],
        type: bestMatch['3. type'],
        region: bestMatch['4. region'],
        marketOpen: bestMatch['5. marketOpen'],
        marketClose: bestMatch['6. marketClose'],
        timezone: bestMatch['7. timezone'],
        currency: bestMatch['8. currency'],
        matchScore: bestMatch['9. matchScore']
      };
    }
    
    return null;
  } catch (error) {
    logger.error(`Error checking if company is public: ${error.message}`);
    return null;
  }
};

/**
 * Get stock price data for a symbol
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object|null>} Stock price data or null if unavailable
 */
const getStockPrice = async (symbol) => {
  try {
    if (!process.env.ALPHA_VANTAGE_API_KEY) {
      logger.warn('Alpha Vantage API key not configured. Stock price retrieval disabled.');
      return null;
    }
    
    const response = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      }
    });
    
    if (response.data && response.data['Global Quote']) {
      const quote = response.data['Global Quote'];
      return {
        symbol: quote['01. symbol'],
        currentPrice: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        lastUpdated: new Date()
      };
    }
    
    return null;
  } catch (error) {
    logger.error(`Error retrieving stock price: ${error.message}`);
    return null;
  }
};

module.exports = {
  getStockSymbol,
  getStockPrice
};
