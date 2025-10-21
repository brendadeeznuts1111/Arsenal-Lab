// components/PerformanceArsenal/ui/PerformanceDashboard.tsx
import React from 'react';

interface PerformanceDashboardProps {
  metrics: {
    longTasks: number;
    layoutShifts: number;
    memoryUsage: number;
    fps: number;
  };
  analytics: {
    totalRuns: number;
    averageDuration: number;
    byType: Record<string, number>;
    recentRuns: any[];
  };
  onRunBenchmark: (type: string) => void;
}

export function PerformanceDashboard({ metrics, analytics, onRunBenchmark }: PerformanceDashboardProps) {
  return (
    <div className="performance-dashboard">
      <div className="dashboard-grid">
        {/* Real-time Metrics */}
        <div className="metric-card">
          <h3>🔄 Real-time Performance</h3>
          <div className="metric-grid">
            <div className="metric">
              <span className="label">FPS</span>
              <span className="value">{metrics.fps}</span>
            </div>
            <div className="metric">
              <span className="label">Memory</span>
              <span className="value">{metrics.memoryUsage}MB</span>
            </div>
            <div className="metric">
              <span className="label">Long Tasks</span>
              <span className="value">{metrics.longTasks}</span>
            </div>
            <div className="metric">
              <span className="label">Layout Shifts</span>
              <span className="value">{metrics.layoutShifts}</span>
            </div>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="metric-card">
          <h3>📈 Benchmark Analytics</h3>
          <div className="analytics-grid">
            <div className="analytics-item">
              <span>Total Runs</span>
              <strong>{analytics.totalRuns || 0}</strong>
            </div>
            <div className="analytics-item">
              <span>Avg Duration</span>
              <strong>{analytics.averageDuration ? analytics.averageDuration.toFixed(2) + 'ms' : 'N/A'}</strong>
            </div>
            <div className="analytics-item">
              <span>postMessage Runs</span>
              <strong>{analytics.byType?.postmessage || 0}</strong>
            </div>
            <div className="analytics-item">
              <span>Registry Runs</span>
              <strong>{analytics.byType?.registry || 0}</strong>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="metric-card">
          <h3>⚡ Quick Benchmarks</h3>
          <div className="quick-actions">
            <button
              onClick={() => onRunBenchmark('postmessage')}
              className="quick-action-btn"
            >
              Test postMessage
            </button>
            <button
              onClick={() => onRunBenchmark('registry')}
              className="quick-action-btn"
            >
              Test Registry
            </button>
            <button
              onClick={() => onRunBenchmark('crypto')}
              className="quick-action-btn"
            >
              Test Crypto
            </button>
          </div>
        </div>

        {/* Hardware Info */}
        <div className="metric-card">
          <h3>🖥️ System Information</h3>
          <div className="system-info">
            <div className="info-item">
              <span>CPU Cores</span>
              <span>{navigator.hardwareConcurrency}</span>
            </div>
            <div className="info-item">
              <span>User Agent</span>
              <span className="truncate">{navigator.userAgent.split(' ')[0]}</span>
            </div>
            <div className="info-item">
              <span>Memory API</span>
              <span>{(performance as any).memory ? 'Available' : 'Unavailable'}</span>
            </div>
            <div className="info-item">
              <span>Workers</span>
              <span>{typeof Worker !== 'undefined' ? 'Supported' : 'Unsupported'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
