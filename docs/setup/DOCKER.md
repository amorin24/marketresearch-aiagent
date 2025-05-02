# Docker Setup Guide

This document provides instructions for setting up and running the Market Research AI Agent Testing Platform using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) installed on your system

## Docker Configuration

The platform includes Docker configuration for both development and production environments:

- `docker-compose.yml` - Production configuration
- `docker-compose.dev.yml` - Development configuration with volume mounts for hot reloading

## Environment Variables

Before running the containers, you need to set up environment variables:

1. Copy the example environment file to create your own:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit the `.env` file to set your API keys and configuration:
   ```
   # API Keys
   OPENAI_API_KEY=your_openai_api_key_here
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
   
   # Framework Configuration
   CREWAI_ENABLED=true
   SQUIDAI_ENABLED=true
   LETTAAI_ENABLED=true
   AUTOGEN_ENABLED=true
   LANGGRAPH_ENABLED=true
   
   # Email Configuration
   EMAIL_ENABLED=false
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=user@example.com
   EMAIL_PASS=password
   EMAIL_FROM=noreply@example.com
   ```

## Building and Running Containers

### Production Environment

To build and run the containers in production mode:

```bash
# Build the containers
docker-compose build

# Start the containers
docker-compose up -d

# View logs
docker-compose logs -f
```

### Development Environment

To build and run the containers in development mode with hot reloading:

```bash
# Build the containers
docker-compose -f docker-compose.dev.yml build

# Start the containers
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

## Container Verification

### Frontend Container

Verify that the frontend container is working correctly:

```bash
# Check if the container is running
docker ps | grep frontend

# Test the frontend
curl http://localhost

# Open in browser
open http://localhost
```

The frontend should be accessible at http://localhost.

### Backend Container

Verify that the backend container is working correctly:

```bash
# Check if the container is running
docker ps | grep backend

# Test the health endpoint
curl http://localhost:8000/health

# Test the API
curl http://localhost:8000/api/frameworks
```

The backend API should be accessible at http://localhost:8000.

## Troubleshooting

### Container Logs

If you encounter issues, check the container logs:

```bash
# View all container logs
docker-compose logs

# View specific container logs
docker-compose logs backend
docker-compose logs frontend
```

### Restarting Containers

If you need to restart the containers:

```bash
# Restart all containers
docker-compose restart

# Restart specific container
docker-compose restart backend
docker-compose restart frontend
```

### Rebuilding Containers

If you make changes to the Dockerfiles or need to rebuild the containers:

```bash
# Rebuild and restart all containers
docker-compose up -d --build

# Rebuild and restart specific container
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

## Docker Configuration Files

### Frontend Dockerfile

The frontend Dockerfile uses a multi-stage build process:
1. Build stage: Compiles the React application
2. Production stage: Serves the compiled files using Nginx

Key features:
- Pinned Node.js and Nginx versions for consistency
- Health check for container monitoring
- Custom Nginx configuration for React Router support
- Optimized for production with caching and compression

### Backend Dockerfile

The backend Dockerfile sets up a Node.js environment for the API server:

Key features:
- Pinned Node.js version for consistency
- Health check for container monitoring
- Production-ready configuration

### Docker Compose Configuration

The Docker Compose configuration sets up the complete environment:

Key features:
- Service dependencies with health checks
- Network configuration for inter-container communication
- Environment variable management
- Volume mounts for development (in dev configuration)

## Best Practices

1. **Environment Variables**: Never commit sensitive information like API keys to the repository. Use environment variables and `.env` files.

2. **Health Checks**: The containers include health checks to ensure they're functioning correctly.

3. **Separate Configurations**: Use `docker-compose.yml` for production and `docker-compose.dev.yml` for development.

4. **Container Security**: The containers run with minimal permissions and don't expose unnecessary ports.

5. **Image Optimization**: The Dockerfiles are optimized to create smaller, more efficient images.
