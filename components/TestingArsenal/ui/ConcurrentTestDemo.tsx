// components/TestingArsenal/ui/ConcurrentTestDemo.tsx
import React, { useState } from 'react';
import { CodeBlock } from '../../PerformanceArsenal/ui/CodeBlock';

interface ConcurrentTestDemoProps {
  onRunTest: (name: string, code: string) => void;
  onRunSuite: (suiteName: string, tests: Array<{name: string, code: string}>) => void;
}

export function ConcurrentTestDemo({ onRunTest, onRunSuite }: ConcurrentTestDemoProps) {
  const [concurrentResults, setConcurrentResults] = useState<any[]>([]);
  const [isRunningConcurrent, setIsRunningConcurrent] = useState(false);

  const basicConcurrentCode = `import { test, expect } from "bun:test";

test.concurrent("fetch user 1", async () => {
  const res = await fetch("https://api.example.com/users/1");
  expect(res.status).toBe(200);
});

test.concurrent("fetch user 2", async () => {
  const res = await fetch("https://api.example.com/users/2");
  expect(res.status).toBe(200);
});

test("serial test", () => {
  expect(1 + 1).toBe(2);
});`;

  const describeConcurrentCode = `import { test, expect, describe } from "bun:test";

describe.concurrent("server tests", () => {
  test("sends a request to server 1", async () => {
    const response = await fetch("https://httpbin.org/get?server=1");
    expect(response.status).toBe(200);
  });

  test("sends a request to server 2", async () => {
    const response = await fetch("https://httpbin.org/get?server=2");
    expect(response.status).toBe(200);
  });

  test("sends a request to server 3", async () => {
    const response = await fetch("https://httpbin.org/get?server=3");
    expect(response.status).toBe(200);
  });
});`;

  const mixedConcurrentCode = `import { test, expect, describe } from "bun:test";

describe.concurrent("concurrent tests", () => {
  test("async test", async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(1 + 1).toBe(2);
  });

  test("async test #2", async () => {
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(2 + 2).toBe(4);
  });

  test.serial("serial test", () => {
    expect(3 + 3).toBe(6);
  });
});`;

  const runConcurrentSuite = async () => {
    setIsRunningConcurrent(true);
    setConcurrentResults([]);

    const tests = [
      {
        name: "Concurrent Test 1",
        code: `test.concurrent("concurrent 1", async () => {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
  expect(true).toBe(true);
});`
      },
      {
        name: "Concurrent Test 2",
        code: `test.concurrent("concurrent 2", async () => {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
  expect(true).toBe(true);
});`
      },
      {
        name: "Concurrent Test 3",
        code: `test.concurrent("concurrent 3", async () => {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
  expect(true).toBe(true);
});`
      }
    ];

    const startTime = performance.now();
    await onRunSuite('Concurrent Suite', tests);
    const totalTime = performance.now() - startTime;

    // Simulate concurrent execution timing
    const results = tests.map((test, index) => ({
      name: test.name,
      startTime: Math.random() * 100,
      duration: 50 + Math.random() * 150,
      thread: index % 3 + 1
    }));

    setConcurrentResults(results);
    setIsRunningConcurrent(false);
  };

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>Concurrent Testing</h3>
        <p>Bun 1.3 supports running multiple asynchronous tests concurrently within the same file, significantly speeding up I/O-bound test suites.</p>
      </div>

      <div className="concurrent-features">
        <div className="feature-grid">
          <div className="feature-item">
            <h4>⚡ test.concurrent</h4>
            <p>Run individual async tests simultaneously</p>
          </div>
          <div className="feature-item">
            <h4>📦 describe.concurrent</h4>
            <p>Run entire test suites concurrently</p>
          </div>
          <div className="feature-item">
            <h4>🔀 test.serial</h4>
            <p>Force specific tests to run sequentially</p>
          </div>
          <div className="feature-item">
            <h4>🎲 --randomize</h4>
            <p>Random test execution order</p>
          </div>
        </div>

        <div className="concurrent-controls">
          <button
            onClick={runConcurrentSuite}
            disabled={isRunningConcurrent}
            className="concurrent-btn primary"
          >
            {isRunningConcurrent ? '⚡ Running...' : '⚡ Run Concurrent Suite'}
          </button>
          <div className="concurrent-info">
            <span>Max concurrency: 20 tests</span>
            <span>Perfect for I/O-bound tests</span>
          </div>
        </div>
      </div>

      {concurrentResults.length > 0 && (
        <div className="concurrent-visualization">
          <h4>Concurrent Execution Timeline</h4>
          <div className="timeline">
            {concurrentResults.map((result, index) => (
              <div
                key={index}
                className="timeline-bar"
                style={{
                  left: `${result.startTime}%`,
                  width: `${(result.duration / 300) * 100}%`,
                  top: `${index * 30}px`
                }}
              >
                <span className="bar-label">{result.name} (Thread {result.thread})</span>
                <span className="bar-duration">{result.duration.toFixed(1)}ms</span>
              </div>
            ))}
          </div>
          <div className="timeline-axis">
            <span>0ms</span>
            <span>150ms</span>
            <span>300ms</span>
          </div>
        </div>
      )}

      <div className="concurrent-examples">
        <div className="example-section">
          <h4>Basic Concurrent Tests</h4>
          <CodeBlock
            code={basicConcurrentCode}
            language="javascript"
            onCopy={() => {}}
          />
        </div>

        <div className="example-section">
          <h4>Concurrent Describe Blocks</h4>
          <CodeBlock
            code={describeConcurrentCode}
            language="javascript"
            onCopy={() => {}}
          />
        </div>

        <div className="example-section">
          <h4>Mixed Serial & Concurrent</h4>
          <CodeBlock
            code={mixedConcurrentCode}
            language="javascript"
            onCopy={() => {}}
          />
        </div>
      </div>

      <div className="concurrent-benefits">
        <h4>🚀 Performance Benefits</h4>
        <div className="benefits-list">
          <div className="benefit">
            <span className="benefit-icon">⚡</span>
            <div>
              <strong>Up to 10x faster</strong> for I/O-bound tests
            </div>
          </div>
          <div className="benefit">
            <span className="benefit-icon">🔍</span>
            <div>
              <strong>Expose race conditions</strong> with --randomize
            </div>
          </div>
          <div className="benefit">
            <span className="benefit-icon">🎯</span>
            <div>
              <strong>Flexible execution</strong> with test.serial when needed
            </div>
          </div>
        </div>
      </div>

      <div className="concurrent-cli">
        <h4>💻 CLI Options</h4>
        <div className="cli-commands">
          <code>bun test --max-concurrency 10</code>
          <span>Set maximum concurrent tests</span>
        </div>
        <div className="cli-commands">
          <code>bun test --randomize</code>
          <span>Random test execution order</span>
        </div>
        <div className="cli-commands">
          <code>bun test --seed 12345</code>
          <span>Reproduce specific random order</span>
        </div>
      </div>
    </div>
  );
}
