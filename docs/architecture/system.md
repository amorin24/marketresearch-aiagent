# System Architecture

This document provides an overview of the Market Research AI Agent Testing Platform's system architecture, showing how the frontend, backend, and framework adapters interact.

## Overall System Architecture

```
┌─────────────────┐      ┌─────────────────────────────────────────┐      ┌───────────────────┐
│                 │      │                                         │      │                   │
│    Frontend     │◄────►│               Backend                   │◄────►│  External APIs    │
│    (React)      │      │               (Node.js)                 │      │                   │
│                 │      │                                         │      └───────────────────┘
└─────────────────┘      └─────────────────────────────────────────┘
                                           │
                                           │
                                           ▼
                         ┌─────────────────────────────────────────┐
                         │         Framework Adapters              │
                         ├─────────────┬─────────────┬─────────────┤
                         │   CrewAI    │   SquidAI   │   LettaAI   │
                         ├─────────────┼─────────────┼─────────────┤
                         │   AutoGen   │  LangGraph  │    ...      │
                         └─────────────┴─────────────┴─────────────┘
```

## Component Interactions

### Frontend to Backend Communication

The frontend communicates with the backend through RESTful API calls:

1. **Framework Selection**: When a user selects a framework, the frontend sends a request to the backend to load the framework configuration.
2. **Company Discovery**: The frontend initiates company discovery by sending a request to the backend with the selected framework.
3. **Research Status**: The frontend polls the backend for research status updates.
4. **Export Data**: The frontend requests data export in JSON or CSV format.
5. **Email Notifications**: The frontend sends the user's email address to the backend for notification when research is complete.
6. **Stock Price Retrieval**: When researching public companies, the frontend requests stock price information from the backend.

### Backend to Framework Adapters

The backend interacts with framework adapters through a modular adapter interface:

1. **Adapter Selection**: The backend loads the appropriate adapter based on the user's framework selection.
2. **Task Delegation**: The backend delegates research tasks to the selected adapter.
3. **Progress Tracking**: The backend monitors and records the progress of each adapter.
4. **Result Collection**: The backend collects and processes results from the adapters.

### Backend to External APIs

The backend communicates with external APIs for various data needs:

1. **OpenAI API**: Used by all framework adapters for LLM capabilities.
2. **Alpha Vantage API**: Used for retrieving stock price information for public companies.
3. **SMTP Services**: Used for sending email notifications when research is complete.

## Data Flow

1. User selects a framework and initiates research
2. Frontend sends request to backend API
3. Backend selects appropriate framework adapter
4. Adapter performs research using external APIs
5. Results are returned to backend
6. Backend processes and scores results
7. Frontend displays results to user
8. (Optional) Email notification is sent when research is complete

## Deployment Architecture

The platform can be deployed using Docker containers:

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Host                            │
│                                                             │
│   ┌─────────────────┐            ┌─────────────────────┐    │
│   │                 │            │                     │    │
│   │  Frontend       │            │  Backend            │    │
│   │  Container      │◄─────────►│  Container          │    │
│   │  (Nginx)        │            │  (Node.js)          │    │
│   │                 │            │                     │    │
│   └─────────────────┘            └─────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

The frontend container serves the React application using Nginx, while the backend container runs the Node.js API server. Both containers are orchestrated using Docker Compose.
