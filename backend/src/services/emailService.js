const nodemailer = require('nodemailer');
const { logger } = require('../index');

let transporter = null;

/**
 * Initialize email service with configuration
 */
const initializeEmailService = () => {
  try {
    const emailEnabled = process.env.EMAIL_ENABLED === 'true';
    
    if (!emailEnabled) {
      logger.info('Email service disabled. Set EMAIL_ENABLED=true to enable.');
      return;
    }
    
    const host = process.env.EMAIL_HOST;
    const port = process.env.EMAIL_PORT;
    const secure = process.env.EMAIL_SECURE === 'true';
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    
    if (!host || !port || !user || !pass) {
      logger.error('Email configuration incomplete. Check environment variables.');
      return;
    }
    
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
    
    logger.info('Email service initialized successfully');
  } catch (error) {
    logger.error(`Error initializing email service: ${error.message}`);
  }
};

/**
 * Send research completion notification email
 * @param {string} email - Recipient email address
 * @param {string} companyName - Name of the researched company
 * @param {Object} results - Research results
 * @returns {Promise<boolean>} - Success status
 */
const sendResearchCompletionEmail = async (email, companyName, results) => {
  if (!email || !transporter) {
    return false;
  }
  
  try {
    const from = process.env.EMAIL_FROM || 'noreply@marketresearch-aiagent.com';
    
    const frameworkResultsHtml = Object.entries(results.frameworkResults)
      .map(([framework, result]) => {
        const displayName = framework
          .replace('Adapter', '')
          .replace(/([A-Z])/g, ' $1')
          .trim();
          
        return `
          <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 5px;">
            <h3 style="margin-top: 0;">${displayName}</h3>
            <p><strong>Score:</strong> ${result.score}/100</p>
            <p><strong>Summary:</strong> ${result.summary}</p>
          </div>
        `;
      })
      .join('');
    
    const message = {
      from,
      to: email,
      subject: `Market Research Results: ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Market Research Results</h1>
          <p>Your research for <strong>${companyName}</strong> has been completed.</p>
          
          <h2>Framework Results</h2>
          ${frameworkResultsHtml}
          
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost'}" style="background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
              View Full Results
            </a>
          </p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message from the Market Research AI Agent Testing Platform.
          </p>
        </div>
      `,
    };
    
    await transporter.sendMail(message);
    logger.info(`Research completion email sent to ${email} for company "${companyName}"`);
    return true;
  } catch (error) {
    logger.error(`Error sending research completion email: ${error.message}`);
    return false;
  }
};

module.exports = {
  initializeEmailService,
  sendResearchCompletionEmail,
};
