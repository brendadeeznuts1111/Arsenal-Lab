# 🔧 API Reference - Arsenal-Lab Components

Complete API documentation for all Arsenal-Lab components and utilities.

## 📚 Table of Contents

- [Performance Arsenal](#performance-arsenal)
- [Process & Shell Arsenal](#process--shell-arsenal)
- [Testing Arsenal](#testing-arsenal)
- [Database Infrastructure Arsenal](#database-infrastructure-arsenal)
- [Build Configuration Arsenal](#build-configuration-arsenal)
- [Utility Functions](#utility-functions)
- [Type Definitions](#type-definitions)

## ⚡ Performance Arsenal

### `usePerformanceArsenal()`

Main hook for performance benchmarking and monitoring.

```typescript
import { usePerformanceArsenal } from '@bun/performance-arsenal';

function PerformanceArsenal() {
  const {
    currentBenchmark,
    setCurrentBenchmark,
    isRunning,
    setIsRunning,
    results,
    runBenchmark,
    clearResults
  } = usePerformanceArsenal();

  // Component implementation
}
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `currentBenchmark` | `string` | Currently selected benchmark type |
| `setCurrentBenchmark` | `(benchmark: string) => void` | Set active benchmark |
| `isRunning` | `boolean` | Whether benchmark is currently running |
| `setIsRunning` | `(running: boolean) => void` | Control benchmark execution |
| `results` | `BenchmarkResult[]` | Array of benchmark results |
| `runBenchmark` | `() => Promise<void>` | Execute current benchmark |
| `clearResults` | `() => void` | Clear all benchmark results |

### `usePerformanceMetrics()`

Hook for real-time performance monitoring.

```typescript
import { usePerformanceMetrics } from '@bun/performance-arsenal';

function MetricsDisplay() {
  const metrics = usePerformanceMetrics();

  return (
    <div>
      <p>FPS: {metrics.fps}</p>
      <p>Memory: {metrics.memoryUsage} MB</p>
    </div>
  );
}
```

#### Returns

```typescript
interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  timestamp: number;
  userAgent: string;
}
```

## 🔧 Process & Shell Arsenal

### `useProcessShellArsenal()`

Hook for process monitoring and shell operations.

```typescript
import { useProcessShellArsenal } from '@bun/performance-arsenal';

function ProcessMonitor() {
  const {
    processes,
    memoryStats,
    socketConnections,
    startMonitoring,
    stopMonitoring
  } = useProcessShellArsenal();
}
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `processes` | `ProcessInfo[]` | Active process information |
| `memoryStats` | `MemoryStats` | Memory usage statistics |
| `socketConnections` | `SocketInfo[]` | Network socket connections |
| `startMonitoring` | `() => void` | Begin process monitoring |
| `stopMonitoring` | `() => void` | Stop process monitoring |

## 🧪 Testing Arsenal

### `useTestExecution()`

Hook for test execution and CI/CD workflows.

```typescript
import { useTestExecution } from '@bun/performance-arsenal';

function TestRunner() {
  const {
    tests,
    runningTests,
    results,
    runTests,
    stopTests,
    onTestComplete
  } = useTestExecution();
}
```

### `useTestMetrics()`

Hook for test performance metrics and analytics.

```typescript
import { useTestMetrics } from '@bun/performance-arsenal';

function TestDashboard() {
  const metrics = useTestMetrics();

  return (
    <div>
      <p>Total Tests: {metrics.totalTests}</p>
      <p>Pass Rate: {metrics.passRate}%</p>
      <p>Average Duration: {metrics.avgDuration}ms</p>
    </div>
  );
}
```

## 🗄️ Database Infrastructure Arsenal

### `useDatabaseInfrastructureArsenal()`

Hook for database and infrastructure testing.

```typescript
import { useDatabaseInfrastructureArsenal } from '@bun/performance-arsenal';

function DatabaseTester() {
  const {
    activeTab,
    setActiveTab,
    sqliteResults,
    redisResults,
    websocketResults,
    runTests
  } = useDatabaseInfrastructureArsenal();
}
```

#### Tab Types

```typescript
type DatabaseTab = 'sqlite' | 'redis' | 'websocket' | 's3';
```

## 🔧 Build Configuration Arsenal

### `useBuildConfigurationArsenal()`

Main hook for Bun.build() configuration playground.

```typescript
import { useBuildConfigurationArsenal } from '@bun/performance-arsenal';

function BuildConfigurator() {
  const {
    tab,
    setTab,
    config,
    setConfig,
    generateBuildCode,
    simulateBuild,
    buildOutput
  } = useBuildConfigurationArsenal();
}
```

### Build Configuration Types

```typescript
interface BuildConfiguration {
  // Core Options
  entrypoints: string[];
  outdir: string;
  root: string;

  // Output Configuration
  publicPath: string;
  naming: {
    entry: string;
    chunk: string;
    asset: string;
  };

  // Environment & Packages
  env: 'inline' | 'disable' | string;
  packages: 'bundle' | 'external';
  external: string[];
  conditions: string[];

  // Code Transformation
  define: Record<string, string>;
  loader: Record<string, string>;
  banner: string;
  footer: string;
  drop: string[];

  // JSX Configuration
  jsx: {
    factory: string;
    fragment: string;
    importSource: string;
    runtime: 'automatic' | 'classic';
  };

  // Optimization
  sourcemap: 'none' | 'linked' | 'inline' | 'external';
  minify: {
    whitespace: boolean;
    syntax: boolean;
    identifiers: boolean;
  };

  // Output Format
  format: 'esm' | 'cjs' | 'iife';
  target: 'browser' | 'bun' | 'node';
  splitting: boolean;

  // Advanced Options
  bytecode: boolean;
  throw: boolean;
}
```

## 🛠️ Utility Functions

### Analytics & Tracking

```typescript
import {
  getAnalyticsTracker,
  useAnalytics,
  EnhancedAnalyticsTracker
} from '@bun/performance-arsenal';

// Analytics tracker instance
const tracker = getAnalyticsTracker();

// React hook for analytics
function MyComponent() {
  const analytics = useAnalytics();

  const trackEvent = () => {
    analytics.trackEvent('button_click', {
      component: 'MyComponent',
      timestamp: Date.now()
    });
  };
}
```

### Clipboard Utilities

```typescript
import { copyToClipboard } from '@bun/performance-arsenal';

// Copy text to clipboard
await copyToClipboard('Hello, World!');

// Copy with success message
await copyToClipboard(code, 'Code copied to clipboard!');
```

### Hardware Detection

```typescript
import { getHardwareInfo } from '@bun/performance-arsenal';

const hardware = getHardwareInfo();
console.log('CPU Cores:', hardware.cores);
console.log('Memory:', hardware.memoryGB, 'GB');
console.log('Platform:', hardware.platform);
```

### Performance Monitoring

```typescript
import {
  getPerformanceMonitor,
  PerformanceMetrics,
  PerformanceStats
} from '@bun/performance-arsenal';

const monitor = getPerformanceMonitor();
const stats = monitor.getCurrentStats();
```

## 📊 Type Definitions

### Benchmark Types

```typescript
interface BenchmarkResult {
  id: string;
  name: string;
  duration: number;
  operationsPerSecond: number;
  memoryUsage: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

interface BenchmarkEvent {
  type: 'benchmark_start' | 'benchmark_complete' | 'benchmark_error';
  benchmark_type: 'postmessage' | 'registry' | 'crypto' | 'memory';
  config?: any;
  duration?: number;
  payload_size?: number;
  performance_metrics?: any;
}
```

### Database Types

```typescript
interface SQLiteResult {
  query: string;
  executionTime: number;
  rowsAffected: number;
  result: any[];
}

interface RedisResult {
  operation: string;
  executionTime: number;
  success: boolean;
  data?: any;
}

interface WebSocketResult {
  messageSize: number;
  roundTripTime: number;
  success: boolean;
  error?: string;
}
```

### Test Types

```typescript
interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  stackTrace?: string;
}

interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  passRate: number;
  avgDuration: number;
  totalDuration: number;
}
```

### Build Types

```typescript
interface BuildOutput {
  success: boolean;
  outputs: BuildArtifact[];
  logs: BuildMessage[];
}

interface BuildArtifact extends Blob {
  path: string;
  loader: string;
  hash: string | null;
  kind: 'entry-point' | 'chunk' | 'asset' | 'sourcemap';
  sourcemap?: BuildArtifact;
}

interface BuildMessage {
  name: string;
  position?: Position;
  message: string;
  level: 'error' | 'warning' | 'info' | 'debug' | 'verbose';
}
```

## 🔧 Configuration Options

### Environment Variables

```bash
# Analytics configuration
ANALYTICS_ENABLED=true
ANALYTICS_ANONYMOUS=true

# Performance monitoring
PERFORMANCE_MONITORING=true
MEMORY_MONITORING=true

# Build configuration
BUILD_TARGET=browser
BUILD_FORMAT=esm
BUILD_SOURCEMAP=linked
```

### Runtime Configuration

```typescript
// Global configuration
const config = {
  analytics: {
    enabled: true,
    anonymous: true,
    performanceTracking: true
  },
  performance: {
    monitoring: true,
    memoryTracking: true,
    workerTracking: true
  },
  build: {
    target: 'browser',
    format: 'esm',
    sourcemap: 'linked'
  }
};
```

## 🎯 Usage Examples

### Complete Performance Test

```typescript
import {
  usePerformanceArsenal,
  useAnalytics,
  copyToClipboard
} from '@bun/performance-arsenal';

function PerformanceTest() {
  const arsenal = usePerformanceArsenal();
  const analytics = useAnalytics();

  const runCompleteTest = async () => {
    // Start analytics tracking
    analytics.trackEvent('test_start', { type: 'performance' });

    // Run benchmark
    await arsenal.runBenchmark();

    // Copy results
    const results = JSON.stringify(arsenal.results, null, 2);
    await copyToClipboard(results, 'Results copied!');

    // Track completion
    analytics.trackEvent('test_complete', {
      duration: arsenal.results[0]?.duration,
      success: true
    });
  };

  return (
    <div>
      <button onClick={runCompleteTest}>
        Run Performance Test
      </button>
      {/* Results display */}
    </div>
  );
}
```

### Build Configuration Playground

```typescript
import { useBuildConfigurationArsenal } from '@bun/performance-arsenal';

function BuildConfigurator() {
  const {
    config,
    setConfig,
    generateBuildCode,
    simulateBuild
  } = useBuildConfigurationArsenal();

  const updateTarget = (target: string) => {
    setConfig(prev => ({ ...prev, target: target as any }));
  };

  return (
    <div>
      <select value={config.target} onChange={e => updateTarget(e.target.value)}>
        <option value="browser">Browser</option>
        <option value="bun">Bun</option>
        <option value="node">Node.js</option>
      </select>

      <button onClick={simulateBuild}>Build</button>

      <pre>{generateBuildCode()}</pre>
    </div>
  );
}
```

## 📚 Related Documentation

- **[Analytics Guide](../wiki/Analytics.md)** - Performance monitoring and optimization
- **[Contributing Guide](../CONTRIBUTING.md)** - Development guidelines
- **[Main README](../README.md)** - Project overview and setup

---

**Built with ❤️ using [Bun](https://bun.com/docs) - The fast JavaScript runtime**
