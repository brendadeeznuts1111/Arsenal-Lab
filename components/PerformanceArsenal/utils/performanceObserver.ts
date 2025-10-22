// components/PerformanceArsenal/utils/performanceObserver.ts

export interface PerformanceMetrics {
  timestamp: number;
  type: string;
  duration?: number;
  startTime?: number;
  name?: string;
  entryType?: string;
  size?: number;
  decodedBodySize?: number;
  transferSize?: number;
}

export interface PerformanceStats {
  fps: number;
  memoryUsage?: number;
  totalJSHeapSize?: number;
  usedJSHeapSize?: number;
  jsHeapSizeLimit?: number;
  loadTime?: number;
  domContentLoaded?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
}

export class PerformanceMonitor {
  private observers: PerformanceObserver[] = [];
  private metrics: PerformanceMetrics[] = [];
  private stats: PerformanceStats;
  private frameCount = 0;
  private lastFrameTime = 0;
  private fps = 0;
  private isBrowser = false;

  constructor() {
    this.stats = {
      fps: 0,
      memoryUsage: 0
    };

    // Check if we're in a browser environment
    this.isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

    if (this.isBrowser) {
      this.initializeObservers();
      this.startFrameMonitoring();
    }
  }

  private initializeObservers() {
    // Navigation timing
    if (this.isBrowser && 'PerformanceObserver' in window) {
      try {
        // Navigation observer
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.metrics.push({
              timestamp: Date.now(),
              type: 'navigation',
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
              entryType: entry.entryType
            });
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);

        // Resource timing
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.metrics.push({
              timestamp: Date.now(),
              type: 'resource',
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
              entryType: entry.entryType,
              decodedBodySize: (entry as any).decodedBodySize,
              transferSize: (entry as any).transferSize
            });
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);

        // Paint timing
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.metrics.push({
              timestamp: Date.now(),
              type: 'paint',
              startTime: entry.startTime,
              name: entry.name,
              entryType: entry.entryType
            });

            // Update stats based on paint events
            if (entry.name === 'first-paint') {
              this.stats.firstPaint = entry.startTime;
            } else if (entry.name === 'first-contentful-paint') {
              this.stats.firstContentfulPaint = entry.startTime;
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.stats.largestContentfulPaint = lastEntry.startTime;
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // Long tasks
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.metrics.push({
              timestamp: Date.now(),
              type: 'longtask',
              duration: entry.duration,
              startTime: entry.startTime,
              name: 'long-task',
              entryType: entry.entryType
            });
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);

      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }

    // Get initial navigation timing
    if (this.isBrowser && 'performance' in window && performance.timing) {
      const timing = performance.timing;
      this.stats.loadTime = timing.loadEventEnd - timing.navigationStart;
      this.stats.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    }
  }

  private startFrameMonitoring() {
    if (!this.isBrowser || typeof requestAnimationFrame === 'undefined') {
      return;
    }

    const updateFPS = (currentTime: number) => {
      this.frameCount++;
      if (currentTime - this.lastFrameTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFrameTime));
        this.stats.fps = this.fps;
        this.frameCount = 0;
        this.lastFrameTime = currentTime;
      }
      requestAnimationFrame(updateFPS);
    };

    requestAnimationFrame(updateFPS);
  }

  public getCurrentStats(): PerformanceStats {
    // Update memory info if available (browser only)
    if (this.isBrowser && typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.stats.totalJSHeapSize = memory.totalJSHeapSize;
      this.stats.usedJSHeapSize = memory.usedJSHeapSize;
      this.stats.jsHeapSizeLimit = memory.jsHeapSizeLimit;
    }

    return { ...this.stats };
  }

  public getRecentMetrics(limit = 50): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  public clearMetrics() {
    this.metrics = [];
  }

  public getBenchmarkMetrics(benchmarkType: string): PerformanceMetrics[] {
    return this.metrics.filter(metric =>
      metric.name?.includes(benchmarkType) ||
      metric.type === benchmarkType
    );
  }

  public measureCustomEvent(name: string, startMark?: string): PerformanceMetrics {
    const startTime = startMark ? performance.getEntriesByName(startMark)[0]?.startTime ?? performance.now() : performance.now();
    const duration = startMark && startTime !== performance.now() ? performance.now() - startTime : undefined;

    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      type: 'custom',
      name,
      startTime,
      duration
    };

    this.metrics.push(metric);
    return metric;
  }

  public destroy() {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Error disconnecting observer:', error);
      }
    });
    this.observers = [];
    this.metrics = [];
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

export function destroyPerformanceMonitor() {
  if (performanceMonitor) {
    performanceMonitor.destroy();
    performanceMonitor = null;
  }
}
