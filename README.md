# Market Research AI Agent Testing Platform

A comprehensive platform for evaluating multiple agentic AI frameworks (CrewAI, SquidAI, LettaAI) on a structured market research and dynamic scoring use case.

## Overview

This platform allows you to:

- Test different AI agent frameworks on the same market research task
- Discover emerging fintech companies using publicly available data
- Extract key company attributes and information
- Score companies dynamically using a weighted scoring model
- Compare performance metrics across different frameworks

## Features

- **Multi-Framework Integration**: Seamlessly switch between CrewAI, SquidAI, and LettaAI
- **Dynamic Scoring Model**: Configurable weights for different scoring criteria
- **Public Data Sources**: Uses only publicly accessible information
- **Modern Web Interface**: React-based UI with TailwindCSS styling
- **Framework Performance Tracking**: Compare metrics across frameworks

## Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- OpenAI API key (for agent frameworks)

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

## Documentation

For detailed documentation, please see the [docs](./docs) directory:

- [Setup Instructions](./docs/setup/README.md)
- [Usage Guide](./docs/usage/README.md)
- [Development Guide](./docs/development/README.md)
- [API Documentation](./docs/api/README.md)
- [Compliance with Public Data Policies](./docs/compliance/README.md)

## License

[MIT License](LICENSE)
