# Multi-stage build with air-gapped patch application
FROM oven/bun:1.3-slim AS deps
WORKDIR /app
COPY package.json bun.lockb ./
COPY patches ./patches
RUN bun install --frozen-lockfile --production

FROM oven/bun:1.3-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM oven/bun:1.3-slim AS patch-applier
WORKDIR /app
COPY package.json bun.lockb ./
COPY patches ./patches
# Apply patches and create clean node_modules
RUN bun install --frozen-lockfile --production && \
    bun run invariant:validate && \
    echo "✅ Patches validated and applied"

FROM gcr.io/distroless/base-debian12 AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
# Copy validated node_modules from patch-applier stage
COPY --from=patch-applier /app/node_modules ./node_modules
USER 10001:10001
ENV NODE_ENV=production
CMD ["./dist/server.js"]

# Multi-stage for development
FROM oven/bun:1.3-slim AS development
WORKDIR /app
COPY package.json bun.lockb ./
COPY patches ./patches
RUN bun install
COPY . .
EXPOSE 3000
CMD ["bun", "run", "dev"]

# Air-gapped init container for read-only deployments
FROM oven/bun:1.3-slim AS air-gapped-init
WORKDIR /app
COPY package.json bun.lockb ./
COPY patches ./patches
# This runs in initContainer to populate emptyDir volume
RUN echo "🔄 Applying patches to emptyDir volume..." && \
    bun install --frozen-lockfile --production && \
    bun run invariant:validate && \
    echo "✅ Air-gapped patches applied"

# Health check for production
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
