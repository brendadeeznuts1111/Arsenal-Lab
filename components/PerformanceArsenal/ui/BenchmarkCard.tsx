// components/PerformanceArsenal/ui/BenchmarkCard.tsx

interface BenchmarkCardProps {
  title: string;
  bunResult: number;
  nodeResult: number;
  calculateSpeedup: (bun: number, node: number) => number;
  memory?: string;
  payloadSize?: string;
  size?: string;
  operations?: number;
  throughput?: string;
}

export function BenchmarkCard({
  title,
  bunResult,
  nodeResult,
  calculateSpeedup,
  memory,
  payloadSize,
  size,
  operations,
  throughput
}: BenchmarkCardProps) {
  const speedup = calculateSpeedup(bunResult, nodeResult);

  return (
    <div className="benchmark-card">
      <h4 className="benchmark-title">{title}</h4>

      <div className="benchmark-results">
        <div className="result-item">
          <div className="result-label">Bun</div>
          <div className="result-value bun-value">
            {bunResult.toFixed(2)}ms
          </div>
        </div>

        <div className="result-item">
          <div className="result-label">Node.js</div>
          <div className="result-value node-value">
            {nodeResult.toFixed(2)}ms
          </div>
        </div>

        <div className="result-item">
          <div className="result-label">Speedup</div>
          <div className="result-value speedup-value">
            {speedup.toFixed(1)}× faster
          </div>
        </div>
      </div>

      <div className="benchmark-details">
        {memory && <div className="detail-item">Memory: {memory}</div>}
        {payloadSize && <div className="detail-item">Payload: {payloadSize}</div>}
        {size && <div className="detail-item">Size: {size}</div>}
        {operations && <div className="detail-item">Operations: {operations}</div>}
        {throughput && <div className="detail-item">Throughput: {throughput}</div>}
      </div>
    </div>
  );
}
