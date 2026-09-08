# Stage 1: Build Frontend and Server bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Vite frontend assets and bundle server.ts with esbuild
RUN npm run build

# Stage 2: Production Execution Environment
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled frontend and bundled CommonJS server from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/db/schema.sql ./server/db/schema.sql

# Non-root user for security
USER node

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
