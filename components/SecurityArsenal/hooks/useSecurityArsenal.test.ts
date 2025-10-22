/// <reference lib="dom" />
// components/SecurityArsenal/hooks/useSecurityArsenal.test.ts
import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useSecurityArsenal } from './useSecurityArsenal';

// Mock fetch
const mockFetch = mock(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({
    vulnerabilities: {},
    metadata: { vulnerabilities: { low: 0, moderate: 0, high: 0, critical: 0 } }
  })
}));

global.fetch = mockFetch as any;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('useSecurityArsenal', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockFetch.mockClear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  test('should initialize with default values', () => {
    const { result } = renderHook(() => useSecurityArsenal());

    expect(result.current.isScanning).toBe(false);
    expect(result.current.auditResult).toBe(null);
    expect(result.current.filterSeverity).toBe('all');
    expect(result.current.prodOnly).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.filteredVulnerabilities).toEqual([]);
  });

  test('should toggle demo mode', async () => {
    const { result } = renderHook(() => useSecurityArsenal());

    expect(result.current.demoMode).toBe(false);

    await act(async () => {
      result.current.toggleDemoMode();
    });

    expect(result.current.demoMode).toBe(true);

    await act(async () => {
      result.current.toggleDemoMode();
    });

    expect(result.current.demoMode).toBe(false);
  });

  test('should run audit in demo mode', async () => {
    const { result } = renderHook(() => useSecurityArsenal());

    // Enable demo mode
    await act(async () => {
      result.current.toggleDemoMode();
    });

    expect(result.current.demoMode).toBe(true);

    // Run audit
    await act(async () => {
      await result.current.runAudit();
    });

    await waitFor(() => {
      return !result.current.isScanning;
    });

    expect(result.current.isScanning).toBe(false);
    expect(result.current.auditResult).not.toBe(null);
    expect(result.current.auditResult?.vulnerabilities).toBeDefined();
    expect(result.current.auditResult?.metadata).toBeDefined();
    expect(result.current.auditResult?.vulnerabilities.length).toBeGreaterThan(0);
  });

  test('should run real audit when not in demo mode', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        vulnerabilities: {
          'test-package': {
            via: [{
              severity: 'high',
              cve: 'CVE-2024-TEST',
              title: 'Test Vulnerability',
              url: 'https://example.com',
              source: 'npm'
            }],
            range: '1.0.0 - 2.0.0',
            fixAvailable: true
          }
        },
        metadata: {
          vulnerabilities: {
            low: 0,
            moderate: 0,
            high: 1,
            critical: 0
          }
        }
      })
    } as any);

    const { result, rerender, unmount } = renderHook(() => useSecurityArsenal());

    const auditPromise = result.current.runAudit();
    rerender();

    expect(result.current.isScanning).toBe(true);

    await auditPromise;
    rerender();

    await waitFor(() => {
      rerender();
      return !result.current.isScanning;
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/security/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prodOnly: false,
        auditLevel: undefined
      })
    });

    expect(result.current.auditResult).not.toBe(null);
    expect(result.current.auditResult?.vulnerabilities.length).toBe(1);
    expect(result.current.auditResult?.metadata.high).toBe(1);

    unmount();
  });

  test('should filter vulnerabilities by severity', async () => {
    const { result, rerender, unmount } = renderHook(() => useSecurityArsenal());

    // Enable demo mode and run audit
    result.current.toggleDemoMode();
    rerender();

    const auditPromise = result.current.runAudit();
    await auditPromise;
    rerender();

    await waitFor(() => {
      rerender();
      return !result.current.isScanning;
    });

    const totalVulns = result.current.filteredVulnerabilities.length;
    expect(totalVulns).toBeGreaterThan(0);

    // Filter by critical
    result.current.setFilterSeverity('critical');
    rerender();

    const criticalVulns = result.current.filteredVulnerabilities;
    expect(criticalVulns.every(v => v.severity === 'critical')).toBe(true);
    expect(criticalVulns.length).toBeLessThanOrEqual(totalVulns);

    // Filter by high
    result.current.setFilterSeverity('high');
    rerender();

    const highVulns = result.current.filteredVulnerabilities;
    expect(highVulns.every(v => v.severity === 'high')).toBe(true);

    unmount();
  });

  test('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    } as any);

    const { result, rerender, unmount } = renderHook(() => useSecurityArsenal());

    const auditPromise = result.current.runAudit();
    await auditPromise;
    rerender();

    await waitFor(() => {
      rerender();
      return !result.current.isScanning;
    });

    expect(result.current.error).toContain('demo mode');

    unmount();
  });

  test('should save audit results to history', async () => {
    const { result, rerender, unmount } = renderHook(() => useSecurityArsenal());

    result.current.toggleDemoMode();
    rerender();

    const initialHistoryLength = result.current.history.length;

    const auditPromise = result.current.runAudit();
    await auditPromise;
    rerender();

    await waitFor(() => {
      rerender();
      return !result.current.isScanning;
    });

    expect(result.current.history.length).toBe(initialHistoryLength + 1);
    expect(result.current.stats.totalScans).toBe(initialHistoryLength + 1);

    unmount();
  });

  test('should clear history', async () => {
    const { result, rerender, unmount } = renderHook(() => useSecurityArsenal());

    // Add some history by running audits
    result.current.toggleDemoMode();
    rerender();

    const auditPromise = result.current.runAudit();
    await auditPromise;
    rerender();

    await waitFor(() => {
      rerender();
      return !result.current.isScanning;
    });

    expect(result.current.history.length).toBeGreaterThan(0);

    // Clear history
    result.current.clearHistory();
    rerender();

    expect(result.current.history.length).toBe(0);
    expect(result.current.stats.totalScans).toBe(0);

    unmount();
  });

  test('should load historical result', async () => {
    const { result, rerender, unmount } = renderHook(() => useSecurityArsenal());

    // Run audit to create history
    result.current.toggleDemoMode();
    rerender();

    const auditPromise1 = result.current.runAudit();
    await auditPromise1;
    rerender();

    await waitFor(() => {
      rerender();
      return !result.current.isScanning;
    });

    const firstResult = result.current.auditResult;
    const historyItem = result.current.history[0];

    // Run another audit
    const auditPromise2 = result.current.runAudit();
    await auditPromise2;
    rerender();

    await waitFor(() => {
      rerender();
      return !result.current.isScanning;
    });

    // Load first result from history
    result.current.loadHistoricalResult(historyItem);
    rerender();

    expect(result.current.auditResult?.timestamp).toBe(firstResult?.timestamp);

    unmount();
  });

  test('should export results as JSON', async () => {
    const { result, rerender, unmount } = renderHook(() => useSecurityArsenal());

    // Mock document methods
    const mockLink = {
      click: mock(),
      href: '',
      download: ''
    };
    const createElementSpy = spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    const appendChildSpy = spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    const removeChildSpy = spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    // Run audit
    result.current.toggleDemoMode();
    rerender();

    const auditPromise = result.current.runAudit();
    await auditPromise;
    rerender();

    await waitFor(() => {
      rerender();
      return !result.current.isScanning;
    });

    // Export results
    result.current.exportResults();

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();

    unmount();
  });

  test('should export Prometheus metrics', async () => {
    const { result, rerender, unmount } = renderHook(() => useSecurityArsenal());

    // Mock document methods
    const mockLink = {
      click: mock(),
      href: '',
      download: ''
    };
    const createElementSpy = spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    const appendChildSpy = spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    const removeChildSpy = spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    // Run audit
    result.current.toggleDemoMode();
    rerender();

    const auditPromise = result.current.runAudit();
    await auditPromise;
    rerender();

    await waitFor(() => {
      rerender();
      return !result.current.isScanning;
    });

    // Export Prometheus metrics
    result.current.exportPrometheus();

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();

    unmount();
  });

  test('should respect prodOnly flag in API call', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        vulnerabilities: {},
        metadata: { vulnerabilities: { low: 0, moderate: 0, high: 0, critical: 0 } }
      })
    } as any);

    const { result, rerender, unmount } = renderHook(() => useSecurityArsenal());

    result.current.setProdOnly(true);
    rerender();

    const auditPromise = result.current.runAudit();
    await auditPromise;
    rerender();

    await waitFor(() => {
      rerender();
      return !result.current.isScanning;
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/security/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prodOnly: true,
        auditLevel: undefined
      })
    });

    unmount();
  });

  test('should respect audit level filter in API call', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        vulnerabilities: {},
        metadata: { vulnerabilities: { low: 0, moderate: 0, high: 0, critical: 0 } }
      })
    } as any);

    const { result, rerender, unmount } = renderHook(() => useSecurityArsenal());

    result.current.setFilterSeverity('high');
    rerender();

    const auditPromise = result.current.runAudit();
    await auditPromise;
    rerender();

    await waitFor(() => {
      rerender();
      return !result.current.isScanning;
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/security/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prodOnly: false,
        auditLevel: 'high'
      })
    });

    unmount();
  });
});
