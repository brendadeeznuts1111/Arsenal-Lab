// components/ProcessShellArsenal/index.tsx
import React, { useCallback } from 'react';
import { BenchmarkCard } from '../PerformanceArsenal/ui/BenchmarkCard';
import { CodeBlock } from '../PerformanceArsenal/ui/CodeBlock';
import { HardwareWarning } from '../PerformanceArsenal/ui/HardwareWarning';
import { TabBar } from '../PerformanceArsenal/ui/TabBar';
import { Toast, useToaster } from '../PerformanceArsenal/ui/Toast';
import { useProcessShellArsenal } from './hooks/useProcessShellArsenal';
import './styles.css';
import { ProcessMonitor } from './ui/ProcessMonitor';
import { SocketDiagnostics } from './ui/SocketDiagnostics';

export function ProcessShellArsenal() {
  const {
    tab,
    setTab,
    timeoutValue,
    setTimeoutValue,
    maxBufferSize,
    setMaxBufferSize,
    isRunning,
    benchmarkResults,
    runBenchmark,
    copyCode,
    hardwareInfo,
    processStats,
    socketInfo
  } = useProcessShellArsenal();

  const { toasts, showToast, dismissToast } = useToaster();

  const tabs = [
    { id: 'timeout' as const, label: 'Timeout', color: 'red', icon: '⏱️' },
    { id: 'buffer' as const, label: 'Max Buffer', color: 'blue', icon: '📏' },
    { id: 'socket' as const, label: 'Socket Info', color: 'green', icon: '🌐' },
    { id: 'streams' as const, label: 'Streams', color: 'purple', icon: '🌊' },
    { id: 'memory' as const, label: 'Memory', color: 'indigo', icon: '🧠' }
  ];

  const handleCopyCode = useCallback((code: string, message: string = 'Copied to clipboard!') => {
    copyCode(code);
    showToast(message, 'success');
  }, [copyCode, showToast]);

  return (
    <div className="process-shell-arsenal">
      {/* Header */}
      <div className="arsenal-header">
        <div className="header-content">
          <div className="header-icon">
            <span>⚡</span>
          </div>
          <div>
            <h2>Process & Shell Arsenal</h2>
            <p>v1.3 Process Improvements</p>
          </div>
        </div>
        <div className="header-badge">
          40× faster
        </div>
      </div>

      {/* Hardware Warning */}
      <HardwareWarning hardwareInfo={hardwareInfo} />

      {/* Tab Bar */}
      <TabBar tabs={tabs} activeTab={tab} onTabChange={(tabId) => setTab(tabId as 'timeout' | 'buffer' | 'socket' | 'streams' | 'memory')} />

      {/* Tab Content */}
      <div className="tab-content">
        {tab === 'timeout' && (
          <TimeoutTab
            timeoutValue={timeoutValue}
            setTimeoutValue={setTimeoutValue}
            isRunning={isRunning}
            benchmarkResults={benchmarkResults}
            runBenchmark={runBenchmark}
            onCopyCode={handleCopyCode}
          />
        )}

        {tab === 'buffer' && (
          <BufferTab
            maxBufferSize={maxBufferSize}
            setMaxBufferSize={setMaxBufferSize}
            isRunning={isRunning}
            benchmarkResults={benchmarkResults}
            runBenchmark={runBenchmark}
            onCopyCode={handleCopyCode}
          />
        )}

        {tab === 'socket' && (
          <SocketTab
            socketInfo={socketInfo}
            onCopyCode={handleCopyCode}
          />
        )}

        {tab === 'streams' && (
          <StreamsTab
            isRunning={isRunning}
            benchmarkResults={benchmarkResults}
            runBenchmark={runBenchmark}
            onCopyCode={handleCopyCode}
          />
        )}

        {tab === 'memory' && (
          <MemoryTab
            processStats={processStats}
            isRunning={isRunning}
            benchmarkResults={benchmarkResults}
            runBenchmark={runBenchmark}
          />
        )}
      </div>

      {/* Live Process Monitor */}
      <ProcessMonitor stats={processStats} />

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

// Timeout Tab
const TimeoutTab = React.memo(({
  timeoutValue,
  setTimeoutValue,
  isRunning,
  benchmarkResults,
  runBenchmark,
  onCopyCode
}: any) => {
  const timeoutExample = `import { spawn } from "bun";

// Kill process after timeout - prevents hanging
const proc = spawn({
  cmd: ["sleep", "10"],
  timeout: ${timeoutValue}, // ${timeoutValue/1000} seconds
});

await proc.exited; // Killed after ${timeoutValue/1000} second${timeoutValue > 1000 ? 's' : ''}`;

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>Process Timeout Control</h3>
        <p>Prevent runaway processes with automatic timeout killing. Essential for CI/CD and user input handling.</p>
      </div>

      <div className="timeout-controls">
        <div className="control-group">
          <label>Timeout Duration (ms)</label>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={timeoutValue}
            onChange={(e) => setTimeoutValue(Number(e.target.value))}
            className="timeout-slider"
          />
          <div className="timeout-value">{timeoutValue}ms</div>
        </div>

        <div className="timeout-presets">
          {[500, 1000, 2000, 5000].map(preset => (
            <button
              key={preset}
              onClick={() => setTimeoutValue(preset)}
              className={`preset-button ${timeoutValue === preset ? 'active' : ''}`}
            >
              {preset}ms
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => runBenchmark('timeout')}
        disabled={isRunning}
        className="benchmark-button danger"
      >
        {isRunning ? (
          <>
            <div className="spinner"></div>
            <span>Testing Timeout...</span>
          </>
        ) : (
          <span>Run Timeout Benchmark</span>
        )}
      </button>

      {benchmarkResults && (
        <BenchmarkCard
          title="Timeout Performance"
          bunResult={benchmarkResults.bun}
          nodeResult={benchmarkResults.node}
          memory={benchmarkResults.memory}
          description={`Process killed after ${timeoutValue}ms`}
          calculateSpeedup={(bun: number, node: number) => node / bun}
        />
      )}

      <CodeBlock
        code={timeoutExample}
        language="javascript"
        onCopy={() => onCopyCode(timeoutExample)}
      />

      <div className="feature-benefits">
        <h4>Key Benefits</h4>
        <ul>
          <li>✅ Prevents infinite loops in CI/CD pipelines</li>
          <li>✅ Protects against malicious user input</li>
          <li>✅ Automatic cleanup of zombie processes</li>
          <li>✅ Configurable per-process timeout</li>
        </ul>
      </div>
    </div>
  );
});

// Buffer Tab
const BufferTab = React.memo(({
  maxBufferSize,
  setMaxBufferSize,
  isRunning,
  benchmarkResults,
  runBenchmark,
  onCopyCode
}: any) => {
  const bufferExample = `import { spawn } from "bun";

// Kill process if output exceeds buffer limit
const proc = spawn({
  cmd: ["yes"], // Generates infinite output
  maxBuffer: ${maxBufferSize}, // ${maxBufferSize >= 1024*1024 ? `${maxBufferSize/(1024*1024)}MB` : `${maxBufferSize/1024}KB`} limit
  stdout: "pipe",
});

await proc.exited; // Killed after buffer limit exceeded`;

  const sizeOptions = [
    { value: 64 * 1024, label: '64KB', desc: 'Small commands' },
    { value: 512 * 1024, label: '512KB', desc: 'Medium output' },
    { value: 1024 * 1024, label: '1MB', desc: 'Large output' },
    { value: 10 * 1024 * 1024, label: '10MB', desc: 'Huge output' }
  ];

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>Buffer Size Protection</h3>
        <p>Prevent memory exhaustion from runaway processes. Automatically kills processes that exceed output limits.</p>
      </div>

      <div className="buffer-controls">
        <div className="size-selector">
          {sizeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setMaxBufferSize(option.value)}
              className={`size-option ${maxBufferSize === option.value ? 'active' : ''}`}
            >
              <div className="size-label">{option.label}</div>
              <div className="size-desc">{option.desc}</div>
            </button>
          ))}
        </div>

        <div className="custom-buffer">
          <label>Custom Buffer Size (bytes)</label>
          <input
            type="number"
            value={maxBufferSize}
            onChange={(e) => setMaxBufferSize(Number(e.target.value))}
            min="1024"
            max="100 * 1024 * 1024"
            className="buffer-input"
          />
        </div>
      </div>

      <button
        onClick={() => runBenchmark('buffer')}
        disabled={isRunning}
        className="benchmark-button warning"
      >
        {isRunning ? (
          <>
            <div className="spinner"></div>
            <span>Testing Buffer...</span>
          </>
        ) : (
          <span>Run Buffer Benchmark</span>
        )}
      </button>

      {benchmarkResults && (
        <BenchmarkCard
          title="Buffer Protection"
          bunResult={benchmarkResults.bun}
          nodeResult={benchmarkResults.node}
          memory={benchmarkResults.memory}
          description={`Killed at ${maxBufferSize >= 1024*1024 ? `${maxBufferSize/(1024*1024)}MB` : `${maxBufferSize/1024}KB`} limit`}
          calculateSpeedup={(bun: number, node: number) => node / bun}
        />
      )}

      <CodeBlock
        code={bufferExample}
        language="javascript"
        onCopy={() => onCopyCode(bufferExample)}
      />

      <div className="security-note">
        <h4>🛡️ Security Feature</h4>
        <p>Essential when running untrusted commands or processing user input. Prevents DoS attacks through memory exhaustion.</p>
      </div>
    </div>
  );
});

// Socket Tab
const SocketTab = React.memo(({ socketInfo, onCopyCode }: any) => {
  const socketExample = `import { connect } from "bun";

const socket = await connect({
  hostname: "example.com",
  port: 80,
});

// Complete network visibility
console.log({
  localAddress: socket.localAddress,    // "${socketInfo.localAddress}"
  localPort: socket.localPort,          // ${socketInfo.localPort}
  localFamily: socket.localFamily,      // "${socketInfo.localFamily}"
  remoteAddress: socket.remoteAddress,  // "${socketInfo.remoteAddress}"
  remotePort: socket.remotePort,        // ${socketInfo.remotePort}
  remoteFamily: socket.remoteFamily,    // "${socketInfo.remoteFamily}"
});`;

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>Enhanced Socket Information</h3>
        <p>Complete visibility into both ends of socket connections. Essential for debugging and network diagnostics.</p>
      </div>

      <SocketDiagnostics info={socketInfo} />

      <CodeBlock
        code={socketExample}
        language="javascript"
        onCopy={() => onCopyCode(socketExample, 'Socket example copied!')}
      />

      <div className="socket-benefits">
        <h4>Network Debugging Features</h4>
        <ul>
          <li>✅ Local and remote address information</li>
          <li>✅ IPv4/IPv6 family detection</li>
          <li>✅ Port number visibility</li>
          <li>✅ Real-time connection diagnostics</li>
        </ul>
      </div>
    </div>
  );
});

// Streams Tab
const StreamsTab = React.memo(({
  isRunning,
  benchmarkResults,
  runBenchmark,
  onCopyCode
}: any) => {
  const streamsExample = `import { spawn } from "bun";

// Pipe fetch response directly to process
const response = await fetch("https://api.example.com/large-data.json");

const proc = spawn({
  cmd: ["jq", ".users"], // Extract users array
  stdin: response.body,  // Stream directly from fetch
  stdout: "pipe",
});

// Process large data without loading into memory
const result = await new Response(proc.stdout).text();`;

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>Pipe Streams to Processes</h3>
        <p>Stream data directly from HTTP requests to processes without loading into memory. Perfect for large datasets.</p>
      </div>

      <div className="stream-demo">
        <div className="demo-visualization">
          <div className="stream-flow">
            <div className="stream-node">
              <span>🌐</span>
              <label>HTTP Response</label>
            </div>
            <div className="stream-arrow">→</div>
            <div className="stream-node">
              <span>⚡</span>
              <label>jq Process</label>
            </div>
            <div className="stream-arrow">→</div>
            <div className="stream-node">
              <span>📊</span>
              <label>Filtered Data</label>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => runBenchmark('streams')}
        disabled={isRunning}
        className="benchmark-button primary"
      >
        {isRunning ? (
          <>
            <div className="spinner"></div>
            <span>Testing Streams...</span>
          </>
        ) : (
          <span>Run Stream Benchmark</span>
        )}
      </button>

      {benchmarkResults && (
        <BenchmarkCard
          title="Stream Processing"
          bunResult={benchmarkResults.bun}
          nodeResult={benchmarkResults.node}
          memory={benchmarkResults.memory}
          description="Zero-copy stream piping"
          calculateSpeedup={(bun: number, node: number) => node / bun}
        />
      )}

      <CodeBlock
        code={streamsExample}
        language="javascript"
        onCopy={() => onCopyCode(streamsExample, 'Stream example copied!')}
      />

      <div className="performance-note">
        <h4>🚀 Zero-Copy Performance</h4>
        <p>Data flows directly from HTTP response to process without intermediate buffering. Handles GB-scale datasets efficiently.</p>
      </div>
    </div>
  );
});

// Memory Tab
const MemoryTab = React.memo(({
  processStats: _processStats,
  isRunning,
  benchmarkResults,
  runBenchmark
}: any) => {
  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>Memory Optimizations</h3>
        <p>Dramatic memory usage reductions across the runtime. Up to 30% less memory usage in real applications.</p>
      </div>

      <div className="memory-improvements">
        <div className="improvement-grid">
          <div className="improvement-card">
            <div className="improvement-header">
              <span className="improvement-icon">🚀</span>
              <span className="improvement-title">Next.js</span>
            </div>
            <div className="improvement-value">-28%</div>
            <div className="improvement-desc">Memory usage</div>
          </div>

          <div className="improvement-card">
            <div className="improvement-header">
              <span className="improvement-icon">⚡</span>
              <span className="improvement-title">Elysia</span>
            </div>
            <div className="improvement-value">-11%</div>
            <div className="improvement-desc">Memory usage</div>
          </div>

          <div className="improvement-card">
            <div className="improvement-header">
              <span className="improvement-icon">🔄</span>
              <span className="improvement-title">Startup</span>
            </div>
            <div className="improvement-value">-3MB</div>
            <div className="improvement-desc">Baseline memory</div>
          </div>
        </div>
      </div>

      <button
        onClick={() => runBenchmark('memory')}
        disabled={isRunning}
        className="benchmark-button success"
      >
        {isRunning ? (
          <>
            <div className="spinner"></div>
            <span>Testing Memory...</span>
          </>
        ) : (
          <span>Run Memory Benchmark</span>
        )}
      </button>

      {benchmarkResults && (
        <BenchmarkCard
          title="Memory Efficiency"
          bunResult={benchmarkResults.bun}
          nodeResult={benchmarkResults.node}
          memory={benchmarkResults.memory}
          description="Memory usage comparison"
          calculateSpeedup={(bun: number, node: number) => node / bun}
        />
      )}
    </div>
  );
});
