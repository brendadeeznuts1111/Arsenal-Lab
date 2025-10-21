// components/PerformanceArsenal/hooks/usePerformanceMetrics.ts
import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  longTasks: number;
  layoutShifts: number;
  memoryUsage: number;
  fps: number;
}

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    longTasks: 0,
    layoutShifts: 0,
    memoryUsage: 0,
    fps: 0
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    // Track Long Tasks (blocking operations > 50ms)
    if ('PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((list) => {
        const longTasks = list.getEntries().filter(entry =>
          entry.entryType === 'longtask'
        ).length;

        setMetrics(prev => ({
          ...prev,
          longTasks: prev.longTasks + longTasks
        }));
      });

      try {
        observerRef.current.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long Task observation not supported');
      }
    }

    // Track Layout Shifts (visual stability)
    if ('PerformanceObserver' in window) {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        const shifts = list.getEntries().filter(entry =>
          !(entry as any).hadRecentInput
        ).length;

        setMetrics(prev => ({
          ...prev,
          layoutShifts: prev.layoutShifts + shifts
        }));
      });

      try {
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Layout Shift observation not supported');
      }
    }

    // Track FPS
    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();

      if (currentTime - lastTime.current >= 1000) {
        const fps = Math.round(
          (frameCount.current * 1000) / (currentTime - lastTime.current)
        );

        setMetrics(prev => ({ ...prev, fps }));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    measureFPS();

    // Track Memory (if available)
    const trackMemory = () => {
      if ((performance as any).memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
        }));
      }
    };

    const memoryInterval = setInterval(trackMemory, 1000);

    return () => {
      observerRef.current?.disconnect();
      clearInterval(memoryInterval);
    };
  }, []);

  return metrics;
}
