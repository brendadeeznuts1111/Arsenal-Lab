---
name: 📊 Performance Issue
about: Report performance degradation or optimization opportunities
title: "[PERFORMANCE] "
labels: ["performance", "optimization"]
assignees: []
---

## 📊 Performance Issue

### Performance Problem
What performance issue are you experiencing? (slower than expected, memory leaks, high CPU usage, etc.)

### Affected Component
Which arsenal/component is affected?
- [ ] Performance Arsenal
- [ ] Process & Shell Arsenal
- [ ] Testing Arsenal
- [ ] Testing & Debugging Arsenal
- [ ] Database & Infrastructure Arsenal

### Specific Tab/Feature
Which specific tab or feature shows the performance issue?

### Benchmark Results
Please provide benchmark results if available:

**Before (expected performance):**
```
Operation: SET user:1
Expected: 0.15ms
Actual: X.XXms
Degradation: XX%
```

**After (current performance):**
```
Operation: SET user:1
Expected: 0.15ms
Actual: X.XXms
Degradation: XX%
```

### Environment Details

**System Information:**
- OS: [e.g. macOS 14.0, Ubuntu 22.04]
- CPU: [e.g. Apple M2, Intel i7-11800H]
- Memory: [e.g. 16GB, 32GB]
- Storage: [e.g. SSD, HDD]

**Runtime Versions:**
- Bun: [e.g. 1.3.0]
- Node.js (if applicable): [e.g. 18.17.0]
- Browser (if applicable): [e.g. Chrome 120.0]

### Steps to Reproduce
1. Open the arsenal lab: `bun run dev`
2. Navigate to [specific component]
3. Configure [specific settings]
4. Run [specific benchmark/test]
5. Observe [specific performance issue]

### Expected Performance
What performance metrics do you expect to see?

### Actual Performance
What performance metrics are you actually seeing?

### Additional Context
- Browser developer tools screenshots
- Memory usage charts
- CPU profiling data
- Network timing information
- Any error messages or warnings

### Root Cause Analysis
If you have investigated the issue, what do you suspect is the cause?

### Proposed Solutions
If you have ideas for fixing this performance issue:

**Quick Fix:**
- Description of immediate workaround

**Long-term Solution:**
- Description of proper fix
- Implementation approach
- Expected performance improvement

### Checklist
- [ ] I have provided benchmark data
- [ ] I have included environment details
- [ ] I have described steps to reproduce
- [ ] I have included performance expectations
- [ ] I have attached relevant profiling data
