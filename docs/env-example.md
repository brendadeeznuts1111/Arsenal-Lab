# Arsenal Lab Environment Configuration Example

Copy these settings to your `.env` file and customize for your deployment.

## Server Configuration
```bash
NODE_ENV=development
PORT=3655
```

## Arsenal Lab URLs
```bash
ARSENAL_API_URL=http://localhost:3655
PUBLIC_ARSENAL_API_URL=http://localhost:3655  # Exposed to client
```

## Public Configuration (Exposed to Client-Side Code)
Variables prefixed with `PUBLIC_` are automatically exposed to your frontend code via Bun's static file serving.

```bash
PUBLIC_APP_NAME=Arsenal Lab
PUBLIC_APP_VERSION=1.0.0
PUBLIC_ENVIRONMENT=development
PUBLIC_FEATURE_GATE_ENABLED=true
PUBLIC_ANALYTICS_ENABLED=false
PUBLIC_GITHUB_REPO=arsenal-lab
PUBLIC_DEPLOY_ENV=development
```

## Security & Governance
```bash
ARSENAL_FAIL_OPEN=true
ARSENAL_BLOCK_LEVEL=high
ARSENAL_CACHE_TTL=3600
ARSENAL_VERBOSE=false
```

## Analytics & External Services
```bash
GOOGLE_ANALYTICS_ID=G-YOUR-GA-ID
PUBLIC_GOOGLE_ANALYTICS_ID=G-YOUR-GA-ID  # Exposed to client
```

## Database & Infrastructure
```bash
DATABASE_URL=postgres://localhost:5432/arsenal_lab
REDIS_URL=redis://localhost:6379
```

## Feature Flags
```bash
PUBLIC_CANARY_ENABLED=false
PUBLIC_EXPERIMENTAL_FEATURES=false
```

## API Keys Security
⚠️ **Important**: Only prefix with `PUBLIC_` if the key is safe for client-side exposure.

```bash
PUBLIC_API_KEY=your-public-api-key     # ✅ Safe for client
PRIVATE_API_KEY=your-private-api-key   # ❌ Not exposed (server-only)
```

## Usage in Client Code

With `[serve.static] env = "PUBLIC_*"` in `bunfig.toml`, these variables are automatically available in your frontend:

```javascript
// In your client-side JavaScript
console.log(process.env.PUBLIC_APP_NAME);        // "Arsenal Lab"
console.log(process.env.PUBLIC_ENVIRONMENT);     // "development"
console.log(process.env.PUBLIC_API_KEY);         // Your public API key

// Private variables are NOT available
console.log(process.env.PRIVATE_API_KEY);        // undefined
```

## Security Benefits

- **Automatic isolation**: Private keys stay server-side only
- **No manual configuration**: Bun handles the exposure automatically
- **Type safety**: TypeScript can infer public env var types
- **Build-time validation**: Public vars are validated at build time
