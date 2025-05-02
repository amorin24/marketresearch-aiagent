/**
 * Test utility for verifying rate limit handling
 * 
 * This is a simple test script to verify that the rate limit handling works correctly.
 * It makes multiple rapid requests to the OpenAI API to trigger rate limiting.
 */

require('dotenv').config();
const { makeOpenAIRequest } = require('./openaiApiUtil');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'rate-limit-test.log' })
  ]
});

/**
 * Test rate limit handling by making multiple rapid requests
 */
const testRateLimitHandling = async () => {
  logger.info('Starting rate limit handling test');
  
  const makeTestRequest = async (index) => {
    logger.info(`Making test request #${index}`);
    
    const result = await makeOpenAIRequest({
      endpoint: '/v1/chat/completions',
      data: {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `This is test request #${index}. Respond with a short sentence.` }
        ],
        max_tokens: 50
      },
      apiKey: process.env.OPENAI_API_KEY,
      frameworkName: 'RateLimitTest',
      logger // Pass the logger to avoid importing from main application
    });
    
    if (result.success) {
      logger.info(`Request #${index} successful`);
    } else {
      logger.error(`Request #${index} failed: ${result.error}`);
    }
    
    return result;
  };
  
  const promises = [];
  const requestCount = 10; // Adjust as needed to trigger rate limiting
  
  for (let i = 1; i <= requestCount; i++) {
    promises.push(new Promise(resolve => {
      setTimeout(async () => {
        const result = await makeTestRequest(i);
        resolve(result);
      }, i * 100); // Small stagger between requests
    }));
  }
  
  const results = await Promise.all(promises);
  
  const successCount = results.filter(r => r.success).length;
  logger.info(`Test complete. ${successCount} of ${requestCount} requests succeeded.`);
  
  if (successCount < requestCount) {
    logger.info('Some requests likely hit rate limits and were retried or failed after retries.');
  }
};

if (require.main === module) {
  testRateLimitHandling()
    .then(() => {
      logger.info('Rate limit test completed');
      process.exit(0);
    })
    .catch(error => {
      logger.error(`Error in rate limit test: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  testRateLimitHandling
};
