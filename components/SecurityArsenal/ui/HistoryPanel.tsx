// components/SecurityArsenal/ui/HistoryPanel.tsx
import type { AuditHistoryItem } from '../utils/storage';

interface HistoryPanelProps {
  history: AuditHistoryItem[];
  onLoadResult: (item: AuditHistoryItem) => void;
  onClearHistory: () => void;
}

export function HistoryPanel({ history, onLoadResult, onClearHistory }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="history-panel empty">
        <p className="empty-message">No scan history yet. Run your first audit to start tracking!</p>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <h4>Recent Scans ({history.length})</h4>
        <button onClick={onClearHistory} className="clear-btn">
          🗑️ Clear History
        </button>
      </div>
      <div className="history-list">
        {history.slice(0, 10).map((item) => (
          <button
            key={item.id}
            onClick={() => onLoadResult(item)}
            className="history-item"
          >
            <div className="history-item-time">
              {new Date(item.result.timestamp).toLocaleDateString()} {new Date(item.result.timestamp).toLocaleTimeString()}
            </div>
            <div className="history-item-summary">
              <span className="badge critical">{item.result.metadata.critical} Critical</span>
              <span className="badge high">{item.result.metadata.high} High</span>
              <span className="badge total">{item.result.metadata.total} Total</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
