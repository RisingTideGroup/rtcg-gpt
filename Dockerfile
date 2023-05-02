# Use latest Node.js image as the base
FROM node:latest

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port 3000 (the port on which the app listens)
EXPOSE 3000

# Start the app using 'node server.js'
CMD ["node", "server.js"]
