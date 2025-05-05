const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const winston = require('winston');

const { 
  configureCors, 
  configureRateLimit, 
  configureHelmet 
} = require('./middleware/security');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

exports.logger = logger;

const companyRoutes = require('./controllers/companyController');
const frameworkRoutes = require('./controllers/frameworkController');
const configRoutes = require('./controllers/configController');
const researchRoutes = require('./controllers/researchController');
const emailService = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 8000;

emailService.initializeEmailService();

app.use(configureCors());
app.use(configureHelmet());
app.use(express.json({ limit: '1mb' })); // Limit payload size

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

const apiLimiter = configureRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api', apiLimiter);

app.use('/api/companies', companyRoutes);
app.use('/api/frameworks', frameworkRoutes);
app.use('/api/config', configRoutes);
app.use('/api/research', researchRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const { globalErrorHandler } = require('./utils/errorHandler');

app.use(globalErrorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});

exports.app = app;
