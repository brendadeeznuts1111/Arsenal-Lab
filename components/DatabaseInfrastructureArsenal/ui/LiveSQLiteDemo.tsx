// components/DatabaseInfrastructureArsenal/ui/LiveSQLiteDemo.tsx
import { useEffect, useState } from 'react';

export function LiveSQLiteDemo() {
  const [users, setUsers] = useState<any[]>([]);
  const [columnInfo, setColumnInfo] = useState<{ declared: string[], actual: string[] }>({ declared: [], actual: [] });
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Mock database initialization
    const mockUsers = [
      { id: 1, name: 'Alice', age: 30 },
      { id: 2, name: 'Bob', age: 25 },
      { id: 3, name: 'Charlie', age: 35 }
    ];

    setUsers(mockUsers);
    setColumnInfo({
      declared: ['INTEGER', 'TEXT', 'INTEGER'],
      actual: ['integer', 'text', 'integer']
    });
  }, []);

  const simulateQuery = async () => {
    setIsRunning(true);
    // Simulate query execution time
    await new Promise(resolve => setTimeout(resolve, 100));
    setIsRunning(false);
  };

  return (
    <div className="live-demo-section">
      <h4 className="demo-title">Live SQLite Demo</h4>

      <div className="demo-controls">
        <button
          onClick={simulateQuery}
          disabled={isRunning}
          className="demo-button sqlite-demo-button"
        >
          {isRunning ? 'Querying...' : 'Run Query'}
        </button>
      </div>

      <div className="demo-grid">
        <div className="demo-column">
          <div className="demo-column-label">Column Types</div>
          <div className="demo-column-content">
            <div className="type-info">
              <span className="type-declared">Declared: </span>
              <span className="type-values">{columnInfo.declared.join(', ')}</span>
            </div>
            <div className="type-info">
              <span className="type-actual">Actual: </span>
              <span className="type-values">{columnInfo.actual.join(', ')}</span>
            </div>
          </div>
        </div>

        <div className="demo-column">
          <div className="demo-column-label">Sample Data</div>
          <div className="demo-column-content">
            {users.map(user => (
              <div key={user.id} className="user-row">
                <span className="user-id">{user.id}</span>
                <span className="user-name">{user.name}</span>
                <span className="user-age">{user.age}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="demo-status">
        <span className="status-indicator success">✓</span>
        <span className="status-text">Database deserialized with enhanced options</span>
      </div>
    </div>
  );
}
