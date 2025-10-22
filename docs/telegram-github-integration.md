# Telegram Bot GitHub Integration

Complete integration between Arsenal Lab's Telegram bot and GitHub ecosystem.

## Overview

The Telegram bot now provides live access to:
- **GitHub Repository Metrics** - Stars, forks, issues, watchers
- **Wiki Search** - Full-text search across wiki pages
- **GitHub Discussions** - Latest community discussions
- **GitHub Pages Deployment** - Live deployment status
- **Auto-Published Metrics** - Bot metrics updated every 10 minutes

## New Commands

### `/metrics` - GitHub Repository Stats

Shows live statistics from the Arsenal Lab repository:

```
/metrics
```

**Features**:
- ⭐ Star count
- 🍴 Fork count
- 🐛 Open issues
- 👀 Watchers
- 💻 Primary language
- 📦 Repository size
- 🕒 Last updated timestamp
- Links to repository and live site

**Rate Limits**:
- Without token: 60 requests/hour
- With token: 5000 requests/hour

---

### `/wiki <query>` - Search Wiki Pages

Search Arsenal Lab wiki for documentation:

```
/wiki home
/wiki performance
/wiki getting started
```

**Features**:
- Exact title matching
- Full-text content search
- Top 5 results with summaries
- Direct links to wiki pages
- 10-minute cache for performance

**How it works**:
1. Clones wiki repository to temp directory
2. Parses all `.md` files
3. Searches titles and content
4. Returns matching pages with summaries

---

### `/discuss` - Latest Discussions

View the 5 most recent GitHub Discussions:

```
/discuss
```

**Features**:
- Discussion titles and authors
- Category badges
- Upvote counts
- Comment counts
- Answered status
- Relative timestamps ("2 hours ago")
- Direct links to discussions

---

### `/deploy` - GitHub Pages Status

Check GitHub Pages deployment status:

```
/deploy
```

**Features**:
- Deployment status (Live, Building, Failed)
- Last updated timestamp
- Build time (if available)
- Direct link to live site

**Statuses**:
- ✅ Live - Site is deployed and accessible
- ⏳ Building - Deployment in progress
- 🔄 Queued - Waiting to build
- ❌ Failed - Deployment error

---

## GitHub API Setup

### Generate Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Set expiration and permissions:
   - `repo` - Full repository access
   - `read:org` - Read organization data (for discussions)
   - `read:user` - Read user profile

4. Copy the token (starts with `ghp_`)

### Add to Environment

```bash
# Add to .env file
echo "GITHUB_TOKEN=ghp_your_token_here" >> .env
```

**Security Notes**:
- Never commit `.env` to version control
- Rotate tokens every 90 days
- Use fine-grained tokens when possible
- Monitor token usage in GitHub settings

---

## Auto-Published Metrics

### GitHub Actions Workflow

The bot automatically publishes metrics to GitHub Pages every 10 minutes:

**File**: `.github/workflows/publish-metrics.yml`

```yaml
name: Publish Bot Metrics
on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
  workflow_dispatch:  # Manual trigger
```

### Metrics JSON Format

Published to: `https://brendadeeznuts1111.github.io/Arsenal-Lab/metrics/metrics.json`

```json
{
  "commandsProcessed": 1247,
  "uniqueUsers": 42,
  "averageResponseTime": 125,
  "errorsEncountered": 3,
  "lastUpdated": "2025-10-22T03:26:55.000Z",
  "uptime": 86400,
  "version": "1.0.0",
  "runtimeInfo": {
    "bunVersion": "1.3.0",
    "platform": "linux",
    "architecture": "x64"
  }
}
```

### Manual Export

```bash
# Export metrics locally
bun run scripts/export-metrics.ts

# Metrics saved to: metrics/metrics.json
```

---

## GitHub Pages Integration

### TelegramBotMetrics Component

Add live bot metrics to your React app:

```tsx
import { TelegramBotMetrics } from './components/TelegramBotMetrics';

function App() {
  return (
    <div>
      <TelegramBotMetrics />
    </div>
  );
}
```

**Features**:
- Auto-refreshes every 30 seconds
- Live indicator with pulse animation
- Responsive grid layout
- Error handling and loading states
- Links to bot, group, and channel

---

## Rate Limiting & Caching

### GitHub API Rate Limits

| Auth Type | Limit | Reset Time |
|-----------|-------|------------|
| No token | 60/hour | Every hour |
| With token | 5000/hour | Every hour |
| GraphQL | 5000 points/hour | Every hour |

### Wiki Cache

- **Duration**: 10 minutes
- **Strategy**: Clone on first request, update on cache miss
- **Storage**: Temporary directory (`/tmp/arsenal-lab-wiki`)
- **Clear cache**: Restart bot or wait 10 minutes

### Metrics Cache

- **Duration**: 10 minutes (GitHub Actions)
- **Format**: JSON
- **Location**: `metrics/metrics.json` in gh-pages branch

---

## Error Handling

All GitHub commands handle common errors gracefully:

### Rate Limit Exceeded

```
❌ GitHub API Rate Limit Exceeded

The API rate limit has been reached. Please try again later.

Tip: Add a GitHub token to increase the rate limit from 60 to 5000 requests per hour.
```

### Wiki Clone Failed

```
❌ Wiki Search Failed

Failed to clone wiki: repository not found

The wiki repository may not be available. Try again later.
```

### Discussions Require Token

```
❌ GitHub Discussions Unavailable

Discussions may not be enabled for this repository, or a GitHub token is required.

🔗 Visit Discussions
```

### Deployment Not Found

```
🚀 GitHub Pages Deployment

✅ Assumed Live

Deployment details unavailable via API, but the site should be live.

🌐 Visit Live Site
```

---

## Testing

### Test All Commands

```bash
# Start bot
bun run telegram:dev

# Test in Telegram:
/metrics
/wiki home
/discuss
/deploy
```

### Verify Metrics Export

```bash
# Generate metrics
bun run scripts/export-metrics.ts

# Check output
cat metrics/metrics.json
```

### Test GitHub Actions Workflow

```bash
# Trigger manually
gh workflow run publish-metrics.yml

# Check status
gh run list --workflow=publish-metrics.yml
```

---

## Troubleshooting

### Wiki search returns no results

**Cause**: Wiki repository might not exist or is empty

**Fix**:
1. Create wiki on GitHub
2. Add at least one page (Home.md)
3. Try command again (cache will clear in 10 minutes)

### Metrics not updating

**Cause**: GitHub Actions workflow not running

**Fix**:
1. Check workflow is enabled: Settings → Actions
2. Verify `GITHUB_TOKEN` has `contents: write` permission
3. Check workflow runs: Actions → Publish Bot Metrics

### Rate limit errors

**Cause**: No GitHub token or token expired

**Fix**:
1. Generate new token (see above)
2. Add to `.env` file
3. Restart bot

### Commands timing out

**Cause**: GitHub API slow or unreachable

**Fix**:
1. Check GitHub status: https://www.githubstatus.com/
2. Increase timeout in bot configuration
3. Try again later

---

## Advanced Usage

### Custom Wiki Repository

Update `src/integrations/github/wiki.ts`:

```ts
const WIKI_REPO = 'https://github.com/your-org/your-repo.wiki.git';
```

### Custom Metrics Schedule

Edit `.github/workflows/publish-metrics.yml`:

```yaml
schedule:
  - cron: '*/5 * * * *'  # Every 5 minutes
```

### Add Custom Metrics

Extend `scripts/export-metrics.ts`:

```ts
function generateMetrics(): BotMetrics {
  return {
    // ... existing metrics
    customMetric: calculateCustomMetric(),
  };
}
```

---

## Resources

- **GitHub REST API**: https://docs.github.com/rest
- **GitHub GraphQL API**: https://docs.github.com/graphql
- **GitHub Pages**: https://docs.github.com/pages
- **Personal Access Tokens**: https://github.com/settings/tokens
- **Rate Limits**: https://docs.github.com/rest/overview/rate-limits-for-the-rest-api

---

## Summary

✅ **4 new commands**: `/metrics`, `/wiki`, `/discuss`, `/deploy`
✅ **GitHub API integration** with proper auth and rate limiting
✅ **Wiki search** with full-text indexing and caching
✅ **Auto-published metrics** every 10 minutes via GitHub Actions
✅ **React component** for live metrics display on GitHub Pages
✅ **Production-ready** error handling and fallbacks

All code is production-ready with comprehensive error handling, caching, and security best practices.
