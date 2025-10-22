// components/TestingDebuggingArsenal/ui/LiveTestingDemo.tsx
import clsx from 'clsx';
import { useState } from 'react';

export function LiveTestingDemo() {
  const [activeDemo, setActiveDemo] = useState<'concurrent' | 'performance' | 'mocks'>('concurrent');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<Array<{name: string, status: 'pass' | 'fail' | 'running', time: number}>>([]);

  const runConcurrentDemo = () => {
    setIsRunning(true);
    const initialResults = [
      { name: 'API Test 1', status: 'running' as const, time: 0 },
      { name: 'API Test 2', status: 'running' as const, time: 0 },
      { name: 'API Test 3', status: 'running' as const, time: 0 },
      { name: 'Database Test', status: 'running' as const, time: 0 }
    ];
    setTestResults(initialResults);

    // Simulate concurrent test execution with different completion times
    const timeouts = initialResults.map((_, index) => {
      const delay = Math.random() * 1000 + 500; // 500-1500ms
      return setTimeout(() => {
        setTestResults(prev => prev.map((test, i) =>
          i === index
            ? {
                ...test,
                status: Math.random() > 0.2 ? 'pass' : 'fail',
                time: Math.random() * 100 + 50 // 50-150ms
              }
            : test
        ));

        if (index === initialResults.length - 1) {
          setIsRunning(false);
        }
      }, delay);
    });

    // Cleanup timeouts if component unmounts
    return () => timeouts.forEach(clearTimeout);
  };

  return (
    <div className="live-testing-demo">
      <h4 className="demo-title">Live Testing Demo</h4>

      <div className="demo-tabs">
        <button
          onClick={() => setActiveDemo('concurrent')}
          className={clsx(
            'demo-tab-button',
            activeDemo === 'concurrent' ? 'active' : ''
          )}
        >
          ⚡ Concurrent
        </button>
        <button
          onClick={() => setActiveDemo('performance')}
          className={clsx(
            'demo-tab-button',
            activeDemo === 'performance' ? 'active' : ''
          )}
        >
          📊 Performance
        </button>
        <button
          onClick={() => setActiveDemo('mocks')}
          className={clsx(
            'demo-tab-button',
            activeDemo === 'mocks' ? 'active' : ''
          )}
        >
          🎭 Mocks
        </button>
      </div>

      {activeDemo === 'concurrent' && (
        <div className="demo-content concurrent-demo">
          <div className="demo-description">Concurrent Test Execution</div>
          <button
            onClick={runConcurrentDemo}
            disabled={isRunning}
            className="run-demo-button concurrent-run"
          >
            {isRunning ? 'Running Tests...' : 'Run Concurrent Tests'}
          </button>

          <div className="test-results">
            {testResults.map((test, idx) => (
              <div key={idx} className="test-result-item">
                <span className="test-name">{test.name}</span>
                <div className="test-status">
                  {test.status === 'running' && <span className="status-running">⏳</span>}
                  {test.status === 'pass' && <span className="status-pass">✅</span>}
                  {test.status === 'fail' && <span className="status-fail">❌</span>}
                  <span className="test-time">
                    {test.status === 'running' ? '...' : `${test.time.toFixed(0)}ms`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeDemo === 'performance' && (
        <div className="demo-content performance-demo">
          <div className="demo-description">Performance Comparison</div>
          <div className="performance-results">
            {[
              { name: 'Serial Tests', time: 1250, speedup: 1.0 },
              { name: 'Concurrent (4)', time: 320, speedup: 3.9 },
              { name: 'Concurrent (8)', time: 180, speedup: 6.9 },
              { name: 'Concurrent (16)', time: 110, speedup: 11.4 }
            ].map((result, idx) => (
              <div key={idx} className="performance-item">
                <span className="performance-name">{result.name}</span>
                <div className="performance-metrics">
                  <div className="performance-time">{result.time}ms</div>
                  <div className="performance-speedup">{result.speedup.toFixed(1)}× faster</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeDemo === 'mocks' && (
        <div className="demo-content mocks-demo">
          <div className="demo-description">Mock Function Tracking</div>
          <div className="mock-results">
            {[
              { name: 'toHaveReturnedWith', calls: 3, status: 'pass' },
              { name: 'toHaveLastReturnedWith', calls: 1, status: 'pass' },
              { name: 'toHaveNthReturnedWith(2)', calls: 2, status: 'pass' }
            ].map((mock, idx) => (
              <div key={idx} className="mock-item">
                <span className="mock-name">{mock.name}</span>
                <div className="mock-status">
                  <span className="mock-calls">{mock.calls} calls</span>
                  <span className="status-pass">✅</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
