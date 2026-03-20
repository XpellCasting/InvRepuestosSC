FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Change ownership of the directory to the non-root 'node' user
RUN chown -R node:node /usr/src/app

# Switch to the non-root user
USER node

# Copy package files first
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY --chown=node:node . .

# Expose port for Vite
EXPOSE 5173

# Start development server on all interfaces
CMD ["npm", "run", "dev", "--", "--host"]
