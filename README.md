# Market Research AI Agent Testing Platform

A comprehensive platform for evaluating multiple agentic AI frameworks (CrewAI, SquidAI, LettaAI) on a structured market research and dynamic scoring use case.

## Overview

This platform allows you to:

- Test different AI agent frameworks on the same market research task
- Discover companies across all industries using publicly available data
- Extract key company attributes and information
- Score companies dynamically using a weighted scoring model
- Compare performance metrics across different frameworks

## Features

- **Multi-Framework Integration**: Seamlessly switch between CrewAI, SquidAI, LettaAI, AutoGen, and LangGraph
- **Parallel and Sequential Research Workflows**: Run frameworks simultaneously or in sequence with data passing
- **Framework Benchmarking and Comparison**: Evaluate frameworks against standard test cases
- **Dynamic Scoring Model**: Configurable weights for different scoring criteria
- **Public Data Sources**: Uses only publicly accessible information
- **Modern Web Interface**: React-based UI with TailwindCSS styling
- **Framework Performance Tracking**: Compare metrics across frameworks
- **Stock Price Retrieval**: Get real-time stock prices for public companies
- **Email Notifications**: Receive email alerts when research tasks are completed
- **Industry-Agnostic Research**: Research companies across all industries, not limited to fintech

## Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- OpenAI API key (for agent frameworks)
- Alpha Vantage API key (for stock price retrieval, optional)
- SMTP server access (for email notifications, optional)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/amorin24/marketresearch-aiagent.git
   cd marketresearch-aiagent
   ```

2. Install dependencies:
   ```
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Configure environment variables:
   ```
   # In the backend directory
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

4. Start the application:
   ```
   # Start backend (from backend directory)
   npm run dev

   # Start frontend (from frontend directory)
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Research Flows

The platform supports multiple research flows:

1. **Parallel Research**: Run multiple frameworks simultaneously on the same company
2. **Sequential Research**: Run frameworks in sequence, passing data between them
3. **Benchmark**: Evaluate frameworks against standard test cases

See the [Research Flow Documentation](./docs/research-flow/README.md) for more details.

## Benchmarking

The platform includes a comprehensive benchmarking system to evaluate frameworks against standard test cases. It measures:

1. **Execution Time**: How long each framework takes to complete research
2. **Success Rate**: Percentage of test cases successfully completed
3. **Data Completeness**: How complete the extracted company data is
4. **Source Credibility**: Quality of sources used for research

See the [Benchmarking Documentation](./docs/benchmarking/README.md) for more details.

## Documentation

For detailed documentation, please see the [docs](./docs) directory:

- [Setup Instructions](./docs/setup/README.md)
- [Usage Guide](./docs/usage/README.md)
- [Development Guide](./docs/development/README.md)
- [API Documentation](./docs/api/README.md)
- [Research Flow Documentation](./docs/research-flow/README.md)
- [Benchmarking Documentation](./docs/benchmarking/README.md)
- [Compliance with Public Data Policies](./docs/compliance/README.md)

## License

[MIT License](LICENSE)
