# White-label Reverse Proxy

A hardened reverse proxy setup that sits between your customers and the rented sports-book, injecting your branding, functionality, and security while maintaining the rented platform's core betting engine.

## Overview

```
Internet → Caddy (Your Proxy) → Rented Sports-Book
    ↓
Your Branding + Telegram Auth + KYC + Analytics
```

## Features

- 🔒 **Security Hardening**: CSP, HSTS, XSS protection, rate limiting
- 🎨 **Brand Injection**: Replace logos, colors, and messaging
- 🔐 **Auth Override**: Replace password login with Telegram OAuth
- 📊 **Analytics**: Track user behavior and bet patterns
- 🚀 **Performance**: Compression, caching, CDN integration
- 🛡️ **Compliance**: KYC enforcement, geo-blocking, age verification

## Quick Setup

### 1. Install Caddy

```bash
# Ubuntu/Debian
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Or use Docker
docker run -d --name caddy -p 80:80 -p 443:443 -v caddy_data:/data caddy:latest
```

### 2. Configure Domain

```bash
# Point your domain to your server
# fantasy.yourbrand.com → your-server-ip
```

### 3. Deploy Configuration

```bash
# Copy configuration
sudo cp Caddyfile /etc/caddy/Caddyfile

# Create directories
sudo mkdir -p /var/www/yourbrand
sudo mkdir -p /var/www/cdn

# Copy assets
sudo cp loader.js /var/www/yourbrand/
sudo cp branding.css /var/www/yourbrand/
sudo cp logo.png /var/www/yourbrand/  # Add your logo

# Set permissions
sudo chown -R caddy:caddy /var/www/yourbrand
sudo chown -R caddy:caddy /var/log/caddy

# Reload Caddy
sudo systemctl reload caddy
```

## Configuration Details

### Security Headers

```caddyfile
header {
    Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    X-Frame-Options "DENY"
    X-Content-Type-Options "nosniff"
    X-XSS-Protection "1; mode=block"
    Content-Security-Policy "default-src 'self' https:; script-src 'self' 'nonce-{nonce}'; ..."
}
```

### Rate Limiting

```caddyfile
rate_limit {
    zone static {
        key {remote_host}
        window 1m
        events 100
    }
}
```

### Request Injection

The `loader.js` script:
- Replaces login forms with Telegram authentication
- Injects your branding and CSS
- Intercepts bet placement to use your APIs
- Adds customer context to all requests

## Environment Variables

Set these in your deployment:

```bash
# Domain configuration
YOURBRAND_DOMAIN=fantasy.yourbrand.com
RENTER_DOMAIN=fantasy402.com

# API endpoints
IDENTITY_SERVICE_URL=https://identity.yourbrand.com
TELEGRAM_BOT_URL=https://t.me/YourBrandBot

# Security
TLS_EMAIL=admin@yourbrand.com
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=1m
```

## Monitoring

### Logs

```bash
# Access logs
tail -f /var/log/caddy/access.log

# Structured JSON logs for analysis
jq '.request > "/api/"' /var/log/caddy/access.log | head -10
```

### Metrics

Caddy exposes Prometheus metrics at `:2019/metrics`:

```bash
# Active connections
curl localhost:2019/metrics | grep http_requests_in_flight

# Response codes
curl localhost:2019/metrics | grep http_response_status_count
```

### Health Checks

```bash
# Caddy health
curl localhost:2019/health

# Backend health
curl https://fantasy.yourbrand.com/api/health
```

## Customization

### Your Branding

1. **Replace logo**: Update `logo.png` in `/var/www/yourbrand/`
2. **Colors**: Modify CSS variables in `branding.css`
3. **Text**: Update strings in `loader.js`
4. **Fonts**: Add Google Fonts import in CSS

### KYC Integration

Add KYC check to `loader.js`:

```javascript
async function checkKYCStatus(customerId) {
    const response = await fetch(`${API_BASE}/api/customers/${customerId}`);
    const customer = await response.json();
    return customer.kyc_status === 'approved';
}

// Block betting if not verified
if (!(await checkKYCStatus(CONFIG.customerId))) {
    redirectToKYC();
}
```

### Geo-blocking

Add country-based restrictions:

```caddyfile
@blocked_countries {
    vars {
        country_code {header.X-Country-Code}
    }
    expression {vars.country_code} in ["CU", "IR", "KP", "SY"]
}

respond @blocked_countries 403 {
    body "Service not available in your region"
}
```

## Troubleshooting

### Common Issues

1. **Mixed Content Warnings**
   ```
   # Ensure all assets use HTTPS
   header Content-Security-Policy "upgrade-insecure-requests"
   ```

2. **CORS Issues**
   ```
   # Add your domain to allowed origins
   header Access-Control-Allow-Origin https://yourapp.com
   ```

3. **Rate Limiting Too Aggressive**
   ```
   # Increase limits
   rate_limit events 500
   ```

4. **Assets Not Loading**
   ```
   # Check file permissions
   ls -la /var/www/yourbrand/
   sudo chown -R caddy:caddy /var/www/yourbrand
   ```

### Debug Mode

```bash
# Enable debug logging
caddy run --config Caddyfile --log-level debug

# Test configuration
caddy validate --config Caddyfile
```

## Production Deployment

### Docker Compose

```yaml
version: '3.8'
services:
  caddy:
    image: caddy:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./assets:/var/www/yourbrand
      - caddy_data:/data
      - caddy_config:/config
    restart: unless-stopped

volumes:
  caddy_data:
  caddy_config:
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: reverse-proxy
spec:
  template:
    spec:
      containers:
      - name: caddy
        image: caddy:latest
        ports:
        - containerPort: 80
        - containerPort: 443
        volumeMounts:
        - name: config
          mountPath: /etc/caddy
        - name: assets
          mountPath: /var/www/yourbrand
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: caddy-config
data:
  Caddyfile: |
    # Your Caddyfile content here
```

## Backup & Recovery

### Configuration Backup

```bash
# Backup Caddy configuration
cp /etc/caddy/Caddyfile ./backups/caddy-$(date +%Y%m%d).conf

# Backup SSL certificates
cp -r /var/lib/caddy ./backups/ssl-$(date +%Y%m%d)
```

### Emergency Bypass

If you need to bypass the proxy:

```bash
# Temporary direct access to renter
ssh user@server "sed -i 's/fantasy402.com/direct.fantasy402.com/' /etc/caddy/Caddyfile"
systemctl reload caddy
```

## Performance Tuning

### Caching

```caddyfile
# Cache static assets
@static {
    file {
        try_files {path} {path}/ /index.html
    }
    path *.css *.js *.png *.jpg *.svg *.woff2
}
header @static Cache-Control max-age=31536000
```

### Compression

```caddyfile
# Enable Brotli compression
encode brotli gzip
```

### Connection Limits

```caddyfile
# Limit concurrent connections
client_max_header_size 1m
client_max_body_size 50m
```

## Compliance

- **GDPR**: Implement cookie consent and data deletion
- **COPPA**: Age verification for under 18
- **AML**: KYC integration and transaction monitoring
- **Geo-blocking**: Restrict access by jurisdiction

---

**Your reverse proxy: Where rented becomes yours.** 🎭✨
