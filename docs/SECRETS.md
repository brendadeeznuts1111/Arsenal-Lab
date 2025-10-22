# 🔐 Secrets Management

Arsenal Lab uses **Bun's native Secrets API** to store sensitive configuration data securely using your operating system's credential storage. This provides enterprise-grade security with encryption at rest and proper access controls.

## 🛡️ Security Benefits

- **OS-Level Encryption**: Uses Keychain (macOS), Credential Manager (Windows), or libsecret (Linux)
- **Zero Plaintext**: Credentials never stored in files or exposed in memory dumps
- **Access Control**: Only the user who stored credentials can access them
- **Automatic Cleanup**: Memory is zeroed after use
- **No Git Exposure**: Credentials never committed to version control

## 📁 Environment Files

### `.env` (Private - Not Committed)
Contains your actual secrets and configuration values.

### `.env.example` (Public Template)
Template file showing all available environment variables and their purposes.

### `.env.staging` & `.env.production` (Private - Environment Specific)
Environment-specific configuration files for staging and production deployments.

## 🌍 Environment Management

### Quick Environment Switching
```bash
# Switch to staging
cp .env.staging .env

# Switch to production
cp .env.production .env

# Switch to development
cp .env.example .env  # Then configure manually
```

### Automated Deployment
```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production

# Deploy to development (default)
./scripts/deploy.sh development
```

### Environment-Specific Variables

#### Development
- **NODE_ENV**: `development`
- **PORT**: `3001`
- **Analytics**: May use test/placeholder IDs

#### Staging
- **NODE_ENV**: `staging`
- **PORT**: `3002`
- **Analytics**: Separate GA property for testing
- **Security Keys**: Different from production

#### Production
- **NODE_ENV**: `production`
- **PORT**: `3000`
- **Analytics**: Live production GA tracking
- **Security Keys**: Unique production keys
- **All integrations**: Fully configured

## 🚀 Quick Start

### 1. Run the Interactive Setup
```bash
bun run secrets:setup
```

This will:
- ✅ Check if your system supports Bun Secrets API
- ✅ Prompt for your Google Analytics ID
- ✅ Store GitHub credentials securely
- ✅ Test server configuration

### 2. Manual Setup (Alternative)
```bash
# Interactive secrets management
bun run secrets:manage

# Or set individual secrets programmatically
await Bun.secrets.set({
  service: 'arsenal-lab',
  name: 'google-analytics-id'
}, 'G-YOUR-GA-ID');
```

### 3. Verify Everything Works
```bash
# Start the server
bun run dev

# Check that analytics are loaded
curl http://localhost:3001 | grep "G-YOUR-GA-ID"
```

## 🔑 Available Secrets

| Secret Key | Description | Required |
|------------|-------------|----------|
| `google-analytics-id` | GA4 Measurement ID (G-XXXXXXXXXX) | ✅ Yes |
| `github-username` | Your GitHub username | ✅ Yes |
| `github-repo` | Repository name | ✅ Yes |
| `github-token` | Personal Access Token | ❌ Optional |

## 📊 Fallback Behavior

If Bun Secrets API is unavailable:
- Falls back to environment variables (`.env` file)
- Graceful degradation with placeholder values
- Console warnings about security limitations

## 🔒 Security Features

- **Environment Variables**: All sensitive data loaded from `Bun.env`
- **Gitignored**: `.env` files are never committed to git
- **Dynamic Injection**: Server injects values into HTML at runtime
- **Fallback Values**: Graceful degradation if variables are missing

## 📊 Available Environment Variables

### Core Configuration
- `GOOGLE_ANALYTICS_ID`: Your GA4 Measurement ID (e.g., G-XXXXXXXXXX)
- `GITHUB_USERNAME`: Your GitHub username
- `GITHUB_REPO`: Repository name
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

### Security
- `SESSION_SECRET`: Random string for session encryption
- `API_SECRET_KEY`: API authentication key
- `GITHUB_TOKEN`: GitHub Personal Access Token (for API access)

### Optional Integrations
- `DISCORD_WEBHOOK_URL`: Discord notifications
- `SLACK_WEBHOOK_URL`: Slack notifications
- `DATABASE_URL`: Database connection string
- `SMTP_*`: Email configuration

## 🚀 Runtime Behavior

The server automatically:
1. Loads `.env` file on startup
2. Injects environment variables into HTML templates
3. Provides fallback values for missing variables
4. Never exposes secrets in client-side code

## 🧪 Testing

```bash
# Test with custom environment
GOOGLE_ANALYTICS_ID=G-TEST-ID bun run dev

# Verify injection
curl http://localhost:3001 | grep "G-TEST-ID"
```

## ⚠️ Security Best Practices

1. **Never commit `.env`** to version control
2. **Use strong random keys** for secrets
3. **Rotate keys regularly** in production
4. **Use different values** for dev/staging/production
5. **Monitor environment variable usage** in logs

## 🔍 Troubleshooting

### Analytics Not Loading
```bash
# Check environment variable
echo $GOOGLE_ANALYTICS_ID

# Test server injection
curl http://localhost:3001 | grep analytics
```

### GitHub Links Broken
```bash
# Verify GitHub config
echo "User: $GITHUB_USERNAME"
echo "Repo: $GITHUB_REPO"
```

### Server Won't Start
```bash
# Check for missing required variables
bun run dev 2>&1 | grep -i error
```
