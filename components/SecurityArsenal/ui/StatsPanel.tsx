// components/SecurityArsenal/ui/StatsPanel.tsx
interface StatsPanelProps {
  stats: {
    totalScans: number;
    avgVulnerabilities: number;
    criticalTrend: number;
    lastScan: number | null;
  };
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const trendIcon = stats.criticalTrend < 0 ? '📈' : stats.criticalTrend > 0 ? '📉' : '➖';
  const trendColor = stats.criticalTrend < 0 ? 'trend-up' : stats.criticalTrend > 0 ? 'trend-down' : 'trend-neutral';

  return (
    <div className="stats-panel">
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalScans}</div>
          <div className="stat-label">Total Scans</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📉</div>
        <div className="stat-content">
          <div className="stat-value">{stats.avgVulnerabilities}</div>
          <div className="stat-label">Avg Vulnerabilities</div>
        </div>
      </div>

      <div className={`stat-card ${trendColor}`}>
        <div className="stat-icon">{trendIcon}</div>
        <div className="stat-content">
          <div className="stat-value">
            {stats.criticalTrend > 0 ? '+' : ''}{stats.criticalTrend}
          </div>
          <div className="stat-label">Critical Trend</div>
        </div>
      </div>

      {stats.lastScan && (
        <div className="stat-card">
          <div className="stat-icon">🕒</div>
          <div className="stat-content">
            <div className="stat-value-small">
              {new Date(stats.lastScan).toLocaleDateString()}
            </div>
            <div className="stat-label">Last Scan</div>
          </div>
        </div>
      )}
    </div>
  );
}
