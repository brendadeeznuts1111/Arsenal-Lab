// components/ProcessShellArsenal/ui/MemoryChart.tsx

interface MemoryChartProps {
  stats: {
    memoryUsage: number;
    cpuUsage: number;
    activeProcesses: number;
  };
}

export function MemoryChart({ stats }: MemoryChartProps) {
  return (
    <div className="memory-chart">
      <div className="chart-header">
        <h4>Memory Usage Trends</h4>
      </div>

      <div className="chart-visualization">
        <div className="chart-bars">
          <div className="bar-group">
            <div className="bar-container">
              <div
                className="bar-fill memory-bar"
                style={{ height: `${stats.memoryUsage}%` }}
              />
            </div>
            <span className="bar-label">Current</span>
          </div>

          <div className="bar-group">
            <div className="bar-container">
              <div
                className="bar-fill baseline-bar"
                style={{ height: `${stats.memoryUsage * 0.7}%` }}
              />
            </div>
            <span className="bar-label">Bun v1.2</span>
          </div>

          <div className="bar-group">
            <div className="bar-container">
              <div
                className="bar-fill node-bar"
                style={{ height: `${stats.memoryUsage * 1.4}%` }}
              />
            </div>
            <span className="bar-label">Node.js</span>
          </div>
        </div>

        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color memory-bar"></div>
            <span>Bun v1.3</span>
          </div>
          <div className="legend-item">
            <div className="legend-color baseline-bar"></div>
            <span>Bun v1.2</span>
          </div>
          <div className="legend-item">
            <div className="legend-color node-bar"></div>
            <span>Node.js</span>
          </div>
        </div>
      </div>
    </div>
  );
}
