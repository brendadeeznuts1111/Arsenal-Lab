// components/DatabaseInfrastructureArsenal/ui/PerformanceMetric.tsx

interface PerformanceMetricProps {
  operation: string;
  bunTime: number;
  nodeTime: number;
  speedup: number;
}

export function PerformanceMetric({ operation, bunTime, nodeTime, speedup }: PerformanceMetricProps) {
  const speedupColor = speedup >= 8 ? 'text-green-500' : 'text-yellow-500';

  return (
    <div className="performance-metric">
      <div className="metric-header">
        <div className="metric-operation">{operation}</div>
        <div className={`metric-speedup ${speedupColor}`}>
          {speedup.toFixed(1)}×
        </div>
      </div>
      <div className="metric-comparison">
        <div className="metric-value bun">
          <div className="metric-label">Bun</div>
          <div className="metric-time">{bunTime}ms</div>
        </div>
        <div className="metric-separator">vs</div>
        <div className="metric-value node">
          <div className="metric-label">Node.js</div>
          <div className="metric-time">{nodeTime}ms</div>
        </div>
      </div>
    </div>
  );
}
