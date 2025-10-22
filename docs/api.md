# 🔧 API Reference - Arsenal Lab

> **Complete technical reference** for all Arsenal Lab components, hooks, utilities, and APIs with production-ready examples.

[![TypeScript](https://img.shields.io/badge/TypeScript-✅-blue?style=flat)]()
[![Components](https://img.shields.io/badge/Components-20+-green?style=flat)]()
[![Hooks](https://img.shields.io/badge/Hooks-15+-purple?style=flat)]()
[![Enterprise Ready](https://img.shields.io/badge/🏆_Enterprise_Ready-✅-blue?style=flat)]()

## 📋 Table of Contents

- [Core Components](#-core-components)
  - [PerformanceArsenal](#performancearsenal)
  - [DatabaseInfrastructureArsenal](#databaseinfrastructurearsenal)
  - [BuildConfigurationArsenal](#buildconfigurationarsenal)
  - [TestingArsenal](#testingarsenal)
  - [ProcessShellArsenal](#processshellarsenal)
- [Custom Hooks](#-custom-hooks)
- [UI Components](#-ui-components)
- [Utility Functions](#-utility-functions)
- [Type Definitions](#-type-definitions)
- [CLI Commands](#-cli-commands)
- [Advanced Usage](#-advanced-usage)
- [Integration Examples](#-integration-examples)
- [Migration Guide](#-migration-guide)

---

## 🎯 Core Components

### PerformanceArsenal

Main performance testing component with real-time benchmarking and hardware detection.

#### Props

```typescript
interface PerformanceArsenalProps {
  /** Initial tab to display */
  initialTab?: 'postmessage' | 'registry' | 'crypto' | 'memory' | 'dashboard';

  /** Show hardware capability warnings */
  showHardwareWarning?: boolean;

  /** Enable analytics tracking */
  enableAnalytics?: boolean;

  /** Custom analytics configuration */
  analyticsConfig?: AnalyticsConfig;

  /** Callback when benchmark completes */
  onBenchmarkComplete?: (result: BenchmarkResult) => void;

  /** Callback when tab changes */
  onTabChange?: (tab: TabType) => void;
}
```

#### Usage

```tsx
import { PerformanceArsenal } from '@bun/performance-arsenal';

function App() {
  const handleBenchmarkComplete = (result) => {
    console.log(`Speedup: ${result.speedup}×`);
    console.log(`Duration: ${result.bun}ms (Bun) vs ${result.node}ms (Node.js)`);
  };

  return (
    <PerformanceArsenal
      initialTab="crypto"
      showHardwareWarning={true}
      enableAnalytics={true}
      onBenchmarkComplete={handleBenchmarkComplete}
    />
  );
}
```

#### Features

- ⚡ **postMessage**: Zero-copy worker communication benchmarks
- 📦 **Registry**: Package publishing/downloading performance
- 🔐 **Crypto**: Enhanced cryptography algorithm testing (X25519, Ed25519, SHA-256)
- 💾 **Memory**: Memory optimization and usage tracking
- 📊 **Dashboard**: Real-time performance metrics visualization

---

### DatabaseInfrastructureArsenal

Database and infrastructure testing component with support for SQLite, Redis, WebSocket, and S3.

#### Props

```typescript
interface DatabaseInfrastructureArsenalProps {
  /** Initial database tab */
  initialTab?: 'sqlite' | 'redis' | 'websocket' | 's3';

  /** SQLite database path (defaults to :memory:) */
  sqlitePath?: string;

  /** Redis connection configuration */
  redisConfig?: RedisConfig;

  /** WebSocket configuration */
  websocketConfig?: WebSocketConfig;

  /** S3 configuration */
  s3Config?: S3Config;

  /** Callback for query results */
  onQueryComplete?: (result: QueryResult) => void;
}
```

#### Usage

```tsx
import { DatabaseInfrastructureArsenal } from '@bun/performance-arsenal';

function DatabaseTester() {
  return (
    <DatabaseInfrastructureArsenal
      initialTab="sqlite"
      sqlitePath=":memory:"
      onQueryComplete={(result) => {
        console.log(`Query executed in ${result.executionTime}ms`);
        console.log(`Rows affected: ${result.rowsAffected}`);
      }}
    />
  );
}
```

#### Features

- **SQLite v1.3**: Enhanced deserialization, column introspection, safe integers
- **Redis Client**: 66 commands, automatic reconnection, pub/sub support
- **WebSocket**: RFC 6455 compliance, permessage-deflate compression
- **S3 Client**: ListObjectsV2, storage classes, virtual-hosted URLs

---

### BuildConfigurationArsenal

Interactive Bun.build() API and CLI command playground with live code generation.

#### Props

```typescript
interface BuildConfigurationArsenalProps {
  /** Initial build configuration */
  initialConfig?: Partial<BuildConfiguration>;

  /** Initial tab (js-api or cli) */
  initialTab?: 'js-api' | 'cli';

  /** Show CLI command generation */
  showCliCommand?: boolean;

  /** Enable code copy functionality */
  enableCodeCopy?: boolean;

  /** Callback when config changes */
  onConfigChange?: (config: BuildConfiguration) => void;

  /** Callback when build is simulated */
  onBuildSimulated?: (output: BuildOutput) => void;
}
```

#### BuildConfiguration Interface

```typescript
interface BuildConfiguration {
  // Core Options
  entrypoints: string[];
  outdir: string;
  root?: string;
  target: 'browser' | 'bun' | 'node';
  format: 'esm' | 'cjs' | 'iife';

  // Environment & Packages
  env?: 'inline' | 'disable' | Record<string, string>;
  define?: Record<string, string>;
  loader?: Record<string, LoaderType>;
  external?: string[];
  packages?: 'bundle' | 'external';
  conditions?: string[];

  // JSX Configuration
  jsx?: {
    runtime: 'automatic' | 'classic';
    factory?: string;
    fragment?: string;
    importSource?: string;
  };

  // Optimization
  minify?: boolean | {
    whitespace: boolean;
    syntax: boolean;
    identifiers: boolean;
  };
  splitting?: boolean;
  treeshaking?: boolean;

  // Output
  sourcemap?: 'none' | 'linked' | 'inline' | 'external';
  publicPath?: string;
  naming?: string | {
    entry?: string;
    chunk?: string;
    asset?: string;
  };

  // Advanced
  bytecode?: boolean;
  banner?: string;
  footer?: string;
  drop?: ('console' | 'debugger')[];
  ignoreDCEAnnotations?: boolean;
  emitDCEAnnotations?: boolean;

  // CLI-Only Options
  production?: boolean;
  watch?: boolean;
  compile?: boolean;
}
```

#### Usage

```tsx
import { BuildConfigurationArsenal } from '@bun/performance-arsenal';

function BuildConfigurator() {
  const handleConfigChange = (config) => {
    console.log('New config:', config);
  };

  return (
    <BuildConfigurationArsenal
      initialTab="js-api"
      initialConfig={{
        entrypoints: ['./src/index.ts'],
        target: 'browser',
        format: 'esm',
        minify: true,
        sourcemap: 'linked'
      }}
      showCliCommand={true}
      enableCodeCopy={true}
      onConfigChange={handleConfigChange}
    />
  );
}
```

---

### TestingArsenal

Modern testing capabilities with concurrent execution, type testing, and advanced matchers.

#### Props

```typescript
interface TestingArsenalProps {
  /** Initial test suite */
  initialSuite?: TestSuite;

  /** Enable concurrent testing */
  enableConcurrent?: boolean;

  /** Maximum concurrent tests */
  maxConcurrency?: number;

  /** Show code coverage */
  showCoverage?: boolean;

  /** Callback when tests complete */
  onTestComplete?: (results: TestResult[]) => void;
}
```

#### Usage

```tsx
import { TestingArsenal } from '@bun/performance-arsenal';

function TestRunner() {
  return (
    <TestingArsenal
      enableConcurrent={true}
      maxConcurrency={16}
      showCoverage={true}
      onTestComplete={(results) => {
        const passRate = results.filter(r => r.status === 'passed').length / results.length;
        console.log(`Pass rate: ${(passRate * 100).toFixed(1)}%`);
      }}
    />
  );
}
```

#### Features

- **Async Stack Traces**: Full call stack preservation with WebKit integration
- **Concurrent Testing**: Parallel execution (up to 16× faster)
- **New Matchers**: `toHaveReturnedWith`, `toHaveLastReturnedWith`, etc.
- **Type Testing**: `expectTypeOf` API with compile-time verification

---

### ProcessShellArsenal

Advanced process management with streams, buffers, sockets, and timers.

#### Props

```typescript
interface ProcessShellArsenalProps {
  /** Initial view tab */
  initialTab?: 'streams' | 'buffers' | 'sockets' | 'timers' | 'memory';

  /** Enable process monitoring */
  enableMonitoring?: boolean;

  /** Update interval (ms) */
  updateInterval?: number;

  /** Callback for process events */
  onProcessEvent?: (event: ProcessEvent) => void;
}
```

#### Usage

```tsx
import { ProcessShellArsenal } from '@bun/performance-arsenal';

function ProcessMonitor() {
  return (
    <ProcessShellArsenal
      initialTab="memory"
      enableMonitoring={true}
      updateInterval={1000}
      onProcessEvent={(event) => {
        console.log(`Process ${event.type}:`, event.data);
      }}
    />
  );
}
```

---

## 🎣 Custom Hooks

### usePerformanceArsenal

Core hook for performance benchmarking functionality.

```typescript
function usePerformanceArsenal(): PerformanceArsenalHook

interface PerformanceArsenalHook {
  // Current State
  tab: 'postmessage' | 'registry' | 'crypto' | 'memory' | 'dashboard';
  pmSize: number;
  regAction: string;
  isRunning: boolean;
  benchmarkResults: BenchmarkResult[];

  // Hardware Information
  hardwareInfo: HardwareInfo;
  performanceStats: PerformanceStats;

  // Analytics
  analyticsEnabled: boolean;

  // Actions
  setTab: (tab: TabType) => void;
  setPmSize: (size: number) => void;
  setRegAction: (action: string) => void;
  runBenchmark: () => Promise<void>;
  copyCode: (code: string) => void;
  enableAnalytics: () => void;
  disableAnalytics: () => void;
  getSessionStats: () => SessionStats;
  exportAnalyticsData: () => Promise<Blob>;
}
```

#### Example

```tsx
import { usePerformanceArsenal } from '@bun/performance-arsenal';

function CustomBenchmark() {
  const {
    tab,
    setTab,
    isRunning,
    benchmarkResults,
    runBenchmark,
    hardwareInfo
  } = usePerformanceArsenal();

  const handleRunBenchmark = async () => {
    console.log(`Running on ${hardwareInfo.cores} cores...`);
    await runBenchmark();
    console.log('Results:', benchmarkResults);
  };

  return (
    <div>
      <select value={tab} onChange={(e) => setTab(e.target.value)}>
        <option value="crypto">Crypto</option>
        <option value="memory">Memory</option>
      </select>
      <button onClick={handleRunBenchmark} disabled={isRunning}>
        Run Benchmark
      </button>
    </div>
  );
}
```

---

### usePerformanceMetrics

Real-time performance monitoring hook.

```typescript
function usePerformanceMetrics(): PerformanceMetrics

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  timestamp: number;
  userAgent: string;
  hardwareConcurrency: number;
}
```

#### Example

```tsx
import { usePerformanceMetrics } from '@bun/performance-arsenal';

function PerformanceMonitor() {
  const metrics = usePerformanceMetrics();

  return (
    <div className="performance-metrics">
      <span>FPS: {metrics.fps}</span>
      <span>Memory: {metrics.memoryUsage}MB</span>
      <span>Cores: {metrics.hardwareConcurrency}</span>
    </div>
  );
}
```

---

### useBuildConfigurationArsenal

Hook for build configuration management.

```typescript
function useBuildConfigurationArsenal(): BuildConfigurationHook

interface BuildConfigurationHook {
  // State
  config: BuildConfiguration;
  activeTab: 'js-api' | 'cli';
  generatedCode: string;
  cliCommand: string;

  // Actions
  setActiveTab: (tab: 'js-api' | 'cli') => void;
  updateConfig: (updates: Partial<BuildConfiguration>) => void;
  updateCoreOption: <K extends keyof CoreOptions>(key: K, value: CoreOptions[K]) => void;
  updateEnvOption: <K extends keyof EnvOptions>(key: K, value: EnvOptions[K]) => void;
  updateJsxOption: <K extends keyof JsxOptions>(key: K, value: JsxOptions[K]) => void;
  updateOptimization: <K extends keyof OptimizationOptions>(key: K, value: OptimizationOptions[K]) => void;
  updateOutput: <K extends keyof OutputOptions>(key: K, value: OutputOptions[K]) => void;
  updateAdvanced: <K extends keyof AdvancedOptions>(key: K, value: AdvancedOptions[K]) => void;
  updateCliOption: <K extends keyof CliOptions>(key: K, value: CliOptions[K]) => void;

  // Utilities
  generateBuildCode: () => string;
  generateCliCommand: () => string;
  resetConfig: () => void;
  copyCode: (code: string) => void;
}
```

#### Example

```tsx
import { useBuildConfigurationArsenal } from '@bun/performance-arsenal';

function BuildConfigurator() {
  const {
    config,
    activeTab,
    setActiveTab,
    updateCoreOption,
    generateBuildCode,
    generateCliCommand,
    copyCode
  } = useBuildConfigurationArsenal();

  const handleTargetChange = (target: 'browser' | 'bun' | 'node') => {
    updateCoreOption('target', target);
  };

  const handleCopyCode = () => {
    const code = activeTab === 'js-api'
      ? generateBuildCode()
      : generateCliCommand();
    copyCode(code);
  };

  return (
    <div>
      <select value={config.target} onChange={(e) => handleTargetChange(e.target.value as any)}>
        <option value="browser">Browser</option>
        <option value="bun">Bun</option>
        <option value="node">Node.js</option>
      </select>
      <button onClick={handleCopyCode}>Copy Code</button>
      <pre>{activeTab === 'js-api' ? generateBuildCode() : generateCliCommand()}</pre>
    </div>
  );
}
```

---

### useAnalytics

Analytics tracking and performance monitoring hook.

```typescript
function useAnalytics(): AnalyticsHook

interface AnalyticsHook {
  consent: boolean | null;
  isEnabled: boolean;

  // Actions
  enableAnalytics: () => void;
  disableAnalytics: () => void;
  trackBenchmark: (type: string, config: any) => void;
  trackInteraction: (action: string, metadata: any) => void;
  getStats: () => AnalyticsStats;
  exportData: () => Promise<Blob>;
}
```

#### Example

```tsx
import { useAnalytics } from '@bun/performance-arsenal';

function AnalyticsPanel() {
  const {
    consent,
    isEnabled,
    enableAnalytics,
    disableAnalytics,
    trackBenchmark,
    getStats,
    exportData
  } = useAnalytics();

  const handleExportAnalytics = async () => {
    const blob = await exportData();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.json`;
    a.click();
  };

  if (consent === null) {
    return (
      <div>
        <button onClick={enableAnalytics}>Enable Analytics</button>
        <button onClick={disableAnalytics}>Decline</button>
      </div>
    );
  }

  return isEnabled ? (
    <div>
      <p>Analytics enabled. Stats: {JSON.stringify(getStats())}</p>
      <button onClick={handleExportAnalytics}>Export Data</button>
    </div>
  ) : (
    <p>Analytics disabled</p>
  );
}
```

---

### useDatabaseInfrastructureArsenal

Database testing and infrastructure management hook.

```typescript
function useDatabaseInfrastructureArsenal(): DatabaseHook

interface DatabaseHook {
  // SQLite
  sqliteConnection: SQLiteConnection | null;
  sqliteResults: QueryResult[];
  isSqliteConnected: boolean;

  // Redis
  redisConnection: RedisConnection | null;
  redisResults: RedisResult[];
  isRedisConnected: boolean;

  // WebSocket
  websocketConnection: WebSocketConnection | null;
  websocketMessages: WebSocketMessage[];
  isWebSocketConnected: boolean;

  // Actions
  connectSqlite: (path: string) => Promise<void>;
  disconnectSqlite: () => void;
  executeSqliteQuery: (query: string) => Promise<QueryResult>;

  connectRedis: (config: RedisConfig) => Promise<void>;
  disconnectRedis: () => void;
  executeRedisCommand: (command: string, ...args: any[]) => Promise<RedisResult>;

  connectWebSocket: (url: string) => Promise<void>;
  disconnectWebSocket: () => void;
  sendWebSocketMessage: (message: string) => void;
}
```

---

### useTestingArsenal

Testing framework management and execution hook.

```typescript
function useTestingArsenal(): TestingHook

interface TestingHook {
  // Test State
  tests: TestSuite[];
  runningTests: Set<string>;
  testResults: TestResult[];
  coverage: CoverageReport | null;

  // Configuration
  testConfig: TestConfig;

  // Actions
  runAllTests: () => Promise<void>;
  runTestSuite: (suiteId: string) => Promise<void>;
  runSingleTest: (testId: string) => Promise<void>;
  stopTests: () => void;
  updateTestConfig: (config: Partial<TestConfig>) => void;
  generateTestReport: (format: 'json' | 'html' | 'junit') => Promise<string>;
}
```

---

## 🎨 UI Components

### Layout Components

#### Footer

Professional footer with performance metrics, navigation, and community links.

```tsx
import { Footer } from '@bun/performance-arsenal';

function App() {
  return (
    <div>
      <main>{/* Content */}</main>
      <Footer />
    </div>
  );
}
```

#### TabBar

Consistent tab navigation across all arsenals.

```tsx
import { TabBar } from '@bun/performance-arsenal/ui';

const tabs = [
  { id: 'postmessage', label: 'postMessage', color: 'green', icon: '⚡' },
  { id: 'crypto', label: 'Crypto', color: 'purple', icon: '🔐' }
];

function MyComponent() {
  const [activeTab, setActiveTab] = useState('postmessage');

  return (
    <TabBar
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
```

### Arsenal-Specific UI

#### CodeBlock

Syntax-highlighted code display with copy functionality.

```tsx
import { CodeBlock } from '@bun/performance-arsenal/ui';

function CodeExample() {
  const code = `
const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  target: 'browser',
  minify: true
});
  `.trim();

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

#### BenchmarkCard

Display benchmark results with visual comparison.

```tsx
import { BenchmarkCard } from '@bun/performance-arsenal/ui';

function BenchmarkDisplay() {
  return (
    <BenchmarkCard
      title="Crypto Performance"
      bunTime={45}
      nodeTime={180}
      description="SHA-256 hashing of 1MB data"
    />
  );
}
```

#### HardwareWarning

Warning component for low-end hardware detection.

```tsx
import { HardwareWarning } from '@bun/performance-arsenal/ui';

function App() {
  const hardwareInfo = {
    cores: 2,
    memory: 4,
    platform: 'darwin'
  };

  return <HardwareWarning hardwareInfo={hardwareInfo} />;
}
```

#### Toast

Toast notification system.

```tsx
import { Toast, useToaster } from '@bun/performance-arsenal/ui';

function MyComponent() {
  const { toasts, showToast, dismissToast } = useToaster();

  const handleAction = () => {
    showToast('Operation successful!', 'success');
  };

  return (
    <div>
      <button onClick={handleAction}>Do Something</button>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </div>
  );
}
```

---

## 🔧 Utility Functions

### Analytics

```typescript
import {
  trackBenchmark,
  trackInteraction,
  exportAnalytics,
  clearAnalytics
} from '@bun/performance-arsenal/utils/analytics';

// Track benchmark results
trackBenchmark('crypto', {
  algorithm: 'SHA-256',
  inputSize: '1MB',
  duration: 45
});

// Track user interactions
trackInteraction('button_click', {
  component: 'PerformanceArsenal',
  tab: 'crypto'
});

// Export analytics data
const data = await exportAnalytics();
console.log(data);

// Clear all analytics
clearAnalytics();
```

### Clipboard Operations

```typescript
import { copyToClipboard } from '@bun/performance-arsenal/utils';

// Simple copy
await copyToClipboard('Hello, World!');

// Copy with callback
await copyToClipboard(code, () => {
  console.log('Code copied successfully!');
});
```

### Hardware Detection

```typescript
import { getHardwareInfo, detectHardware } from '@bun/performance-arsenal/utils';

// Get current hardware info
const hardware = getHardwareInfo();
console.log({
  cores: hardware.cores,
  memory: hardware.memoryGB,
  platform: hardware.platform,
  arch: hardware.arch
});

// Detect hardware capabilities
const capabilities = await detectHardware();
console.log({
  isLowEnd: capabilities.isLowEnd,
  supportsSIMD: capabilities.supportsSIMD,
  supportsWebGL: capabilities.supportsWebGL
});
```

### Performance Monitoring

```typescript
import {
  getPerformanceMonitor,
  startPerformanceTracking,
  stopPerformanceTracking
} from '@bun/performance-arsenal/utils';

// Get monitor instance
const monitor = getPerformanceMonitor();
const stats = monitor.getCurrentStats();

console.log({
  fps: stats.fps,
  memory: stats.usedJSHeapSize / 1024 / 1024, // MB
  timestamp: stats.timestamp
});

// Start tracking
const tracker = startPerformanceTracking();

// ... perform operations ...

// Stop and get results
const results = stopPerformanceTracking(tracker);
console.log(`Duration: ${results.duration}ms`);
```

### Storage Utilities

```typescript
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStorage
} from '@bun/performance-arsenal/utils/storage';

// Store preferences
setStorageItem('theme', 'dark');
setStorageItem('analyticsEnabled', true);
setStorageItem('lastBenchmark', { type: 'crypto', date: Date.now() });

// Retrieve with defaults
const theme = getStorageItem('theme', 'light');
const analyticsEnabled = getStorageItem('analyticsEnabled', false);

// Remove item
removeStorageItem('lastBenchmark');

// Clear all storage
clearStorage();
```

---

## 📊 Type Definitions

### Core Types

```typescript
// Benchmark Types
interface BenchmarkResult {
  id: string;
  name: string;
  bun: number;
  node: number;
  speedup: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface BenchmarkEvent {
  type: 'start' | 'progress' | 'complete' | 'error';
  benchmark: string;
  config?: any;
  duration?: number;
  result?: BenchmarkResult;
  error?: Error;
}

// Hardware Types
interface HardwareInfo {
  cores: number;
  memoryGB: number;
  platform: string;
  arch: string;
  isLowEnd: boolean;
}

interface PerformanceStats {
  fps: number;
  memory: number;
  cpu: number;
  timestamp: number;
}

// Database Types
interface QueryResult {
  columns: string[];
  rows: any[][];
  executionTime: number;
  affectedRows?: number;
}

interface RedisResult {
  command: string;
  args: any[];
  result: any;
  executionTime: number;
  success: boolean;
  error?: string;
}

interface WebSocketMessage {
  id: string;
  data: string;
  timestamp: number;
  direction: 'sent' | 'received';
}

// Test Types
interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  error?: string;
  stack?: string;
}

interface TestSuite {
  id: string;
  name: string;
  tests: TestCase[];
  beforeAll?: () => Promise<void>;
  afterAll?: () => Promise<void>;
}

interface TestConfig {
  concurrent: boolean;
  maxConcurrency: number;
  timeout: number;
  bail: boolean;
  coverage: boolean;
}

// Build Types
interface BuildOutput {
  success: boolean;
  outputs: BuildArtifact[];
  logs: BuildMessage[];
  metrics: BuildMetrics;
}

interface BuildArtifact {
  path: string;
  size: number;
  hash: string | null;
  kind: 'entry-point' | 'chunk' | 'asset' | 'sourcemap';
  loader: string;
  sourcemap?: BuildArtifact;
}

interface BuildMessage {
  level: 'error' | 'warning' | 'info';
  message: string;
  position?: {
    file: string;
    line: number;
    column: number;
  };
}

interface BuildMetrics {
  duration: number;
  totalSize: number;
  compressionRatio?: number;
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

class DatabaseError extends ArsenalError {
  constructor(message: string, public query: string) {
    super(message, 'DATABASE_ERROR', { query });
  }
}
```

---

## 💻 CLI Commands

### arsenal:ci

Run automated CI/CD performance testing.

```bash
# Basic usage
bun run arsenal:ci

# With options
bun run arsenal:ci --output-dir ./results --verbose

# Custom settings
bun run arsenal:ci \
  --output-dir ./coverage \
  --junit-file junit.xml \
  --prom-file metrics.prom \
  --verbose \
  --timeout 300000
```

**Options:**
- `--output-dir, -o <dir>` - Output directory (default: `coverage`)
- `--junit-file <file>` - JUnit XML output file (default: `junit-bench.xml`)
- `--prom-file <file>` - Prometheus metrics file (default: `metrics.prom`)
- `--verbose, -v` - Verbose output
- `--timeout <ms>` - Timeout in milliseconds (default: `300000`)

### arsenal:benchmark

Run baseline benchmarks.

```bash
bun run arsenal:benchmark
```

### arsenal:compare

Compare benchmark results.

```bash
bun run arsenal:compare
```

---

## 🚀 Advanced Usage

### Custom Benchmark Creation

```typescript
import { createBenchmark, runBenchmark } from '@bun/performance-arsenal';

const customBenchmark = createBenchmark({
  name: 'custom-algorithm',
  description: 'Test custom sorting algorithm',
  setup: () => {
    // Generate test data
    const data = Array.from({ length: 10000 }, () => Math.random());
    return { data };
  },
  run: (context) => {
    // Run your algorithm
    return customSort(context.data);
  },
  teardown: (context) => {
    // Cleanup if needed
    context.data = null;
  },
  iterations: 100,
  warmup: 10
});

// Run the benchmark
const result = await runBenchmark(customBenchmark);
console.log(`Average duration: ${result.duration}ms`);
console.log(`Throughput: ${result.throughput} ops/sec`);
```

### Plugin System

```typescript
import { registerPlugin, Plugin } from '@bun/performance-arsenal';

const analyticsPlugin: Plugin = {
  name: 'custom-analytics',
  version: '1.0.0',

  hooks: {
    onBenchmarkStart: (benchmark) => {
      console.log(`[Analytics] Starting ${benchmark.name}`);
      // Send to analytics service
    },

    onBenchmarkComplete: (result) => {
      console.log(`[Analytics] Completed in ${result.duration}ms`);
      // Send results to analytics
    },

    onBenchmarkError: (error, benchmark) => {
      console.error(`[Analytics] Error in ${benchmark.name}:`, error);
      // Report error
    }
  }
};

// Register the plugin
registerPlugin(analyticsPlugin);
```

### Configuration Management

```typescript
import { configureArsenal, getConfig } from '@bun/performance-arsenal';

// Global configuration
configureArsenal({
  analytics: {
    enabled: true,
    retention: '30-days',
    endpoint: 'https://analytics.example.com',
    anonymize: true
  },

  performance: {
    warnings: {
      lowFps: 30,
      highMemory: 500,
      slowBenchmark: 1000
    },
    autoOptimize: true
  },

  ui: {
    theme: 'dark',
    animations: true,
    compactMode: false
  },

  testing: {
    defaultConcurrency: 8,
    timeout: 30000,
    coverage: {
      enabled: true,
      threshold: 80
    }
  }
});

// Get current config
const config = getConfig();
console.log(config);
```

---

## 🔗 Integration Examples

### React Integration

```tsx
import React from 'react';
import {
  PerformanceArsenal,
  usePerformanceMetrics,
  useAnalytics
} from '@bun/performance-arsenal';

function PerformanceDashboard() {
  const metrics = usePerformanceMetrics();
  const { trackBenchmark } = useAnalytics();

  return (
    <div className="dashboard">
      <div className="metrics">
        <span>FPS: {metrics.fps}</span>
        <span>Memory: {metrics.memoryUsage}MB</span>
      </div>

      <PerformanceArsenal
        initialTab="crypto"
        enableAnalytics={true}
        onBenchmarkComplete={(result) => {
          trackBenchmark(result.name, {
            duration: result.duration,
            speedup: result.speedup
          });
        }}
      />
    </div>
  );
}
```

### Node.js/Bun Server

```typescript
import { serve } from 'bun';
import { runBenchmark } from '@bun/performance-arsenal';

serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/api/benchmark') {
      const { type } = await req.json();
      const result = await runBenchmark(type);

      return Response.json(result);
    }

    return new Response('Not Found', { status: 404 });
  }
});
```

### CI/CD Integration (GitHub Actions)

```yaml
name: Performance Testing

on: [push, pull_request]

jobs:
  benchmark:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: '1.3.0'

      - name: Install dependencies
        run: bun install

      - name: Run performance tests
        run: bun run arsenal:ci --verbose

      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: benchmark-results
          path: coverage/
```

---

## 📚 Migration Guide

### From v1.2 to v1.3

#### Breaking Changes

1. **Analytics Hook Renamed**
   ```typescript
   // Before (v1.2)
   import { useAnalytics } from '@bun/performance-arsenal';

   // After (v1.3)
   import { usePerformanceMonitor } from '@bun/performance-arsenal';
   ```

2. **Footer Component Requirements**
   - Now requires React 18+
   - Update your React version: `bun add react@^18.0.0 react-dom@^18.0.0`

3. **Build Configuration Validation**
   - Stricter TypeScript types
   - Invalid configurations now throw errors instead of warnings

#### New Features

- **CLI Options**: New command-line flags for BuildConfigurationArsenal
- **Enhanced Analytics**: Privacy controls and data retention settings
- **Improved Error Handling**: Better error messages and stack traces
- **Type Safety**: Improved TypeScript support with stricter types

#### Migration Steps

```bash
# 1. Update dependencies
bun update @bun/performance-arsenal

# 2. Update React (if needed)
bun add react@^18.0.0 react-dom@^18.0.0

# 3. Run type checker
bunx tsc --noEmit

# 4. Update imports
# Replace useAnalytics with usePerformanceMonitor

# 5. Test your application
bun test
```

---

## 📚 Related Documentation

| Document | Description |
|----------|-------------|
| **[🏠 Wiki Home](../wiki-repo/Home.md)** | Overview and getting started |
| **[🚀 Getting Started](../wiki-repo/Getting-Started.md)** | Quick setup guide |
| **[📊 Analytics Guide](../wiki-repo/Analytics.md)** | Performance monitoring and metrics |
| **[🗄️ Database Guide](../wiki-repo/S3-Integration.md)** | Database integration patterns |
| **[📝 SQL Examples](../wiki-repo/SQL-Examples.md)** | Query patterns and examples |
| **[🔗 Integration Guides](../wiki-repo/Integration-Guides.md)** | Framework integrations |
| **[🛠️ Troubleshooting](../wiki-repo/Troubleshooting.md)** | Common issues and solutions |

---

## 📞 Support & Community

- **[💬 GitHub Discussions](https://github.com/brendadeeznuts1111/Arsenal-Lab/discussions)** - Ask questions and share ideas
- **[🐛 Issue Tracker](https://github.com/brendadeeznuts1111/Arsenal-Lab/issues)** - Report bugs and request features
- **[🤝 Contributing Guide](../CONTRIBUTING.md)** - Help improve Arsenal Lab
- **[📖 Full Documentation](../README.md)** - Complete documentation hub

---

**Built with ❤️ for the Bun ecosystem** • **Last updated:** October 21, 2025
