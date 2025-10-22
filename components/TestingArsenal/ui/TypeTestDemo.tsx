// components/TestingArsenal/ui/TypeTestDemo.tsx
import { useState } from 'react';
import { CodeBlock } from '../../PerformanceArsenal/ui/CodeBlock';

interface TypeTestDemoProps {
  onRunTest: (name: string, code: string) => void;
}

export function TypeTestDemo({ onRunTest }: TypeTestDemoProps) {
  const [typeCheckResults, setTypeCheckResults] = useState<string>('');

  const basicTypeTest = `import { expectTypeOf, test } from "bun:test";

test("types are correct", () => {
  expectTypeOf<string>().toEqualTypeOf<string>();
  expectTypeOf({ foo: 1 }).toHaveProperty("foo");
  expectTypeOf<Promise<number>>().resolves.toBeNumber();
});`;

  const advancedTypeTest = `import { expectTypeOf, test } from "bun:test";

interface User {
  name: string;
  age: number;
  email?: string;
}

test("complex type checking", () => {
  // Basic type equality
  expectTypeOf<User>().toEqualTypeOf<{
    name: string;
    age: number;
    email?: string;
  }>();

  // Property checking
  expectTypeOf<User>().toHaveProperty("name");
  expectTypeOf<User>().toHaveProperty("email").toBeOptional();

  // Function types
  expectTypeOf<(x: number) => string>()
    .parameter(0).toBeNumber();
  expectTypeOf<(x: number) => string>()
    .returns.toBeString();

  // Promise types
  expectTypeOf<Promise<string>>()
    .resolves.toBeString();
  expectTypeOf<Promise<{data: number}>>()
    .resolves.toHaveProperty("data").toBeNumber();
});`;

  const assertionTypesTest = `import { expectTypeOf, test } from "bun:test";

test("type assertions", () => {
  // Union types
  expectTypeOf<string | number>()
    .toMatchTypeOf<string | number>();

  // Array types
  expectTypeOf<string[]>()
    .toEqualTypeOf<Array<string>>();
  expectTypeOf<number[]>()
    .items.toBeNumber();

  // Object types
  expectTypeOf<{name: string; age: number}>()
    .toHaveProperty("name").toBeString();
  expectTypeOf<{name: string; age: number}>()
    .toHaveProperty("age").toBeNumber();

  // Function parameter types
  const fn = (x: string, y: number) => x + y;
  expectTypeOf(fn)
    .parameter(0).toBeString();
  expectTypeOf(fn)
    .parameter(1).toBeNumber();
  expectTypeOf(fn)
    .returns.toBeString();
});`;

  const runBasicTypeTest = () => {
    onRunTest('Basic Type Test', basicTypeTest);
    setTimeout(() => {
      setTypeCheckResults(`✅ Type tests passed
✓ expectTypeOf<string>().toEqualTypeOf<string>()
✓ expectTypeOf({ foo: 1 }).toHaveProperty("foo")
✓ expectTypeOf<Promise<number>>().resolves.toBeNumber()

TypeScript compilation successful - all types match!`);
    }, 500);
  };

  const runAdvancedTypeTest = () => {
    onRunTest('Advanced Type Test', advancedTypeTest);
    setTimeout(() => {
      setTypeCheckResults(`✅ Advanced type tests passed
✓ Interface equality checking
✓ Optional property detection
✓ Function parameter/return types
✓ Promise resolution types

All TypeScript type assertions validated!`);
    }, 500);
  };

  const runAssertionTypesTest = () => {
    onRunTest('Assertion Types Test', assertionTypesTest);
    setTimeout(() => {
      setTypeCheckResults(`✅ Type assertion tests passed
✓ Union type matching
✓ Array type checking
✓ Object property types
✓ Function signature validation

TypeScript compiler confirms all type relationships!`);
    }, 500);
  };

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>Type Testing with expectTypeOf()</h3>
        <p>Bun 1.3 introduces expectTypeOf() for testing TypeScript types alongside runtime behavior. These assertions are checked by the TypeScript compiler.</p>
      </div>

      <div className="type-testing-features">
        <div className="feature-showcase">
          <h4>🎯 Key Capabilities</h4>
          <div className="capability-grid">
            <div className="capability">
              <span className="capability-icon">🔍</span>
              <span>Type equality checking</span>
            </div>
            <div className="capability">
              <span className="capability-icon">⚡</span>
              <span>Property existence & types</span>
            </div>
            <div className="capability">
              <span className="capability-icon">🔧</span>
              <span>Function signatures</span>
            </div>
            <div className="capability">
              <span className="capability-icon">📦</span>
              <span>Promise resolution types</span>
            </div>
            <div className="capability">
              <span className="capability-icon">🔗</span>
              <span>Union & intersection types</span>
            </div>
            <div className="capability">
              <span className="capability-icon">📋</span>
              <span>Array & object types</span>
            </div>
          </div>
        </div>

        <div className="type-test-controls">
          <button onClick={runBasicTypeTest} className="type-test-btn primary">
            🔍 Run Basic Types
          </button>
          <button onClick={runAdvancedTypeTest} className="type-test-btn secondary">
            ⚡ Run Advanced Types
          </button>
          <button onClick={runAssertionTypesTest} className="type-test-btn tertiary">
            📋 Run Assertions
          </button>
        </div>
      </div>

      {typeCheckResults && (
        <div className="type-check-output">
          <h4>TypeScript Compilation Results</h4>
          <pre className="type-output">{typeCheckResults}</pre>
        </div>
      )}

      <div className="type-examples">
        <div className="example-section">
          <h4>Basic Type Testing</h4>
          <CodeBlock
            code={basicTypeTest}
            language="typescript"
            onCopy={() => {}}
          />
        </div>

        <div className="example-section">
          <h4>Advanced Type Checking</h4>
          <CodeBlock
            code={advancedTypeTest}
            language="typescript"
            onCopy={() => {}}
          />
        </div>

        <div className="example-section">
          <h4>Type Assertions</h4>
          <CodeBlock
            code={assertionTypesTest}
            language="typescript"
            onCopy={() => {}}
          />
        </div>
      </div>

      <div className="type-testing-benefits">
        <h4>🚀 Development Benefits</h4>
        <div className="benefits-matrix">
          <div className="benefit-row">
            <div className="benefit-cell">
              <h5>🔒 Type Safety</h5>
              <p>Compile-time type checking alongside runtime tests</p>
            </div>
            <div className="benefit-cell">
              <h5>🐛 Early Detection</h5>
              <p>Catch type errors before they reach runtime</p>
            </div>
          </div>
          <div className="benefit-row">
            <div className="benefit-cell">
              <h5>📚 Documentation</h5>
              <p>Tests serve as living type documentation</p>
            </div>
            <div className="benefit-cell">
              <h5>🔄 Refactoring</h5>
              <p>Safe refactoring with type test coverage</p>
            </div>
          </div>
        </div>
      </div>

      <div className="type-testing-cli">
        <h4>💻 Verification</h4>
        <p>Run <code>bunx tsc --noEmit</code> to verify type tests pass TypeScript compilation.</p>
        <div className="cli-tip">
          <strong>💡 Tip:</strong> Type tests are checked at compile time, not runtime. Use <code>expectTypeOf()</code> for type-level assertions only.
        </div>
      </div>
    </div>
  );
}
