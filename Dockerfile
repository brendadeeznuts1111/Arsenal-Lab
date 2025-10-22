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

FROM gcr.io/distroless/base-debian12 AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY patches ./patches
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

# Health check for production
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
