// components/ProcessShellArsenal/ui/ProcessMonitor.tsx

interface ProcessMonitorProps {
  stats: {
    memoryUsage: number;
    cpuUsage: number;
    activeProcesses: number;
  };
}

export function ProcessMonitor({ stats }: ProcessMonitorProps) {
  return (
    <div className="process-monitor">
      <div className="monitor-header">
        <span>📊</span>
        <span>Live Process Stats</span>
      </div>

      <div className="monitor-stats">
        <div className="stat-item">
          <div className="stat-label">Memory</div>
          <div className="stat-bar">
            <div
              className="stat-fill memory"
              style={{ width: `${stats.memoryUsage}%` }}
            />
          </div>
          <div className="stat-value">{stats.memoryUsage.toFixed(1)}%</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">CPU</div>
          <div className="stat-bar">
            <div
              className="stat-fill cpu"
              style={{ width: `${stats.cpuUsage}%` }}
            />
          </div>
          <div className="stat-value">{stats.cpuUsage.toFixed(1)}%</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Processes</div>
          <div className="stat-number">{stats.activeProcesses}</div>
        </div>
      </div>
    </div>
  );
}
