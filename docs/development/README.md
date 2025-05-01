# Development Guide

This guide provides information for developers who want to extend or modify the Market Research AI Agent Testing Platform.

## Architecture Overview

The platform follows a modular architecture designed for extensibility:

### Backend

- **Core Service Layer**: Handles API requests and orchestrates workflows
- **Framework Adapter Layer**: Modular adapters for each AI framework
- **Data Retrieval Layer**: Manages public data source connections
- **Scoring Engine**: Implements the weighted scoring model
- **API Layer**: RESTful endpoints for frontend communication

### Frontend

- **React + TailwindCSS**: Modern UI framework with utility-first CSS
- **Context API**: State management for framework selection and data
- **React Router**: Navigation between different views
- **TypeScript**: Type safety for improved development experience

## Directory Structure

```
marketresearch-aiagent/
├── backend/
│   ├── src/
│   │   ├── adapters/         # Framework adapters
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # API controllers
│   │   ├── models/           # Data models
│   │   ├── services/         # Business logic
│   │   └── index.js          # Entry point
│   ├── .env.example          # Environment variables template
│   └── package.json          # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React context providers
│   │   ├── pages/            # Page components
│   │   ├── types/            # TypeScript type definitions
│   │   ├── App.tsx           # Main application component
│   │   └── main.tsx          # Entry point
│   ├── index.html            # HTML template
│   └── package.json          # Frontend dependencies
└── docs/                     # Documentation
```

## Adding a New Framework

To add a new AI agent framework to the platform:

1. **Create a new adapter** in `backend/src/adapters/`:

```javascript
// newFrameworkAdapter.js
const { logger } = require('../index');

// Framework configuration
const config = {
  description: 'New Framework Adapter',
  version: '1.0.0',
  capabilities: [
    // List framework capabilities
  ],
  limitations: [
    // List framework limitations
  ]
};

/**
 * Discover fintech companies using the new framework
 * @param {Object} parameters - Discovery parameters
 * @returns {Promise<Array>} Discovered companies
 */
const discoverCompanies = async (parameters = {}) => {
  try {
    logger.info('Starting company discovery with New Framework');
    
    // Implement framework-specific discovery logic
    
    return companies;
  } catch (error) {
    logger.error(`Error in New Framework discovery: ${error.message}`);
    throw error;
  }
};

module.exports = {
  ...config,
  discoverCompanies
};
```

2. **Update environment variables** in `.env`:

```
NEW_FRAMEWORK_ENABLED=true
```

3. **Update the frontend** to include the new framework in the selector.

## Supported Frameworks

The platform currently supports the following AI agent frameworks:

### CrewAI

[CrewAI](https://docs.crewai.com/) is a framework for orchestrating role-playing autonomous AI agents. The CrewAI adapter implements:

- Multi-agent collaboration with specialized roles
- Sequential and parallel task execution
- Memory and context sharing between agents

### SquidAI

SquidAI is a framework focused on distributed AI agent workflows. The SquidAI adapter provides:

- Distributed task processing
- Specialized agent roles
- Efficient resource utilization

### LettaAI

LettaAI is a lightweight framework for simple AI agent tasks. The LettaAI adapter offers:

- Streamlined agent creation
- Basic task execution
- Minimal configuration requirements

### AutoGen

[AutoGen](https://microsoft.github.io/autogen/) is a framework that enables the development of LLM applications using multiple agents that can converse with each other to solve tasks. The AutoGen adapter implements:

- Multi-agent conversations
- Tool use and function calling
- Customizable agent behaviors
- Human-in-the-loop interactions
- Code generation and execution

### LangGraph/LangChain

[LangGraph](https://python.langchain.com/docs/langgraph) is an extension of [LangChain](https://python.langchain.com/docs/get_started) that provides a state graph abstraction for creating stateful, multi-actor applications with LLMs. The LangGraph/LangChain adapter offers:

- Composable agent workflows
- State management and persistence
- Cyclical and conditional execution flows
- Extensive tool integration
- Document processing and retrieval

## Adding a New Data Source

To add a new data source:

1. **Create a data retrieval service** in `backend/src/services/`:

```javascript
// newDataSourceService.js
const axios = require('axios');
const { logger } = require('../index');

/**
 * Fetch data from the new source
 * @param {Object} parameters - Search parameters
 * @returns {Promise<Array>} Retrieved data
 */
const fetchData = async (parameters = {}) => {
  try {
    logger.info('Fetching data from new source');
    
    // Implement data retrieval logic
    
    return data;
  } catch (error) {
    logger.error(`Error fetching from new source: ${error.message}`);
    throw error;
  }
};

module.exports = {
  fetchData
};
```

2. **Update the company service** to use the new data source.

3. **Update the settings page** in the frontend to include the new data source.

## Modifying the Scoring Model

The scoring model is defined in `backend/src/config/scoring.json`. To modify it:

1. **Update the scoring configuration** with new categories or weights.

2. **Update the scoring calculation logic** in `backend/src/services/companyService.js`.

3. **Update the frontend settings page** to reflect the new scoring options.

## Testing

### Backend Testing

Run backend tests with:

```bash
cd backend
npm test
```

Add new tests in the `backend/tests/` directory.

### Frontend Testing

Run frontend tests with:

```bash
cd frontend
npm test
```

Add new tests in the `frontend/src/__tests__/` directory.

## Building for Production

### Backend

```bash
cd backend
npm run build
```

### Frontend

```bash
cd frontend
npm run build
```

The built frontend will be in the `frontend/dist/` directory.

## Deployment

The platform can be deployed in various ways:

### Docker Deployment

The project includes Docker configuration for both development and production environments:

#### Docker Configuration Files

- `backend/Dockerfile`: Node.js configuration for the backend service
- `frontend/Dockerfile`: Multi-stage build for the React frontend (build with Node.js, serve with Nginx)
- `docker-compose.yml`: Orchestrates both services with proper networking

#### Development with Docker

For development using Docker:

```bash
# Start both services in development mode with hot-reloading
docker-compose -f docker-compose.dev.yml up
```

This configuration mounts your local source code as volumes, enabling hot-reloading during development.

#### Production Deployment with Docker

For production deployment:

```bash
# Build and start production containers
docker-compose up -d --build

# View logs
docker-compose logs -f
```

#### Docker Environment Configuration

Environment variables can be configured in several ways:

1. In the `.env` file for the backend service
2. Through the `environment` section in `docker-compose.yml`
3. Using Docker secrets for sensitive information in production

#### Docker Image Customization

To customize the Docker images:

1. Modify the appropriate Dockerfile
2. Update the build arguments in `docker-compose.yml` if needed
3. Rebuild the containers with `docker-compose build`

### Traditional Hosting

Deploy the backend to a Node.js host and the frontend to a static file host:

1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `frontend/dist` directory to a static file host
3. Deploy the backend to a Node.js environment

### Serverless

The backend can be adapted to run as serverless functions:

1. Refactor controllers into individual function handlers
2. Update API routes to match serverless function endpoints
3. Deploy to a serverless platform (AWS Lambda, Vercel, etc.)

## Contributing

When contributing to this project:

1. Follow the existing code style and patterns
2. Add tests for new functionality
3. Update documentation to reflect changes
4. Ensure all tests pass before submitting a pull request

## Next Steps

For API documentation, see the [API Documentation](../api/README.md).
