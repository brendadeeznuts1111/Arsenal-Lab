# Contributing to bun:performance-arsenal

Thank you for your interest in contributing to the bun:performance-arsenal! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Install** dependencies: `bun install`
4. **Start** development server: `bun run dev`
5. **Make** your changes
6. **Test** your changes: `bun test`
7. **Submit** a pull request

## 📋 Development Setup

### Prerequisites
- **Bun 1.3+** - Required for all v1.3 features
- **Git** - Version control
- **Modern browser** - For testing the UI

### Local Development
```bash
# Clone the repository
git clone https://github.com/brendadeeznuts1111/Arsenal-Lab.git
cd Arsenal-Lab

# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun test

# Lint code
bun run lint

# Format code
bun run format
```

### Project Structure
```
bun:performance-arsenal/
├── components/           # React component arsenals
│   ├── PerformanceArsenal/      # Core performance demos
│   ├── DatabaseInfrastructureArsenal/  # Database & infra demos
│   └── TestingDebuggingArsenal/ # Testing framework demos
├── src/                  # Application entry points
├── docs/                 # Documentation
├── REF/                  # Structured reference docs
├── public/              # Static assets
└── scripts/             # Build and utility scripts
```

## 🐛 How to Report Issues

### Bug Reports
When reporting bugs, please include:
- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Environment information** (OS, Bun version, browser)
- **Screenshots** if applicable
- **Error messages** from console

### Performance Issues
For performance-related issues, please provide:
- **Benchmark results** before/after
- **System specifications** (CPU, memory, OS)
- **Test configuration** used
- **Performance metrics** (FPS, memory usage, timing)

### Feature Requests
Feature requests should include:
- **Problem statement** - what's missing or difficult
- **Proposed solution** - how it should work
- **Use cases** - specific scenarios where it's valuable
- **Implementation details** - technical considerations

## 💡 Contribution Guidelines

### Code Style
- **TypeScript** strict mode enabled
- **ESLint** rules enforced
- **Prettier** for code formatting
- **Consistent naming** conventions
- **Comprehensive JSDoc** comments

### Testing Requirements
- **Unit tests** for all new functions
- **Integration tests** for component interactions
- **Performance tests** for benchmark changes
- **Cross-browser testing** where applicable
- **Minimum 80% coverage** requirement

### Documentation Standards
- **README updates** for new features
- **REF/** documentation for technical details
- **Code comments** for complex logic
- **Type definitions** for all public APIs

## 🎯 Types of Contributions

### 🆕 New Arsenal Components

1. **Create component structure**:
   ```bash
   mkdir components/NewArsenal
   mkdir components/NewArsenal/{hooks,ui,utils}
   ```

2. **Implement the hook**:
   ```typescript
   export function useNewArsenal() {
     // State management logic
     return { /* exposed API */ };
   }
   ```

3. **Create the component**:
   ```typescript
   export function NewArsenal() {
     const state = useNewArsenal();
     return <div>{/* UI implementation */}</div>;
   }
   ```

4. **Add to lab navigation** in `src/lab.ts`

### 📊 Performance Benchmarks

1. **Define benchmark interface**:
   ```typescript
   interface BenchmarkDefinition {
     name: string;
     setup: () => Promise<void>;
     execute: () => Promise<Result>;
     teardown: () => Promise<void>;
   }
   ```

2. **Implement measurement logic**:
   ```typescript
   async function measurePerformance(benchmark: BenchmarkDefinition): Promise<Result> {
     await benchmark.setup();
     const start = performance.now();
     const result = await benchmark.execute();
     const end = performance.now();
     await benchmark.teardown();

     return { ...result, duration: end - start };
   }
   ```

3. **Add regression tests** to CI pipeline

### 🎨 UI/UX Improvements

1. **Follow design system**:
   - Glass-morphism panels
   - Color-coded components
   - Responsive layouts
   - Dark mode support

2. **Accessibility standards**:
   - Keyboard navigation
   - Screen reader support
   - High contrast ratios
   - Semantic HTML

3. **Performance considerations**:
   - Virtual scrolling for large lists
   - Lazy loading for heavy components
   - Optimized re-renders

### 📚 Documentation

1. **Update README.md** for user-facing features
2. **Add REF/** documentation** for technical details
3. **Update package.json** metadata
4. **Create examples** and tutorials

## 🔄 Pull Request Process

### Before Submitting
- [ ] **Tests pass**: `bun test`
- [ ] **Linting passes**: `bun run lint`
- [ ] **Type checking**: `bunx tsc --noEmit`
- [ ] **Performance benchmarks**: `bun run arsenal:ci`
- [ ] **Documentation updated**: README and REF/
- [ ] **Commits follow conventional format**

### PR Template
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 📚 Documentation
- [ ] 🔧 Refactoring
- [ ] 🎨 Styling
- [ ] ⚡ Performance

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Performance benchmarks included
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project standards
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Migration guide provided (if needed)
```

### Commit Convention
```
type(scope): description

Types:
- feat: new feature
- fix: bug fix
- docs: documentation
- style: formatting
- refactor: code restructuring
- test: testing
- chore: maintenance

Scopes:
- arsenal: component changes
- perf: performance improvements
- docs: documentation
- ci: CI/CD changes
- deps: dependency updates
```

## 🎖️ Recognition

Contributors are recognized through:
- **GitHub contributors** list
- **CHANGELOG.md** entries
- **Release notes** mentions
- **Community shoutouts** on social media

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time community support
- **Twitter**: Announcements and updates

### Response Times
- **Bug reports**: Acknowledged within 24 hours
- **Feature requests**: Initial response within 3 days
- **Pull requests**: Reviewed within 1 week
- **Security issues**: Response within 12 hours

## 📋 Code Review Guidelines

### For Reviewers
- **Be constructive** and respectful
- **Focus on code quality** and standards
- **Suggest improvements** rather than demands
- **Acknowledge good practices** and patterns
- **Provide context** for requested changes

### For Contributors
- **Address all feedback** thoughtfully
- **Ask questions** if unclear
- **Explain rationale** for design decisions
- **Update tests** as needed
- **Keep PRs focused** on single concerns

## 🔒 Security Considerations

### Reporting Security Issues
- **Email**: security@bun.com (preferred)
- **GitHub**: Private security advisory
- **Response**: Within 48 hours
- **Disclosure**: Coordinated public release

### Security Best Practices
- **Input validation** on all user inputs
- **CSP headers** for web components
- **Dependency scanning** in CI/CD
- **Regular security audits**
- **Responsible disclosure** policy

---

Thank you for contributing to bun:performance-arsenal! 🚀

Your contributions help make Bun faster and more accessible to developers worldwide.
