# Stage 1: Build stage
FROM node:20-alpine as builder

# Install build dependencies and v2ray
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    v2ray \
    ca-certificates

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY server ./server
COPY drizzle.config.ts ./
COPY shared ./shared
COPY client ./client

# Build the application (if using TypeScript)
RUN npm run build 2>/dev/null || true

# Run database migrations in builder stage


# Ensure /app/dist exists so the later COPY from builder won't fail if build produced nothing
RUN mkdir -p /app/dist

# Stage 2: Runtime stage
FROM node:20-alpine

# Install v2ray and runtime dependencies (include wget for healthcheck)
RUN apk add --no-cache \
    v2ray \
    ca-certificates \
    dumb-init \
    wget

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/client ./client
COPY --from=builder /app/tsconfig.json ./

# Expose ports
ARG PORT=5000
ENV PORT=${PORT}
EXPOSE ${PORT}

# Health check (uses wget which we installed above)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:${PORT:-5000}/api/status || exit 1

# Use dumb-init to handle signals properly (let system find it in PATH)
ENTRYPOINT ["dumb-init", "--"]

# Use a production start command — update to the correct entrypoint file or ensure package.json has a "start" script
CMD ["npm", "start"]
