# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**bun:performance-arsenal** is a FAANG-grade performance testing suite and interactive playground for Bun runtime v1.3+. It showcases Bun's performance enhancements across five main "arsenals": Performance, Process & Shell, Testing, Testing & Debugging, and Database & Infrastructure.

The project is both:
1. An **interactive web application** (React + TypeScript) that runs benchmarks in-browser
2. A **CLI tool** for automated CI/CD performance testing with Prometheus metrics export

## Key Architecture Concepts

### Dual Runtime Environment
- **Browser mode**: Interactive UI via `bun run dev` (server.ts + lab.ts)
- **CLI mode**: Headless benchmarking via `bun run arsenal:ci`
- Code must be environment-aware: check for `typeof window !== 'undefined'` and `typeof document !== 'undefined'`

### Component Architecture
Each "Arsenal" is a self-contained React component in `components/`:
```
components/PerformanceArsenal/
├── index.tsx              # Main component export
├── hooks/                 # Custom React hooks for state/logic
├── ui/                    # Presentational components
├── utils/                 # Utilities (analytics, performance observers)
├── workers/               # Web Workers for parallel benchmarks
├── benchmarks/            # Benchmark implementations
├── data/                  # Static data (improvements, examples)
└── styles.css             # Component-specific styles
```

**Pattern**: Logic lives in hooks (e.g., `usePerformanceArsenal`), presentation in UI components, heavy computation in workers.

### Server Implementation (src/server.ts)
- Uses `Bun.serve()` with custom transpilation via `Bun.build()`
- On-the-fly TypeScript/TSX → JavaScript conversion for browser
- Injects secrets (Google Analytics, GitHub credentials) from Bun.secrets API with environment variable fallback
- Serves static assets from `public/` and root directory

### Metrics System (src/metrics/arsenal.ts)
- Custom Prometheus metrics implementation (no external dependencies)
- Exports `.prom` format for monitoring systems
- Tracks: benchmark duration (histogram), throughput (gauge), memory usage (gauge), system info
- Used by both browser (export button) and CLI (arsenal:ci)

### Secrets Management
- **Never commit secrets to git** - use `.env` files (gitignored)
- Bun.secrets API for secure storage: `Bun.secrets.get/set({ service: 'arsenal-lab', name: '...' })`
- Scripts: `generate-keys.sh`, `setup-secrets.ts`, `manage-secrets.ts`
- Environment switching: `bun run env:dev|staging|production`

## Common Development Commands

### Development & Testing
```bash
# Start dev server (http://localhost:3655)
bun run dev

# Run tests
bun test
bun test --watch
bun test --coverage

# Run specific test file
bun test path/to/test.ts

# Type checking
bun run typecheck
bunx tsc --noEmit
```

### Code Quality
```bash
# Full quality check (typecheck + lint + format check)
bun run quality

# Linting
bun run lint
bun run lint:fix

# Formatting
bun run format
bun run format:check
```

### Building & Publishing
```bash
# Production build (creates dist/)
bun run build

# Build outputs:
# - dist/index.js (browser bundle from src/lab.ts)
# - dist/cli.js (CLI tool from src/cli.ts)

# Preview production build
bun run preview
bun run start

# Publishing
bun run publish:dry    # Test publish
bun run publish:ci     # Quality + build + publish
```

### CI/CD & Benchmarking
```bash
# Run automated performance benchmarks
bun run arsenal:ci

# With custom options
bun run arsenal:ci --output-dir ./results --verbose

# Baseline benchmarks
bun run arsenal:benchmark

# Compare benchmarks
bun run arsenal:compare
```

### Secrets & Environment
```bash
# Switch environments
bun run env:dev
bun run env:staging
bun run env:production

# Generate encryption keys
bun run keys:generate
bun run keys:dev|staging|production|all

# Setup secrets interactively
bun run secrets:setup
bun run secrets:manage

# Deploy
bun run deploy:staging
bun run deploy:production
```

## Development Guidelines

### TypeScript Strictness
- **Strict mode enabled**: All compiler strict checks are on (see tsconfig.json)
- `noUncheckedIndexedAccess: true` - array/object access returns `T | undefined`
- Always handle undefined/null cases explicitly
- Use type guards and optional chaining

### Testing Bun-Specific Features
When testing Bun v1.3 features:
- Crypto: Use `Bun.crypto` for enhanced algorithms (X25519, Ed25519)
- Workers: postMessage with structured clone (zero-copy for large buffers)
- Database: `Bun.Database` for SQLite, native Redis/S3 clients
- Shell: `Bun.$` for shell scripting

### Browser vs Server Code
- Lab initialization in `src/lab.ts` is wrapped in environment checks
- Server code (src/server.ts) uses Bun-native APIs
- Components should work in browser context only
- Use dynamic imports to lazy-load arsenals: `import('../components/PerformanceArsenal').then(...)`

### Performance Considerations
- Web Workers in `workers/` for CPU-intensive benchmarks
- Performance monitoring via `PerformanceObserver` (utils/performanceObserver.ts)
- Real-time FPS and memory metrics displayed in UI
- Hardware capability detection (warn on low-end devices)

### Adding New Arsenals
1. Create component directory: `mkdir -p components/NewArsenal/{hooks,ui,utils,benchmarks}`
2. Implement main component in `index.tsx`
3. Create hook for logic: `hooks/useNewArsenal.ts`
4. Add tab in `src/lab.ts` navigation
5. Update README.md arsenal collection section

### Styling
- CSS modules via component-specific `styles.css`
- Responsive design (mobile-first)
- Dark mode support throughout
- Use CSS custom properties for theming

### Analytics & Privacy
- Optional analytics with user consent (AnalyticsConsent component)
- Privacy-first: no tracking without explicit opt-in
- Session stats exportable as JSON
- Prometheus metrics for CI/CD

## Important File Locations

### Configuration
- `tsconfig.json` - TypeScript config (strict mode, React JSX)
- `package.json` - Scripts, dependencies, Bun 1.3+ requirement
- `.env.example` - Template for environment variables

### Core Application
- `src/server.ts` - HTTP server with on-the-fly transpilation
- `src/lab.ts` - Browser app initialization, tab navigation
- `src/cli.ts` - CLI entry point
- `src/cli/arsenal-ci.ts` - Automated CI benchmark runner

### Components
- `components/PerformanceArsenal/` - 500× faster operations (postMessage, crypto, memory)
- `components/ProcessShellArsenal/` - Process management (streams, buffers, sockets)
- `components/TestingArsenal/` - Modern testing (concurrent, type testing)
- `components/TestingDebuggingArsenal/` - Debugging tools (async traces, mocking)
- `components/DatabaseInfrastructureArsenal/` - Database clients (SQLite, Redis, WebSocket, S3)
- `components/BuildConfigurationArsenal/` - Build system features
- `components/Layout/Footer.tsx` - Shared footer component

### Benchmarks & Metrics
- `src/bench/` - Benchmark implementations
- `src/metrics/arsenal.ts` - Prometheus metrics registry

### Documentation
- `README.md` - Comprehensive user documentation
- `docs/` - Additional documentation and wiki
- `.github/CONTRIBUTING.md` - Contribution guidelines

## Common Patterns

### Running Benchmarks
Benchmarks use a consistent pattern:
1. Setup: Initialize test data
2. Warmup: Prime caches (discard results)
3. Measure: Run iterations, collect timing
4. Compare: Bun vs Node.js (if applicable)
5. Report: Display speedup, memory usage

### Error Handling
- Use try/catch for async operations
- Display user-friendly errors via Toast component
- Log detailed errors to console for debugging
- Never expose secrets in error messages

### State Management
- React hooks for component state
- No external state management library (Redux, Zustand)
- Context API for analytics consent
- Local state in hooks, lift when shared

## CI/CD Integration

The `arsenal:ci` command produces:
- **JUnit XML** (`coverage/junit-bench.xml`) - Test results for CI dashboards
- **Prometheus metrics** (`coverage/metrics.prom`) - For monitoring systems
- Exit code 0 on success, 1 on failures

Integrate in GitHub Actions:
```yaml
- uses: oven-sh/setup-bun@v1
- run: bun install
- run: bun run arsenal:ci
```

## Publishing

Package is published to npm as `@bun/performance-arsenal` with three CLI aliases:
- `bun-arsenal`
- `bun-perf-lab`
- `performance-arsenal`

Before publishing:
- Version bump in package.json
- Update CHANGELOG (if exists)
- Run `bun run quality` to ensure all checks pass
- Run `bun run build` to create dist/
- Use `bun publish` (not npm publish)

## Security Notes

- Secrets managed via Bun.secrets API + environment variables
- Never commit: `.env`, `.env.production`, `.env.staging`
- Safe to commit: `.env.example` (templates only)
- Key generation scripts create strong encryption keys
- HTTPS upgrade enforced for external URLs
- Service Worker for PWA (offline capability)

## Troubleshooting

### Build Fails
- Ensure Bun 1.3+ installed: `bun --version`
- Clear cache: `bun run clean`
- Reinstall deps: `rm -rf node_modules && bun install`

### Dev Server Not Transpiling
- Check `src/server.ts` Bun.build() configuration
- Verify file paths are correct (.ts/.tsx extensions)
- Check browser console for JavaScript errors

### Benchmarks Not Running
- Verify browser supports required APIs (SharedArrayBuffer requires HTTPS or localhost)
- Check hardware capability (low-end devices show warning)
- Review console for worker errors

### Tests Failing
- Ensure using `bun test`, not `jest` or other runners
- Check Bun v1.3 features are available
- Verify environment variables are set for tests requiring them
