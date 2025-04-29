# Setup Instructions

This guide provides detailed instructions for setting up the Market Research AI Agent Testing Platform.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (version 8 or higher) or **yarn**
- **Git**

You will also need:

- An **OpenAI API key** for the agent frameworks to function

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/amorin24/marketresearch-aiagent.git
cd marketresearch-aiagent
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory by copying the example:

```bash
cp .env.example .env
```

Edit the `.env` file and add your OpenAI API key:

```
# API Keys
OPENAI_API_KEY=your_openai_api_key_here

# Framework Configuration
CREWAI_ENABLED=true
SQUIDAI_ENABLED=true
LETTAAI_ENABLED=true
AUTOGEN_ENABLED=true
LANGGRAPH_ENABLED=true

# Data Source Configuration
ENABLE_CRUNCHBASE=true
ENABLE_TECHCRUNCH=true
ENABLE_LINKEDIN=true
ENABLE_ANGELLIST=true
ENABLE_NEWS=true

# Server Configuration
PORT=8000
NODE_ENV=development
```

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 5. Start the Backend Server

```bash
cd ../backend
npm run dev
```

The backend server will start on http://localhost:8000.

### 6. Start the Frontend Development Server

```bash
cd ../frontend
npm run dev
```

The frontend development server will start on http://localhost:5173.

## Verifying Installation

To verify that everything is working correctly:

1. Open your browser and navigate to http://localhost:5173
2. You should see the Market Research AI Agent Testing Platform dashboard
3. Try selecting a framework and starting a discovery process
4. Check the backend logs to ensure API requests are being processed

## Troubleshooting

### Common Issues

#### CORS Errors

If you see CORS errors in the browser console, ensure that:
- The backend server is running
- The frontend is configured to connect to the correct backend URL
- CORS is properly enabled in the backend (it should be by default)

#### API Key Issues

If you see authentication errors:
- Verify that your OpenAI API key is correctly set in the `.env` file
- Ensure the API key has the necessary permissions
- Check that the key is being properly loaded by the application

#### Port Conflicts

If either server fails to start due to port conflicts:
- Change the port in the `.env` file for the backend
- For the frontend, you can use the `--port` flag: `npm run dev -- --port 3000`

## Next Steps

Once you have successfully set up the platform, proceed to the [Usage Guide](../usage/README.md) to learn how to use the platform effectively.
