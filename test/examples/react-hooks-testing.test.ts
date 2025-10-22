// test/examples/react-hooks-testing.test.ts
// Example: Testing React Hooks with Bun + Testing Library

import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useState, useCallback, useEffect } from 'react';

/**
 * EXAMPLE HOOK: Simple Counter
 *
 * A basic hook to demonstrate testing patterns.
 */
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(c => c - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}

/**
 * EXAMPLE 1: Testing React Hooks with Testing Library
 *
 * Use @testing-library/react's renderHook for testing custom hooks.
 * This is the RECOMMENDED approach for Bun + React projects.
 */
describe('React Hooks Testing with Testing Library', () => {
  test('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
  });

  test('should initialize with custom value', () => {
    const { result } = renderHook(() => useCounter(10));

    expect(result.current.count).toBe(10);
  });

  test('should increment count', async () => {
    const { result } = renderHook(() => useCounter());

    await act(async () => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  test('should decrement count', async () => {
    const { result } = renderHook(() => useCounter(5));

    await act(async () => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  test('should reset to initial value', async () => {
    const { result } = renderHook(() => useCounter(10));

    await act(async () => {
      result.current.increment();
      result.current.increment();
    });

    expect(result.current.count).toBe(12);

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.count).toBe(10);
  });
});

/**
 * EXAMPLE 2: Testing Hooks with Async Operations
 */
function useAsyncData(url: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { data, loading, error, fetchData };
}

describe('Async Hooks Testing', () => {
  const mockFetch = mock(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ result: 'success' })
  }));

  beforeEach(() => {
    global.fetch = mockFetch as any;
    mockFetch.mockClear();
  });

  test('should fetch data successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'test data' })
    } as any);

    const { result } = renderHook(() => useAsyncData('https://api.example.com'));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);

    await act(async () => {
      await result.current.fetchData();
    });

    await waitFor(() => !result.current.loading);

    expect(result.current.data).toEqual({ message: 'test data' });
    expect(result.current.error).toBe(null);
  });

  test('should handle errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAsyncData('https://api.example.com'));

    await act(async () => {
      await result.current.fetchData();
    });

    await waitFor(() => !result.current.loading);

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network error');
  });
});

/**
 * EXAMPLE 3: Testing Hooks with useEffect
 */
function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

describe('useEffect Hooks Testing', () => {
  test('should update document title', () => {
    const { rerender } = renderHook(
      ({ title }) => useDocumentTitle(title),
      { initialProps: { title: 'Initial Title' } }
    );

    expect(document.title).toBe('Initial Title');

    rerender({ title: 'Updated Title' });

    expect(document.title).toBe('Updated Title');
  });
});

/**
 * EXAMPLE 4: Testing Hooks with Dependencies
 */
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue] as const;
}

describe('localStorage Hooks Testing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should initialize with default value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('default');
  });

  test('should update localStorage when value changes', async () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    await act(async () => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
  });

  test('should load from localStorage on mount', () => {
    localStorage.setItem('existing-key', JSON.stringify('stored value'));

    const { result } = renderHook(() => useLocalStorage('existing-key', 'default'));

    expect(result.current[0]).toBe('stored value');
  });
});

/**
 * KEY PATTERNS FOR REACT HOOKS TESTING:
 *
 * 1. ✅ Use renderHook from @testing-library/react (NOT custom implementations)
 * 2. ✅ Wrap state updates in act() to ensure React processes them
 * 3. ✅ Use waitFor() for async operations instead of custom waiters
 * 4. ✅ Mock global APIs (fetch, localStorage) in beforeEach
 * 5. ✅ Clean up mocks in afterEach or using mock.restore()
 * 6. ✅ Test hook behavior, not implementation details
 * 7. ✅ Use rerender() to test hooks with changing props
 * 8. ✅ Test error states and edge cases
 * 9. ✅ Keep hooks simple and testable - complex logic should be extracted
 * 10. ✅ Use TypeScript for type safety in hooks and tests
 *
 * COMMON PITFALLS TO AVOID:
 *
 * ❌ DON'T: Write custom renderHook implementations
 * ❌ DON'T: Forget to wrap updates in act()
 * ❌ DON'T: Use setTimeout instead of waitFor()
 * ❌ DON'T: Mock DOM methods globally before renderHook()
 * ❌ DON'T: Test implementation details (internal state structure)
 *
 * RESOURCES:
 * - React Testing Library: https://testing-library.com/docs/react-testing-library/intro
 * - Testing Hooks: https://react-hooks-testing-library.com/
 * - Bun + React: https://bun.com/guides/ecosystem/react
 */
