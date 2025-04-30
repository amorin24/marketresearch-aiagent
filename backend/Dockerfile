FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Bundle app source
COPY . .

# Create .env file from .env.example if .env doesn't exist
RUN if [ ! -f .env ]; then cp -n .env.example .env || echo "No .env.example found"; fi

# Expose the port the app runs on
EXPOSE 8000

# Define environment variables
ENV NODE_ENV=production

# Command to run the application
CMD ["npm", "start"]
