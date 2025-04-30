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

## Rate Limiting

Currently, there is no rate limiting implemented. In a production environment, you should consider implementing rate limiting to prevent abuse.

## Versioning

The API does not currently use versioning. Future versions may include a version prefix in the URL path.
