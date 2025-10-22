// components/SecurityArsenal/index.tsx
import { useState } from 'react';
import { useSecurityArsenal } from './hooks/useSecurityArsenal';
import './styles.css';
import { SeverityFilter } from './ui/SeverityFilter';
import { VulnerabilityCard } from './ui/VulnerabilityCard';
import { HistoryPanel } from './ui/HistoryPanel';
import { StatsPanel } from './ui/StatsPanel';

export function SecurityArsenal() {
  const {
    isScanning,
    auditResult,
    filteredVulnerabilities,
    filterSeverity,
    setFilterSeverity,
    prodOnly,
    setProdOnly,
    error,
    demoMode,
    toggleDemoMode,
    history,
    stats,
    clearHistory,
    loadHistoricalResult,
    runAudit,
    exportResults,
    exportPrometheus
  } = useSecurityArsenal();

  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="security-arsenal">
      {/* Header */}
      <div className="arsenal-header">
        <div className="header-content">
          <div className="header-icon">
            <span>🔒</span>
          </div>
          <div>
            <h2>Security Arsenal</h2>
            <p>Dependency Vulnerability Scanning</p>
          </div>
        </div>
        {auditResult && (
          <div className={`header-badge ${auditResult.metadata.critical > 0 ? 'critical' : auditResult.metadata.high > 0 ? 'high' : 'safe'}`}>
            {auditResult.metadata.total === 0 ? '✅ Secure' : `${auditResult.metadata.total} Issues`}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="security-controls">
        <div className="control-row">
          <div className="control-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={prodOnly}
                onChange={(e) => setProdOnly(e.target.checked)}
                disabled={isScanning}
              />
              <span>Production dependencies only</span>
            </label>
          </div>
          <div className="control-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={toggleDemoMode}
                disabled={isScanning}
              />
              <span>🎭 Demo Mode</span>
            </label>
          </div>
        </div>

        <div className="button-row">
          <button
            onClick={runAudit}
            disabled={isScanning}
            className="scan-button primary"
          >
            {isScanning ? (
              <>
                <div className="spinner"></div>
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>{demoMode ? 'Run Demo Scan' : 'Run Security Audit'}</span>
              </>
            )}
          </button>
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="history-toggle-btn"
            >
              📜 {showHistory ? 'Hide' : 'Show'} History ({history.length})
            </button>
          )}
        </div>
      </div>

      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="demo-banner">
          🎭 Demo Mode Active - Using sample vulnerability data for demonstration
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span>❌</span>
          <span>{error}</span>
          {error.includes('demo mode') && (
            <button onClick={toggleDemoMode} className="demo-mode-btn">
              Enable Demo Mode
            </button>
          )}
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <HistoryPanel
          history={history}
          onLoadResult={loadHistoricalResult}
          onClearHistory={clearHistory}
        />
      )}

      {/* Stats Panel */}
      {stats.totalScans > 0 && !showHistory && (
        <StatsPanel stats={stats} />
      )}

      {/* Results */}
      {auditResult && (
        <>
          {/* Summary */}
          <div className="security-summary">
            <div className="summary-card">
              <div className="summary-label">Total Scanned</div>
              <div className="summary-value">{auditResult.metadata.total}</div>
            </div>
            <div className="summary-card critical">
              <div className="summary-label">Critical</div>
              <div className="summary-value">{auditResult.metadata.critical}</div>
            </div>
            <div className="summary-card high">
              <div className="summary-label">High</div>
              <div className="summary-value">{auditResult.metadata.high}</div>
            </div>
            <div className="summary-card moderate">
              <div className="summary-label">Moderate</div>
              <div className="summary-value">{auditResult.metadata.moderate}</div>
            </div>
            <div className="summary-card low">
              <div className="summary-label">Low</div>
              <div className="summary-value">{auditResult.metadata.low}</div>
            </div>
          </div>

          {/* Severity Filter */}
          <SeverityFilter
            selected={filterSeverity}
            onChange={setFilterSeverity}
            counts={{
              all: auditResult.metadata.total,
              low: auditResult.metadata.low,
              moderate: auditResult.metadata.moderate,
              high: auditResult.metadata.high,
              critical: auditResult.metadata.critical
            }}
          />

          {/* Vulnerabilities List */}
          <div className="vulnerabilities-list">
            {filteredVulnerabilities.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <h3>No {filterSeverity !== 'all' ? filterSeverity : ''} vulnerabilities found</h3>
                <p>Your dependencies are secure at this severity level.</p>
              </div>
            ) : (
              <>
                <div className="list-header">
                  <h3>{filteredVulnerabilities.length} Vulnerabilities</h3>
                  <div className="export-buttons">
                    <button onClick={exportResults} className="export-btn">
                      📄 Export JSON
                    </button>
                    <button onClick={exportPrometheus} className="export-btn">
                      📊 Export Metrics
                    </button>
                  </div>
                </div>
                {filteredVulnerabilities.map((vuln, index) => (
                  <VulnerabilityCard key={`${vuln.cve}-${index}`} vulnerability={vuln} />
                ))}
              </>
            )}
          </div>

          {/* Timestamp */}
          <div className="scan-timestamp">
            Last scanned: {new Date(auditResult.timestamp).toLocaleString()}
          </div>
        </>
      )}

      {/* Initial State */}
      {!auditResult && !isScanning && !error && (
        <div className="initial-state">
          <div className="initial-icon">🔒</div>
          <h3>Ready to Scan</h3>
          <p>Click "Run Security Audit" to scan your dependencies for known vulnerabilities.</p>
          <div className="security-features">
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <span>Fast scanning with Bun</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔍</span>
              <span>NPM advisory database</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>Prometheus metrics export</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
