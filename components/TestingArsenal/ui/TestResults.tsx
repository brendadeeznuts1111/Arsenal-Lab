// components/TestingArsenal/ui/TestResults.tsx
import React from 'react';

interface TestResult {
  name: string;
  duration: number;
  passed: boolean;
  error?: string;
  timestamp: number;
}

interface TestResultsProps {
  results: TestResult[];
  isRunning: boolean;
}

export function TestResults({ results, isRunning }: TestResultsProps) {
  const recentResults = results.slice(0, 5);

  return (
    <div className="test-results-panel">
      <div className="results-header">
        <h4>Test Results</h4>
        {isRunning && <span className="running-indicator">Running...</span>}
      </div>

      {recentResults.length === 0 ? (
        <div className="no-results">
          <span>No tests run yet</span>
          <small>Run some tests to see results here</small>
        </div>
      ) : (
        <div className="results-list">
          {recentResults.map((result, index) => (
            <div key={index} className={`result-item ${result.passed ? 'passed' : 'failed'}`}>
              <div className="result-icon">
                {result.passed ? '✅' : '❌'}
              </div>
              <div className="result-info">
                <div className="result-name">{result.name}</div>
                <div className="result-meta">
                  <span className="result-duration">{result.duration.toFixed(2)}ms</span>
                  <span className="result-time">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              {result.error && (
                <div className="result-error">
                  {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length > 5 && (
        <div className="results-footer">
          <span>And {results.length - 5} more tests...</span>
        </div>
      )}
    </div>
  );
}
