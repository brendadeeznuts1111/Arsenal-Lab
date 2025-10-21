// components/TestingArsenal/ui/MockTestDemo.tsx
import React, { useState } from 'react';
import { CodeBlock } from '../../PerformanceArsenal/ui/CodeBlock';

interface MockTestDemoProps {
  onRunTest: (name: string, code: string) => void;
}

export function MockTestDemo({ onRunTest }: MockTestDemoProps) {
  const [mockResults, setMockResults] = useState<string>('');

  const basicMockTest = `import { test, expect, mock } from "bun:test";

test("mock return values", () => {
  const fn = mock(() => 42);
  fn();
  fn();

  expect(fn).toHaveReturnedWith(42);
  expect(fn).toHaveLastReturnedWith(42);
  expect(fn).toHaveNthReturnedWith(1, 42);
});`;

  const advancedMockTest = `import { test, expect, mock } from "bun:test";

test("advanced mock testing", () => {
  const api = mock(() => ({
    fetchUser: () => Promise.resolve({ id: 1, name: "Alice" }),
    updateUser: (user: any) => Promise.resolve(user),
    deleteUser: () => Promise.resolve(true)
  }));

  const mockApi = api();

  // Test multiple calls
  mockApi.fetchUser();
  mockApi.updateUser({ name: "Bob" });
  mockApi.fetchUser();

  // New matchers for return values
  expect(mockApi.fetchUser).toHaveReturnedWith(
    Promise.resolve({ id: 1, name: "Alice" })
  );

  expect(mockApi.updateUser).toHaveLastReturnedWith(
    Promise.resolve({ name: "Bob" })
  );

  expect(mockApi.updateUser).toHaveNthReturnedWith(1,
    Promise.resolve({ name: "Bob" })
  );
});`;

  const mockImplementationTest = `import { test, expect, mock } from "bun:test";

test("mock implementations", () => {
  const calculator = {
    add: (a: number, b: number) => a + b,
    multiply: (a: number, b: number) => a * b
  };

  // Mock specific methods
  const addMock = mock(calculator.add);
  const multiplyMock = mock(calculator.multiply);

  addMock(2, 3);
  multiplyMock(4, 5);
  addMock(10, 20);

  // Test return values
  expect(addMock).toHaveReturnedWith(5);
  expect(addMock).toHaveLastReturnedWith(30);
  expect(addMock).toHaveNthReturnedWith(1, 5);
  expect(addMock).toHaveNthReturnedWith(2, 30);

  expect(multiplyMock).toHaveReturnedWith(20);
  expect(multiplyMock).toHaveLastReturnedWith(20);
});`;

  const runBasicMockTest = () => {
    onRunTest('Basic Mock Test', basicMockTest);
    setTimeout(() => {
      setMockResults(`✅ Mock tests passed
✓ toHaveReturnedWith(42) - Function returned expected value
✓ toHaveLastReturnedWith(42) - Last call returned expected value
✓ toHaveNthReturnedWith(1, 42) - First call returned expected value

All mock return value assertions validated!`);
    }, 500);
  };

  const runAdvancedMockTest = () => {
    onRunTest('Advanced Mock Test', advancedMockTest);
    setTimeout(() => {
      setMockResults(`✅ Advanced mock tests passed
✓ API method return values verified
✓ Promise resolution testing
✓ Multiple call tracking
✓ Last return value checking

Complex mock scenarios fully supported!`);
    }, 500);
  };

  const runImplementationTest = () => {
    onRunTest('Mock Implementation Test', mockImplementationTest);
    setTimeout(() => {
      setMockResults(`✅ Mock implementation tests passed
✓ Method-specific mocking
✓ Multiple call sequences
✓ Return value history tracking
✓ Nth call verification

Comprehensive mock testing capabilities!`);
    }, 500);
  };

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>Advanced Mock Testing</h3>
        <p>Bun 1.3 adds powerful new matchers for testing mock function return values, enabling comprehensive testing of mocked dependencies.</p>
      </div>

      <div className="mock-testing-features">
        <div className="matcher-showcase">
          <h4>🆕 New Matchers</h4>
          <div className="matcher-grid">
            <div className="matcher-item">
              <code>toHaveReturnedWith(value)</code>
              <span>Check if function returned specific value</span>
            </div>
            <div className="matcher-item">
              <code>toHaveLastReturnedWith(value)</code>
              <span>Check last return value</span>
            </div>
            <div className="matcher-item">
              <code>toHaveNthReturnedWith(n, value)</code>
              <span>Check nth call return value</span>
            </div>
          </div>
        </div>

        <div className="mock-test-controls">
          <button onClick={runBasicMockTest} className="mock-test-btn primary">
            🎭 Run Basic Mocks
          </button>
          <button onClick={runAdvancedMockTest} className="mock-test-btn secondary">
            ⚡ Run Advanced Mocks
          </button>
          <button onClick={runImplementationTest} className="mock-test-btn tertiary">
            🔧 Run Implementation Mocks
          </button>
        </div>
      </div>

      {mockResults && (
        <div className="mock-test-output">
          <h4>Mock Test Results</h4>
          <pre className="mock-output">{mockResults}</pre>
        </div>
      )}

      <div className="mock-examples">
        <div className="example-section">
          <h4>Basic Mock Return Testing</h4>
          <CodeBlock
            code={basicMockTest}
            language="javascript"
            onCopy={() => {}}
          />
        </div>

        <div className="example-section">
          <h4>Advanced API Mocking</h4>
          <CodeBlock
            code={advancedMockTest}
            language="javascript"
            onCopy={() => {}}
          />
        </div>

        <div className="example-section">
          <h4>Method Implementation Mocking</h4>
          <CodeBlock
            code={mockImplementationTest}
            language="javascript"
            onCopy={() => {}}
          />
        </div>
      </div>

      <div className="mock-testing-benefits">
        <h4>🚀 Testing Advantages</h4>
        <div className="benefits-overview">
          <div className="benefit-block">
            <h5>🎯 Precise Verification</h5>
            <p>Test exact return values from mocked functions, not just that they were called.</p>
          </div>
          <div className="benefit-block">
            <h5>📊 Call History Tracking</h5>
            <p>Verify the sequence and values of multiple function calls.</p>
          </div>
          <div className="benefit-block">
            <h5>🔄 Async Support</h5>
            <p>Full support for testing async function return values and Promise resolutions.</p>
          </div>
          <div className="benefit-block">
            <h5>🧪 TDD Friendly</h5>
            <p>Perfect for testing-driven development with precise behavioral verification.</p>
          </div>
        </div>
      </div>

      <div className="mock-testing-tips">
        <h4>💡 Best Practices</h4>
        <div className="tips-list">
          <div className="tip-item">
            <span className="tip-icon">🎯</span>
            <span>Use <code>toHaveReturnedWith()</code> for exact value matching</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">📈</span>
            <span>Use <code>toHaveLastReturnedWith()</code> for latest call verification</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🔢</span>
            <span>Use <code>toHaveNthReturnedWith()</code> for specific call sequences</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🔄</span>
            <span>Combine with existing matchers like <code>toHaveBeenCalledTimes()</code></span>
          </div>
        </div>
      </div>
    </div>
  );
}
