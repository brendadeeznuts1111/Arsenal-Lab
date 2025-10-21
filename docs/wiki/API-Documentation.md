# API Documentation

Complete technical reference for Arsenal Lab components and APIs.

## 🎯 Core Components

### PerformanceArsenal

Main performance testing component with real-time benchmarking.

#### Props
```typescript
interface PerformanceArsenalProps {
  initialTab?: 'postmessage' | 'registry' | 'crypto' | 'memory';
  showHardwareWarning?: boolean;
  enableAnalytics?: boolean;
}
```

#### Usage
```tsx
import { PerformanceArsenal } from '@bun/performance-arsenal';

function App() {
  return (
    <PerformanceArsenal
      initialTab="crypto"
      showHardwareWarning={true}
      enableAnalytics={true}
    />
  );
}
```

### BuildConfigurationArsenal

Interactive Bun.build() API and CLI playground.

#### Props
```typescript
interface BuildConfigurationArsenalProps {
  initialConfig?: Partial<BuildConfiguration>;
  showCliCommand?: boolean;
  enableCodeCopy?: boolean;
}
```

#### BuildConfiguration Interface
```typescript
interface BuildConfiguration {
  // Core Options
  entrypoints: string[];
  outdir: string;
  target: 'browser' | 'bun' | 'node';
  format: 'esm' | 'cjs' | 'iife';

  // Environment
  env: 'inline' | 'disable' | string;
  define: Record<string, string>;
  conditions: string[];

  // JSX
  jsx: {
    runtime: 'automatic' | 'classic';
    factory: string;
    fragment: string;
    importSource: string;
  };

  // Optimization
  minify: boolean | {
    whitespace: boolean;
    syntax: boolean;
    identifiers: boolean;
  };
  splitting: boolean;
  external: string[];
  packages: 'bundle' | 'external';

  // Output
  sourcemap: 'none' | 'linked' | 'inline' | 'external';
  naming: string | {
    entry: string;
    chunk: string;
    asset: string;
  };
  publicPath: string;

  // Advanced
  bytecode: boolean;
  throw: boolean;
  banner: string;
  footer: string;
  drop: string[];
  ignoreDCEAnnotations: boolean;
  emitDCEAnnotations: boolean;

  // CLI-Specific (not in JS API)
  production?: boolean;
  watch?: boolean;
  noClearScreen?: boolean;
  reactFastRefresh?: boolean;
  compile?: boolean;
  compileExecArgv?: string;
}
```

## 🎣 Custom Hooks

### usePerformanceArsenal

Core hook for performance benchmarking functionality.

```typescript
interface PerformanceArsenalHook {
  // State
  tab: 'postmessage' | 'registry' | 'crypto' | 'memory';
  pmSize: number;
  regAction: string;
  isRunning: boolean;
  benchmarkResults: BenchmarkResult[];

  // Hardware
  hardwareInfo: HardwareInfo;

  // Actions
  setTab: (tab: TabType) => void;
  setPmSize: (size: number) => void;
  setRegAction: (action: string) => void;
  runBenchmark: () => Promise<void>;
  copyCode: (code: string) => void;
}

interface BenchmarkResult {
  name: string;
  bun: number;
  node: number;
  speedup: number;
  timestamp: Date;
}

interface HardwareInfo {
  cores: number;
  memory: number;
  platform: string;
  arch: string;
}
```

### useBuildConfigurationArsenal

Hook for build configuration management.

```typescript
interface BuildConfigurationHook {
  // State
  config: BuildConfiguration;
  activeTab: string;
  generatedCode: string;
  cliCommand: string;

  // Actions
  updateConfig: (updates: Partial<BuildConfiguration>) => void;
  updateCoreOption: (key: keyof CoreOptions, value: any) => void;
  updateEnvOption: (key: keyof EnvOptions, value: any) => void;
  updateJsxOption: (key: keyof JsxOptions, value: any) => void;
  updateOptimization: (key: keyof OptimizationOptions, value: any) => void;
  updateOutput: (key: keyof OutputOptions, value: any) => void;
  updateAdvanced: (key: keyof AdvancedOptions, value: any) => void;
  updateCliOption: (key: keyof CliOptions, value: any) => void;

  // Utilities
  generateBuildCode: () => string;
  generateCliCommand: () => string;
  resetConfig: () => void;
}
```

### useDatabaseInfrastructureArsenal

Database testing and infrastructure management.

```typescript
interface DatabaseHook {
  // SQLite
  sqliteConnection: SQLiteConnection;
  sqliteResults: QueryResult[];
  isSqliteConnected: boolean;

  // Redis
  redisConnection: RedisConnection;
  redisResults: RedisResult[];
  isRedisConnected: boolean;

  // Actions
  connectSqlite: (path: string) => Promise<void>;
  disconnectSqlite: () => void;
  executeSqliteQuery: (query: string) => Promise<QueryResult[]>;

  connectRedis: (config: RedisConfig) => Promise<void>;
  disconnectRedis: () => void;
  executeRedisCommand: (command: string, args: any[]) => Promise<RedisResult>;
}

interface QueryResult {
  columns: string[];
  rows: any[][];
  executionTime: number;
  affectedRows?: number;
}
```

### useProcessShellArsenal

Process management and shell operations.

```typescript
interface ProcessHook {
  // Process State
  processes: ProcessInfo[];
  activeProcess: ProcessInfo | null;
  isRunning: boolean;

  // Socket State
  socketConnections: SocketInfo[];
  socketStats: SocketStats;

  // Actions
  spawnProcess: (command: string, args: string[]) => Promise<ProcessInfo>;
  killProcess: (pid: number) => void;
  sendProcessSignal: (pid: number, signal: string) => void;

  createSocket: (type: 'tcp' | 'udp', config: SocketConfig) => Promise<SocketInfo>;
  closeSocket: (id: string) => void;
  sendSocketData: (id: string, data: Buffer) => void;
}

interface ProcessInfo {
  pid: number;
  command: string;
  args: string[];
  status: 'running' | 'stopped' | 'exited';
  cpu: number;
  memory: number;
  startTime: Date;
}
```

### useTestingArsenal

Testing framework management and execution.

```typescript
interface TestingHook {
  // Test State
  tests: TestSuite[];
  runningTests: TestSuite[];
  testResults: TestResult[];
  coverage: CoverageReport;

  // Configuration
  testConfig: TestConfig;

  // Actions
  runAllTests: () => Promise<void>;
  runTestSuite: (suiteId: string) => Promise<void>;
  runSingleTest: (testId: string) => Promise<void>;
  stopTests: () => void;

  updateTestConfig: (config: Partial<TestConfig>) => void;
  loadTestFile: (path: string) => Promise<void>;
  generateTestReport: (format: 'json' | 'html' | 'xml') => Promise<string>;
}

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  stack?: string;
}
```

## 🎨 UI Components

### Layout Components

#### Footer
Professional footer with performance metrics and navigation.

```tsx
import { Footer } from '@bun/performance-arsenal';

function App() {
  return (
    <div>
      <main>{/* Main content */}</main>
      <Footer />
    </div>
  );
}
```

#### Banner
Rotating feature announcements and project statistics.

```tsx
import { Banner } from '@bun/performance-arsenal';

function App() {
  return (
    <div>
      <Banner />
      <main>{/* Main content */}</main>
    </div>
  );
}
```

#### EnhancedBanner
Advanced banner with social links and metrics.

```tsx
import { EnhancedBanner } from '@bun/performance-arsenal';

function App() {
  return (
    <div>
      <EnhancedBanner
        showStats={true}
        showSocialLinks={true}
      />
    </div>
  );
}
```

### Arsenal-Specific UI

#### TabNavigation
Consistent tab navigation across all arsenals.

```tsx
import { TabNavigation } from '@bun/performance-arsenal/ui';

const tabs = [
  { id: 'performance', label: 'Performance', icon: '⚡' },
  { id: 'database', label: 'Database', icon: '🗄️' }
];

function MyComponent() {
  const [activeTab, setActiveTab] = useState('performance');

  return (
    <TabNavigation
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
```

#### CodeBlock
Syntax-highlighted code display with copy functionality.

```tsx
import { CodeBlock } from '@bun/performance-arsenal/ui';

function MyComponent() {
  const code = `console.log('Hello, Bun!');`;

  return (
    <CodeBlock
      code={code}
      language="javascript"
      showCopyButton={true}
      onCopy={() => console.log('Copied!')}
    />
  );
}
```

#### PerformanceMetric
Real-time performance metric display.

```tsx
import { PerformanceMetric } from '@bun/performance-arsenal/ui';

function MyComponent() {
  return (
    <div>
      <PerformanceMetric
        label="FPS"
        value={60}
        unit="fps"
        status="good"
      />
      <PerformanceMetric
        label="Memory"
        value={128}
        unit="MB"
        status="warning"
      />
    </div>
  );
}
```

## 🔧 Utility Functions

### Analytics
Performance tracking and analytics utilities.

```typescript
import {
  trackBenchmark,
  trackInteraction,
  exportAnalytics,
  clearAnalytics
} from '@bun/performance-arsenal/utils/analytics';

// Track benchmark results
trackBenchmark('crypto-sha256', {
  inputSize: '1MB',
  duration: 45,
  throughput: '22.2 MB/s'
});

// Export analytics data
const data = await exportAnalytics();
console.log(JSON.stringify(data, null, 2));
```

### Copy to Clipboard
Cross-platform clipboard utilities.

```typescript
import { copyToClipboard } from '@bun/performance-arsenal/utils/copyToClipboard';

// Copy text to clipboard
await copyToClipboard('Hello, World!');

// Copy with callback
copyToClipboard('Code snippet', () => {
  console.log('Copied successfully!');
});
```

### Hardware Detection
System hardware profiling.

```typescript
import { detectHardware } from '@bun/performance-arsenal/utils/hardware';

const hardware = await detectHardware();
console.log({
  cores: hardware.cores,
  memory: hardware.totalMemory,
  platform: hardware.platform,
  arch: hardware.arch
});
```

### Storage
Persistent storage utilities.

```typescript
import { getStorageItem, setStorageItem } from '@bun/performance-arsenal/utils/storage';

// Store user preferences
setStorageItem('theme', 'dark');
setStorageItem('analytics', true);

// Retrieve stored data
const theme = getStorageItem('theme', 'light');
const analytics = getStorageItem('analytics', false);
```

## 📊 Type Definitions

### Enums
```typescript
enum Target {
  Browser = 'browser',
  Bun = 'bun',
  Node = 'node'
}

enum Format {
  ESM = 'esm',
  CJS = 'cjs',
  IIFE = 'iife'
}

enum SourcemapType {
  None = 'none',
  Linked = 'linked',
  Inline = 'inline',
  External = 'external'
}
```

### Error Types
```typescript
class ArsenalError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ArsenalError';
  }
}

class BenchmarkError extends ArsenalError {
  constructor(message: string, public benchmark: string) {
    super(message, 'BENCHMARK_ERROR', { benchmark });
  }
}

class BuildError extends ArsenalError {
  constructor(message: string, public config: BuildConfiguration) {
    super(message, 'BUILD_ERROR', { config });
  }
}
```

## 🚀 Advanced Usage

### Custom Benchmark Creation
Create custom performance benchmarks:

```typescript
import { createBenchmark } from '@bun/performance-arsenal';

const customBenchmark = createBenchmark({
  name: 'custom-algorithm',
  setup: () => {
    // Setup test data
    return { data: generateTestData() };
  },
  run: (context) => {
    // Run the algorithm
    return processAlgorithm(context.data);
  },
  iterations: 1000
});

// Run the benchmark
const result = await customBenchmark.run();
console.log(`Result: ${result.duration}ms`);
```

### Plugin System
Extend Arsenal Lab with custom plugins:

```typescript
import { registerPlugin } from '@bun/performance-arsenal';

registerPlugin({
  name: 'custom-plugin',
  version: '1.0.0',
  hooks: {
    onBenchmarkStart: (benchmark) => {
      console.log(`Starting ${benchmark.name}`);
    },
    onBenchmarkEnd: (result) => {
      console.log(`Completed in ${result.duration}ms`);
    }
  }
});
```

### Configuration Management
Advanced configuration management:

```typescript
import { configureArsenal } from '@bun/performance-arsenal';

// Global configuration
configureArsenal({
  analytics: {
    enabled: true,
    retention: '30-days',
    endpoint: 'https://analytics.example.com'
  },
  performance: {
    warnings: {
      lowFps: 30,
      highMemory: 500
    }
  },
  ui: {
    theme: 'dark',
    animations: true
  }
});
```

## 📚 Migration Guide

### From v1.2 to v1.3
- New CLI options in BuildConfigurationArsenal
- Enhanced analytics with privacy controls
- Improved error handling and TypeScript support

### Breaking Changes
- `useAnalytics` hook renamed to `usePerformanceMonitor`
- Footer component now requires React 18+
- Build configuration validation is stricter

## 🤝 Support

For API questions and support:
- [GitHub Issues](https://github.com/brendadeeznuts1111/Arsenal-Lab/issues)
- [Discussions](https://github.com/brendadeeznuts1111/Arsenal-Lab/discussions)
- [Documentation](https://github.com/brendadeeznuts1111/Arsenal-Lab/wiki)
