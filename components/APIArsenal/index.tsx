// components/APIArsenal/index.tsx - API Toolkit & Developer Tools
import React, { useState, useEffect } from 'react';
import './styles.css';

interface Identity {
  id: string;
  ttl: number;
  expires: string;
  metadata: {
    type: string;
    compatible: string[];
    prefix?: string;
    run?: string;
    environment?: string;
  };
}

interface APIArsenalProps {
  className?: string;
}

export function APIArsenal({ className = '' }: APIArsenalProps) {
  const [activeTab, setActiveTab] = useState<'toolkit' | 'developer' | 'identity'>('toolkit');
  const [apiResults, setApiResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = "http://localhost:3655";

  const tabs = [
    { id: 'toolkit' as const, label: 'API Toolkit', icon: '🛠️', description: 'Interactive API testing tools' },
    { id: 'developer' as const, label: 'Developer Tools', icon: '👨‍💻', description: 'Development utilities and helpers' },
    { id: 'identity' as const, label: 'v4 Identity System', icon: '🔐', description: 'Self-describing authentication' },
  ];

  const testEndpoint = async (endpoint: string, method: string = 'GET', body?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      setApiResults({ endpoint, method, status: response.status, data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setApiResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const runDemo = async (mode: 'live' | 'dry' | 'json') => {
    setIsLoading(true);
    setError(null);
    try {
      const command = mode === 'live' ? './demo.ts' :
                     mode === 'dry' ? './demo.ts --dry-run' :
                     './demo.ts --json --dry-run';

      // For demo purposes, we'll simulate the API calls
      if (mode === 'dry') {
        const mockIdentity: Identity = {
          id: "ci-123456789@api.dev.arsenal-lab.com/v1:id",
          ttl: 7200,
          expires: new Date(Date.now() + 7200000).toISOString(),
          metadata: {
            type: "disposable",
            compatible: ["nexus", "npm", "oidc"],
            prefix: "ci",
            run: "123456789"
          }
        };
        setApiResults({ command, mode, result: mockIdentity });
      } else if (mode === 'json') {
        const mockJson = [{
          type: "single_identity",
          data: {
            id: "ci-123456789@api.dev.arsenal-lab.com/v1:id",
            ttl: 7200,
            metadata: { type: "disposable", compatible: ["nexus", "npm", "oidc"] }
          }
        }];
        setApiResults({ command, mode, result: mockJson });
      } else {
        // Try live API call
        await testEndpoint('/api/v1/id?prefix=demo&run=' + Date.now());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`api-arsenal ${className}`}>
      <div className="arsenal-header">
        <h1 className="arsenal-title">🚀 API Arsenal</h1>
        <p className="arsenal-description">
          Enterprise-grade API toolkit with v4 identity system and developer tools
        </p>
      </div>

      <div className="arsenal-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            <span className="tab-description">{tab.description}</span>
          </button>
        ))}
      </div>

      <div className="arsenal-content">
        {activeTab === 'toolkit' && (
          <div className="toolkit-section">
            <h2>🛠️ API Testing Toolkit</h2>
            <p>Test and interact with Arsenal Lab APIs in real-time</p>

            <div className="api-endpoints">
              <div className="endpoint-group">
                <h3>Performance APIs</h3>
                <div className="endpoint-buttons">
                  <button onClick={() => testEndpoint('/api/performance/metrics')}>
                    GET /api/performance/metrics
                  </button>
                  <button onClick={() => testEndpoint('/api/performance/history?metric=memory&duration=60')}>
                    GET /api/performance/history
                  </button>
                  <button onClick={() => testEndpoint('/api/performance/alerts')}>
                    GET /api/performance/alerts
                  </button>
                  <button onClick={() => testEndpoint('/api/performance/benchmarks')}>
                    GET /api/performance/benchmarks
                  </button>
                </div>
              </div>

              <div className="endpoint-group">
                <h3>Health & Diagnostics</h3>
                <div className="endpoint-buttons">
                  <button onClick={() => testEndpoint('/api/health')}>
                    GET /api/health
                  </button>
                  <button onClick={() => testEndpoint('/api/diagnostics')}>
                    GET /api/diagnostics
                  </button>
                  <button onClick={() => testEndpoint('/api/telemetry')}>
                    GET /api/telemetry
                  </button>
                </div>
              </div>

              <div className="endpoint-group">
                <h3>v4 Identity APIs</h3>
                <div className="endpoint-buttons">
                  <button onClick={() => testEndpoint('/api/v1/id?prefix=test&run=123')}>
                    GET /api/v1/id
                  </button>
                  <button onClick={() => testEndpoint('/api/v1/identities', 'POST', {
                    environments: [{ name: 'test', prefix: 'test', run: '123' }],
                    domain: 'api.dev.arsenal-lab.com',
                    version: 'v1'
                  })}>
                    POST /api/v1/identities
                  </button>
                  <button onClick={() => testEndpoint('/api/v1/validate', 'POST', {
                    identity: 'test-123@api.dev.arsenal-lab.com/v1:id'
                  })}>
                    POST /api/v1/validate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'developer' && (
          <div className="developer-section">
            <h2>👨‍💻 Developer Tools</h2>
            <p>Utilities and helpers for API development and testing</p>

            <div className="developer-tools">
              <div className="tool-group">
                <h3>Command Line Tools</h3>
                <div className="tool-commands">
                  <div className="command-block">
                    <code>./demo.ts --dry-run</code>
                    <p>Offline identity system demo</p>
                  </div>
                  <div className="command-block">
                    <code>./demo.ts --json --dry-run</code>
                    <p>Machine-readable JSON output</p>
                  </div>
                  <div className="command-block">
                    <code>API_BASE_URL=https://prod-api.com ./demo.ts</code>
                    <p>Test production API endpoints</p>
                  </div>
                  <div className="command-block">
                    <code>bun run demo:v4-identity</code>
                    <p>Interactive identity demonstration</p>
                  </div>
                </div>
              </div>

              <div className="tool-group">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <button onClick={() => runDemo('dry')} disabled={isLoading}>
                    🧪 Run Dry Demo
                  </button>
                  <button onClick={() => runDemo('json')} disabled={isLoading}>
                    📊 Run JSON Demo
                  </button>
                  <button onClick={() => runDemo('live')} disabled={isLoading}>
                    🌐 Test Live API
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'identity' && (
          <div className="identity-section">
            <h2>🔐 v4 Identity System</h2>
            <p>Self-describing email identities for enterprise authentication</p>

            <div className="identity-overview">
              <div className="identity-concept">
                <h3>Core Concept</h3>
                <div className="identity-example">
                  <code>ci-123456789@api.dev.arsenal-lab.com/v1:id</code>
                  <div className="identity-breakdown">
                    <span className="part prefix">ci-123456789</span>@
                    <span className="part domain">api.dev.arsenal-lab.com</span>/
                    <span className="part version">v1</span>:
                    <span className="part type">id</span>
                  </div>
                </div>
              </div>

              <div className="identity-features">
                <h3>Key Features</h3>
                <ul>
                  <li>✅ <strong>Human-readable:</strong> Clear CI run identification</li>
                  <li>🏷️ <strong>Self-describing:</strong> API endpoint metadata</li>
                  <li>📧 <strong>RFC 5322 compliant:</strong> Nexus compatible</li>
                  <li>🚫 <strong>No domain ownership:</strong> Works anywhere</li>
                  <li>🔄 <strong>Disposable:</strong> TTL-based expiration</li>
                  <li>🧪 <strong>Air-gapped:</strong> Fallback generation</li>
                </ul>
              </div>

              <div className="identity-demo">
                <h3>Live Demo</h3>
                <div className="demo-controls">
                  <button onClick={() => runDemo('dry')} disabled={isLoading}>
                    🧪 Generate Identity
                  </button>
                  <button onClick={() => runDemo('json')} disabled={isLoading}>
                    📊 JSON Output
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Results Display */}
        {(apiResults || error || isLoading) && (
          <div className="api-results">
            <h3>📋 Results</h3>

            {isLoading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <span>Testing API endpoint...</span>
              </div>
            )}

            {error && (
              <div className="error-message">
                <span className="error-icon">❌</span>
                <span>{error}</span>
              </div>
            )}

            {apiResults && (
              <div className="results-content">
                <div className="result-header">
                  {apiResults.endpoint && (
                    <span className="endpoint">{apiResults.method} {apiResults.endpoint}</span>
                  )}
                  {apiResults.command && (
                    <span className="command">{apiResults.command}</span>
                  )}
                  {apiResults.status && (
                    <span className={`status ${apiResults.status === 200 ? 'success' : 'error'}`}>
                      Status: {apiResults.status}
                    </span>
                  )}
                </div>

                <pre className="result-json">
                  {JSON.stringify(apiResults.data || apiResults.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
