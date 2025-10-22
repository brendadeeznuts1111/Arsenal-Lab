// components/TestingArsenal/index.tsx
import { useCallback, useState } from 'react';
import { CodeBlock } from '../PerformanceArsenal/ui/CodeBlock';
import { HardwareWarning } from '../PerformanceArsenal/ui/HardwareWarning';
import { TabBar } from '../PerformanceArsenal/ui/TabBar';
import { Toast, useToaster } from '../PerformanceArsenal/ui/Toast';
import { useTestExecution } from './hooks/useTestExecution';
import { useTestMetrics } from './hooks/useTestMetrics';
import './styles.css';
import { CIDemo } from './ui/CIDemo';
import { ConcurrentTestDemo } from './ui/ConcurrentTestDemo';
import { MockTestDemo } from './ui/MockTestDemo';
import { StackTraceDemo } from './ui/StackTraceDemo';
import { TestMetrics } from './ui/TestMetrics';
import { TestResults } from './ui/TestResults';
import { TypeTestDemo } from './ui/TypeTestDemo';

export function TestingArsenal() {
  const [tab, setTab] = useState<'overview' | 'async' | 'concurrent' | 'types' | 'mocks' | 'snapshots' | 'ci'>('overview');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const { toasts, showToast, dismissToast } = useToaster();
  const { executeTest, executeTestSuite: _executeTestSuite } = useTestExecution();
  const { metrics: _metrics, recordTestResult, getSummary } = useTestMetrics();

  const tabs = [
    { id: 'overview' as const, label: 'Overview', color: 'blue', icon: '📊' },
    { id: 'async' as const, label: 'Async Traces', color: 'green', icon: '🔄' },
    { id: 'concurrent' as const, label: 'Concurrent', color: 'purple', icon: '⚡' },
    { id: 'types' as const, label: 'Type Testing', color: 'indigo', icon: '🔷' },
    { id: 'mocks' as const, label: 'Mocks', color: 'red', icon: '🎭' },
    { id: 'snapshots' as const, label: 'Snapshots', color: 'orange', icon: '📸' },
    { id: 'ci' as const, label: 'CI/CD', color: 'gray', icon: '🚀' }
  ];

  const runTest = useCallback(async (testName: string, testCode: string) => {
    setIsRunning(true);
    const startTime = performance.now();

    try {
      const result = await executeTest(testName, testCode);
      const duration = performance.now() - startTime;

      const testResult = {
        name: testName,
        duration,
        passed: result.passed,
        error: result.error,
        output: result.output,
        timestamp: Date.now()
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10
      recordTestResult(testResult);

      if (result.passed) {
        showToast(`✅ ${testName} passed in ${duration.toFixed(2)}ms`, 'success');
      } else {
        showToast(`❌ ${testName} failed`, 'error');
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      const testResult = {
        name: testName,
        duration,
        passed: false,
        error: (error as Error).message,
        timestamp: Date.now()
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]);
      recordTestResult(testResult);
      showToast(`❌ ${testName} failed: ${(error as Error).message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  }, [executeTest, recordTestResult, showToast]);

  const runTestSuite = useCallback(async (suiteName: string, tests: Array<{name: string, code: string}>) => {
    setIsRunning(true);
    showToast(`🧪 Running ${suiteName} suite...`, 'info');

    const results = [];
    for (const test of tests) {
      const startTime = performance.now();
      try {
        const result = await executeTest(test.name, test.code);
        const duration = performance.now() - startTime;

        const testResult = {
          name: test.name,
          duration,
          passed: result.passed,
          error: result.error,
          output: result.output,
          timestamp: Date.now()
        };

        results.push(testResult);
        recordTestResult(testResult);
      } catch (error) {
        const duration = performance.now() - startTime;
        results.push({
          name: test.name,
          duration,
          passed: false,
          error: (error as Error).message,
          timestamp: Date.now()
        });
      }
    }

    setTestResults(prev => [...results, ...prev.slice(0, 10 - results.length)]);
    setIsRunning(false);

    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    showToast(`🏁 ${suiteName}: ${passed}/${total} tests passed`, passed === total ? 'success' : 'warning');
  }, [executeTest, recordTestResult, showToast]);

  return (
    <div className="testing-arsenal">
      {/* Header */}
      <div className="arsenal-header">
        <div className="header-content">
          <div className="header-icon">
            <span>🧪</span>
          </div>
          <div>
            <h2>Testing Arsenal</h2>
            <p>Bun 1.3 Test Runner Features</p>
          </div>
        </div>
        <div className="header-badge">
          Advanced Testing
        </div>
      </div>

      {/* Hardware Warning */}
      <HardwareWarning hardwareInfo={{ cores: navigator.hardwareConcurrency || 4, isLowEnd: false, memory: 'Unknown' }} />

      {/* Tab Bar */}
      <TabBar tabs={tabs} activeTab={tab} onTabChange={(tabId) => setTab(tabId as 'overview' | 'async' | 'concurrent' | 'types' | 'mocks' | 'snapshots' | 'ci')} />

      {/* Tab Content */}
      <div className="tab-content">
        {tab === 'overview' && (
          <OverviewTab
            metrics={getSummary()}
            onRunTest={runTest}
            testResults={testResults.slice(0, 5)}
          />
        )}

        {tab === 'async' && (
          <StackTraceDemo onRunTest={runTest} />
        )}

        {tab === 'concurrent' && (
          <ConcurrentTestDemo onRunTest={runTest} onRunSuite={runTestSuite} />
        )}

        {tab === 'types' && (
          <TypeTestDemo onRunTest={runTest} />
        )}

        {tab === 'mocks' && (
          <MockTestDemo onRunTest={runTest} />
        )}

        {tab === 'snapshots' && (
          <SnapshotDemo onRunTest={runTest} />
        )}

        {tab === 'ci' && (
          <CIDemo onRunTest={runTest} />
        )}
      </div>

      {/* Test Results Sidebar */}
      <TestResults results={testResults} isRunning={isRunning} />

      {/* Test Metrics */}
      <TestMetrics metrics={getSummary()} />

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

// Overview Tab
const OverviewTab = ({ metrics, onRunTest: _onRunTest, testResults }: any) => {
  const overviewCode = `import { test, expect } from "bun:test";

// Bun 1.3 Testing Features Overview
test("Bun 1.3 brings powerful testing capabilities", () => {
  expect(true).toBe(true);
});

// ✅ Async stack traces
// ✅ VS Code integration
// ✅ Concurrent testing
// ✅ Type testing
// ✅ Advanced mocking
// ✅ Inline snapshots
// ✅ CI/CD integration`;

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>Bun 1.3 Testing Arsenal</h3>
        <p>Explore the most advanced testing features in Bun 1.3. From async stack traces to concurrent testing, type checking, and CI/CD integration.</p>
      </div>

      <div className="overview-grid">
        <div className="feature-card">
          <h4>🔄 Async Stack Traces</h4>
          <p>Rich error traces for async functions with full call stack preservation.</p>
          <button onClick={() => {}} className="feature-btn">Try Async Demo</button>
        </div>

        <div className="feature-card">
          <h4>⚡ Concurrent Testing</h4>
          <p>Run multiple async tests simultaneously for faster execution.</p>
          <button onClick={() => {}} className="feature-btn">Try Concurrent</button>
        </div>

        <div className="feature-card">
          <h4>🔷 Type Testing</h4>
          <p>Test TypeScript types alongside runtime behavior.</p>
          <button onClick={() => {}} className="feature-btn">Try Types</button>
        </div>

        <div className="feature-card">
          <h4>🎭 Advanced Mocks</h4>
          <p>New matchers for testing mock return values.</p>
          <button onClick={() => {}} className="feature-btn">Try Mocks</button>
        </div>

        <div className="feature-card">
          <h4>📸 Smart Snapshots</h4>
          <p>Indented inline snapshots with automatic formatting.</p>
          <button onClick={() => {}} className="feature-btn">Try Snapshots</button>
        </div>

        <div className="feature-card">
          <h4>🚀 CI/CD Integration</h4>
          <p>Stricter CI mode with better error reporting.</p>
          <button onClick={() => {}} className="feature-btn">Try CI</button>
        </div>
      </div>

      <div className="metrics-overview">
        <h4>Test Metrics</h4>
        <div className="metrics-stats">
          <div className="metric">Total Tests: <strong>{metrics.totalTests}</strong></div>
          <div className="metric">Passed: <strong className="success">{metrics.passed}</strong></div>
          <div className="metric">Failed: <strong className="error">{metrics.failed}</strong></div>
          <div className="metric">Avg Duration: <strong>{metrics.avgDuration.toFixed(2)}ms</strong></div>
        </div>
      </div>

      <CodeBlock
        code={overviewCode}
        language="javascript"
        onCopy={() => {}}
      />

      {testResults.length > 0 && (
        <div className="recent-tests">
          <h4>Recent Test Results</h4>
          <div className="test-list">
            {testResults.map((result, index) => (
              <div key={index} className={`test-item ${result.passed ? 'passed' : 'failed'}`}>
                <span className="test-name">{result.name}</span>
                <span className="test-duration">{result.duration.toFixed(2)}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Snapshot Demo Tab
const SnapshotDemo = ({ onRunTest }: any) => {
  const snapshotCode = `import { test, expect } from "bun:test";

test("indented inline snapshots", () => {
  const user = {
    name: "Alice",
    age: 30,
    email: "alice@example.com"
  };

  expect(user).toMatchInlineSnapshot(\`
    {
      "name": "Alice",
      "age": 30,
      "email": "alice@example.com",
    }
  \`);
});

// ✅ Automatic indentation detection
// ✅ Preserves code formatting
// ✅ Works with nested objects`;

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>Smart Inline Snapshots</h3>
        <p>Bun 1.3 automatically detects and preserves indentation in inline snapshots, making them more readable and maintainable.</p>
      </div>

      <div className="snapshot-features">
        <div className="feature-item">
          <h5>🔍 Automatic Indentation</h5>
          <p>Snapshots automatically match your code's indentation level.</p>
        </div>
        <div className="feature-item">
          <h5>📝 Formatting Preservation</h5>
          <p>Complex objects maintain their structure and readability.</p>
        </div>
        <div className="feature-item">
          <h5>🎯 Jest Compatibility</h5>
          <p>Works exactly like Jest's inline snapshots.</p>
        </div>
      </div>

      <button
        onClick={() => onRunTest('Snapshot Test', snapshotCode)}
        className="benchmark-button primary"
      >
        Run Snapshot Test
      </button>

      <CodeBlock
        code={snapshotCode}
        language="javascript"
        onCopy={() => {}}
      />
    </div>
  );
};
