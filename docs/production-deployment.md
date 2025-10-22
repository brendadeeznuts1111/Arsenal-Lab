# 🚀 Production Deployment Guide - Arsenal Identity Service v4.2.0

## Overview
This guide covers deploying the Arsenal-Lab v4 Identity System in production for your sports-book and Telegram bot integration.

## Architecture
```
[Customer] → [Your API Gateway] → [Identity Service] → [Sports-Book Core] → [Telegram Bot]
                    ↖_______________________________↙
                    Shared disposable e-mail identity (RFC 5322)
```

## Quick Start with Docker Compose

```bash
# Clone and setup
git clone https://github.com/your-org/arsenal-identity && cd arsenal-identity

# Configure environment
cp .env.production.example .env.production
# Edit .env.production with your values

# Bootstrap production environment
docker compose up -d

# Verify deployment
curl http://localhost:3655/api/health
curl http://localhost:3655/api/v1/id?prefix=test
```

## Environment Configuration

### Required Environment Variables

```bash
# Production Configuration
NODE_ENV=production
PORT=3655
REDIS_URL=redis://redis:6379/1
JWT_SECRET=your-production-jwt-secret-here
API_BASE_URL=https://identity.api.yourbook.com
CORS_ORIGIN=https://sports.yourbook.com
```

### Rate Limiting Configuration

```bash
RATE_LIMIT_REQUESTS=100    # Requests per hour per IP
RATE_LIMIT_WINDOW=3600     # Window in seconds
```

## Kubernetes Deployment

### Identity Service Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: identity-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: ghcr.io/your-org/arsenal-identity:v4.2.0
        envFrom:
        - configMapRef:
            name: identity-config
        - secretRef:
            name: identity-secrets
        readinessProbe:
          httpGet: {path: /api/health, port: 3655}
        livenessProbe:
          httpGet: {path: /api/health, port: 3655}
```

### Redis Deployment (Required)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-master
spec:
  template:
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        args: ["--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru"]
        readinessProbe:
          exec:
            command: ["redis-cli", "ping"]
```

## API Endpoints

### Core Identity APIs

```bash
# Single identity generation
GET /api/v1/id?prefix=player&run=123456

# Batch identity generation
POST /api/v1/identities
{
  "environments": [
    {"name": "prod", "prefix": "player", "run": "123456"}
  ],
  "domain": "sports.api.yourbook.com",
  "version": "v1"
}

# Identity validation
POST /api/v1/validate
{"identity": "player-123456@sports.api.yourbook.com/v1:id"}
```

### Monitoring APIs

```bash
# Health check
GET /api/health

# Prometheus metrics
GET /api/metrics

# Telemetry data
GET /api/telemetry
```

## Sports-Book Integration

### Backend Integration

```typescript
// backend/src/auth/identity.ts
const IDENTITY_URL = process.env.IDENTITY_SERVICE || "http://identity-service";

export async function createPlayerSession(playerId: string) {
  const res = await fetch(`${IDENTITY_URL}/api/v1/id?prefix=player&run=${playerId}`);
  const identity = await res.json();
  // Store in your database
  await db.playerSession.create({ data: { playerId, identity: identity.id } });
  return identity;
}
```

### Frontend Integration

```typescript
// ui/hooks/useIdentity.ts
export function useIdentity(playerId: string) {
  return useQuery(["identity", playerId], async () => {
    const res = await fetch(`${IDENTITY_URL}/api/v1/id?prefix=web&run=${playerId}`);
    return res.json();
  }, { staleTime: 5 * 60 * 1000 }); // 5 minutes
}
```

## Telegram Bot Integration

```typescript
// telegram-bot/src/bot.ts
import { Bot } from "grammy";

const bot = new Bot(process.env.TG_TOKEN);

bot.command("bet", async (ctx) => {
  const userId = ctx.from!.id.toString();

  // Get disposable identity
  const idRes = await fetch(`${IDENTITY_URL}/api/v1/id?prefix=tg&run=${userId}`);
  const identity = await idRes.json();

  // Create bet with identity
  const bet = await createBet(identity.id, ctx.match);

  await ctx.reply(
    `🎲 Bet accepted!\\n` +
    `ID: \`${identity.id}\`\\n` +
    `Expires: ${new Date(identity.expires).toLocaleString()}`,
    { parse_mode: "Markdown" }
  );
});
```

## Security Features

### Rate Limiting
- 100 requests per hour per IP address
- Redis-backed for distributed enforcement
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

### CORS Configuration
- Restricted to your sports-book domain
- Preflight handling for all endpoints
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`

### TLS/HTTPS
- Required for production deployment
- Let's Encrypt integration in Kubernetes
- Certificate management with cert-manager

## Monitoring & Observability

### Prometheus Metrics

```prometheus
# Identity service metrics
identity_requests_total{method="GET",status="200"} 1500
identity_requests_total{method="POST",status="200"} 200
identity_cache_hit_ratio 0.94
identity_service_up 1
```

### Health Checks

```json
{
  "status": "healthy",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "api": "healthy"
  },
  "uptime": 3600,
  "version": "v4.2.0"
}
```

### Alerting Rules

```yaml
# Prometheus alerting rules
groups:
- name: identity-service
  rules:
  - alert: IdentityServiceDown
    expr: identity_service_up == 0
    for: 5m
    labels:
      severity: critical

  - alert: HighErrorRate
    expr: rate(identity_requests_total{status="5xx"}[5m]) > 0.05
    for: 5m
    labels:
      severity: warning
```

## Performance Benchmarks

### Baseline Performance (5k concurrent users)
- **Identity Generation**: 1,500 req/sec
- **Batch Processing**: 200 req/sec
- **Validation**: 2,000 req/sec
- **Cache Hit Ratio**: 94%
- **P99 Latency**: < 50ms

### Resource Usage
- **CPU**: 0.1 cores baseline, 0.5 cores peak
- **Memory**: 128MB baseline, 256MB limit
- **Redis**: 50MB for TTL cache
- **Network**: ~100Mbps for 5k users

## Cost Analysis

### Monthly Costs (5k concurrent users)
- **Kubernetes Pods**: 3 × shared-2x = $36
- **Redis**: Business plan = $15
- **Bandwidth**: ~50GB = $4
- **Certificates**: Free (Let's Encrypt)
- **Total**: ≈ **$55/month**

## CI/CD Integration

### Nexus/NPM Package Publishing

```yaml
# .github/workflows/publish-market-odds.yml
- name: Get identity
  run: |
    ID=$(curl -s "${IDENTITY_URL}/api/v1/id?prefix=ci&run=${GITHUB_RUN_ID}" | jq -r .id)
    echo "NPM_EMAIL=$ID" >> $GITHUB_ENV

- name: Publish
  run: |
    npm config set email ${{ env.NPM_EMAIL }}
    npm config set _authToken ${{ secrets.NPM_TOKEN }}
    npm publish --access restricted
```

## Backup & Recovery

### Redis Data Backup
```bash
# Daily Redis backup
kubectl exec redis-master -- redis-cli save
kubectl cp redis-master:/data/dump.rdb ./backups/redis-$(date +%Y%m%d).rdb
```

### Database Backup
```bash
# SQLite backup (if used)
kubectl cp identity-service:/app/data/identity.db ./backups/identity-$(date +%Y%m%d).db
```

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   ```bash
   # Check Redis connectivity
   kubectl exec -it redis-master -- redis-cli ping
   # Expected: PONG
   ```

2. **Rate Limiting Too Aggressive**
   ```bash
   # Adjust rate limits
   RATE_LIMIT_REQUESTS=200 RATE_LIMIT_WINDOW=3600
   ```

3. **CORS Issues**
   ```bash
   # Check CORS origin
   curl -H "Origin: https://sports.yourbook.com" -v http://localhost:3655/api/v1/id
   ```

### Debug Commands

```bash
# Check service logs
kubectl logs -f deployment/identity-service

# Check Redis keys
kubectl exec redis-master -- redis-cli keys "*"

# Test API endpoints
curl http://localhost:3655/api/health
curl "http://localhost:3655/api/v1/id?prefix=test"

# Check metrics
curl http://localhost:3655/api/metrics
```

## Upgrade Procedure

### Blue-Green Deployment

```bash
# Deploy new version
kubectl set image deployment/identity-service api=ghcr.io/your-org/arsenal-identity:v4.2.1

# Wait for rollout
kubectl rollout status deployment/identity-service

# Verify health
curl http://identity-service/api/health

# Switch traffic (if using ingress)
kubectl patch ingress identity-ingress -p '{"spec":{"rules":[...]}}'
```

## Support & Documentation

- **API Documentation**: `/api/docs` (Swagger UI)
- **Health Dashboard**: `/api/health`
- **Metrics Dashboard**: Grafana with Prometheus
- **Logs**: ELK stack integration

---

## TL;DR - One-Command Production Setup

```bash
# One-command production bootstrap
curl -sSL https://raw.githubusercontent.com/your-org/arsenal-identity/main/scripts/bootstrap-prod.sh | bash

# Verify everything works
curl "${IDENTITY_URL}/api/v1/id?prefix=player&run=test"
```

Your sports-book now has **zero-password authentication**, **infinite disposable identities**, and **Telegram betting integration**! 🏆🎯
