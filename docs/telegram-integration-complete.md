# Telegram Integration - Complete Guide

Comprehensive guide for Arsenal Lab's Telegram ecosystem integration.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Testing](#testing)
4. [Bot Commands](#bot-commands)
5. [Implementation Details](#implementation-details)
6. [Security](#security)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

## Overview

Arsenal Lab's Telegram integration consists of three components:

### 🤖 Bot (@arsenallab_bot)
Interactive bot for running benchmarks, comparisons, and providing statistics.

**Features:**
- Performance benchmark execution
- Runtime comparisons (Bun vs Node.js vs Deno)
- Real-time statistics
- Automated notifications
- Rate limiting for fair usage

### 📡 Supergroup (@arsenallab)
Community discussion space with organized topics for focused conversations.

**Topics:**
- 📢 Announcements
- 💬 General Discussion
- 🐛 Bug Reports
- 💡 Feature Requests
- 🚀 Performance Tips
- 🎓 Help & Support
- 📊 Benchmarks
- 🤝 Contributing

### 📢 Channel (@arsenallab_channel)
Read-only channel for official announcements and curated content.

**Content:**
- Release announcements
- Performance highlights
- Community spotlights
- Weekly digests

## Getting Started

### Prerequisites

- Bun 1.3+ installed
- Telegram account
- Bot created via @BotFather
- `.env` file configured

### Quick Setup

```bash
# 1. Clone repository (if not already done)
git clone https://github.com/brendadeeznuts1111/Arsenal-Lab.git
cd Arsenal-Lab

# 2. Install dependencies
bun install

# 3. Set up environment variables
cp .env.example .env

# 4. Add your bot token to .env
echo "TELEGRAM_BOT_TOKEN=your_bot_token_here" >> .env

# 5. Run tests to verify integration
bun run test:telegram

# 6. Start dev server (for testing web links)
bun run dev
```

## Testing

### Automated Testing

Arsenal Lab includes comprehensive testing for the Telegram integration:

```bash
# Run all Telegram integration tests
bun run test:telegram

# Test only links (footer, README, docs)
bun run test:links

# Test only security configuration
bun run test:security

# Verbose output
bun run test:telegram --verbose
```

### Test Coverage

The test suite validates:
- ✅ File structure (all required files exist)
- ✅ Footer links (proper URLs and security attributes)
- ✅ README badges (shields.io integration)
- ✅ Environment variables (proper configuration)
- ✅ Security (no tokens in git, .gitignore setup)
- ✅ Documentation completeness

### Manual Testing

#### Test Bot Response
```bash
# 1. Open Telegram
# 2. Search: @arsenallab_bot
# 3. Send: /start
# Expected: Welcome message with available commands
```

#### Test Footer Links
```bash
# 1. Start dev server
bun run dev

# 2. Open http://localhost:3655
# 3. Scroll to footer
# 4. Click Telegram links
# Expected: Opens correct Telegram chat/bot/channel
```

## Bot Commands

### Available Commands

#### `/start` or `/help`
Shows welcome message and available commands.

**Example:**
```
/start
```

**Response:**
```
Welcome! 👋

🏆 Arsenal Lab Bot
FAANG-grade performance testing for Bun runtime

What I can do:
⚡ Run performance benchmarks
📊 Compare Bun vs Node.js
📈 Show real-time statistics

Quick Start:
/benchmark crypto - Test crypto performance
/compare bun node - Runtime comparison
/help - See all commands
```

#### `/benchmark [type]`
Runs performance benchmarks.

**Arguments:**
- `crypto` - Cryptography benchmarks
- `memory` - Memory optimization tests
- `postmessage` - postMessage performance
- `all` - Run all benchmarks

**Example:**
```
/benchmark crypto
```

**Response:**
```
🔐 Crypto Benchmark Results

━━━━━━━━━━━━━━━━━━━━
⚡ Bun: 2.30ms
🟢 Node.js: 11.20ms

📊 Speedup: 4.87× faster
💾 Memory: 34.00 MB
━━━━━━━━━━━━━━━━━━━━

📈 Try it yourself: https://...
💬 Join discussion: https://t.me/arsenallab
```

#### `/compare <runtime1> <runtime2>`
Compares performance between runtimes.

**Arguments:**
- `bun`, `node`, or `deno`

**Example:**
```
/compare bun node
```

**Response:**
```
⚖️ Runtime Comparison

bun vs node

━━━━━━━━━━━━━━━━━━━━

📊 Results:
  • Startup: 0.50ms
  • Http: 1.20ms
  • Crypto: 2.30ms
  • FileIO: 0.80ms

━━━━━━━━━━━━━━━━━━━━
```

#### `/stats`
Shows bot usage statistics.

**Example:**
```
/stats
```

**Response:**
```
📊 Arsenal Lab Bot Statistics

━━━━━━━━━━━━━━━━━━━━
👥 Total Users: 42
🟢 Active Users: 12
⚡ Commands Processed: 347
⏱️ Uptime: 24h 0m
📦 Version: 1.4.1
━━━━━━━━━━━━━━━━━━━━

🤖 Powered by Bun 1.3.0
```

## Implementation Details

### Directory Structure

```
src/integrations/telegram/
├── bot.ts                    # Main bot class
├── types.ts                  # TypeScript types
├── commands/
│   ├── index.ts             # Command registry
│   ├── benchmark.ts         # /benchmark handler (STUB)
│   ├── compare.ts           # /compare handler (STUB)
│   ├── stats.ts             # /stats handler (STUB)
│   └── help.ts              # /help handler
└── utils/
    ├── rate-limiter.ts      # Rate limiting
    └── formatter.ts         # Message formatting
```

### Current Status

**✅ Completed:**
- Bot architecture designed
- Command handlers (stubs) implemented
- Rate limiting system
- Message formatting utilities
- TypeScript type definitions
- Security configuration
- Testing infrastructure

**⏳ TODO (Next Phase):**
- Integrate with actual Arsenal Lab benchmarks
- Implement webhook handler
- Set up polling for development
- Add persistent stats storage
- Deploy to production
- Configure @BotFather commands

### Rate Limiting

The bot implements per-user rate limiting to prevent abuse:

| Command | Limit | Window |
|---------|-------|--------|
| `/benchmark` | 5 requests | 1 minute |
| `/compare` | 10 requests | 1 minute |
| `/stats` | 20 requests | 1 minute |
| Default | 15 requests | 1 minute |

**Response when rate limited:**
```
⚠️ Rate Limit Exceeded

You've sent too many requests.
Please try again in 45 seconds.
```

## Security

### Bot Token Management

**⚠️ CRITICAL: Never commit bot tokens to git!**

#### Using Environment Variables (.env)
```bash
# .env (gitignored)
TELEGRAM_BOT_TOKEN=your_actual_bot_token
TELEGRAM_CHANNEL_ID=@arsenallab_channel
TELEGRAM_GROUP_ID=@arsenallab
```

#### Using Bun.secrets (Recommended)
```bash
bun run manage-secrets.ts
# Select: Add/Update Secret
# Service: arsenal-lab
# Name: TELEGRAM_BOT_TOKEN
# Value: <paste token>
```

### Security Checklist

- [x] `.env` in `.gitignore`
- [x] No tokens in documentation
- [x] No tokens in code commits
- [x] Rate limiting enabled
- [x] Input validation for commands
- [x] Error messages don't leak sensitive data
- [ ] Webhook signature verification (TODO)
- [ ] HTTPS for webhooks (TODO)

### Testing Security

```bash
# Check for exposed tokens
bun run test:security

# Should pass all checks:
# ✅ No bot tokens found in documentation
# ✅ .env is gitignored
# ✅ Security warnings present
```

## Deployment

### Development Mode (Polling)

For local development, use polling to receive updates:

```typescript
// TODO: Implement polling
// Example in docs/telegram-bot-setup.md
```

### Production Mode (Webhooks)

For production, use webhooks for better performance:

```bash
# Set webhook URL
curl -X POST "https://api.telegram.org/bot${TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/webhook/telegram"}'

# Verify webhook
curl "https://api.telegram.org/bot${TOKEN}/getWebhookInfo"
```

### Production Checklist

Before deploying to production:

- [ ] Bot token secured in `.env` or Bun.secrets
- [ ] Webhook configured for production domain
- [ ] Rate limiting enabled and tested
- [ ] Error handling and logging active
- [ ] Analytics/monitoring configured
- [ ] Backup bot instance ready
- [ ] Channel and group properly configured
- [ ] Topics created in supergroup
- [ ] Bot added as admin to channel/group
- [ ] @BotFather commands configured

### Configuring @BotFather Commands

```
# Send to @BotFather
/mybots
[Select @arsenallab_bot]
Edit Bot
Edit Commands

# Paste these commands:
benchmark - Run performance benchmarks (crypto, memory, postmessage, all)
compare - Compare runtimes (bun, node, deno)
stats - Show bot usage statistics
help - Show available commands
start - Welcome message and introduction
```

## Troubleshooting

### Bot Not Responding

**Symptoms:** Bot doesn't reply to messages

**Solutions:**
1. Check bot token is correct in `.env`
2. Verify bot is not banned by Telegram
3. Ensure polling/webhook is running
4. Check logs for errors

```bash
# Test bot token
curl "https://api.telegram.org/bot${TOKEN}/getMe"

# Should return bot info
```

### Rate Limit Issues

**Symptoms:** Users getting rate limited too quickly

**Solutions:**
1. Adjust rate limits in `src/integrations/telegram/utils/rate-limiter.ts`
2. Implement command-specific limits
3. Add admin bypass for testing

### Links Not Working

**Symptoms:** Footer/README links don't open Telegram

**Solutions:**
1. Run link tests: `bun run test:links`
2. Verify URLs are correct
3. Check for typos in URLs
4. Ensure Telegram client is installed

### Tests Failing

**Symptoms:** `bun run test:telegram` shows failures

**Solutions:**
1. Run with verbose flag: `bun run test:telegram --verbose`
2. Check which specific test failed
3. Verify all files exist
4. Ensure no bot token in docs

```bash
# Example: Fix missing documentation
touch docs/telegram-integration-complete.md

# Rerun tests
bun run test:telegram
```

## Next Steps

### Phase 1: Complete Bot Implementation
- [ ] Integrate real benchmarks from Arsenal Lab
- [ ] Implement webhook handler
- [ ] Set up polling for development
- [ ] Add persistent stats storage

### Phase 2: Enhanced Features
- [ ] Inline query support
- [ ] Callback buttons for interactive menus
- [ ] Scheduled notifications
- [ ] User preferences

### Phase 3: Production Deployment
- [ ] Deploy webhook endpoint
- [ ] Configure monitoring/alerts
- [ ] Set up backup/redundancy
- [ ] Launch to public

## Resources

- **Bot API Documentation**: https://core.telegram.org/bots/api
- **Bun.secrets Guide**: https://bun.sh/docs/api/secrets
- **Arsenal Lab Docs**: https://github.com/brendadeeznuts1111/Arsenal-Lab/tree/main/docs
- **Testing Guide**: `/docs/telegram-testing-checklist.md`
- **Setup Guide**: `/docs/telegram-bot-setup.md`

---

**Building an intelligent bot for the Bun performance community!** 🤖⚡

*Last updated: 2025-10-21*
