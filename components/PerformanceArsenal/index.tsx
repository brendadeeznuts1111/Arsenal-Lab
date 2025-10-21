// components/PerformanceArsenal/index.tsx
import React, { useCallback } from 'react';
import { cryptoImprovements, memoryOptimizations } from './data/improvements';
import { usePerformanceArsenal } from './hooks/usePerformanceArsenal';
import { usePerformanceMetrics } from './hooks/usePerformanceMetrics';
import './styles.css';
import { AnalyticsConsent } from './ui/AnalyticsConsent';
import { BenchmarkCard } from './ui/BenchmarkCard';
import { CodeBlock } from './ui/CodeBlock';
import { HardwareWarning } from './ui/HardwareWarning';
import { PerformanceDashboard } from './ui/PerformanceDashboard';
import { TabBar } from './ui/TabBar';
import { Toast, useToaster } from './ui/Toast';
import { useAnalytics } from './utils/analytics';
import { WorkerManager } from './workers/WorkerManager';

export function PerformanceArsenal() {
  const {
    tab,
    setTab,
    pmSize,
    setPmSize,
    regAction,
    setRegAction,
    isRunning,
    benchmarkResults,
    runBenchmark,
    copyCode,
    hardwareInfo,
    performanceStats,
    analyticsEnabled,
    enableAnalytics,
    disableAnalytics,
    getSessionStats: _getSessionStats,
    exportAnalyticsData: _exportAnalyticsData
  } = usePerformanceArsenal();

  // Enhanced hooks for enterprise features
  const performanceMetrics = usePerformanceMetrics();
  const { consent, trackBenchmark: _trackBenchmark, enableAnalytics: enableEnhancedAnalytics, disableAnalytics: disableEnhancedAnalytics, getStats } = useAnalytics();
  const _workerManager = WorkerManager.getInstance();

  const { toasts, showToast, dismissToast } = useToaster();

  const tabs = [
    { id: 'postmessage' as const, label: 'postMessage', color: 'green', icon: '⚡' },
    { id: 'registry' as const, label: 'Registry', color: 'blue', icon: '📦' },
    { id: 'crypto' as const, label: 'Crypto', color: 'purple', icon: '🔐' },
    { id: 'memory' as const, label: 'Memory', color: 'indigo', icon: '💾' },
    { id: 'dashboard' as const, label: 'Dashboard', color: 'gray', icon: '📊' }
  ];

  const handleCopyCode = useCallback((code: string, message: string = 'Copied to clipboard!') => {
    copyCode(code);
    showToast(message, 'success');
  }, [copyCode, showToast]);

  const calculateSpeedup = useCallback((bun: number, node: number) => {
    return node / bun;
  }, []);

  return (
    <div className="performance-arsenal">
      {/* Analytics Consent Banner */}
      {consent === null && (
        <AnalyticsConsent
          onAccept={enableEnhancedAnalytics}
          onDecline={disableEnhancedAnalytics}
        />
      )}

      {/* Header */}
      <div className="arsenal-header">
        <div className="header-content">
          <div className="header-icon">
            <span>⚡</span>
          </div>
          <div>
            <h2>Performance Arsenal</h2>
            <div className="live-metrics">
              <span>FPS: {performanceMetrics.fps}</span>
              <span>Memory: {performanceMetrics.memoryUsage}MB</span>
              <span>Cores: {navigator.hardwareConcurrency}</span>
            </div>
          </div>
        </div>
        <div className="header-badge">
          500× faster
        </div>
      </div>

      {/* Hardware Warning */}
      <HardwareWarning hardwareInfo={hardwareInfo} />

      {/* Performance Metrics & Analytics */}
      <div className="performance-metrics">
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">FPS</span>
            <span className="metric-value">{performanceStats.fps}</span>
          </div>
          {performanceStats.usedJSHeapSize && (
            <div className="metric-item">
              <span className="metric-label">Memory</span>
              <span className="metric-value">
                {Math.round(performanceStats.usedJSHeapSize / 1024 / 1024)}MB
              </span>
            </div>
          )}
          <div className="metric-item">
            <span className="metric-label">Analytics</span>
            <button
              onClick={analyticsEnabled ? disableAnalytics : enableAnalytics}
              className={`analytics-toggle ${analyticsEnabled ? 'enabled' : 'disabled'}`}
            >
              {analyticsEnabled ? '📊 ON' : '📊 OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <TabBar tabs={tabs} activeTab={tab} onTabChange={(newTab) => setTab(newTab as typeof tab)} />

      {/* Tab Content */}
      <div className="tab-content">
        {tab === 'postmessage' && (
          <PostMessageTab
            pmSize={pmSize}
            setPmSize={setPmSize}
            isRunning={isRunning}
            benchmarkResults={benchmarkResults}
            runBenchmark={runBenchmark}
            calculateSpeedup={calculateSpeedup}
            onCopyCode={handleCopyCode}
          />
        )}

        {tab === 'registry' && (
          <RegistryTab
            regAction={regAction}
            setRegAction={setRegAction}
            isRunning={isRunning}
            benchmarkResults={benchmarkResults}
            runBenchmark={runBenchmark}
            calculateSpeedup={calculateSpeedup}
          />
        )}

        {tab === 'crypto' && (
          <CryptoTab
            onCopyCode={handleCopyCode}
            isRunning={isRunning}
            benchmarkResults={benchmarkResults}
            runBenchmark={runBenchmark}
          />
        )}

        {tab === 'memory' && (
          <MemoryTab />
        )}

        {tab === 'dashboard' && (
          <PerformanceDashboard
            metrics={performanceMetrics}
            analytics={getStats()}
            onRunBenchmark={runBenchmark}
          />
        )}
      </div>

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Individual Tab Components for better separation
const PostMessageTab = React.memo(({
  pmSize,
  setPmSize,
  isRunning,
  benchmarkResults,
  runBenchmark,
  calculateSpeedup,
  onCopyCode
}: any) => {
  const postMessageExample = `// Worker thread (worker.js)
self.onmessage = (e) => {
  // Large strings are zero-copy in Bun 1.3
  const processed = processData(e.data);
  self.postMessage(processed);
};

// Main thread
const worker = new Worker('./worker.js');
const largeData = await fetchLargeJSON(); // 3MB payload
worker.postMessage(largeData); // 500× faster in Bun`;

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>Zero-Copy Worker Communication</h3>
        <p>Bun 1.3 avoids serialization for safe strings, dramatically improving performance for large payloads.</p>
      </div>

      <div className="size-selector">
        {[
          { value: 'small' as const, label: 'Small', desc: '11 chars' },
          { value: 'medium' as const, label: 'Medium', desc: '~50 KB' },
          { value: 'large' as const, label: 'Large', desc: '~3 MB' }
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setPmSize(option.value)}
            className={`size-option ${pmSize === option.value ? 'active' : ''}`}
          >
            <div className="size-label">{option.label}</div>
            <div className="size-desc">{option.desc}</div>
          </button>
        ))}
      </div>

      <button
        onClick={() => runBenchmark('postmessage')}
        disabled={isRunning}
        className="benchmark-button primary"
      >
        {isRunning ? (
          <>
            <div className="spinner"></div>
            <span>Running Benchmark...</span>
          </>
        ) : (
          <span>Run postMessage Benchmark</span>
        )}
      </button>

      {benchmarkResults && (
        <BenchmarkCard
          title="Benchmark Results"
          bunResult={benchmarkResults.bun}
          nodeResult={benchmarkResults.node}
          memory={benchmarkResults.memory}
          payloadSize={benchmarkResults.payloadSize}
          calculateSpeedup={calculateSpeedup}
        />
      )}

      <CodeBlock
        code={postMessageExample}
        language="javascript"
        onCopy={() => onCopyCode(postMessageExample)}
      />
    </div>
  );
});

const RegistryTab = React.memo(({
  regAction,
  setRegAction,
  isRunning,
  benchmarkResults,
  runBenchmark,
  calculateSpeedup
}: any) => {
  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>Registry Performance</h3>
        <p>Optimized package publishing and downloading with zero-copy operations.</p>
      </div>

      <div className="action-selector">
        {[
          { value: 'upload' as const, label: '📤 Upload', desc: 'Package publish' },
          { value: 'download' as const, label: '📥 Download', desc: 'Package install' }
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setRegAction(option.value)}
            className={`action-option ${regAction === option.value ? 'active' : ''}`}
          >
            <div className="action-label">{option.label}</div>
            <div className="action-desc">{option.desc}</div>
          </button>
        ))}
      </div>

      <button
        onClick={() => runBenchmark('registry')}
        disabled={isRunning}
        className="benchmark-button secondary"
      >
        {isRunning ? (
          <>
            <div className="spinner"></div>
            <span>Testing Registry...</span>
          </>
        ) : (
          <span>Run Registry Benchmark</span>
        )}
      </button>

      {benchmarkResults && (
        <BenchmarkCard
          title="Registry Performance"
          bunResult={benchmarkResults.bun}
          nodeResult={benchmarkResults.node}
          size={benchmarkResults.size}
          calculateSpeedup={calculateSpeedup}
        />
      )}
    </div>
  );
});

const CryptoTab = React.memo(({ onCopyCode, isRunning, benchmarkResults, runBenchmark }: any) => {
  const diffieHellmanExample = `import { createDiffieHellman } from 'crypto';

// 400× faster in Bun 1.3
const alice = createDiffieHellman(2048);
const bob = createDiffieHellman(alice.getPrime(), alice.getGenerator());

const aliceKey = alice.generateKeys();
const bobKey = bob.generateKeys();

const aliceSecret = alice.computeSecret(bobKey);
const bobSecret = bob.computeSecret(aliceKey);

// aliceSecret === bobSecret (400× faster)`;

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>Cryptographic Improvements</h3>
        <p>v1.3 brings massive performance gains and new algorithms to Bun's crypto implementation.</p>
      </div>

      <button
        onClick={() => runBenchmark('crypto')}
        disabled={isRunning}
        className="benchmark-button primary"
      >
        {isRunning ? (
          <>
            <div className="spinner"></div>
            <span>Running Crypto Benchmark...</span>
          </>
        ) : (
          <span>Run Crypto Benchmark</span>
        )}
      </button>

      {benchmarkResults && (
        <div className="benchmark-card">
          <h4 className="benchmark-title">Crypto Performance</h4>
          <div className="benchmark-results">
            <div className="result-item">
              <div className="result-label">Bun</div>
              <div className="result-value bun-value">
                {benchmarkResults.bun?.toFixed(2)}ms
              </div>
            </div>
            <div className="result-item">
              <div className="result-label">Node.js</div>
              <div className="result-value node-value">
                {benchmarkResults.node?.toFixed(2)}ms
              </div>
            </div>
            <div className="result-item">
              <div className="result-label">Speedup</div>
              <div className="result-value speedup-value">
                {(benchmarkResults.node / benchmarkResults.bun).toFixed(1)}× faster
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="improvements-grid">
        {cryptoImprovements.map((improvement, index) => (
          <div key={index} className="improvement-card">
            <div className="improvement-content">
              <div className="improvement-name">{improvement.name}</div>
              <div className="improvement-desc">{improvement.description}</div>
            </div>
            <div className="improvement-badge">{improvement.improvement}</div>
          </div>
        ))}
      </div>

      <CodeBlock
        code={diffieHellmanExample}
        language="javascript"
        onCopy={() => onCopyCode(diffieHellmanExample, 'DiffieHellman example copied!')}
      />
    </div>
  );
});

const MemoryTab = React.memo(() => {
  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>Memory Optimizations</h3>
        <p>Significant memory usage reductions across the runtime.</p>
      </div>

      <div className="improvements-grid">
        {memoryOptimizations.map((optimization, index) => (
          <div key={index} className="improvement-card">
            <div className="improvement-content">
              <div className="improvement-name">{optimization.area}</div>
              <div className="improvement-desc">{optimization.description}</div>
            </div>
            <div className="improvement-badge">{optimization.improvement}</div>
          </div>
        ))}
      </div>

      <div className="impact-summary">
        <h4>Overall Impact</h4>
        <ul>
          <li>• Next.js: 28% less memory</li>
          <li>• Elysia: 11% less memory</li>
          <li>• Startup: 3MB less baseline memory</li>
          <li>• Large fetch: Proper backpressure handling</li>
        </ul>
      </div>
    </div>
  );
});
