# White-label Sports Betting Telegram Bot

A sophisticated Telegram bot for sports betting operators who rent sports-book platforms but want to own their customer experience, data, and branding.

## Features

- 🚀 **Zero-password authentication** via disposable identity tokens
- 🎯 **Interactive bet placement** with conversation flows
- 🔐 **KYC integration** with status tracking
- 💰 **Balance management** and transaction history
- 🎫 **Ticket management** for active bets
- 🌍 **Multi-language support** (English, Spanish, Portuguese, German, French)
- 📊 **Real-time metrics** and health monitoring
- 🛡️ **Rate limiting** and fraud prevention
- 🔄 **Seamless integration** with rented sports-book APIs

## Architecture

```
Telegram User → Bot → Identity Service → Customer DB
                       ↘
                        Renter API (iframe/headless) → Bet Placement
```

## Quick Start

1. **Install dependencies:**
   ```bash
   cd telegram-bot
   bun install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your bot token and service URLs
   ```

3. **Start the bot:**
   ```bash
   bun run dev  # Development with hot reload
   # or
   bun run start  # Production
   ```

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and registration |
| `/bet` | Interactive bet placement |
| `/balance` | Check account balance |
| `/tickets` | View active bet tickets |
| `/profile` | User profile and settings |
| `/kyc` | KYC verification status |
| `/help` | Show help and commands |

## Configuration

### Environment Variables

```bash
# Required
TG_BOT_TOKEN=your-telegram-bot-token-here
IDENTITY_SERVICE_URL=http://localhost:3001
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Optional
RENTER_API_URL=https://fantasy402.com/api
KYC_WIDGET_URL=https://sumsub.com/widget
BOT_USERNAME=@YourBrandBot
SUPPORT_USERNAME=@YourBrandSupport
```

### Database Setup

The bot expects a PostgreSQL database with the schema defined in `../backend/database/white-label-schema.sql`.

```bash
# Create database
createdb white_label_db

# Run schema
psql white_label_db < ../backend/database/white-label-schema.sql
```

## Bet Placement Flow

1. **Authentication:** User starts conversation with `/bet`
2. **KYC Check:** Verify user has completed identity verification
3. **Stake Selection:** Choose or enter bet amount
4. **Market Selection:** Choose betting market (moneyline, spread, etc.)
5. **Selection Input:** Enter team/player/outcome
6. **Odds Confirmation:** Enter or confirm betting odds
7. **Identity Creation:** Generate disposable identity token
8. **Bet Submission:** Place bet through renter API (iframe or headless)
9. **Confirmation:** Return ticket number and bet details

## Integration Points

### Identity Service
```typescript
const identity = await createIdentity('tg', userId);
// Returns: { id: "tg-123456789@sports.api.yourbrand.com/v1:id", ttl: 3600, ... }
```

### Renter API Integration
```typescript
// Option 1: Iframe (easiest)
const ticket = await placeBetViaIframe(identity.id, betData);

// Option 2: Headless (most reliable)
const ticket = await placeBetViaApi(identity.id, betData);
```

### Customer Database
```typescript
const customer = await db.getCustomer(tgUserId);
const bet = await db.createBet(customer.id, betData);
```

## Security Features

- **Disposable Identities:** Each bet uses a unique, time-limited identity
- **Rate Limiting:** Per-user and global rate limits
- **KYC Enforcement:** Blocks betting until identity verification
- **Input Validation:** Comprehensive validation of all user inputs
- **Audit Logging:** Complete audit trail for compliance

## Monitoring

The bot exposes health and metrics endpoints:

- **Health Check:** `GET /health`
- **Metrics:** `GET /metrics` (Prometheus format)

Key metrics tracked:
- Active users and conversations
- Bet placement success/failure rates
- Response times and error rates
- KYC completion rates

## Deployment

### Docker
```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY package.json .
RUN bun install
COPY . .
EXPOSE 3000
CMD ["bun", "run", "src/bot.ts"]
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: telegram-bot
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: bot
        image: your-registry/telegram-bot:v1.0.0
        envFrom:
        - configMapRef:
            name: bot-config
        - secretRef:
            name: bot-secrets
```

## Development

### Testing
```bash
bun test
```

### Linting
```bash
bun run lint
```

### Local Development
```bash
# Start identity service first
cd .. && bun run src/server.ts

# Then start bot
bun run dev
```

## Compliance

- **KYC/AML:** Integrated identity verification
- **Data Residency:** Configurable data storage locations
- **Audit Trails:** Complete transaction and user activity logs
- **Rate Limiting:** Prevents excessive betting activity
- **Responsible Gambling:** Configurable limits and self-exclusion

## Support

For issues and questions:
- 📧 Email: support@yourbrand.com
- 💬 Telegram: @YourBrandSupport
- 📖 Docs: https://docs.yourbrand.com/bot

---

**Built for operators who rent the math but own the magic.** ✨
