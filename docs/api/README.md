# API Documentation

This document provides detailed information about the API endpoints available in the Market Research AI Agent Testing Platform.

## Base URL

All API endpoints are relative to:

```
http://localhost:8000/api
```

## Authentication

Currently, the API does not require authentication for local development. In a production environment, you should implement appropriate authentication mechanisms.

## Endpoints

### Companies

#### Get All Companies

```
GET /companies
```

Returns a list of all discovered companies.

**Response**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "PayFast",
    "foundingYear": 2021,
    "location": "San Francisco, CA",
    "focusArea": "Payments",
    "investors": ["Sequoia Capital", "Andreessen Horowitz"],
    "fundingAmount": "$25M",
    "newsHeadlines": [
      "PayFast raises $25M Series A to revolutionize payment processing",
      "PayFast expands to European markets"
    ],
    "websiteUrl": "https://payfast.io",
    "stockPrice": "127.45",
    "stockSymbol": "PYFT",
    "score": 85,
    "discoveredBy": "crewAI",
    "discoveredAt": "2023-11-15T12:30:45Z"
  }
]
```

#### Get Company by ID

```
GET /companies/:id
```

Returns detailed information about a specific company.

**Parameters**

- `id` (path parameter): The unique identifier of the company

**Response**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "PayFast",
  "foundingYear": 2021,
  "location": "San Francisco, CA",
  "focusArea": "Payments",
  "investors": ["Sequoia Capital", "Andreessen Horowitz"],
  "fundingAmount": "$25M",
  "newsHeadlines": [
    "PayFast raises $25M Series A to revolutionize payment processing",
    "PayFast expands to European markets"
  ],
  "websiteUrl": "https://payfast.io",
  "score": 85,
  "discoveredBy": "crewAI",
  "discoveredAt": "2023-11-15T12:30:45Z"
}
```

#### Start Company Discovery

```
POST /companies/discover
```

Starts a company discovery process using the specified framework.

**Request Body**

```json
{
  "framework": "crewAI",
  "parameters": {
    "minCompanies": 5,
    "maxCompanies": 20,
    "foundingYearMin": 2018
  }
}
```

**Response**

```json
{
  "jobId": "job-550e8400-e29b-41d4-a716-446655440000",
  "status": "discovery_started"
}
```

#### Get Discovery Status

```
GET /companies/discover/:jobId
```

Returns the status of a discovery job.

**Parameters**

- `jobId` (path parameter): The unique identifier of the discovery job

**Response**

```json
{
  "id": "job-550e8400-e29b-41d4-a716-446655440000",
  "framework": "crewAI",
  "status": "running",
  "progress": 45,
  "startTime": "2023-11-15T12:30:45Z",
  "endTime": null,
  "error": null,
  "parameters": {
    "minCompanies": 5,
    "maxCompanies": 20,
    "foundingYearMin": 2018
  }
}
```

#### Export Companies

```
GET /companies/export/:format
```

Exports the discovered companies in the specified format.

**Parameters**

- `format` (path parameter): The export format, either `json` or `csv`

**Response**

For JSON format, returns a JSON array of companies.

For CSV format, returns a CSV file with company data.

#### Research Company

```
POST /companies/research-company
```

Starts a company research process using the specified frameworks. Optionally sends an email notification when research is complete.

**Request Body**

```json
{
  "companyName": "Apple",
  "frameworks": ["crewAI", "squidAI", "lettaAI", "autoGen", "langGraph"],
  "email": "user@example.com"  // Optional
}
```

**Response**

```json
{
  "jobId": "job-550e8400-e29b-41d4-a716-446655440000",
  "status": "research_started"
}
```

#### Get Research Status

```
GET /companies/research-company/:jobId
```

Returns the status of a company research job.

**Parameters**

- `jobId` (path parameter): The unique identifier of the research job

**Response**

```json
{
  "id": "job-550e8400-e29b-41d4-a716-446655440000",
  "companyName": "Apple",
  "status": "completed",
  "startTime": "2023-11-15T12:30:45Z",
  "endTime": "2023-11-15T12:35:12Z",
  "error": null,
  "frameworkStatuses": {
    "crewAIAdapter": {
      "status": "completed",
      "progress": 100,
      "steps": [
        {
          "id": "step-1",
          "description": "[Research Agent] Searching for company information",
          "timestamp": "2023-11-15T12:31:00Z",
          "completed": true
        },
        {
          "id": "step-2",
          "description": "[Analysis Agent] Evaluating market position",
          "timestamp": "2023-11-15T12:32:30Z",
          "completed": true
        },
        {
          "id": "step-3",
          "description": "[Scoring Agent] Calculating final score",
          "timestamp": "2023-11-15T12:34:15Z",
          "completed": true
        }
      ],
      "error": null
    },
    "squidAIAdapter": {
      "status": "completed",
      "progress": 100,
      "steps": [
        // Similar structure to crewAIAdapter
      ],
      "error": null
    }
  },
  "frameworkResults": {
    "crewAIAdapter": {
      "score": 92,
      "fundingScore": 28,
      "buzzScore": 27,
      "relevanceScore": 37,
      "summary": "Apple is a leading technology company with strong market position...",
      "stockPrice": "187.43",
      "stockSymbol": "AAPL"
    },
    "squidAIAdapter": {
      "score": 88,
      "fundingScore": 26,
      "buzzScore": 28,
      "relevanceScore": 34,
      "summary": "Apple shows excellent financial performance with high strategic relevance...",
      "stockPrice": "187.43",
      "stockSymbol": "AAPL"
    }
  }
}
```

### Frameworks

#### Get Available Frameworks

```
GET /frameworks
```

Returns a list of available AI agent frameworks.

**Response**

```json
[
  {
    "name": "crewAI",
    "description": "CrewAI Framework Adapter",
    "version": "1.0.0"
  },
  {
    "name": "squidAI",
    "description": "SquidAI Framework Adapter",
    "version": "1.0.0"
  },
  {
    "name": "lettaAI",
    "description": "LettaAI Framework Adapter",
    "version": "1.0.0"
  },
  {
    "name": "autoGen",
    "description": "AutoGen Framework Adapter",
    "version": "1.0.0"
  },
  {
    "name": "langGraph",
    "description": "LangGraph/LangChain Framework Adapter",
    "version": "1.0.0"
  }
]
```

#### Get Framework Details

```
GET /frameworks/:name
```

Returns detailed information about a specific framework.

**Parameters**

- `name` (path parameter): The name of the framework

**Response**

```json
{
  "name": "crewAI",
  "description": "CrewAI Framework Adapter",
  "version": "1.0.0",
  "capabilities": [
    "Multi-agent collaboration",
    "Role-based agent specialization",
    "Sequential and parallel task execution",
    "Memory and context sharing between agents"
  ],
  "limitations": [
    "Requires OpenAI API key",
    "Limited to text-based data sources"
  ]
}
```

#### Get Framework Performance

```
GET /frameworks/:name/performance
```

Returns performance metrics for a specific framework.

**Parameters**

- `name` (path parameter): The name of the framework

**Response**

```json
{
  "name": "crewAI",
  "avgRunTime": 45.2,
  "completionRate": 98.5,
  "apiSuccessRate": 99.2,
  "totalRuns": 50,
  "successfulRuns": 49,
  "failedRuns": 1
}
```

#### Compare Frameworks

```
POST /frameworks/compare
```

Compares multiple frameworks based on their performance metrics.

**Request Body**

```json
{
  "frameworks": ["crewAI", "squidAI", "lettaAI"]
}
```

**Response**

```json
{
  "crewAI": {
    "details": {
      "name": "crewAI",
      "description": "CrewAI Framework Adapter",
      "version": "1.0.0",
      "capabilities": ["..."],
      "limitations": ["..."]
    },
    "performance": {
      "avgRunTime": 45.2,
      "completionRate": 98.5,
      "apiSuccessRate": 99.2,
      "totalRuns": 50,
      "successfulRuns": 49,
      "failedRuns": 1
    }
  },
  "squidAI": {
    "details": { "..." },
    "performance": { "..." }
  },
  "lettaAI": {
    "details": { "..." },
    "performance": { "..." }
  }
}
```

### Configuration

#### Get Scoring Configuration

```
GET /config/scoring
```

Returns the current scoring configuration.

**Response**

```json
{
  "weights": {
    "fundingStage": 0.3,
    "marketBuzz": 0.3,
    "strategicRelevance": 0.4
  },
  "fundingStage": {
    "seed": 0.2,
    "seriesA": 0.4,
    "seriesB": 0.6,
    "seriesC": 0.8,
    "seriesD+": 1.0
  },
  "marketBuzz": {
    "newsArticles": {
      "weight": 0.5,
      "timeDecay": {
        "lastWeek": 1.0,
        "lastMonth": 0.8,
        "lastQuarter": 0.6,
        "lastYear": 0.4,
        "older": 0.2
      }
    },
    "socialMentions": {
      "weight": 0.5
    }
  },
  "strategicRelevance": {
    "focusAreas": {
      "payments": 0.9,
      "lending": 0.8,
      "crypto": 0.7,
      "wealthTech": 0.8,
      "insurTech": 0.7,
      "regTech": 0.6,
      "banking": 0.9
    }
  }
}
```

#### Update Scoring Configuration

```
PUT /config/scoring
```

Updates the scoring configuration.

**Request Body**

```json
{
  "weights": {
    "fundingStage": 0.4,
    "marketBuzz": 0.2,
    "strategicRelevance": 0.4
  }
}
```

**Response**

Returns the updated scoring configuration.

#### Get Data Source Configuration

```
GET /config/datasources
```

Returns the current data source configuration.

**Response**

```json
{
  "sources": {
    "crunchbase": {
      "enabled": true,
      "weight": 1.0
    },
    "techcrunch": {
      "enabled": true,
      "weight": 1.0
    },
    "linkedin": {
      "enabled": true,
      "weight": 1.0
    },
    "angellist": {
      "enabled": true,
      "weight": 1.0
    },
    "news": {
      "enabled": true,
      "weight": 1.0
    }
  }
}
```

#### Update Data Source Configuration

```
PUT /config/datasources
```

Updates the data source configuration.

**Request Body**

```json
{
  "sources": {
    "crunchbase": {
      "enabled": true,
      "weight": 1.0
    },
    "techcrunch": {
      "enabled": false,
      "weight": 0.5
    }
  }
}
```

**Response**

Returns the updated data source configuration.

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: The request was successful
- `400 Bad Request`: The request was invalid
- `404 Not Found`: The requested resource was not found
- `500 Internal Server Error`: An error occurred on the server

Error responses include a JSON object with an `error` field:

```json
{
  "error": "Failed to fetch companies"
}
```

### Benchmarking

#### Start Framework Benchmark

```
POST /frameworks/benchmark
```

Starts a benchmark process for the specified frameworks using predefined test cases.

**Request Body**

```json
{
  "frameworks": ["crewAI", "squidAI", "lettaAI", "autoGen", "langGraph"],
  "options": {
    "parallel": true,
    "parallelTestCases": false
  }
}
```

**Response**

```json
{
  "jobId": "benchmark-550e8400-e29b-41d4-a716-446655440000",
  "status": "benchmark_started"
}
```

#### Get Benchmark Status

```
GET /frameworks/benchmark/:jobId
```

Returns the status of a benchmark job.

**Parameters**

- `jobId` (path parameter): The unique identifier of the benchmark job

**Response**

```json
{
  "id": "benchmark-550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "startTime": "2023-11-15T12:30:45Z",
  "endTime": "2023-11-15T12:45:12Z",
  "error": null,
  "frameworks": {
    "crewAI": {
      "totalTests": 5,
      "successfulTests": 5,
      "averageExecutionTime": 12.3,
      "results": [
        {
          "testCase": "Apple",
          "success": true,
          "executionTime": 10.2,
          "companies": [
            {
              "name": "Apple Inc.",
              "foundingYear": 1976,
              "location": "Cupertino, CA",
              "focusArea": "Technology",
              "investors": ["..."],
              "fundingAmount": "Public",
              "newsHeadlines": ["..."],
              "websiteUrl": "https://apple.com",
              "stockPrice": "187.43",
              "stockSymbol": "AAPL"
            }
          ]
        },
        // Additional test results
      ]
    },
    "squidAI": {
      // Similar structure to crewAI
    }
  },
  "totalExecutionTime": 875.2
}
```

### Research

#### Start Sequential Research

```
POST /research/sequential
```

Starts a sequential research process where frameworks are executed in sequence, with each framework potentially using data from previous frameworks.

**Request Body**

```json
{
  "companyName": "Apple",
  "frameworks": ["crewAI", "squidAI", "lettaAI"],
  "options": {
    "userEmail": "user@example.com",
    "dataPassingMode": "full"
  }
}
```

**Response**

```json
{
  "jobId": "sequential-550e8400-e29b-41d4-a716-446655440000",
  "status": "research_started"
}
```

#### Get Sequential Research Status

```
GET /research/sequential/:jobId
```

Returns the status of a sequential research job.

**Parameters**

- `jobId` (path parameter): The unique identifier of the sequential research job

**Response**

```json
{
  "id": "sequential-550e8400-e29b-41d4-a716-446655440000",
  "companyName": "Apple",
  "status": "completed",
  "startTime": "2023-11-15T12:30:45Z",
  "endTime": "2023-11-15T12:45:12Z",
  "error": null,
  "sequence": ["crewAI", "squidAI", "lettaAI"],
  "currentFramework": "lettaAI",
  "completedFrameworks": ["crewAI", "squidAI"],
  "results": {
    "crewAI": {
      // Framework results
    },
    "squidAI": {
      // Framework results
    },
    "lettaAI": {
      // Framework results
    }
  }
}
```

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: The request was successful
- `400 Bad Request`: The request was invalid
- `404 Not Found`: The requested resource was not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: An error occurred on the server

Error responses include a JSON object with detailed error information:

```json
{
  "status": "error",
  "statusCode": 429,
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}
```

### Common Error Types

- **ValidationError**: Invalid input data (400)
- **NotFoundError**: Resource not found (404)
- **RateLimitError**: Rate limit exceeded (429)
- **ExternalServiceError**: Error from external service (502)
- **ServiceUnavailableError**: Service temporarily unavailable (503)

### Rate Limit Handling

The platform implements rate limiting for OpenAI API calls with exponential backoff and retry logic. When rate limits are encountered:

1. The system will automatically retry with exponential backoff
2. If all retries fail, a 429 error is returned with a `retryAfter` value
3. Clients should respect the `retryAfter` header and wait before retrying

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Global Rate Limit**: 100 requests per minute per IP address
- **Framework-specific Rate Limits**: Varies by framework based on underlying API constraints
- **OpenAI API Rate Limits**: Handled automatically with retry logic

When rate limits are exceeded, the API returns a 429 status code with a `Retry-After` header indicating how long to wait before retrying.

## Versioning

The API does not currently use versioning. Future versions may include a version prefix in the URL path.

## Framework Adapters

The platform includes adapters for multiple AI agent frameworks:

### CrewAI

CrewAI is a framework for orchestrating role-playing autonomous AI agents. The adapter implements:

- Multi-agent collaboration with specialized roles
- Sequential and parallel task execution
- Memory and context sharing between agents

### SquidAI

SquidAI is a framework focused on distributed AI agent workflows. The adapter implements:

- Distributed task processing
- Specialized research capabilities
- Adaptive learning from previous research

### LettaAI

LettaAI is a framework for lightweight, efficient AI agents. The adapter implements:

- Resource-efficient agent execution
- Streamlined research workflows
- Optimized for speed and accuracy

### AutoGen

AutoGen is a framework for building conversational AI agents. The adapter implements:

- Multi-agent conversations
- Specialized research agents
- Flexible conversation patterns

### LangGraph/LangChain

LangGraph is a framework for building stateful, multi-agent workflows using LangChain. The adapter implements:

- Graph-based workflow execution
- State management between steps
- Integration with LangChain components
