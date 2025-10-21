// components/DatabaseInfrastructureArsenal/ui/LiveRedisDemo.tsx
import { useState } from 'react';

interface OperationResult {
  op: string;
  time: number;
  timestamp: number;
}

export function LiveRedisDemo() {
  const [operations, setOperations] = useState<OperationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const simulateOperation = async (operation: string) => {
    setIsRunning(true);
    const start = performance.now();

    // Simulate operation delay (random between 0.1-2.0ms to show speedup)
    const delay = Math.random() * 1.9 + 0.1;
    await new Promise(resolve => setTimeout(resolve, delay));

    const end = performance.now();
    const duration = end - start;

    const result: OperationResult = {
      op: operation,
      time: duration,
      timestamp: Date.now()
    };

    setOperations(prev => [result, ...prev.slice(0, 9)]); // Keep last 10
    setIsRunning(false);
  };

  return (
    <div className="live-demo-section">
      <h4 className="demo-title">Live Redis Operations</h4>

      <div className="demo-controls">
        <div className="operation-buttons">
          <button
            onClick={() => simulateOperation('SET user:1')}
            disabled={isRunning}
            className="demo-button redis-set-button"
          >
            SET
          </button>
          <button
            onClick={() => simulateOperation('GET user:1')}
            disabled={isRunning}
            className="demo-button redis-get-button"
          >
            GET
          </button>
          <button
            onClick={() => simulateOperation('HSET profile')}
            disabled={isRunning}
            className="demo-button redis-hset-button"
          >
            HSET
          </button>
          <button
            onClick={() => simulateOperation('PUBLISH msg')}
            disabled={isRunning}
            className="demo-button redis-pub-button"
          >
            PUBLISH
          </button>
        </div>
      </div>

      <div className="operations-log">
        <div className="log-header">Recent Operations</div>
        <div className="log-entries">
          {operations.length === 0 ? (
            <div className="log-empty">Click buttons above to simulate Redis operations</div>
          ) : (
            operations.map((op, idx) => (
              <div key={idx} className="log-entry">
                <span className="operation-name">{op.op}</span>
                <span className="operation-time">{op.time.toFixed(2)}ms</span>
                <span className="operation-status success">✓</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="demo-stats">
        <div className="stat-item">
          <span className="stat-label">Operations:</span>
          <span className="stat-value">{operations.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Avg Time:</span>
          <span className="stat-value">
            {operations.length > 0
              ? (operations.reduce((sum, op) => sum + op.time, 0) / operations.length).toFixed(2)
              : '0.00'
            }ms
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Status:</span>
          <span className="stat-value success">Connected</span>
        </div>
      </div>
    </div>
  );
}
