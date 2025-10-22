# Telegram Bot Setup & Integration

Complete guide for setting up and managing the Arsenal Lab Telegram bot, channel, and supergroup.

## ⚠️ **SECURITY NOTICE**

**NEVER commit the Telegram bot token to version control!**

The bot token is a sensitive credential that grants full access to your bot. It must be:
- Stored in `.env` file (which is gitignored)
- Or stored using Bun.secrets API
- Never included in documentation or code commits
- Treated like a password or API key

## 🤖 Bot Information

- **Bot Username**: @arsenallab_bot
- **Bot URL**: https://t.me/arsenallab_bot
- **API Token**: Stored securely in `.env` (see Security section below)

## 📡 Telegram Ecosystem

### 1. Bot (@arsenallab_bot)
Interactive bot for benchmarks, commands, and automated notifications.

**Features**:
- Performance benchmark execution
- Runtime comparison (Bun vs Node.js)
- Statistics and analytics
- Release notifications
- Command-based interactions

### 2. Supergroup (@arsenallab)
Community discussion space with organized topics.

**Topics**:
- 📢 Announcements
- 💬 General
- 🐛 Bug Reports
- 💡 Feature Requests
- 🚀 Performance Tips
- 🎓 Help & Support
- 📊 Benchmarks
- 🤝 Contributing

### 3. Channel (@arsenallab_channel)
Read-only channel for official announcements and updates.

**Content**:
- Release announcements
- Performance highlights
- Community spotlights
- Weekly digests

## 🔒 Security - Bot Token Management

### IMPORTANT: Never Commit the Bot Token to Git!

The bot token is a sensitive credential that must be kept secure.

**Your Token**: Get it from @BotFather when you create your bot. It will look like:
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz-1234567890
```

**NEVER share this token publicly or commit it to git!**

### Using Bun.secrets API

Arsenal Lab uses Bun's built-in secrets management system:

```bash
# Store the bot token securely
bun run manage-secrets.ts
# Select: Add/Update Secret
# Service: arsenal-lab
# Name: TELEGRAM_BOT_TOKEN
# Value: <paste your actual bot token here>
```

### Environment Variables (Fallback)

For development and CI/CD, you can use environment variables:

```bash
# .env (gitignored)
TELEGRAM_BOT_TOKEN=your_actual_bot_token_from_botfather
TELEGRAM_CHANNEL_ID=@arsenallab_channel
TELEGRAM_GROUP_ID=@arsenallab
```

### Accessing Secrets in Code

```typescript
// src/integrations/telegram/bot.ts
import { Bun } from 'bun';

// Try Bun.secrets first, fallback to process.env
const botToken =
  Bun.secrets.get({ service: 'arsenal-lab', name: 'TELEGRAM_BOT_TOKEN' }) ||
  process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  throw new Error('Telegram bot token not found in secrets or environment');
}
```

## 🚀 Bot Commands

### Implemented Commands

```
/start - Welcome message and bot introduction
/help - Show all available commands
/benchmark [type] - Run performance benchmarks
  • crypto - Cryptography benchmarks
  • memory - Memory optimization tests
  • postmessage - postMessage performance
  • all - Run all benchmarks
/compare <runtime1> <runtime2> - Compare runtimes (bun, node, deno)
/stats - Arsenal Lab usage statistics
/latest - Latest release information
/subscribe - Subscribe to release notifications
/unsubscribe - Unsubscribe from notifications
```

### Bot Response Format

```
User: /benchmark crypto

Bot: 🔐 Running crypto benchmark...

Results for Bun v1.3.0:
━━━━━━━━━━━━━━━━━━━━
• X25519: 2.3ms
• Ed25519: 3.1ms
• SHA-256: 1.2ms
━━━━━━━━━━━━━━━━━━━━

Comparison (vs Node.js 22):
• Speedup: 4.87×
• Memory: -42% (58MB → 34MB)

📊 Try it yourself:
https://brendadeeznuts1111.github.io/Arsenal-Lab/

💬 Join discussion:
https://t.me/arsenallab
```

## 📊 Bot Integration Architecture

### Directory Structure

```
src/
├── integrations/
│   └── telegram/
│       ├── bot.ts              # Main bot entry point
│       ├── commands/           # Command handlers
│       │   ├── benchmark.ts
│       │   ├── compare.ts
│       │   ├── stats.ts
│       │   └── help.ts
│       ├── handlers/           # Event handlers
│       │   ├── message.ts
│       │   ├── callback.ts
│       │   └── inline.ts
│       ├── utils/              # Utilities
│       │   ├── formatting.ts
│       │   ├── rate-limit.ts
│       │   └── analytics.ts
│       └── types.ts            # TypeScript types
```

### Key Features to Implement

#### 1. Rate Limiting
```typescript
// src/integrations/telegram/utils/rate-limit.ts
export class RateLimiter {
  private userLimits = new Map<number, number[]>();

  isAllowed(userId: number, limit: number = 5, window: number = 60000): boolean {
    const now = Date.now();
    const userRequests = this.userLimits.get(userId) || [];

    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => now - time < window);

    if (recentRequests.length >= limit) {
      return false;
    }

    recentRequests.push(now);
    this.userLimits.set(userId, recentRequests);
    return true;
  }
}
```

#### 2. Webhook Setup (Production)
```typescript
// src/integrations/telegram/webhook.ts
import { Bun } from 'bun';

const botToken = Bun.secrets.get({
  service: 'arsenal-lab',
  name: 'TELEGRAM_BOT_TOKEN'
});

const webhookUrl = 'https://brendadeeznuts1111.github.io/Arsenal-Lab/webhook';

// Set webhook
await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: webhookUrl })
});
```

#### 3. Polling Setup (Development)
```typescript
// src/integrations/telegram/polling.ts
export async function startPolling() {
  let offset = 0;

  while (true) {
    try {
      const updates = await getUpdates(offset);

      for (const update of updates) {
        await handleUpdate(update);
        offset = update.update_id + 1;
      }
    } catch (error) {
      console.error('Polling error:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}
```

## 🧪 Testing

### Local Testing

```bash
# Start bot in development mode (polling)
bun run telegram:dev

# Test commands
# Open Telegram and message @arsenallab_bot
# Try: /start, /help, /benchmark crypto
```

### CI/CD Testing

```bash
# Run bot tests
bun test src/integrations/telegram/

# Test with mock Telegram API
bun test --coverage src/integrations/telegram/
```

## 📈 Analytics & Monitoring

### Track Bot Usage

```typescript
// src/integrations/telegram/utils/analytics.ts
export interface BotAnalytics {
  totalUsers: number;
  activeUsers: number;
  commandUsage: Map<string, number>;
  averageResponseTime: number;
}

export function trackCommand(command: string, userId: number) {
  // Track in metrics
  metrics.increment('telegram.commands.total', {
    command,
    user_id: userId.toString()
  });
}
```

### Prometheus Metrics

```typescript
// Export bot metrics for monitoring
export const telegramMetrics = {
  commandsProcessed: new Counter('telegram_commands_total'),
  responseTime: new Histogram('telegram_response_seconds'),
  activeUsers: new Gauge('telegram_active_users'),
  errors: new Counter('telegram_errors_total')
};
```

## 🔄 Deployment

### Environment Setup

```bash
# Development
bun run env:dev
bun run telegram:dev

# Staging
bun run env:staging
bun run telegram:staging

# Production
bun run env:production
bun run telegram:start
```

### Production Checklist

- [ ] Bot token stored in Bun.secrets (not environment variables)
- [ ] Webhook configured for production domain
- [ ] Rate limiting enabled
- [ ] Error handling and logging configured
- [ ] Analytics and monitoring active
- [ ] Backup bot instance ready
- [ ] Channel and group properly linked
- [ ] Topics created in supergroup
- [ ] Bot added as admin to channel and group

## 📋 Maintenance

### Regular Tasks

1. **Monitor bot health** - Check uptime and response times
2. **Review analytics** - Track command usage and user engagement
3. **Update commands** - Add new features based on user feedback
4. **Moderate community** - Manage supergroup topics and discussions
5. **Post announcements** - Regular updates to channel
6. **Backup data** - Export analytics and user preferences

### Rate Limiting Strategy

```typescript
// Recommended limits:
const RATE_LIMITS = {
  benchmark: { limit: 5, window: 60000 },    // 5 per minute
  compare: { limit: 10, window: 60000 },     // 10 per minute
  stats: { limit: 3, window: 60000 },        // 3 per minute
  default: { limit: 20, window: 60000 }      // 20 per minute
};
```

## 🔗 References

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Bun.secrets Documentation](https://bun.sh/docs/api/secrets)
- [Arsenal Lab Security Guide](./SECURITY-ARSENAL-IMPLEMENTATION.md)
- [Social Media Strategy](./community/social-media.md)

---

**Building an intelligent bot for the Bun performance community!** 🤖⚡
