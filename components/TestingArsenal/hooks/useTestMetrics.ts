// components/TestingArsenal/hooks/useTestMetrics.ts
import { useState, useCallback, useRef } from 'react';

interface TestResult {
  name: string;
  duration: number;
  passed: boolean;
  error?: string;
  timestamp: number;
}

interface TestMetrics {
  totalTests: number;
  passed: number;
  failed: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  lastRunTime: number;
}

export function useTestMetrics() {
  const [results, setResults] = useState<TestResult[]>([]);
  const metricsRef = useRef<TestMetrics>({
    totalTests: 0,
    passed: 0,
    failed: 0,
    avgDuration: 0,
    minDuration: 0,
    maxDuration: 0,
    lastRunTime: 0
  });

  const recordTestResult = useCallback((result: TestResult) => {
    setResults(prev => [result, ...prev.slice(0, 99)]); // Keep last 100 results

    // Update metrics
    const newResults = [result, ...results.slice(0, 99)];
    const passed = newResults.filter(r => r.passed).length;
    const failed = newResults.filter(r => !r.passed).length;
    const durations = newResults.map(r => r.duration);
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    metricsRef.current = {
      totalTests: newResults.length,
      passed,
      failed,
      avgDuration,
      minDuration: durations.length > 0 ? Math.min(...durations) : 0,
      maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
      lastRunTime: result.timestamp
    };
  }, [results]);

  const getSummary = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  const getResultsByStatus = useCallback((passed: boolean) => {
    return results.filter(r => r.passed === passed);
  }, [results]);

  const getRecentResults = useCallback((count: number = 10) => {
    return results.slice(0, count);
  }, [results]);

  const clearResults = useCallback(() => {
    setResults([]);
    metricsRef.current = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      lastRunTime: 0
    };
  }, []);

  return {
    recordTestResult,
    getSummary,
    getResultsByStatus,
    getRecentResults,
    clearResults,
    allResults: results
  };
}
