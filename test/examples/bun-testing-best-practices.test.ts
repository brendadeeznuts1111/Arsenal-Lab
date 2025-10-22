// test/examples/bun-testing-best-practices.test.ts
// This file demonstrates Bun testing best practices for the Performance Arsenal project

import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';

/**
 * EXAMPLE 1: Basic Test Structure
 *
 * Bun test follows a familiar Jest-like API but with better performance.
 * Use describe blocks to group related tests.
 */
describe('Basic Test Patterns', () => {
  test('should use expect assertions', () => {
    const result = 2 + 2;
    expect(result).toBe(4);
    expect(result).toBeGreaterThan(3);
    expect(result).toBeLessThan(5);
  });

  test('should work with async operations', async () => {
    const asyncFn = async () => {
      return new Promise(resolve => setTimeout(() => resolve('done'), 10));
    };

    const result = await asyncFn();
    expect(result).toBe('done');
  });

  test('should handle arrays and objects', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);

    const obj = { name: 'Bun', version: '1.3' };
    expect(obj).toHaveProperty('name');
    expect(obj.name).toBe('Bun');
  });
});

/**
 * EXAMPLE 2: Mocking with Bun
 *
 * Bun provides native mocking APIs that are compatible with Jest mocks.
 * Use mock() to create mock functions and track calls.
 */
describe('Mocking Patterns', () => {
  test('should create and use mock functions', () => {
    const mockFn = mock((x: number) => x * 2);

    const result = mockFn(5);

    expect(result).toBe(10);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(5);
  });

  test('should track mock call history', () => {
    const mockFn = mock();

    mockFn('first');
    mockFn('second');
    mockFn('third');

    expect(mockFn.mock.calls).toHaveLength(3);
    expect(mockFn.mock.calls[0]).toEqual(['first']);
    expect(mockFn.mock.calls[1]).toEqual(['second']);
  });

  test('should mock return values', () => {
    const mockFn = mock(() => 'mocked');

    expect(mockFn()).toBe('mocked');

    // Override with mockResolvedValueOnce for promises
    const asyncMock = mock();
    asyncMock.mockResolvedValueOnce('async value');

    return expect(asyncMock()).resolves.toBe('async value');
  });
});

/**
 * EXAMPLE 3: Setup and Teardown
 *
 * Use beforeEach and afterEach for test isolation.
 * This ensures each test starts with a clean state.
 */
describe('Setup and Teardown', () => {
  let state: { count: number };

  beforeEach(() => {
    // Reset state before each test
    state = { count: 0 };
  });

  afterEach(() => {
    // Clean up after each test
    state = { count: 0 };
  });

  test('first test modifies state', () => {
    state.count = 5;
    expect(state.count).toBe(5);
  });

  test('second test has fresh state', () => {
    // State is reset, so count is 0
    expect(state.count).toBe(0);
  });
});

/**
 * EXAMPLE 4: Testing Async Code
 *
 * Bun handles async tests naturally with async/await.
 */
describe('Async Testing', () => {
  test('should resolve promises', async () => {
    const promise = Promise.resolve('success');
    await expect(promise).resolves.toBe('success');
  });

  test('should reject promises', async () => {
    const promise = Promise.reject(new Error('failed'));
    await expect(promise).rejects.toThrow('failed');
  });

  test('should use async/await', async () => {
    const asyncOperation = async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'completed';
    };

    const result = await asyncOperation();
    expect(result).toBe('completed');
  });
});

/**
 * EXAMPLE 5: Snapshot Testing
 *
 * Bun supports snapshot testing for capturing complex data structures.
 */
describe('Snapshot Testing', () => {
  test('should match snapshot', () => {
    const data = {
      name: 'Performance Arsenal',
      version: '1.4.0',
      features: ['benchmarks', 'security', 'testing']
    };

    expect(data).toMatchSnapshot();
  });
});

/**
 * EXAMPLE 6: Matchers Reference
 *
 * Common Bun/Jest matchers you'll use frequently.
 */
describe('Common Matchers', () => {
  test('equality matchers', () => {
    expect(2 + 2).toBe(4);  // Strict equality
    expect({ a: 1 }).toEqual({ a: 1 });  // Deep equality
    expect({ a: 1, b: 2 }).toMatchObject({ a: 1 });  // Partial match
  });

  test('truthiness matchers', () => {
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    expect('string').toBeDefined();
  });

  test('number matchers', () => {
    expect(5).toBeGreaterThan(3);
    expect(5).toBeGreaterThanOrEqual(5);
    expect(5).toBeLessThan(10);
    expect(5).toBeLessThanOrEqual(5);
    expect(0.1 + 0.2).toBeCloseTo(0.3);  // Floating point comparison
  });

  test('string matchers', () => {
    expect('hello world').toMatch(/world/);
    expect('hello world').toContain('world');
  });

  test('array/iterable matchers', () => {
    const arr = ['a', 'b', 'c'];
    expect(arr).toHaveLength(3);
    expect(arr).toContain('b');
    expect(new Set(arr)).toContain('a');
  });

  test('exception matchers', () => {
    const throwError = () => {
      throw new Error('oops');
    };

    expect(throwError).toThrow();
    expect(throwError).toThrow('oops');
    expect(throwError).toThrow(Error);
  });
});

/**
 * EXAMPLE 7: Testing with TypeScript
 *
 * Bun has built-in TypeScript support - no configuration needed!
 */
describe('TypeScript Support', () => {
  interface User {
    id: number;
    name: string;
  }

  const createUser = (name: string): User => ({
    id: Math.random(),
    name
  });

  test('should work with TypeScript interfaces', () => {
    const user = createUser('Alice');

    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user.name).toBe('Alice');
  });
});

/**
 * BEST PRACTICES SUMMARY:
 *
 * 1. ✅ Use descriptive test names that explain what's being tested
 * 2. ✅ Group related tests with describe blocks
 * 3. ✅ Keep tests isolated - use beforeEach/afterEach for setup/teardown
 * 4. ✅ Test one thing per test
 * 5. ✅ Use appropriate matchers (toBe vs toEqual, etc.)
 * 6. ✅ Handle async code properly with async/await
 * 7. ✅ Mock external dependencies to keep tests fast and reliable
 * 8. ✅ Use snapshots for complex data structures
 * 9. ✅ Keep tests readable - avoid overly complex setup
 * 10. ✅ Run tests frequently during development with `bun test --watch`
 *
 * RESOURCES:
 * - Bun Test Documentation: https://bun.com/docs/cli/test
 * - Bun Test API: https://bun.com/docs/test/writing
 * - Bun Mocking: https://bun.com/docs/test/mocks
 */
