# Security Arsenal - Quick Start Guide

**Version:** 1.4.0
**Status:** ✅ Production Ready
**Test Coverage:** 83.77%

---

## 🚀 Quick Commands

### Development
```bash
# Start dev server with demo mode
bun run dev
# Then navigate to: http://localhost:3655?demo=true

# Or toggle demo mode in UI:
# 1. Go to http://localhost:3655
# 2. Click "🔒 Security" tab
# 3. Check "🎭 Demo Mode" checkbox
```

### Testing
```bash
# Run Security Arsenal tests (13 tests)
bun test components/SecurityArsenal/hooks/useSecurityArsenal.test.ts

# Run all tests
bun test

# Watch mode
bun test --watch

# Coverage report
bun test --coverage
```

### CLI Security Audit
```bash
# Basic security audit
bun run arsenal:security

# High severity only, production dependencies
bun run arsenal:ci --security-audit --audit-level=high --audit-prod

# With verbose output
bun run arsenal:ci --security-audit --verbose

# Custom output directory
bun run arsenal:ci --security-audit --output-dir ./security-reports
```

---

## 📊 Features at a Glance

| Feature | Description | Status |
|---------|-------------|--------|
| **Demo Mode** | Test without bun.lock file | ✅ |
| **Historical Tracking** | Store up to 50 audit results | ✅ |
| **Stats Dashboard** | 4 key metrics + trend analysis | ✅ |
| **Severity Filtering** | Filter by Critical/High/Moderate/Low | ✅ |
| **Export JSON** | Download audit results | ✅ |
| **Export Prometheus** | Metrics for monitoring systems | ✅ |
| **CLI Integration** | Automated CI/CD scanning | ✅ |
| **13 Unit Tests** | 100% passing, 83.77% coverage | ✅ |

---

## 🎯 Common Use Cases

### 1. First Time Setup
```bash
# Install dependencies
bun install

# Try demo mode to explore features
bun run dev
# Navigate to: http://localhost:3655?demo=true
```

### 2. Regular Security Scanning
```bash
# Weekly security check
bun run arsenal:security

# Review results in browser
bun run dev
# Click "🔒 Security" tab → "Show History"
```

### 3. CI/CD Integration
```yaml
# .github/workflows/security.yml
- uses: oven-sh/setup-bun@v1
- run: bun install
- run: bun run arsenal:security
- uses: actions/upload-artifact@v4
  with:
    name: security-audit
    path: coverage/security-audit.json
```

### 4. Monitoring Integration
```bash
# Export Prometheus metrics
bun run arsenal:ci --security-audit
# Metrics saved to: coverage/security-metrics.prom

# Import to Grafana or your monitoring system
```

---

## 📖 Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| **Feature Guide** | Complete feature documentation | [SECURITY-ARSENAL.md](./SECURITY-ARSENAL.md) |
| **Implementation** | Technical details & decisions | [SECURITY-ARSENAL-IMPLEMENTATION.md](./SECURITY-ARSENAL-IMPLEMENTATION.md) |
| **Checklist** | Task completion status | [SECURITY-ARSENAL-CHECKLIST.md](./SECURITY-ARSENAL-CHECKLIST.md) |
| **Quick Start** | This document | [SECURITY-ARSENAL-QUICK-START.md](./SECURITY-ARSENAL-QUICK-START.md) |

---

## 🧪 Test Results

```
✅ 13 pass
❌ 0 fail
📊 40 expect() calls
⏱️  ~12s runtime
📈 83.77% coverage

Coverage Breakdown:
  useSecurityArsenal.ts:  96.36%
  mockData.ts:            97.62%
  storage.ts:             93.10%
```

---

## 🎨 UI Components

### Demo Mode
- **Banner:** Purple banner indicating demo mode is active
- **Toggle:** Checkbox to enable/disable demo mode
- **Data:** 7 realistic sample vulnerabilities (2 Critical, 2 High, 2 Moderate, 1 Low)
- **Delay:** 1.5s simulated network delay

### History Panel
- **Display:** Last 10 audit results
- **Click:** Reload any historical scan
- **Clear:** Button to remove all history
- **Storage:** Up to 50 results in localStorage

### Stats Dashboard
- **Total Scans:** Count of audits performed
- **Avg Vulnerabilities:** Average per scan
- **Critical Trend:** ↑ degrading / ↓ improving
- **Last Scan:** Timestamp of most recent audit

---

## 🔧 Configuration

### Environment Variables
```bash
# .env
SECURITY_AUDIT_LEVEL=moderate  # low|moderate|high|critical
SECURITY_PROD_ONLY=false       # true|false
SECURITY_AUTO_SCAN=true        # Auto-scan on startup
```

### CLI Flags
```bash
--security-audit          # Enable security scanning
--audit-level=<level>     # Filter by severity (low|moderate|high|critical)
--audit-prod              # Only scan production dependencies
--output-dir=<path>       # Custom output directory
--verbose                 # Detailed output
```

---

## 🐛 Troubleshooting

### "No bun.lock found"
**Solution:** Enable demo mode or run `bun install`
```bash
# Option 1: Demo mode (no bun.lock needed)
http://localhost:3655?demo=true

# Option 2: Create bun.lock
bun install
```

### "API endpoint not found"
**Solution:** Ensure dev server is running
```bash
bun run dev
# Server must be running on port 3655
```

### "History not persisting"
**Solution:** Check localStorage is enabled
```javascript
// Test in browser console
localStorage.setItem('test', '1');
console.log(localStorage.getItem('test')); // Should print '1'
```

### Tests failing
**Solution:** Ensure using Bun v1.3+
```bash
bun --version  # Should be >= 1.3.0
bun install    # Reinstall dependencies if needed
```

---

## 📞 Support

- **Documentation:** See [SECURITY-ARSENAL.md](./SECURITY-ARSENAL.md)
- **Issues:** Create issue at GitHub repository
- **Bun Docs:** https://bun.com/docs/cli/audit

---

## ✅ Checklist for New Users

- [ ] Install Bun v1.3+ (`bun --version`)
- [ ] Clone repository
- [ ] Run `bun install`
- [ ] Try demo mode: `bun run dev` → http://localhost:3655?demo=true
- [ ] Run tests: `bun test components/SecurityArsenal/hooks/useSecurityArsenal.test.ts`
- [ ] Try CLI: `bun run arsenal:security` (requires bun.lock)
- [ ] Read [SECURITY-ARSENAL.md](./SECURITY-ARSENAL.md) for detailed docs

---

**Last Updated:** 2025-10-21
**Bun Version:** 1.3+
**React Version:** 18.2+
**TypeScript:** Strict Mode

🎊 **All features are production-ready!**
