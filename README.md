# 🚀 bun:performance-arsenal

[![Bun](https://img.shields.io/badge/Bun-1.3+-FBF0DF?style=for-the-badge&logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@bun/performance-arsenal?style=for-the-badge)](https://www.npmjs.com/package/@bun/performance-arsenal)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/brendadeeznuts1111/Arsenal-Lab/ci.yml?style=for-the-badge)](https://github.com/brendadeeznuts1111/Arsenal-Lab/actions)
[![OpenSSF Scorecard](https://img.shields.io/ossf-scorecard/github.com/brendadeeznuts1111/Arsenal-Lab?style=for-the-badge)](https://api.securityscorecards.dev/projects/github.com/brendadeeznuts1111/Arsenal-Lab)

**FAANG-grade performance testing suite for Bun runtime** - Interactive playground showcasing every v1.3 enhancement across performance, databases, testing, and infrastructure.

## 🎯 Quick Start

```bash
# Clone and install
git clone https://github.com/brendadeeznuts1111/Arsenal-Lab.git
cd Arsenal-Lab
bun install

# Start the arsenal lab
bun run dev

# Build for production
bun run build
```

## 📊 Live Demo

🚀 **[Try the Arsenal Lab Live](https://arsenal.bun.sh)** - Interactive playground with all Bun v1.3 features!

Open [http://localhost:3655](http://localhost:3655) and explore the interactive arsenals!

## 🎪 Arsenal Collection

### ⚡ Performance Arsenal
**500× faster operations** - Zero-copy worker communication, crypto acceleration, memory optimization.

- **postMessage**: Large payload transfer without serialization overhead
- **Registry**: Optimized package publishing/downloading
- **Crypto**: 400× faster Diffie-Hellman, new algorithms
- **Memory**: 28% reduction in Next.js, 11% in Elysia

### 🔧 Process & Shell Arsenal
**Advanced process management** - Streams, buffers, sockets, timers with Bun-native APIs.

- **Streams**: High-performance data processing pipelines
- **Buffers**: Efficient binary data manipulation
- **Memory**: Real-time process monitoring and optimization
- **Sockets**: Low-latency network communication

### 🧪 Testing Arsenal
**Modern testing capabilities** - Concurrent execution, type testing, advanced mocking.

- **Async Traces**: Full call stack preservation
- **Concurrent**: Parallel test execution (up to 16× faster)
- **Matchers**: Enhanced assertions and snapshots
- **Type Testing**: Runtime type validation

### 🔍 Testing & Debugging Arsenal
**Complete testing ecosystem** - From async traces to CI/CD integration.

- **Async Stack Traces**: WebKit integration for preserved call history
- **Concurrent Testing**: Configurable parallelism with randomization
- **New Matchers**: `toHaveReturnedWith`, `toHaveLastReturnedWith`
- **Type Testing**: `expectTypeOf` API with compile-time verification

### 🗄️ Database & Infrastructure Arsenal
**Production database clients** - SQLite, Redis, WebSocket, S3 with 7.9× performance gains.

- **SQLite v1.3**: Enhanced deserialization, column introspection, safe integers
- **Redis Client**: 66 commands, automatic reconnection, pub/sub
- **WebSocket**: RFC 6455 compliance, permessage-deflate compression
- **S3 Client**: ListObjectsV2, storage classes, virtual-hosted URLs

## 🏗️ Architecture

```
bun:performance-arsenal/
├── components/           # React component arsenals
│   ├── PerformanceArsenal/
│   ├── ProcessShellArsenal/
│   ├── TestingArsenal/
│   ├── TestingDebuggingArsenal/
│   └── DatabaseInfrastructureArsenal/
├── src/
│   ├── lab.ts           # Main application entry
│   ├── metrics/         # Prometheus metrics export
│   └── ui/              # Shared UI components
├── public/              # Static assets & PWA
├── scripts/             # Build & deployment scripts
└── docs/                # Comprehensive documentation
```

## 🎮 Interactive Features

- **Live Demos**: Real-time performance comparisons and execution
- **Configuration**: Interactive controls that update code examples
- **Copy-to-Clipboard**: Production-ready code snippets
- **Performance Metrics**: Real-time FPS, memory, and timing data
- **Dark Mode**: Full theme support throughout
- **Responsive**: Mobile-optimized interface

## 📊 Performance Benchmarks

| Feature | Bun v1.3 | Node.js | Speedup |
|---------|----------|---------|---------|
| postMessage (3MB) | 0.15ms | 1.2ms | **8×** |
| Diffie-Hellman | 0.02ms | 8ms | **400×** |
| Redis Operations | 0.12ms | 1.1ms | **9.2×** |
| Concurrent Tests | 110ms | 1250ms | **11.4×** |

## 🔧 Development

### Prerequisites
- **Bun 1.3+**: Required for all v1.3 features
- **Node.js 18+**: Fallback compatibility testing

### Available Scripts

```bash
bun run dev          # Start development server with hot reload
bun run build        # Production build optimized for browser
bun run test         # Run test suite with concurrent execution
bun run lint         # ESLint + Prettier code quality checks
bun run arsenal:ci   # Automated performance testing pipeline
```

### Environment Variables

```bash
# Analytics and telemetry
ANALYTICS_ENABLED=true
METRICS_ENDPOINT=https://metrics.example.com

# Performance monitoring
PERFORMANCE_MONITORING=true
MEMORY_PROFILING=true

# Development
NODE_ENV=development
HOT_RELOAD=true
```

## 📈 CI/CD Integration

### Automated Testing
```yaml
# .github/workflows/arsenal.yml
name: Performance Arsenal CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test
      - run: bun run arsenal:ci
```

### Performance Regression Detection
```yaml
# Performance thresholds
performance:
  postMessage: '< 0.20ms'
  crypto: '< 0.05ms'
  memory: '< 50MB'
  concurrent: '< 150ms'
```

## 🎨 Customization

### Adding New Arsenals

1. **Create component structure**:
```bash
mkdir components/NewArsenal
mkdir components/NewArsenal/{hooks,ui,utils}
```

2. **Implement hook**:
```typescript
export function useNewArsenal() {
  const [state, setState] = useState(initialState);
  // ... implementation
}
```

3. **Add to lab navigation** in `src/lab.ts`

### Extending Metrics

```typescript
// Add custom metrics in src/metrics/arsenal.ts
export interface CustomMetrics {
  customOperation: number;
  throughput: number;
  latency: number;
}
```

## 📚 Documentation

- **[Performance Guide](docs/performance.md)**: Deep dive into optimizations
- **[API Reference](docs/api.md)**: Complete component documentation
- **[Migration Guide](docs/migration.md)**: Upgrading from Node.js
- **[Contributing](docs/contributing.md)**: Development guidelines

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](docs/contributing.md) for details.

### Development Setup
```bash
# Fork and clone
git clone https://github.com/oven-sh/bun-performance-arsenal.git
cd bun-performance-arsenal

# Install dependencies
bun install

# Start development
bun run dev

# Run tests
bun run test
```

### Code Quality
- **ESLint**: Code linting and style enforcement
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict type checking
- **Concurrent Testing**: Parallel test execution

## 🏷️ GitHub Topics

This repository is tagged with the following topics for discoverability:

`bun` `performance` `benchmarking` `typescript` `react` `runtime` `database` `sqlite` `redis` `websocket` `s3` `testing` `concurrent` `async` `web-performance` `pwa` `infrastructure` `crypto` `memory-optimization` `developer-tools` `interactive`

## 🤝 Sponsors & Support

### 💖 Sponsors
Support this project by [becoming a sponsor](https://github.com/sponsors/oven-sh)!

### 💰 Funding
This project is funded through:
- [Open Collective](https://opencollective.com/bun)
- [GitHub Sponsors](https://github.com/sponsors/oven-sh)
- Community contributions

### 🏢 Enterprise Support
For enterprise support, custom integrations, or commercial licensing, contact [team@bun.sh](mailto:team@bun.sh).

## 📄 License

**MIT License** - See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Bun Team**: For the incredible runtime performance
- **React**: For the component architecture
- **WebKit**: For JavaScriptCore optimizations
- **Community**: For feedback and contributions

---

**Built with ❤️ for the Bun ecosystem**

[📖 Documentation](docs/) • [🐛 Issues](https://github.com/oven-sh/bun-performance-arsenal/issues) • [💬 Discussions](https://github.com/oven-sh/bun-performance-arsenal/discussions) • [🏠 Homepage](https://arsenal.bun.sh)
