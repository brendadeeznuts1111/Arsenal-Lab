// components/PerformanceArsenal/hooks/usePerformanceArsenal.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { runCryptoBench } from '../benchmarks/crypto';
import { runRealPostMessageBench } from '../benchmarks/postMessage';
import { simulateRegistryBench } from '../benchmarks/registry';
import { getAnalyticsTracker } from '../utils/analytics';
import { copyToClipboard } from '../utils/copyToClipboard';
import { getHardwareInfo } from '../utils/hardware';
import { getPerformanceMonitor } from '../utils/performanceObserver';

export function usePerformanceArsenal() {
  const [tab, setTab] = useState<'postmessage' | 'registry' | 'crypto' | 'memory'>('postmessage');
  const [pmSize, setPmSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [regAction, setRegAction] = useState<'upload' | 'download'>('upload');
  const [isRunning, setIsRunning] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<any>(null);
  const [hardwareInfo, _setHardwareInfo] = useState(getHardwareInfo());

  // Performance monitoring
  const performanceMonitor = useRef(getPerformanceMonitor());
  const analyticsTracker = useRef(getAnalyticsTracker());

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('bun-performance-arsenal');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTab(parsed.tab || 'postmessage');
        setPmSize(parsed.pmSize || 'medium');
        setRegAction(parsed.regAction || 'upload');
        setBenchmarkResults(parsed.benchmarkResults || null);
      } catch (error) {
        console.warn('Failed to load saved state:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bun-performance-arsenal', JSON.stringify({
      tab,
      pmSize,
      regAction,
      benchmarkResults
    }));
  }, [tab, pmSize, regAction, benchmarkResults]);

  // Benchmark runner with useCallback
  const runBenchmark = useCallback(async (type: 'postmessage' | 'registry' | 'crypto') => {
    setIsRunning(true);
    const startTime = performance.now();

    try {
      // Track benchmark start
      analyticsTracker.current.trackBenchmarkStart(type, {
        pmSize: type === 'postmessage' ? pmSize : undefined,
        regAction: type === 'registry' ? regAction : undefined,
        algorithm: type === 'crypto' ? 'diffieHellman' : undefined
      });

      let results;
      if (type === 'postmessage') {
        results = await runRealPostMessageBench(pmSize);
      } else if (type === 'registry') {
        results = await simulateRegistryBench(regAction);
      } else if (type === 'crypto') {
        results = await runCryptoBench('diffieHellman');
      }

      const duration = performance.now() - startTime;

      // Get performance metrics
      const perfStats = performanceMonitor.current.getCurrentStats();

      // Track benchmark completion
      analyticsTracker.current.trackBenchmarkComplete(type, duration, {
        pmSize: type === 'postmessage' ? pmSize : undefined,
        regAction: type === 'registry' ? regAction : undefined,
        algorithm: type === 'crypto' ? 'diffieHellman' : undefined
      }, perfStats);

      setBenchmarkResults(results);
    } catch (error) {
      // Track benchmark error
      analyticsTracker.current.trackBenchmarkError(type, (error as Error).message, {
        pmSize: type === 'postmessage' ? pmSize : undefined,
        regAction: type === 'registry' ? regAction : undefined,
        algorithm: type === 'crypto' ? 'diffieHellman' : undefined
      });

      console.error('Benchmark failed:', error);
      throw error;
    } finally {
      setIsRunning(false);
    }
  }, [pmSize, regAction]);

  // Copy to clipboard with error handling
  const copyCode = useCallback(async (code: string) => {
    try {
      await copyToClipboard(code);
      analyticsTracker.current.trackInteraction('copy_code', { code_type: 'benchmark_example' });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw error;
    }
  }, []);

  // Track tab changes
  const handleTabChange = useCallback((newTab: typeof tab) => {
    setTab(newTab);
    analyticsTracker.current.trackInteraction('tab_change', { tab: newTab });
  }, []);

  return {
    tab,
    setTab: handleTabChange,
    pmSize,
    setPmSize,
    regAction,
    setRegAction,
    isRunning,
    benchmarkResults,
    runBenchmark,
    copyCode,
    hardwareInfo,
    // Analytics and performance monitoring
    performanceStats: performanceMonitor.current.getCurrentStats(),
    analyticsEnabled: analyticsTracker.current.isAnalyticsEnabled(),
    enableAnalytics: () => analyticsTracker.current.enableAnalytics(),
    disableAnalytics: () => analyticsTracker.current.disableAnalytics(),
    getSessionStats: () => analyticsTracker.current.getSessionStats(),
    exportAnalyticsData: () => analyticsTracker.current.exportData()
  };
}
