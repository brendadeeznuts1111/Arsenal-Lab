// components/TestingArsenal/ui/TestRunner.tsx
import React, { useState } from 'react';

interface TestRunnerProps {
  onRunTest: (name: string, code: string) => void;
  isRunning: boolean;
}

export function TestRunner({ onRunTest, isRunning }: TestRunnerProps) {
  const [customTest, setCustomTest] = useState(`import { test, expect } from "bun:test";

test("custom test", () => {
  expect(1 + 1).toBe(2);
});`);

  const runCustomTest = () => {
    onRunTest('Custom Test', customTest);
  };

  const loadExampleTest = (example: string) => {
    switch (example) {
      case 'async':
        setCustomTest(`import { test, expect } from "bun:test";

test("async stack trace", async () => {
  async function foo() {
    return await bar();
  }

  async function bar() {
    return await baz();
  }

  async function baz() {
    await 1;
    throw new Error("test error");
  }

  await expect(foo()).rejects.toThrow("test error");
});`);
        break;
      case 'concurrent':
        setCustomTest(`import { test, expect } from "bun:test";

test.concurrent("concurrent test 1", async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  expect(true).toBe(true);
});

test.concurrent("concurrent test 2", async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  expect(true).toBe(true);
});`);
        break;
      case 'types':
        setCustomTest(`import { expectTypeOf, test } from "bun:test";

test("type testing", () => {
  expectTypeOf<string>().toEqualTypeOf<string>();
  expectTypeOf<Promise<number>>().resolves.toBeNumber();
});`);
        break;
    }
  };

  return (
    <div className="test-runner">
      <h4>Test Runner</h4>

      <div className="runner-controls">
        <div className="example-buttons">
          <button onClick={() => loadExampleTest('async')} className="example-btn">
            Async Example
          </button>
          <button onClick={() => loadExampleTest('concurrent')} className="example-btn">
            Concurrent Example
          </button>
          <button onClick={() => loadExampleTest('types')} className="example-btn">
            Types Example
          </button>
        </div>

        <button
          onClick={runCustomTest}
          disabled={isRunning}
          className="run-custom-btn"
        >
          {isRunning ? 'Running...' : 'Run Custom Test'}
        </button>
      </div>

      <div className="code-editor">
        <textarea
          value={customTest}
          onChange={(e) => setCustomTest(e.target.value)}
          placeholder="Write your test code here..."
          rows={10}
        />
      </div>
    </div>
  );
}
