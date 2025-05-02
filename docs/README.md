# Market Research AI Agent Testing Platform Documentation

This documentation provides comprehensive information about the Market Research AI Agent Testing Platform, which evaluates multiple agentic AI frameworks on a structured market research and dynamic scoring use case.

## Table of Contents

1. [Setup Instructions](./setup/README.md)
   - Installation
   - Configuration
   - Environment Variables

2. [Usage Guide](./usage/README.md)
   - Framework Selection
   - Data Source Configuration
   - Scoring Model Adjustment
   - Exporting Results

3. [Development Guide](./development/README.md)
   - Architecture Overview
   - Adding New Agent Frameworks
   - Extending Data Sources
   - Modifying the Scoring Model

4. [API Documentation](./api/README.md)
   - Backend API Endpoints
   - Framework Adapter Interfaces
   - Data Models

## Compliance with Public Data Policies

This platform is designed to work exclusively with publicly accessible information. The documentation includes guidelines for ensuring compliance with data source terms of service and avoiding any scraping of content behind logins, paywalls, or terms that prohibit scraping.

## API Integration

### Real Framework Implementations

The platform now supports real API integrations with the following frameworks:

- CrewAI
- SquidAI
- LettaAI
- AutoGen
- LangGraph/LangChain

To enable real implementations:

1. Add your API keys to the `.env` file:
   ```
   OPENAI_API_KEY=sk-your-openai-api-key-goes-here  # Must start with 'sk-'
   ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key-goes-here
   ```
   
   > **Important:** OpenAI API keys must start with the prefix `sk-`. If a valid API key is not provided, the system will automatically fall back to using mock data.

2. Configure OpenAI API retry behavior for rate limiting (429 errors):
   ```
   OPENAI_MAX_RETRIES=3
   OPENAI_INITIAL_RETRY_DELAY=1000
   ```
   The system automatically implements exponential backoff for retries when rate limit errors occur.

3. Ensure the framework you want to use is enabled:
   ```
   CREWAI_ENABLED=true
   SQUIDAI_ENABLED=true
   LETTAAI_ENABLED=true
   AUTOGEN_ENABLED=true
   LANGGRAPH_ENABLED=true
   ```

4. For email notifications, configure the email settings:
   ```
   EMAIL_SERVICE=smtp
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your_email_user
   EMAIL_PASSWORD=your_email_password
   EMAIL_FROM=noreply@example.com
   ```

If a valid API key is not provided or if an error occurs, the system will automatically fall back to the mock implementation. This ensures that the platform remains functional even when API access is limited or unavailable.

> **Note:** When adding new features to the platform, always remember to update all relevant documentation, including architecture diagrams and setup instructions.

## License

[License information will be added here]
