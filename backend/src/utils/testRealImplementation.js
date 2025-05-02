const frameworkService = require('../services/frameworkService');
const dotenv = require('dotenv');

const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  warn: (message) => console.warn(`[WARN] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`)
};

dotenv.config();

/**
 * Test real implementation for a specific framework
 * @param {string} frameworkName - Name of the framework to test
 * @param {string} companyName - Name of the company to research
 * @returns {Promise<void>}
 */
async function testRealImplementation(frameworkName, companyName = 'Apple') {
  try {
    console.log(`\n=== Testing real implementation for ${frameworkName} with company: ${companyName} ===\n`);
    
    const framework = await frameworkService.getFrameworkAdapter(frameworkName);
    if (!framework) {
      console.error(`Framework adapter not found: ${frameworkName}`);
      return;
    }
    
    console.log('Framework adapter found, calling discoverCompanies...');
    console.log(`API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes (masked)' : 'No'}`);
    
    console.time(`${frameworkName} execution time`);
    const companies = await framework.discoverCompanies({ companyName });
    console.timeEnd(`${frameworkName} execution time`);
    
    if (!companies || companies.length === 0) {
      console.error(`No companies discovered for ${companyName} using ${frameworkName}`);
      return;
    }
    
    console.log(`\nDiscovered ${companies.length} companies:`);
    
    companies.forEach((company, index) => {
      console.log(`\n--- Company ${index + 1} ---`);
      
      console.log(`Name: ${company.name}`);
      console.log(`Founding Year: ${company.foundingYear || 'Unknown'}`);
      console.log(`Location: ${company.location || 'Unknown'}`);
      console.log(`Focus Area: ${company.focusArea || 'Unknown'}`);
      console.log(`Investors: ${company.investors && company.investors.length > 0 ? company.investors.join(', ') : 'Unknown'}`);
      console.log(`Funding Amount: ${company.fundingAmount || 'Unknown'}`);
      
      if (company.isPublic) {
        console.log(`Public Company: Yes`);
        console.log(`Stock Symbol: ${company.stockSymbol || 'Unknown'}`);
        
        if (company.stockPrice) {
          console.log(`Stock Price: $${company.stockPrice.currentPrice}`);
          console.log(`Change: ${company.stockPrice.change > 0 ? '+' : ''}${company.stockPrice.change} (${company.stockPrice.changePercent > 0 ? '+' : ''}${company.stockPrice.changePercent}%)`);
          console.log(`Market Cap: ${company.stockPrice.marketCap || 'Unknown'}`);
          console.log(`Last Updated: ${company.stockPrice.lastUpdated || 'Unknown'}`);
        }
      } else {
        console.log(`Public Company: No`);
      }
      
      if (company.newsHeadlines && company.newsHeadlines.length > 0) {
        console.log(`\nNews Headlines:`);
        company.newsHeadlines.forEach((headline, i) => {
          console.log(`  ${i + 1}. ${headline}`);
        });
      }
      
      if (company.agentSteps && company.agentSteps.length > 0) {
        console.log(`\nAgent Steps (${company.agentSteps.length}):`);
        company.agentSteps.forEach((step, i) => {
          console.log(`  ${i + 1}. ${step.name}: ${step.description}`);
          console.log(`     Result: ${step.result}`);
        });
      }
    });
    
    console.log(`\n=== Test completed for ${frameworkName} ===\n`);
  } catch (error) {
    console.error(`Error testing real implementation for ${frameworkName}:`);
    console.error(error.message);
    console.error(error.stack);
  }
}

const frameworkToTest = process.argv[2];
const companyName = process.argv[3] || 'Apple';

if (!frameworkToTest) {
  console.log('No specific framework specified. Testing all frameworks...');
  const frameworks = ['crewAI', 'squidAI', 'lettaAI', 'autoGen', 'langGraph'];
  
  (async () => {
    for (const framework of frameworks) {
      await testRealImplementation(framework, companyName);
    }
  })();
} else {
  testRealImplementation(frameworkToTest, companyName);
}
