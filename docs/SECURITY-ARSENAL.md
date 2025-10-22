# Security Arsenal - Complete Feature Guide

## 🔒 Overview

The Security Arsenal is a comprehensive dependency vulnerability scanner and monitoring dashboard for the Bun Performance Arsenal Lab. It provides real-time security auditing, historical tracking, and trend analysis for your project dependencies.

## ✨ Features

### 🎭 Demo Mode
Test and explore the Security Arsenal without a real project or `bun.lock` file.

**Activation:**
- URL Parameter: `http://localhost:3655?demo=true`
- UI Toggle: Check the "🎭 Demo Mode" checkbox
- CLI Flag: Automatically enabled when no `bun.lock` found

**Demo Data:**
- 7 realistic vulnerability samples
- All severity levels represented (Critical, High, Moderate, Low)
- Includes CVE identifiers and advisory links
- Simulated 1.5s network delay for realistic UX

### 📊 Historical Tracking
Automatically tracks up to 50 security scan results in browser localStorage.

**Features:**
- Persistent across browser sessions
- Stores scan configuration (prodOnly, auditLevel)
- One-click history clearing
- Quick reload of any historical scan

**Storage Format:**
```typescript
{
  id: string;
  result: AuditResult;
  config: {
    prodOnly: boolean;
    auditLevel: string;
  };
  timestamp: number;
}
```

### 📈 Statistics Dashboard
Track security improvements over time with comprehensive analytics.

**Metrics Tracked:**
- **Total Scans** - Number of audits performed
- **Avg Vulnerabilities** - Average vulnerabilities per scan
- **Critical Trend** - Trend of critical vulnerabilities (↑↓)
- **Last Scan** - Timestamp of most recent audit

**Trend Calculation:**
```typescript
// Based on last 5 scans
trend = (first_critical - last_critical) / scan_count
// Negative = Improving ✅
// Positive = Degrading ⚠️
```

### 🔍 Severity Filtering
Instantly filter vulnerabilities by severity level.

**Filter Options:**
- **All** - Show all vulnerabilities
- **Critical** - Only critical severity
- **High** - Only high severity
- **Moderate** - Only moderate severity
- **Low** - Only low severity

### 📤 Export Capabilities

**JSON Export:**
```bash
# Downloads: security-audit-YYYY-MM-DD.json
{
  "vulnerabilities": [...],
  "metadata": {...},
  "timestamp": 1234567890
}
```

**Prometheus Metrics Export:**
```bash
# Downloads: security-metrics.prom
# HELP security_vulnerabilities_total Total number of vulnerabilities
# TYPE security_vulnerabilities_total gauge
security_vulnerabilities_total{severity="critical"} 2
security_vulnerabilities_total{severity="high"} 5
security_vulnerabilities_total{severity="moderate"} 3
security_vulnerabilities_total{severity="low"} 1
security_vulnerabilities_total{severity="all"} 11
```

## 🚀 Usage Guide

### Interactive Web UI

1. **Start the dev server:**
   ```bash
   bun run dev
   ```

2. **Navigate to Security Arsenal:**
   ```
   http://localhost:3655
   Click "🔒 Security" tab
   ```

3. **Run your first scan:**
   - Toggle "Demo Mode" if no `bun.lock` exists
   - Click "Run Security Audit"
   - Wait for results (1.5s in demo mode)

4. **Explore results:**
   - View summary cards (Total, Critical, High, Moderate, Low)
   - Filter by severity level
   - Export to JSON or Prometheus format

5. **Review history:**
   - Click "Show History" to see past scans
   - Click any historical scan to reload
   - Compare trends in Stats Panel

### CLI Integration

```bash
# Basic security audit
bun run arsenal:security

# With specific audit level
bun run arsenal:ci --security-audit --audit-level=high

# Production dependencies only
bun run arsenal:ci --security-audit --audit-prod

# Combined with performance benchmarks
bun run arsenal:ci --security-audit --verbose

# Custom output directory
bun run arsenal:ci --security-audit --output-dir ./security-reports
```

### CI/CD Integration

**GitHub Actions Example:**
```yaml
name: Security Audit
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run arsenal:security
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: security-audit
          path: coverage/security-audit.json
```

## 🧪 Testing

### Running Tests

```bash
# Run Security Arsenal test suite
bun test components/SecurityArsenal/hooks/useSecurityArsenal.test.ts

# Run all tests
bun test

# With coverage report
bun test --coverage

# Watch mode for development
bun test --watch
```

### Test Framework

**Technology Stack:**
- **Bun Test Runner** - Native Bun testing (`bun:test`)
- **happy-dom** - Browser API simulation
- **React Testing** - Custom `renderHook` helper with `flushSync`

**Test Coverage:**
- ✅ Demo mode toggle
- ✅ Real API audit execution
- ✅ Severity filtering
- ✅ Error handling
- ✅ History persistence
- ✅ Stats calculation
- ✅ Export functionality
- ✅ Configuration respect (prodOnly, auditLevel)

## 📖 API Reference

### `useSecurityArsenal()` Hook

**Returns:**
```typescript
{
  // State
  isScanning: boolean;
  auditResult: AuditResult | null;
  filteredVulnerabilities: Vulnerability[];
  filterSeverity: 'all' | 'low' | 'moderate' | 'high' | 'critical';
  prodOnly: boolean;
  error: string | null;
  demoMode: boolean;
  history: AuditHistoryItem[];
  stats: AuditStats;

  // Actions
  setFilterSeverity: (severity) => void;
  setProdOnly: (value: boolean) => void;
  toggleDemoMode: () => void;
  runAudit: () => Promise<void>;
  exportResults: () => void;
  exportPrometheus: () => void;
  clearHistory: () => void;
  loadHistoricalResult: (item: AuditHistoryItem) => void;
}
```

### Types

```typescript
interface Vulnerability {
  cve: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  package: string;
  version: string;
  title: string;
  url: string;
  patched?: string | undefined;
}

interface AuditResult {
  vulnerabilities: Vulnerability[];
  metadata: {
    total: number;
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  timestamp: number;
}

interface AuditHistoryItem {
  id: string;
  result: AuditResult;
  config: {
    prodOnly: boolean;
    auditLevel: string;
  };
}

interface AuditStats {
  totalScans: number;
  avgVulnerabilities: number;
  criticalTrend: number;
  lastScan: number | null;
}
```

## 🎯 Best Practices

### 1. Regular Scanning
Run `bun audit` regularly, not just in CI/CD:
```bash
# Weekly security check
bun run arsenal:security

# Before major releases
bun run arsenal:ci --security-audit --audit-level=high
```

### 2. Set Baselines
Establish acceptable vulnerability thresholds for your project:
```typescript
// Example acceptance criteria
const acceptableThresholds = {
  critical: 0,  // Zero tolerance
  high: 2,      // Max 2 high severity
  moderate: 5,  // Max 5 moderate
  low: 10       // Max 10 low
};
```

### 3. Prioritize Fixes
Address vulnerabilities by severity:
1. **Critical** - Immediate action required
2. **High** - Fix within 1 week
3. **Moderate** - Fix within 1 month
4. **Low** - Fix when convenient

### 4. Track Progress
Use the Stats Panel to monitor improvements:
```bash
# Week 1: Baseline scan
Total: 15 vulnerabilities (3 critical, 5 high)

# Week 2: After fixes
Total: 8 vulnerabilities (1 critical, 2 high)

# Stats Panel shows:
Critical Trend: -2.0 (✅ Improvement!)
Avg Vulnerabilities: 11.5
```

### 5. Automate Updates
Use `bun update` carefully with thorough testing:
```bash
# Check what will be updated
bun update --dry-run

# Update with audit
bun update && bun run arsenal:security

# Revert if issues found
git checkout package.json bun.lock
```

### 6. Review History
Check scan history weekly to identify persistent issues:
- Click "Show History" button
- Review past 10 scans
- Identify recurring vulnerabilities
- Investigate why they persist

### 7. Monitor Trends
Use the Critical Trend metric to track security posture:
- **Negative trend** = Improving ✅
- **Zero trend** = Stable ➖
- **Positive trend** = Degrading ⚠️

## 🔧 Configuration

### Environment Variables

```bash
# .env
SECURITY_AUDIT_LEVEL=moderate  # low|moderate|high|critical
SECURITY_PROD_ONLY=false       # true|false
SECURITY_AUTO_SCAN=true        # Auto-scan on startup
```

### bunfig.toml

```toml
[test]
preload = ["./test/setup.ts"]
coverage = true

[install]
# Optional: Configure registry for security advisories
registry = "https://registry.npmjs.org/"
```

## 🐛 Troubleshooting

### Issue: "No bun.lock found"
**Solution:** Enable demo mode or run `bun install` first
```bash
# Option 1: Demo mode
http://localhost:3655?demo=true

# Option 2: Create bun.lock
bun install
```

### Issue: "API endpoint not found"
**Solution:** Ensure dev server is running
```bash
bun run dev
# Server must be running on port 3655
```

### Issue: "History not persisting"
**Solution:** Check localStorage is enabled
```javascript
// Test localStorage
localStorage.setItem('test', '1');
console.log(localStorage.getItem('test')); // Should print '1'
```

### Issue: "Tests failing with DOM errors"
**Solution:** Ensure happy-dom is installed
```bash
bun add -d @happy-dom/global-registrator happy-dom
```

## 📊 Metrics & Monitoring

### Prometheus Integration

Export metrics for monitoring systems:
```bash
# Generate metrics file
bun run arsenal:ci --security-audit
# Output: coverage/security-audit.json

# Convert to Prometheus format
# Use export button in UI or CLI
```

**Grafana Dashboard Example:**
```yaml
panels:
  - title: "Security Vulnerabilities"
    targets:
      - expr: security_vulnerabilities_total{severity="critical"}
        legendFormat: "Critical"
      - expr: security_vulnerabilities_total{severity="high"}
        legendFormat: "High"
```

## 🤝 Contributing

To add new features to Security Arsenal:

1. **Create feature branch**
   ```bash
   git checkout -b feature/security-enhancement
   ```

2. **Add implementation**
   - Hook logic: `components/SecurityArsenal/hooks/`
   - UI components: `components/SecurityArsenal/ui/`
   - Utilities: `components/SecurityArsenal/utils/`

3. **Add tests**
   ```bash
   # Create test file
   touch components/SecurityArsenal/hooks/myFeature.test.ts

   # Run tests
   bun test
   ```

4. **Update documentation**
   - Update this file (`docs/SECURITY-ARSENAL.md`)
   - Update `GUIDE.md` if needed
   - Add JSDoc comments to code

5. **Submit PR**
   - Include test coverage
   - Update CHANGELOG
   - Add screenshots for UI changes

## 📚 Additional Resources

- [Bun Audit Documentation](https://bun.com/docs/cli/audit)
- [Bun Test Runner](https://bun.com/docs/test)
- [Bun DOM Testing](https://bun.com/docs/test/dom)
- [happy-dom Documentation](https://github.com/capricorn86/happy-dom)
- [Arsenal Lab Main Guide](../GUIDE.md)
- [API Documentation](https://github.com/brendadeeznuts1111/Arsenal-Lab/wiki/API-Documentation)

## 📄 License

MIT License - See [LICENSE](../LICENSE) file for details

---

**Built with ❤️ for the Bun ecosystem**
**Last Updated:** 2025-10-21
**Version:** 1.4.0
