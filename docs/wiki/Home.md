# Arsenal Lab Wiki

Welcome to the **Arsenal Lab** - A comprehensive performance testing suite for Bun.js featuring interactive benchmarks, build configuration tools, and real-time analytics.

## 🎯 What is Arsenal Lab?

Arsenal Lab is a modern, interactive web application that showcases Bun's performance capabilities through:

- **Performance Arsenal**: Real-time benchmarking of Bun vs Node.js
- **Database Infrastructure Arsenal**: SQLite and Redis performance testing
- **Process & Shell Arsenal**: Process management and socket communication
- **Build Configuration Arsenal**: Interactive Bun.build() API and CLI playground
- **Testing Arsenal**: Comprehensive testing frameworks and debugging tools

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/brendadeeznuts1111/Arsenal-Lab.git
cd Arsenal-Lab

# Install dependencies with Bun
bun install

# Start development server
bun run dev

# Open http://localhost:3655
```

### Standalone Demo

For a quick preview without installation:
- Visit: `public/arsenal-lab.html` in your browser
- No Bun installation required
- All features available offline

## 📚 Documentation Structure

- **[Analytics](Analytics.md)** - Performance monitoring and analytics
- **[API Documentation](API-Documentation.md)** - Technical API reference
- **[S3 Integration](S3-Integration.md)** - Cloud storage and database integration
- **[SQL Examples](SQL-Examples.md)** - Database query examples and patterns

## 🔧 Key Features

### Performance Testing
- Real-time FPS monitoring
- Memory usage tracking
- Hardware detection and warnings
- Comparative benchmarking (Bun vs Node.js)

### Interactive Components
- Live code generation
- Copy-to-clipboard functionality
- Real-time configuration updates
- Responsive design for all devices

### Developer Experience
- TypeScript strict typing
- Hot reload development
- Comprehensive error handling
- Production-ready code quality

## 🎨 Component Architecture

```
components/
├── PerformanceArsenal/          # Core performance benchmarks
├── DatabaseInfrastructureArsenal/  # Database testing tools
├── ProcessShellArsenal/         # Process management demos
├── BuildConfigurationArsenal/   # Bun.build() playground
├── TestingArsenal/              # Testing frameworks
└── Layout/                      # UI components (Footer, Banner)
```

## 📊 Live Demo

Visit the [live demo](https://brendadeeznuts1111.github.io/Arsenal-Lab/) to see all arsenals in action.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
