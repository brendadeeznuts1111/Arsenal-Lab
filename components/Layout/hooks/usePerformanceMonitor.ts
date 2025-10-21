// components/Layout/hooks/usePerformanceMonitor.ts
import { useCallback, useEffect, useState } from 'react';
import { getAnalyticsTracker } from '../../PerformanceArsenal/utils/analytics';
import { getPerformanceMonitor } from '../../PerformanceArsenal/utils/performanceObserver';

export function usePerformanceMonitor() {
  const [fps, setFps] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  // Get performance monitor instance
  const performanceMonitor = getPerformanceMonitor();
  const analyticsTracker = getAnalyticsTracker();

  // Update performance stats
  useEffect(() => {
    const updateStats = () => {
      const stats = performanceMonitor.getCurrentStats();
      setFps(stats.fps || 0);
      // Convert bytes to MB
      setMemoryUsage(stats.usedJSHeapSize ? Math.round(stats.usedJSHeapSize / 1024 / 1024) : 0);
      setAnalyticsEnabled(analyticsTracker.isAnalyticsEnabled());
    };

    // Update immediately
    updateStats();

    // Update every second
    const interval = setInterval(updateStats, 1000);

    return () => clearInterval(interval);
  }, [performanceMonitor, analyticsTracker]);

  // Toggle analytics
  const toggleAnalytics = useCallback(() => {
    const newState = !analyticsTracker.isAnalyticsEnabled();
    analyticsTracker.setAnalyticsEnabled(newState);
    setAnalyticsEnabled(newState);
  }, [analyticsTracker]);

  return {
    fps,
    memoryUsage,
    analyticsEnabled,
    toggleAnalytics
  };
}
