// components/TestingDebuggingArsenal/hooks/useTestingDebuggingArsenal.ts
import { useState, useCallback } from 'react';

/* ----------  TESTING STATE  ---------- */
export function useTestingDebuggingArsenal() {
  const [tab, setTab] = useState<'async' | 'concurrent' | 'matchers' | 'types' | 'mocks'>('async');

  // Async Stack Traces State
  const [asyncExample, setAsyncExample] = useState({
    foo: `async function foo() {\n  return await bar();\n}`,
    bar: `async function bar() {\n  return await baz();\n}`,
    baz: `async function baz() {\n  await 1;\n  throw new Error("oops");\n}`
  });

  // Concurrent Testing State
  const [concurrentConfig, setConcurrentConfig] = useState({
    maxConcurrency: 20,
    randomize: false,
    seed: '',
    testGlob: '**/integration/**/*.test.ts'
  });

  // Mock Testing State
  const [mockConfig, setMockConfig] = useState({
    returnValue: 42,
    callCount: 3,
    nthCall: 2
  });

  return {
    tab,
    setTab,
    asyncExample,
    setAsyncExample,
    concurrentConfig,
    setConcurrentConfig,
    mockConfig,
    setMockConfig
  };
}

/* ----------  CODE GENERATORS  ---------- */
export function generateAsyncStackCode() {
  return `// Async stack traces now preserve full call history
async function foo() {
  return await bar();
}

async function bar() {
  return await baz();
}

async function baz() {
  await 1; // ensure it's a real async function
  throw new Error("oops");
}

try {
  await foo();
} catch (e) {
  console.log(e);
  // Full async stack trace preserved!
}`;
}

export function generateConcurrentCode(config: any) {
  return `import { test, describe } from "bun:test";

// Concurrent tests (max ${config.maxConcurrency} concurrent)
test.concurrent("fetch user 1", async () => {
  const res = await fetch("https://api.example.com/users/1");
  expect(res.status).toBe(200);
});

describe.concurrent("server tests", () => {
  test("server 1", async () => {
    const response = await fetch("https://example.com/server-1");
    expect(response.status).toBe(200);
  });
});

// Serial test (runs sequentially)
test.serial("critical section", () => {
  expect(1 + 1).toBe(2);
});`;
}

export function generateMatcherCode() {
  return `import { test, expect, mock } from "bun:test";

test("new matchers", () => {
  const fn = mock(() => 42);
  fn(); fn(); // call twice

  expect(fn).toHaveReturnedWith(42);
  expect(fn).toHaveLastReturnedWith(42);
  expect(fn).toHaveNthReturnedWith(1, 42);
});

test("failing test (TDD)", () => {
  test.failing("new feature", () => {
    expect(newFeature()).toBe("working");
  });
});`;
}

export function generateTypeTestCode() {
  return `import { expectTypeOf, test } from "bun:test";

test("types are correct", () => {
  expectTypeOf<string>().toEqualTypeOf<string>();
  expectTypeOf({ foo: 1 }).toHaveProperty("foo");
  expectTypeOf<Promise<number>>().resolves.toBeNumber();

  // Verify with: bunx tsc --noEmit
});`;
}

export function generateMockCode(config: any) {
  return `import { mock } from "bun:test";

// Clear all mocks at once
mock.clearAllMocks();

// Mock with specific return value
const fn = mock(() => ${config.returnValue});
fn(); // call ${config.callCount} times

// New matchers
expect(fn).toHaveReturnedWith(${config.returnValue});
expect(fn).toHaveLastReturnedWith(${config.returnValue});
expect(fn).toHaveNthReturnedWith(${config.nthCall}, ${config.returnValue});`;
}

export function generateCoverageCode() {
  return `// bunfig.toml
[test]
# Exclude paths from coverage
coveragePathIgnorePatterns = [
  "**/node_modules/**",
  "**/test/**",
  "**/*.test.ts"
]

# Concurrent test patterns
concurrentTestGlob = "**/integration/**/*.test.ts"`;
}

export function generateRandomizeCode(config: any) {
  return `# Run tests in random order
bun test --randomize

# Reproduce same order with seed
bun test --seed ${config.seed || '12345'}

# Set max concurrency
bun test --max-concurrency ${config.maxConcurrency}`;
}
