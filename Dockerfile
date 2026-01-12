# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files for server dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy server files
COPY --from=builder /app/server ./server

# Copy public assets (question bank)
COPY --from=builder /app/public ./public

# Expose ports
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Database environment variables (to be overridden at runtime)
ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_NAME=nimbus
ENV DB_USER=nimbus
ENV DB_PASSWORD=
ENV DB_SSL=false

# Start the server
CMD ["node", "server/index.js"]
