# Bun Gate – 30-second cheat sheet

## 🚀 Quick Install
```bash
# Install governance in any Bun repo
curl -sSL https://raw.githubusercontent.com/brendadeeznuts1111/Arsenal-Lab/main/scripts/remote-gate.sh | bash
```

## 🛠️ Daily Commands

### Validation & Signing
```bash
bun run invariant:validate    # Validate all patches against security rules
bun run gate:validate        # Quick validation check
bun run gate:sign            # Sign patches cryptographically
bun run gate:verify          # Verify patch signatures
```

### Security Reporting
```bash
bun run gate:sarif > results.sarif    # Generate SARIF for GitHub Security tab
```

### Canary Management
```bash
bun run patch:ctl list              # Show current canary rollout status
bun run patch:ctl rollout pkg@1.0.0 25  # Set 25% canary rollout
```

## 🚨 Incident Response (10 seconds)

### Kill-Switch Rules
```bash
# Disable specific rules instantly (requires LaunchDarkly setup)
launchdarkly toggle crypto-integrity off    # Allow insecure crypto temporarily
launchdarkly toggle no-eval off            # Allow eval usage temporarily
launchdarkly toggle layer-boundary off     # Allow cross-layer imports
```

### Emergency Commands
```bash
bun run gate:sarif > emergency-report.sarif  # Generate emergency security report
git add emergency-report.sarif && git commit -m "security: emergency SARIF report"
```

## 🔄 Maintenance Tasks

### Weekly Patch Renewal
```bash
# Trigger manual renewal (GitHub Actions does this automatically)
gh workflow run "Patch-Renew Bot" -R brendadeeznuts1111/Arsenal-Lab
```

### Quarterly Governance Review
```bash
# Run full governance audit
bun run invariant:validate
bun run gate:sarif > quarterly-report.sarif
bun run gate:sign

# Check metrics (if Prometheus/Grafana setup)
curl http://localhost:9464/metrics
```

## 📊 Monitoring & Metrics

### Local Metrics
```bash
# Start metrics endpoint (if configured)
bun run telemetry:init

# Check metrics
curl http://localhost:9464/metrics
```

### GitHub Security Tab
- View SARIF reports at: `https://github.com/brendadeeznuts1111/Arsenal-Lab/security`
- Check code scanning alerts

## 🔧 Configuration Files

### Core Files
- `gate.js` - Governance engine (do not edit)
- `canary.json` - Canary rollout configuration
- `package.json` - Scripts and patched dependencies

### Edit Canary Configuration
```json
{
  "react@18.2.0": 100,    // 100% stable production
  "lodash@4.17.0": 25,    // 25% canary rollout
  "express@4.18.0": 5     // 5% canary rollout
}
```

## 📚 Documentation Links

- **Installation:** `https://brendadeeznuts1111.github.io/Arsenal-Lab/bun-gate/`
- **GitHub Release:** `https://github.com/brendadeeznuts1111/Arsenal-Lab/releases/tag/bun-gate-v∞`
- **Source Code:** `https://github.com/brendadeeznuts1111/Arsenal-Lab/tree/main/scripts`

## 🚨 Emergency Contacts

- **Security Issues:** Create GitHub Security Advisory
- **Patch Failures:** Check `bun run invariant:validate` output
- **CI/CD Issues:** Check GitHub Actions logs
- **Feature Flags:** Use LaunchDarkly dashboard

---

**Remember:** Governance should be invisible. If you notice it, something needs fixing! 🛡️
