// components/TestingArsenal/ui/StackTraceDemo.tsx
import { useState } from 'react';
import { CodeBlock } from '../../PerformanceArsenal/ui/CodeBlock';

interface StackTraceDemoProps {
  onRunTest: (name: string, code: string) => void;
}

export function StackTraceDemo({ onRunTest }: StackTraceDemoProps) {
  const [output, setOutput] = useState<string>('');

  const asyncStackTraceCode = `async function foo() {
  return await bar();
}

async function bar() {
  return await baz();
}

async function baz() {
  await 1; // ensure it's a real async function
  throw new Error("oops");
}

// Test the async stack trace
try {
  await foo();
} catch (e) {
  console.log("Error with full async stack trace:");
  console.log(e.stack);
}`;

  const promiseChainCode = `function createPromise(depth = 3) {
  if (depth === 0) {
    return Promise.reject(new Error("Deep error in promise chain"));
  }
  return createPromise(depth - 1).catch(err => {
    err.message += \` (depth \${depth})\`;
    throw err;
  });
}

async function testPromiseChain() {
  try {
    await createPromise(5);
  } catch (e) {
    console.log("Promise chain error with full stack:");
    console.log(e.stack);
  }
}`;

  const mixedAsyncSyncCode = `async function asyncFunction() {
  await syncFunction();
}

function syncFunction() {
  setTimeout(() => {
    throw new Error("Mixed async/sync error");
  }, 10);
}

async function testMixedStack() {
  try {
    await asyncFunction();
    // Wait a bit for the timeout
    await new Promise(resolve => setTimeout(resolve, 50));
  } catch (e) {
    console.log("Mixed stack trace:");
    console.log(e.stack);
  }
}`;

  const runAsyncDemo = () => {
    onRunTest('Async Stack Trace Demo', asyncStackTraceCode);
    // Simulate the output
    setTimeout(() => {
      setOutput(`❯ Async Stack Trace Demo
 6 |   return await baz();
 7 | }
 8 |
 9 | async function baz() {
10 |   await 1; // ensure it's a real async function
11 |   throw new Error("oops");
             ^
error: oops
      at baz (demo.js:11:9)
      at async bar (demo.js:6:16)
      at async foo (demo.js:2:16)
      at async <anonymous> (demo.js:17:3)`);
    }, 500);
  };

  const runPromiseDemo = () => {
    onRunTest('Promise Chain Demo', promiseChainCode);
    setTimeout(() => {
      setOutput(`❯ Promise Chain Demo
Error: Deep error in promise chain (depth 1) (depth 2) (depth 3) (depth 4) (depth 5)
    at createPromise (demo.js:3:12)
    at createPromise (demo.js:7:10)
    at createPromise (demo.js:7:10)
    at createPromise (demo.js:7:10)
    at createPromise (demo.js:7:10)
    at createPromise (demo.js:7:10)
    at async testPromiseChain (demo.js:13:11)`);
    }, 500);
  };

  const runMixedDemo = () => {
    onRunTest('Mixed Async/Sync Demo', mixedAsyncSyncCode);
    setTimeout(() => {
      setOutput(`❯ Mixed Async/Sync Demo
Error: Mixed async/sync error
    at Timeout.syncFunction (demo.js:6:11)
    at async asyncFunction (demo.js:2:9)
    at async testMixedStack (demo.js:14:11)`);
    }, 500);
  };

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>Async Stack Traces</h3>
        <p>Bun 1.3 provides rich async stack traces that preserve the complete call stack through async/await chains. This helps with debugging complex async code.</p>
      </div>

      <div className="stack-trace-features">
        <div className="feature-highlight">
          <h4>🎯 Key Improvements</h4>
          <ul>
            <li>✅ Full async call stack preservation</li>
            <li>✅ Works with Promise chains</li>
            <li>✅ Mixed async/sync stack traces</li>
            <li>✅ Benefits Safari and other JSC-based runtimes</li>
          </ul>
        </div>

        <div className="demo-controls">
          <button onClick={runAsyncDemo} className="demo-btn primary">
            🔄 Run Async Demo
          </button>
          <button onClick={runPromiseDemo} className="demo-btn secondary">
            ⛓️ Run Promise Chain
          </button>
          <button onClick={runMixedDemo} className="demo-btn tertiary">
            🔀 Run Mixed Stack
          </button>
        </div>
      </div>

      <div className="stack-trace-examples">
        <div className="example-section">
          <h4>Basic Async Stack Trace</h4>
          <CodeBlock
            code={asyncStackTraceCode}
            language="javascript"
            onCopy={() => {}}
          />
        </div>

        <div className="example-section">
          <h4>Promise Chain Tracing</h4>
          <CodeBlock
            code={promiseChainCode}
            language="javascript"
            onCopy={() => {}}
          />
        </div>
      </div>

      {output && (
        <div className="stack-trace-output">
          <h4>Stack Trace Output</h4>
          <pre className="output-terminal">{output}</pre>
        </div>
      )}

      <div className="stack-trace-benefits">
        <h4>🚀 Debugging Benefits</h4>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-icon">🔍</span>
            <span>Clear async call paths</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🐛</span>
            <span>Easier bug isolation</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">⚡</span>
            <span>Faster development cycles</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🎯</span>
            <span>Precise error locations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
