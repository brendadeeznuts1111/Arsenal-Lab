// test/examples/bun-v1.3-features.test.ts
// Examples demonstrating Bun v1.3 testing improvements

import { describe, test, expect, expectTypeOf, mock } from 'bun:test';

/**
 * Bun v1.3 Feature: test.serial() for sequential tests
 *
 * When using concurrent tests, you can mark specific tests as sequential
 */
describe.concurrent('concurrent tests with serial exceptions', () => {
  test('concurrent test #1', async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(1 + 1).toBe(2);
  });

  test('concurrent test #2', async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(2 + 2).toBe(4);
  });

  // This test runs sequentially even though describe is concurrent
  test.serial('sequential test in concurrent block', () => {
    expect(3 + 3).toBe(6);
  });
});

/**
 * Bun v1.3 Feature: Chain qualifiers
 *
 * You can now chain .failing, .skip, .only, and .each
 */
describe('chained qualifiers', () => {
  // Expected to fail for each item
  test.failing.each([1, 2, 3])('failing test for each %i', (i) => {
    if (i > 0) {
      throw new Error('Expected to fail');
    }
  });

  // Skip all items in array
  test.skip.each([
    { a: 1, b: 2, expected: 3 },
    { a: 2, b: 3, expected: 5 }
  ])('skipped parameterized test: $a + $b = $expected', ({ a, b, expected }) => {
    expect(a + b).toBe(expected);
  });
});

/**
 * Bun v1.3 Feature: test.failing() for TDD and known bugs
 *
 * Mark tests as expected to fail for:
 * - Documenting known bugs
 * - Test-Driven Development (write test before implementation)
 */
describe('expected failures', () => {
  test.failing('known bug: will be fixed later', () => {
    // This currently fails but we're documenting it
    const buggyFunction = () => {
      throw new Error('Not yet implemented');
    };
    expect(buggyFunction()).toBe('working');
  });

  test.failing('TDD: feature not implemented', () => {
    // Write the test first, implement later
    interface User {
      name: string;
      email: string;
    }

    const validateUser = (user: User): boolean => {
      // Not implemented yet!
      return false;
    };

    expect(validateUser({ name: 'Alice', email: 'alice@example.com' })).toBe(true);
  });
});

/**
 * Bun v1.3 Feature: Type testing with expectTypeOf()
 *
 * Test TypeScript types alongside unit tests
 */
describe('type testing', () => {
  test('basic type assertions', () => {
    expectTypeOf<string>().toEqualTypeOf<string>();
    expectTypeOf<number>().not.toEqualTypeOf<string>();
    expectTypeOf<boolean>().toBeBoolean();
  });

  test('object type assertions', () => {
    interface User {
      id: number;
      name: string;
      email?: string;
    }

    expectTypeOf<User>().toHaveProperty('id');
    expectTypeOf<User>().toHaveProperty('name');
    expectTypeOf<User>().toMatchTypeOf<{ id: number }>();
  });

  test('promise type assertions', () => {
    expectTypeOf<Promise<number>>().resolves.toBeNumber();
    expectTypeOf<Promise<string>>().resolves.toBeString();
  });

  test('function type assertions', () => {
    type AddFn = (a: number, b: number) => number;

    expectTypeOf<AddFn>().toBeFunction();
    expectTypeOf<AddFn>().parameters.toEqualTypeOf<[number, number]>();
    expectTypeOf<AddFn>().returns.toBeNumber();
  });
});

/**
 * Bun v1.3 Feature: New return value matchers
 *
 * - toHaveReturnedWith(value)
 * - toHaveLastReturnedWith(value)
 * - toHaveNthReturnedWith(n, value)
 */
describe('return value matchers', () => {
  test('toHaveReturnedWith checks any return', () => {
    const fn = mock(() => 42);
    fn();
    fn();

    expect(fn).toHaveReturnedWith(42);
  });

  test('toHaveLastReturnedWith checks last return', () => {
    const fn = mock((x: number) => x * 2);
    fn(5);  // returns 10
    fn(21); // returns 42

    expect(fn).toHaveLastReturnedWith(42);
  });

  test('toHaveNthReturnedWith checks specific call', () => {
    const fn = mock((x: number) => x * 2);
    fn(5);  // returns 10 (call 1)
    fn(21); // returns 42 (call 2)
    fn(50); // returns 100 (call 3)

    expect(fn).toHaveNthReturnedWith(1, 10);
    expect(fn).toHaveNthReturnedWith(2, 42);
    expect(fn).toHaveNthReturnedWith(3, 100);
  });
});

/**
 * Bun v1.3 Feature: Indented inline snapshots
 *
 * Snapshots automatically match your code's indentation
 */
describe('inline snapshots', () => {
  test('formatted inline snapshot', () => {
    const user = {
      name: 'Alice',
      age: 30,
      email: 'alice@example.com'
    };

    expect(user).toMatchInlineSnapshot(`
      {
        "age": 30,
        "email": "alice@example.com",
        "name": "Alice",
      }
    `);
  });

  test('nested object snapshot', () => {
    const data = {
      user: { name: 'Bob', role: 'admin' },
      timestamp: 1234567890,
      active: true
    };

    expect(data).toMatchInlineSnapshot(`
      {
        "active": true,
        "timestamp": 1234567890,
        "user": {
          "name": "Bob",
          "role": "admin",
        },
      }
    `);
  });
});

/**
 * Bun v1.3 Feature: Variable substitution in test.each titles
 *
 * Use $variable and $object.property in test titles
 */
describe('variable substitution in titles', () => {
  test.each([
    { a: 1, b: 2, expected: 3 },
    { a: 5, b: 10, expected: 15 },
    { a: 100, b: 200, expected: 300 }
  ])('$a + $b = $expected', ({ a, b, expected }) => {
    expect(a + b).toBe(expected);
  });

  test.each([
    { user: { name: 'Alice', age: 30 }, valid: true },
    { user: { name: 'Bob', age: 17 }, valid: false }
  ])('user $user.name (age $user.age) is valid: $valid', ({ user, valid }) => {
    const isAdult = user.age >= 18;
    expect(isAdult).toBe(valid);
  });
});

/**
 * Bun v1.3 Feature: mock.clearAllMocks()
 *
 * Clear all mocks at once for easier cleanup
 */
describe('clear all mocks', () => {
  test('mock.clearAllMocks() example', () => {
    const fn1 = mock(() => 'one');
    const fn2 = mock(() => 'two');

    fn1();
    fn1();
    fn2();

    expect(fn1).toHaveBeenCalledTimes(2);
    expect(fn2).toHaveBeenCalledTimes(1);

    // Clear all mocks at once
    mock.clearAllMocks();

    expect(fn1).toHaveBeenCalledTimes(0);
    expect(fn2).toHaveBeenCalledTimes(0);
  });
});

/**
 * CLI FEATURES TO TEST MANUALLY:
 *
 * 1. Randomize test order:
 *    bun test --randomize
 *
 * 2. Reproduce test order with seed:
 *    bun test --seed=12345
 *
 * 3. VS Code Test Explorer integration:
 *    - Install Bun for VS Code extension
 *    - Tests appear in Test Explorer sidebar
 *    - Run/debug individual tests from UI
 *
 * 4. Async stack traces:
 *    - Better error messages for async code
 *    - Full stack traces through async boundaries
 *
 * 5. CI strictness:
 *    - In CI, test.only() causes error
 *    - New snapshots require --update-snapshots
 *    - Set CI=false to disable
 *
 * 6. Coverage path ignore:
 *    bunfig.toml:
 *    [test]
 *    coveragePathIgnorePatterns = ["node_modules", "dist"]
 */

/**
 * CONCURRENT TEST LIMITATIONS (Bun v1.3):
 *
 * When using test.concurrent or describe.concurrent:
 * ❌ expect.assertions() not supported
 * ❌ expect.hasAssertions() not supported
 * ❌ toMatchSnapshot() not supported
 * ✅ toMatchInlineSnapshot() IS supported
 * ✅ beforeAll/afterAll run sequentially (not concurrently)
 * ✅ Use test.serial() for specific sequential tests
 */

/**
 * BEST PRACTICES WITH BUN v1.3:
 *
 * 1. ✅ Use test.serial() for order-dependent tests
 * 2. ✅ Use test.failing() for known bugs and TDD
 * 3. ✅ Use expectTypeOf() to test TypeScript types
 * 4. ✅ Use --randomize in CI to find test dependencies
 * 5. ✅ Use toMatchInlineSnapshot() for better diffs
 * 6. ✅ Chain qualifiers (.failing.each, .skip.only, etc.)
 * 7. ✅ Use variable substitution in test.each titles
 * 8. ✅ Use mock.clearAllMocks() in beforeEach for cleaner setup
 * 9. ✅ Enable VS Code Test Explorer for better DX
 * 10. ✅ Use new return matchers for precise mock testing
 */
