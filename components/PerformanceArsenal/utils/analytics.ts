// components/PerformanceArsenal/utils/analytics.ts
import { useCallback, useRef, useState } from 'react';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof navigator !== 'undefined';

export interface BenchmarkEvent {
  type: 'benchmark_start' | 'benchmark_complete' | 'benchmark_error';
  benchmark_type: 'postmessage' | 'registry' | 'crypto' | 'memory';
  config?: any;
  duration?: number;
  error?: string;
  hardware_info?: {
    cores: number;
    memory: string;
    deviceMemory?: number;
  };
  performance_metrics?: {
    fps: number;
    memoryUsage?: number;
    totalJSHeapSize?: number;
    usedJSHeapSize?: number;
  };
  timestamp: number;
  session_id: string;
}

export interface InteractionEvent {
  type: 'tab_change' | 'copy_code' | 'view_improvements' | 'hardware_warning';
  tab?: string;
  code_type?: string;
  warning_type?: string;
  timestamp: number;
  session_id: string;
}

export class AnalyticsTracker {
  private sessionId: string;
  private isEnabled: boolean;
  private events: (BenchmarkEvent | InteractionEvent)[] = [];
  private maxStoredEvents = 100;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = this.checkAnalyticsConsent();
    this.loadStoredEvents();
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private checkAnalyticsConsent(): boolean {
    if (!isBrowser) return false;
    try {
      // Check for consent in localStorage or user preferences
      const consent = localStorage.getItem('performance-arsenal-analytics-consent');
      return consent === 'true';
    } catch (error) {
      return false;
    }
  }

  public enableAnalytics(): void {
    this.isEnabled = true;
    if (isBrowser) {
      localStorage.setItem('performance-arsenal-analytics-consent', 'true');
    }
  }

  public disableAnalytics(): void {
    this.isEnabled = false;
    if (isBrowser) {
      localStorage.setItem('performance-arsenal-analytics-consent', 'false');
      this.clearStoredEvents();
    }
  }

  public isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }

  private loadStoredEvents(): void {
    if (!isBrowser) return;
    try {
      const stored = localStorage.getItem('performance-arsenal-analytics-events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      // Silently fail in non-browser environments
    }
  }

  private saveEvents(): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem('performance-arsenal-analytics-events', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to save analytics events:', error);
    }
  }

  private addEvent(event: BenchmarkEvent | InteractionEvent): void {
    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.maxStoredEvents) {
      this.events = this.events.slice(-this.maxStoredEvents);
    }

    this.saveEvents();
  }

  public trackBenchmarkStart(benchmarkType: BenchmarkEvent['benchmark_type'], config?: any): void {
    if (!this.isEnabled) return;

    const event: BenchmarkEvent = {
      type: 'benchmark_start',
      benchmark_type: benchmarkType,
      config,
      hardware_info: this.getHardwareInfo(),
      timestamp: Date.now(),
      session_id: this.sessionId
    };

    this.addEvent(event);
    this.sendToAnalytics(event);
  }

  public trackBenchmarkComplete(
    benchmarkType: BenchmarkEvent['benchmark_type'],
    duration: number,
    config?: any,
    performanceMetrics?: any
  ): void {
    if (!this.isEnabled) return;

    const event: BenchmarkEvent = {
      type: 'benchmark_complete',
      benchmark_type: benchmarkType,
      config,
      duration,
      hardware_info: this.getHardwareInfo(),
      performance_metrics: performanceMetrics,
      timestamp: Date.now(),
      session_id: this.sessionId
    };

    this.addEvent(event);
    this.sendToAnalytics(event);
  }

  public trackBenchmarkError(
    benchmarkType: BenchmarkEvent['benchmark_type'],
    error: string,
    config?: any
  ): void {
    if (!this.isEnabled) return;

    const event: BenchmarkEvent = {
      type: 'benchmark_error',
      benchmark_type: benchmarkType,
      config,
      error,
      hardware_info: this.getHardwareInfo(),
      timestamp: Date.now(),
      session_id: this.sessionId
    };

    this.addEvent(event);
    this.sendToAnalytics(event);
  }

  public trackInteraction(
    type: InteractionEvent['type'],
    data?: { tab?: string; code_type?: string; warning_type?: string }
  ): void {
    if (!this.isEnabled) return;

    const event: InteractionEvent = {
      type,
      ...data,
      timestamp: Date.now(),
      session_id: this.sessionId
    };

    this.addEvent(event);
    this.sendToAnalytics(event);
  }

  private getHardwareInfo() {
    const cores = navigator.hardwareConcurrency || 4;
    let memory = 'Unknown';

    // Try to get memory info
    if ('deviceMemory' in navigator) {
      memory = `${(navigator as any).deviceMemory} GB`;
    } else if (performance.memory) {
      memory = `${Math.round((performance as any).memory.total / 1024 / 1024)} MB`;
    }

    return {
      cores,
      memory,
      deviceMemory: (navigator as any).deviceMemory
    };
  }

  private sendToAnalytics(event: BenchmarkEvent | InteractionEvent): void {
    // Google Analytics 4
    if (window.gtag) {
      gtag('event', event.type, {
        custom_parameter_1: event.type,
        custom_parameter_2: 'benchmark_type' in event ? event.benchmark_type : event.type,
        custom_parameter_3: event.session_id,
        value: 'duration' in event ? event.duration : undefined,
        custom_map: {
          hardware_cores: event.type !== 'tab_change' && event.type !== 'copy_code' && event.type !== 'view_improvements' && event.type !== 'hardware_warning' ? (event as BenchmarkEvent).hardware_info?.cores : undefined,
          session_id: event.session_id
        }
      });
    }

    // Custom analytics endpoint (if configured)
    const analyticsEndpoint = process.env.PERFORMANCE_ARSENAL_ANALYTICS_ENDPOINT;
    if (analyticsEndpoint) {
      fetch(analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }).catch(error => {
        console.warn('Failed to send analytics:', error);
      });
    }
  }

  public getStoredEvents(): (BenchmarkEvent | InteractionEvent)[] {
    return [...this.events];
  }

  public getSessionStats(): {
    totalBenchmarks: number;
    benchmarksByType: Record<string, number>;
    averageDuration: number;
    errorRate: number;
  } {
    const sessionEvents = this.events.filter(event => event.session_id === this.sessionId);
    const benchmarkEvents = sessionEvents.filter(event =>
      event.type === 'benchmark_complete' || event.type === 'benchmark_error'
    ) as BenchmarkEvent[];

    const benchmarksByType: Record<string, number> = {};
    let totalDuration = 0;
    let errorCount = 0;

    benchmarkEvents.forEach(event => {
      if (event.benchmark_type) {
        benchmarksByType[event.benchmark_type] = (benchmarksByType[event.benchmark_type] || 0) + 1;
      }
      if (event.duration) {
        totalDuration += event.duration;
      }
      if (event.type === 'benchmark_error') {
        errorCount++;
      }
    });

    return {
      totalBenchmarks: benchmarkEvents.length,
      benchmarksByType,
      averageDuration: benchmarkEvents.length > 0 ? totalDuration / benchmarkEvents.length : 0,
      errorRate: benchmarkEvents.length > 0 ? errorCount / benchmarkEvents.length : 0
    };
  }

  public clearStoredEvents(): void {
    this.events = [];
    if (isBrowser) {
      localStorage.removeItem('performance-arsenal-analytics-events');
    }
  }

  public exportData(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      events: this.events,
      stats: this.getSessionStats(),
      exportDate: new Date().toISOString()
    }, null, 2);
  }
}

// Singleton instance
let analyticsTracker: AnalyticsTracker | null = null;

export function getAnalyticsTracker(): AnalyticsTracker {
  if (!analyticsTracker) {
    analyticsTracker = new AnalyticsTracker();
  }
  return analyticsTracker;
}

export function destroyAnalyticsTracker() {
  analyticsTracker = null;
}

// Declare global gtag function for TypeScript
declare global {
  function gtag(...args: any[]): void;
}

// Enhanced Analytics Interface
interface EnhancedAnalyticsEvent {
  event: string;
  benchmark_type: string;
  duration: number;
  payload_size?: string;
  hardware_cores: number;
  user_agent: string;
  timestamp: string;
  performance_metrics?: {
    longTasks: number;
    layoutShifts: number;
    memoryUsage: number;
    fps: number;
  };
}

export class EnhancedAnalyticsTracker {
  private static instance: EnhancedAnalyticsTracker;
  private enabled: boolean;
  private events: EnhancedAnalyticsEvent[] = [];

  private constructor() {
    this.enabled = this.checkAnalyticsConsent();
    this.loadFromStorage();
  }

  static getInstance(): EnhancedAnalyticsTracker {
    if (!EnhancedAnalyticsTracker.instance) {
      EnhancedAnalyticsTracker.instance = new EnhancedAnalyticsTracker();
    }
    return EnhancedAnalyticsTracker.instance;
  }

  private checkAnalyticsConsent(): boolean {
    if (!isBrowser) return false;
    try {
      // Check localStorage or cookie for user consent
      return localStorage.getItem('analytics-consent') === 'true';
    } catch (error) {
      return false;
    }
  }

  private loadFromStorage() {
    if (!isBrowser) return;
    try {
      const saved = localStorage.getItem('benchmark-analytics');
      if (saved) {
        this.events = JSON.parse(saved).slice(-100); // Keep last 100 events
      }
    } catch (error) {
      console.warn('Failed to load analytics from storage');
    }
  }

  private saveToStorage() {
    if (!isBrowser) return;
    try {
      localStorage.setItem('benchmark-analytics', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to save analytics to storage');
    }
  }

  trackBenchmark(event: Omit<EnhancedAnalyticsEvent, 'timestamp' | 'user_agent' | 'hardware_cores'>) {
    if (!this.enabled) return;

    const fullEvent: EnhancedAnalyticsEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      user_agent: isBrowser ? navigator.userAgent : 'Unknown',
      hardware_cores: isBrowser ? (navigator.hardwareConcurrency || 0) : 0
    };

    this.events.push(fullEvent);
    this.saveToStorage();

    // Send to analytics service (optional)
    this.sendToAnalyticsService(fullEvent);
  }

  private async sendToAnalyticsService(event: EnhancedAnalyticsEvent) {
    try {
      // Google Analytics 4
      if (typeof gtag !== 'undefined') {
        gtag('event', event.event, {
          benchmark_type: event.benchmark_type,
          duration: event.duration,
          payload_size: event.payload_size,
          hardware_cores: event.hardware_cores
        });
      }

      // Custom analytics endpoint
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/analytics/benchmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
      }
    } catch (error) {
      console.warn('Analytics service unavailable');
    }
  }

  getBenchmarkStats() {
    const events = this.events.filter(e => e.event === 'benchmark_complete');

    return {
      totalRuns: events.length,
      averageDuration: events.reduce((acc, e) => acc + e.duration, 0) / events.length,
      byType: events.reduce((acc: any, e) => {
        acc[e.benchmark_type] = (acc[e.benchmark_type] || 0) + 1;
        return acc;
      }, {}),
      recentRuns: events.slice(-10)
    };
  }

  enableTracking() {
    this.enabled = true;
    if (isBrowser) {
      localStorage.setItem('analytics-consent', 'true');
    }
  }

  disableTracking() {
    this.enabled = false;
    if (isBrowser) {
      localStorage.setItem('analytics-consent', 'false');
      this.events = [];
      localStorage.removeItem('benchmark-analytics');
    }
  }
}

// React Hook for Enhanced Analytics
export function useAnalytics() {
  const [consent, setConsent] = useState(() => {
    return isBrowser ? (localStorage.getItem('analytics-consent') === 'true') : false;
  });

  const tracker = useRef(EnhancedAnalyticsTracker.getInstance());

  const trackBenchmark = useCallback((
    type: string,
    duration: number,
    payloadSize?: string,
    metrics?: any
  ) => {
    tracker.current.trackBenchmark({
      event: 'benchmark_complete',
      benchmark_type: type,
      duration,
      payload_size: payloadSize,
      performance_metrics: metrics
    });
  }, []);

  const enableAnalytics = useCallback(() => {
    tracker.current.enableTracking();
    setConsent(true);
  }, []);

  const disableAnalytics = useCallback(() => {
    tracker.current.disableTracking();
    setConsent(false);
  }, []);

  const getStats = useCallback(() => {
    return tracker.current.getBenchmarkStats();
  }, []);

  return {
    consent,
    trackBenchmark,
    enableAnalytics,
    disableAnalytics,
    getStats
  };
}
