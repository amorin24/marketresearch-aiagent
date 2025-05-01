# Usage Guide

This guide explains how to use the Market Research AI Agent Testing Platform effectively.

## Dashboard Overview

The dashboard is the main interface for the platform. It provides:

- Framework selection dropdown
- Company discovery controls
- List of discovered companies with scores
- Export functionality

## Selecting a Framework

1. Use the framework selector dropdown in the top-right corner of the dashboard
2. Choose between CrewAI, SquidAI, LettaAI, AutoGen, or LangGraph/LangChain
3. The platform will automatically switch to the selected framework

When you switch frameworks, the platform will:
- Load the framework-specific configuration
- Reset the company list
- Prepare for a new discovery process

## Discovering Companies

To start the company discovery process:

1. Select your desired framework
2. Click the "Refresh Data" button
3. The progress tracker will show the current stage of the discovery process:
   - Discovery: Finding potential companies
   - Extraction: Extracting company details
   - Scoring: Calculating scores based on the configured weights

The discovery process may take several minutes depending on the framework and the number of companies being analyzed.

## Viewing Company Details

To view detailed information about a discovered company:

1. Find the company in the list
2. Click the "View" button on the right side of the company row
3. The company details page will show:
   - Basic information (name, founding year, location)
   - Focus area
   - Funding information
   - Investors
   - News headlines
   - Score breakdown

## Comparing Frameworks

To compare the performance of different frameworks:

1. Navigate to the "Compare Frameworks" page using the navigation menu
2. Select at least two frameworks to compare
3. Click the "Compare Frameworks" button
4. View the comparison results, including:
   - Average run time
   - Completion rate
   - API success rate
   - Capabilities and limitations

## Adjusting Scoring Weights

To customize the scoring model:

1. Navigate to the "Settings" page using the navigation menu
2. Under "Scoring Weights", adjust the sliders for:
   - Funding Stage (default: 30%)
   - Market Buzz (default: 30%)
   - Strategic Relevance (default: 40%)
3. Ensure the weights sum to 100%
4. Click "Save Settings" to apply the changes

The new weights will be applied to all subsequent discovery processes.

## Configuring Data Sources

To enable or disable specific data sources:

1. Navigate to the "Settings" page
2. Under "Data Sources", toggle the switches for:
   - Crunchbase
   - TechCrunch
   - LinkedIn
   - AngelList
   - News websites
3. Adjust the weight of each data source if desired
4. Click "Save Settings" to apply the changes

## Exporting Results

To export the discovered companies:

1. Click the "Export" button on the dashboard
2. Choose the desired format:
   - JSON: For programmatic use or further analysis
   - CSV: For importing into spreadsheet applications
3. The file will be downloaded to your computer

## Best Practices

- **Framework Selection**: Different frameworks have different strengths. Try all of them to see which works best for your specific needs.
- **Scoring Weights**: Adjust the weights based on what aspects of companies are most important to your analysis.
- **Data Sources**: Enable only the data sources that are most relevant to your research to improve performance.
- **Regular Updates**: Run the discovery process regularly to find new companies and updated information.

## Using Docker

If you're using the Docker deployment of the platform, here are some specific usage instructions:

### Accessing the Platform

- The frontend is available at `http://localhost` (port 80)
- The backend API is available at `http://localhost:8000`

### Managing Docker Containers

To check the status of the running containers:

```bash
docker-compose ps
```

To view logs from the containers:

```bash
# View all logs
docker-compose logs

# View only frontend logs
docker-compose logs frontend

# View only backend logs
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f
```

### Restarting Services

If you need to restart a service:

```bash
# Restart the frontend
docker-compose restart frontend

# Restart the backend
docker-compose restart backend

# Restart all services
docker-compose restart
```

### Updating Environment Variables

If you need to update environment variables:

1. Edit the `.env` file in the backend directory
2. Restart the backend container:

```bash
docker-compose restart backend
```

### Stopping the Platform

To stop the platform:

```bash
# Stop containers but don't remove them
docker-compose stop

# Stop and remove containers
docker-compose down
```

### Troubleshooting Docker Usage

If you encounter issues:

- Check container logs for error messages
- Verify that all required environment variables are set
- Ensure ports 80 and 8000 are not in use by other applications
- If the frontend can't connect to the backend, check network settings in docker-compose.yml

## Next Steps

For information on extending the platform with new frameworks or data sources, see the [Development Guide](../development/README.md).
