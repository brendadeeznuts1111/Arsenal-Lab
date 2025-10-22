# Betting API Configuration Guide

## Overview

This guide covers the standardized configuration for the betting platform API integration in the @arsenallab_bot notification system.

## Environment Variables (Standardized)

```bash
# Betting API Configuration (Standardized)
# Replace with your actual betting platform API details
BETTING_API_BASE_URL=https://betting-api.example.com
BETTING_API_BEARER_TOKEN=your_bearer_token_here
BETTING_API_AGENT_ID=DEMO_AGENT
BETTING_API_AGENT_OWNER=DEMO_AGENT
BETTING_API_AGENT_SITE=1
BETTING_API_TIMEOUT=10000
```

## Configuration Details

### Base URL
- **Variable**: `BETTING_API_BASE_URL`
- **Default**: `https://betting-api.example.com` (placeholder)
- **Description**: The root URL for the betting platform API

### Authentication
- **Variable**: `BETTING_API_BEARER_TOKEN`
- **Required**: Yes
- **Description**: JWT Bearer token for API authentication
- **Validation**: Must be set and not equal to demo placeholder

### Agent Configuration
- **Variable**: `BETTING_API_AGENT_ID`
- **Default**: `DEMO_AGENT`
- **Description**: Agent identifier for API requests

- **Variable**: `BETTING_API_AGENT_OWNER`
- **Default**: `DEMO_AGENT`
- **Description**: Agent owner identifier

- **Variable**: `BETTING_API_AGENT_SITE`
- **Default**: `1`
- **Description**: Agent site number

### Timeouts
- **Variable**: `BETTING_API_TIMEOUT`
- **Default**: `10000` (10 seconds)
- **Description**: Request timeout in milliseconds

## API Endpoints

The client automatically constructs these endpoints:

- **Bet Ticker**: `GET/POST {baseUrl}/cloud/api/Manager/getBetTicker`
- **Authentication**: Bearer token in `Authorization` header
- **Content-Type**: `application/x-www-form-urlencoded`

## Request Format

```javascript
// POST request format
{
  method: 'POST',
  headers: {
    'accept': '*/*',
    'authorization': `Bearer ${token}`,
    'content-type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    agentID: agentId,
    wagerNumber: wagerNumber,
    operation: 'getBetTicker',
    RRO: '1',
    agentOwner: agentOwner,
    agentSite: agentSite.toString()
  })
}
```

## Error Handling

The client includes comprehensive error handling:

- **Timeout**: 10-second default timeout
- **Authentication**: Validates Bearer token presence
- **Network**: Handles fetch failures gracefully
- **Validation**: Checks for required environment variables

## Testing

Use the included demo script to test configuration:

```bash
# Set environment variables first
export BETTING_API_BEARER_TOKEN="your-token-here"
export BETTING_API_BASE_URL="https://your-api.example.com"

# Run demo
bun run scripts/demo-betting-integration.ts
```

## Migration from Legacy Configuration

If you're migrating from the old Fantasy402 configuration:

1. Update environment variable names to use the standardized `BETTING_API_*` prefix
2. Replace placeholder domain with your actual betting platform API endpoint
3. Set a valid Bearer token for authentication
4. Test with the demo script: `bun run scripts/demo-betting-integration.ts`

## Security Considerations

- Never commit Bearer tokens to version control
- Use environment-specific configuration files
- Rotate tokens regularly
- Monitor API usage for anomalies

## Bun Runtime Compatibility

This integration is optimized for Bun v1.3.1+:

- Uses native `fetch` API
- Leverages Bun's fast URL parsing
- Compatible with Bun's environment variable handling
- Optimized for Bun's HTTP client performance
