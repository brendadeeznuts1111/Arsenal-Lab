// components/TestingArsenal/ui/TestMetrics.tsx
import React from 'react';

interface TestMetricsProps {
  metrics: {
    totalTests: number;
    passed: number;
    failed: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    lastRunTime: number;
  };
}

export function TestMetrics({ metrics }: TestMetricsProps) {
  const successRate = metrics.totalTests > 0
    ? ((metrics.passed / metrics.totalTests) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="test-metrics-panel">
      <div className="metrics-header">
        <h4>Test Metrics</h4>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{metrics.totalTests}</div>
          <div className="metric-label">Total Tests</div>
        </div>

        <div className="metric-card success">
          <div className="metric-value">{metrics.passed}</div>
          <div className="metric-label">Passed</div>
        </div>

        <div className="metric-card error">
          <div className="metric-value">{metrics.failed}</div>
          <div className="metric-label">Failed</div>
        </div>

        <div className="metric-card info">
          <div className="metric-value">{successRate}%</div>
          <div className="metric-label">Success Rate</div>
        </div>
      </div>

      <div className="metrics-details">
        <div className="detail-row">
          <span>Average Duration:</span>
          <strong>{metrics.avgDuration.toFixed(2)}ms</strong>
        </div>
        <div className="detail-row">
          <span>Min Duration:</span>
          <strong>{metrics.minDuration.toFixed(2)}ms</strong>
        </div>
        <div className="detail-row">
          <span>Max Duration:</span>
          <strong>{metrics.maxDuration.toFixed(2)}ms</strong>
        </div>
        {metrics.lastRunTime > 0 && (
          <div className="detail-row">
            <span>Last Run:</span>
            <strong>{new Date(metrics.lastRunTime).toLocaleTimeString()}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
