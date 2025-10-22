// components/TestingDebuggingArsenal/index.tsx
import clsx from 'clsx';
import { useCallback } from 'react';
import { generateAsyncStackCode, generateConcurrentCode, generateCoverageCode, generateMatcherCode, generateMockCode, generateRandomizeCode, generateTypeTestCode, useTestingDebuggingArsenal } from './hooks/useTestingDebuggingArsenal';
import './styles.css';
import { LiveTestingDemo } from './ui/LiveTestingDemo';

export function TestingDebuggingArsenal() {
  const {
    tab,
    setTab,
    asyncExample: _asyncExample,
    setAsyncExample: _setAsyncExample,
    concurrentConfig,
    setConcurrentConfig,
    mockConfig,
    setMockConfig
  } = useTestingDebuggingArsenal();

  const tabs = [
    { id: 'async', label: 'Async Traces', color: 'blue', icon: '📋' },
    { id: 'concurrent', label: 'Concurrent', color: 'green', icon: '⚡' },
    { id: 'matchers', label: 'Matchers', color: 'purple', icon: '🎯' },
    { id: 'types', label: 'Type Tests', color: 'orange', icon: '🔧' },
    { id: 'mocks', label: 'Mocks', color: 'red', icon: '🎭' }
  ];

  const handleConcurrentChange = useCallback((key: string, value: any) => {
    setConcurrentConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleMockChange = useCallback((key: string, value: any) => {
    setMockConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const copyToClipboard = useCallback(async (text: string, message = 'Copied to clipboard!') => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        console.log(message);
      } else {
        console.warn('Clipboard not available in this environment');
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  return (
    <div className="testing-debugging-arsenal">
      {/* Header */}
      <div className="arsenal-header">
        <div className="header-content">
          <div className="header-icon">
            <span>🧪</span>
          </div>
          <div>
            <h2>Testing & Debugging Arsenal</h2>
            <div className="live-metrics">
              <span>v1.3 Complete Arsenal</span>
            </div>
          </div>
        </div>
        <div className="header-badge">
          VS Code Ready
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={clsx(
              'tab-button',
              tab === t.id ? `active ${t.color}` : ''
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* ----------  ASYNC STACK TRACES TAB  ---------- */}
        {tab === 'async' && (
          <div className="tab-panel async-panel">
            <div className="panel-header">
              <h3>Async Stack Traces</h3>
              <p>Full async call history preserved in JavaScriptCore</p>
            </div>

            <div className="content-section">
              <h4 className="section-title">Example Code</h4>
              <div className="code-block">
                <pre className="code-content async-code">
                  {generateAsyncStackCode()}
                </pre>
                <button
                  onClick={() => copyToClipboard(generateAsyncStackCode(), 'Async example copied!')}
                  className="copy-button async-copy"
                >
                  Copy Async Example
                </button>
              </div>
            </div>

            <div className="content-section">
              <h4 className="section-title">Sample Output</h4>
              <div className="sample-output">
                <div className="error-output">error: oops</div>
                <div className="stack-trace">      at baz (async.js:11:9)</div>
                <div className="stack-trace">      at async bar (async.js:6:16)</div>
                <div className="stack-trace">      at async foo (async.js:2:16)</div>
              </div>
            </div>

            <div className="feature-grid">
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span>WebKit integration</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span>Real async functions</span>
              </div>
            </div>
          </div>
        )}

        {/* ----------  CONCURRENT TESTING TAB  ---------- */}
        {tab === 'concurrent' && (
          <div className="tab-panel concurrent-panel">
            <div className="panel-header">
              <h3>Concurrent Testing</h3>
              <p>Run tests in parallel with configurable concurrency</p>
            </div>

            <div className="config-section">
              <div className="config-row">
                <label className="config-label">Max Concurrency</label>
                <input
                  type="number"
                  value={concurrentConfig.maxConcurrency}
                  onChange={(e) => handleConcurrentChange('maxConcurrency', parseInt(e.target.value))}
                  className="config-input"
                  min="1"
                  max="100"
                />
              </div>

              <div className="config-row">
                <label className="config-checkbox">
                  <input
                    type="checkbox"
                    checked={concurrentConfig.randomize}
                    onChange={(e) => handleConcurrentChange('randomize', e.target.checked)}
                    className="checkbox-input"
                  />
                  <span>Randomize test order</span>
                </label>
              </div>

              <div className="config-row">
                <label className="config-label">Seed (optional)</label>
                <input
                  type="text"
                  value={concurrentConfig.seed}
                  onChange={(e) => handleConcurrentChange('seed', e.target.value)}
                  placeholder="Leave empty for random"
                  className="config-input"
                />
              </div>

              <div className="config-row">
                <label className="config-label">Concurrent Test Glob</label>
                <input
                  type="text"
                  value={concurrentConfig.testGlob}
                  onChange={(e) => handleConcurrentChange('testGlob', e.target.value)}
                  className="config-input"
                />
              </div>
            </div>

            <div className="content-section">
              <h4 className="section-title">Concurrent Test Code</h4>
              <div className="code-block">
                <pre className="code-content concurrent-code">
                  {generateConcurrentCode(concurrentConfig)}
                </pre>
                <button
                  onClick={() => copyToClipboard(generateConcurrentCode(concurrentConfig), 'Concurrent example copied!')}
                  className="copy-button concurrent-copy"
                >
                  Copy Concurrent Example
                </button>
              </div>
            </div>

            <div className="content-section">
              <h4 className="section-title">CLI Commands</h4>
              <div className="cli-output">
                {generateRandomizeCode(concurrentConfig)}
              </div>
            </div>
          </div>
        )}

        {/* ----------  MATCHERS TAB  ---------- */}
        {tab === 'matchers' && (
          <div className="tab-panel matchers-panel">
            <div className="panel-header">
              <h3>New Matchers & Snapshots</h3>
              <p>Enhanced assertions and inline snapshots</p>
            </div>

            <div className="content-section">
              <h4 className="section-title">Mock Return Matchers</h4>
              <div className="matcher-grid">
                <div className="matcher-card">
                  <div className="matcher-name">toHaveReturnedWith</div>
                  <div className="matcher-desc">Check any return value</div>
                </div>
                <div className="matcher-card">
                  <div className="matcher-name">toHaveLastReturnedWith</div>
                  <div className="matcher-desc">Check last return value</div>
                </div>
                <div className="matcher-card">
                  <div className="matcher-name">toHaveNthReturnedWith</div>
                  <div className="matcher-desc">Check nth return value</div>
                </div>
              </div>
            </div>

            <div className="content-section">
              <h4 className="section-title">Matcher Code</h4>
              <div className="code-block">
                <pre className="code-content matcher-code">
                  {generateMatcherCode()}
                </pre>
                <button
                  onClick={() => copyToClipboard(generateMatcherCode(), 'Matcher example copied!')}
                  className="copy-button matcher-copy"
                >
                  Copy Matcher Example
                </button>
              </div>
            </div>

            <div className="content-section">
              <h4 className="section-title">Indented Inline Snapshots</h4>
              <div className="snapshot-example">
                <div className="snapshot-code">
                  {`expect(user).toMatchInlineSnapshot(\`
  {{
    "name": "Alice",
    "age": 30,
    "email": "alice@example.com",
  }}
\`);`}
                </div>
              </div>
              <p className="snapshot-desc">Automatically matches your code indentation</p>
            </div>
          </div>
        )}

        {/* ----------  TYPE TESTING TAB  ---------- */}
        {tab === 'types' && (
          <div className="tab-panel types-panel">
            <div className="panel-header">
              <h3>Type Testing</h3>
              <p>Test TypeScript types alongside unit tests</p>
            </div>

            <div className="content-section">
              <h4 className="section-title">expectTypeOf API</h4>
              <div className="type-grid">
                <div className="type-feature">
                  <span className="type-check">✓</span>
                  <span>toEqualTypeOf</span>
                </div>
                <div className="type-feature">
                  <span className="type-check">✓</span>
                  <span>toHaveProperty</span>
                </div>
                <div className="type-feature">
                  <span className="type-check">✓</span>
                  <span>resolves.toBeNumber</span>
                </div>
                <div className="type-feature">
                  <span className="type-check">✓</span>
                  <span>Type-safe assertions</span>
                </div>
              </div>
            </div>

            <div className="content-section">
              <h4 className="section-title">Type Test Code</h4>
              <div className="code-block">
                <pre className="code-content type-code">
                  {generateTypeTestCode()}
                </pre>
                <button
                  onClick={() => copyToClipboard(generateTypeTestCode(), 'Type test copied!')}
                  className="copy-button type-copy"
                >
                  Copy Type Test
                </button>
              </div>
            </div>

            <div className="content-section">
              <h4 className="section-title">Verification Command</h4>
              <div className="verification-cmd">
                bunx tsc --noEmit
              </div>
            </div>
          </div>
        )}

        {/* ----------  MOCKS TAB  ---------- */}
        {tab === 'mocks' && (
          <div className="tab-panel mocks-panel">
            <div className="panel-header">
              <h3>Mock Improvements</h3>
              <p>Enhanced mock clearing and return value testing</p>
            </div>

            <div className="config-section">
              <div className="config-grid">
                <div className="config-row">
                  <label className="config-label">Return Value</label>
                  <input
                    type="number"
                    value={mockConfig.returnValue}
                    onChange={(e) => handleMockChange('returnValue', parseInt(e.target.value))}
                    className="config-input"
                  />
                </div>
                <div className="config-row">
                  <label className="config-label">Call Count</label>
                  <input
                    type="number"
                    value={mockConfig.callCount}
                    onChange={(e) => handleMockChange('callCount', parseInt(e.target.value))}
                    className="config-input"
                  />
                </div>
              </div>

              <div className="config-row">
                <label className="config-label">Nth Call to Check</label>
                <input
                  type="number"
                  value={mockConfig.nthCall}
                  onChange={(e) => handleMockChange('nthCall', parseInt(e.target.value))}
                  className="config-input"
                  min="1"
                />
              </div>
            </div>

            <div className="content-section">
              <h4 className="section-title">Mock Code</h4>
              <div className="code-block">
                <pre className="code-content mock-code">
                  {generateMockCode(mockConfig)}
                </pre>
                <button
                  onClick={() => copyToClipboard(generateMockCode(mockConfig), 'Mock example copied!')}
                  className="copy-button mock-copy"
                >
                  Copy Mock Example
                </button>
              </div>
            </div>

            <div className="content-section">
              <h4 className="section-title">Coverage Configuration</h4>
              <div className="coverage-config">
                {generateCoverageCode()}
              </div>
            </div>
          </div>
        )}

        {/* ----------  VS CODE INTEGRATION  ---------- */}
        <div className="integration-section vscode-integration">
          <div className="integration-content">
            <span className="integration-icon">🚀</span>
            <div>
              <h4>VS Code Test Explorer</h4>
              <p>
                Install "Bun for Visual Studio Code" extension for sidebar integration, inline error messages, and one-click test execution
              </p>
            </div>
          </div>
        </div>

        {/* ----------  CI/CD INTEGRATION  ---------- */}
        <div className="integration-section ci-integration">
          <div className="integration-content">
            <span className="integration-icon">🔄</span>
            <div>
              <h4>CI/CD Safety</h4>
              <p>
                Automatic errors on test.only() and new snapshots without --update-snapshots flag in CI environments
              </p>
            </div>
          </div>
        </div>

        {/* ----------  LIVE TESTING DEMO  ---------- */}
        <LiveTestingDemo />
      </div>
    </div>
  );
}
