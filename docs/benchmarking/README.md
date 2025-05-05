# Benchmarking System Documentation

This document describes the benchmarking system in the Market Research AI Agent Testing Platform.

## Overview

The benchmarking system allows for systematic evaluation of different AI agent frameworks against standard test cases. It provides quantitative metrics to compare framework performance and capabilities.

## Test Cases

Test cases are predefined company research scenarios designed to evaluate different aspects of framework performance. Each test case includes:

- **Name**: Unique identifier for the test case
- **Company Name**: The company to research
- **Description**: Brief description of the test case
- **Expected Data Points**: Key data points that should be extracted
- **Difficulty Level**: Easy, Medium, or Hard

Test cases are defined in `backend/src/config/benchmark.json` and can be customized to focus on specific aspects of framework performance.

### Default Test Cases

The system includes several default test cases:

1. **Large Public Fintech**
   - Companies: Square, PayPal, Stripe
   - Tests ability to research well-known public companies

2. **Emerging Startups**
   - Companies: Recent YCombinator fintech graduates
   - Tests ability to find information on newer companies

3. **International Companies**
   - Companies: Revolut, Monzo, N26
   - Tests ability to research non-US companies

4. **Cross-Industry**
   - Companies: Companies that span multiple industries
   - Tests ability to identify relevant financial aspects

## Metrics

The benchmarking system evaluates frameworks based on several key metrics:

### 1. Execution Time

Measures how long each framework takes to complete research. Lower execution times indicate better performance.

- **Weight**: 30%
- **Calculation**: Normalized inverse of average execution time across test cases
- **Formula**: `Score = min(1, 10000 / averageExecutionTime) * weight`

### 2. Data Completeness

Evaluates how complete the extracted company data is. Higher completeness scores indicate better data extraction capabilities.

- **Weight**: 40%
- **Calculation**: Percentage of successful test cases
- **Formula**: `Score = (successfulTests / totalTests) * weight`

### 3. Source Credibility

Assesses the quality of sources used for research. Higher credibility scores indicate better source selection.

- **Weight**: 30%
- **Calculation**: Based on the sources used and their credibility ratings
- **Source Weights**:
  - Yahoo Finance: 1.0
  - Bloomberg: 0.9
  - Financial Times: 0.8
  - CNBC: 0.8
  - Reuters: 0.8
  - Wall Street Journal: 0.8
  - Business Insider: 0.7
  - TechCrunch: 0.7
  - Other sources: 0.5

## Scoring System

The benchmarking system calculates a total score for each framework based on the weighted sum of individual metric scores:

```
TotalScore = (ExecutionTimeScore × 0.3) + (DataCompletenessScore × 0.4) + (SourceCredibilityScore × 0.3)
```

Scores are normalized to a 0-100 scale for easy comparison.

### Score Interpretation

- **90-100**: Excellent performance
- **80-89**: Very good performance
- **70-79**: Good performance
- **60-69**: Satisfactory performance
- **Below 60**: Needs improvement

## Running Benchmarks

Benchmarks can be run through the UI or API:

### UI

1. Navigate to the Benchmark page
2. Select frameworks to benchmark
3. Select test cases to run
4. Click "Run Benchmark"
5. View results and scores

### API

```
POST /api/research/benchmark
{
  "frameworks": ["crewAI", "autoGen", "langGraph"],
  "testCases": [
    {
      "name": "large_fintech",
      "companyName": "Square",
      "description": "Large publicly traded fintech company"
    },
    ...
  ]
}
```

## Benchmark Results

Benchmark results include:

- **Overall scores** for each framework
- **Individual metric scores** for each framework
- **Detailed results** for each test case
- **Execution time** for each test case
- **Success/failure status** for each test case

Results can be downloaded as JSON for further analysis.

### Sample Results Format

```json
{
  "timestamp": "2023-04-29T12:34:56Z",
  "frameworks": {
    "crewAI": {
      "totalTests": 5,
      "successfulTests": 4,
      "averageExecutionTime": 8500,
      "results": [...]
    },
    "autoGen": {
      "totalTests": 5,
      "successfulTests": 5,
      "averageExecutionTime": 12000,
      "results": [...]
    }
  },
  "scores": {
    "crewAI": {
      "totalScore": 78.5,
      "executionTimeScore": 25.2,
      "successRateScore": 32.0,
      "sourceCredibilityScore": 21.3
    },
    "autoGen": {
      "totalScore": 82.1,
      "executionTimeScore": 22.5,
      "successRateScore": 40.0,
      "sourceCredibilityScore": 19.6
    }
  }
}
```

## Extending the Benchmarking System

The benchmarking system can be extended in several ways:

### Adding New Test Cases

Add new test cases to `backend/src/config/benchmark.json`:

```json
{
  "testCases": [
    {
      "name": "new_test_case",
      "companyName": "Company Name",
      "description": "Description of the test case",
      "expectedDataPoints": ["founding year", "investors", "funding amount"],
      "difficultyLevel": "medium"
    },
    ...
  ]
}
```

### Adding New Metrics

Add new metrics to `backend/src/config/benchmark.json` and update the scoring calculation in `backend/src/services/benchmarkService.js`.

Example of adding a new "API Efficiency" metric:

```json
{
  "metrics": {
    "executionTime": { "weight": 0.25 },
    "dataCompleteness": { "weight": 0.35 },
    "sourceCredibility": { "weight": 0.25 },
    "apiEfficiency": { "weight": 0.15 }
  }
}
```

Then update the `calculateScores` function in `benchmarkService.js` to include the new metric.

### Custom Benchmark Configurations

Create custom benchmark configurations for specific evaluation scenarios by modifying the benchmark configuration file.

Example of a custom configuration for speed testing:

```json
{
  "name": "speed_test",
  "description": "Configuration focused on execution speed",
  "metrics": {
    "executionTime": { "weight": 0.7 },
    "dataCompleteness": { "weight": 0.2 },
    "sourceCredibility": { "weight": 0.1 }
  },
  "testCases": [...]
}
```

## Benchmark Reports

The benchmarking system can generate detailed reports for framework comparison:

1. **Summary Report**: High-level overview of framework performance
2. **Detailed Report**: In-depth analysis of each framework's performance
3. **Comparative Report**: Side-by-side comparison of frameworks

Reports can be exported in various formats:
- JSON (for programmatic use)
- CSV (for spreadsheet analysis)
- PDF (for presentation)

## Best Practices

When using the benchmarking system:

1. **Run multiple iterations** to account for variability
2. **Use diverse test cases** to evaluate different aspects of performance
3. **Update test cases regularly** to reflect changing requirements
4. **Compare frameworks on the same hardware** for fair comparison
5. **Document benchmark conditions** for reproducibility
