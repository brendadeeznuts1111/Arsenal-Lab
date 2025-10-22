/**
 * Performance Notification Monitor
 *
 * Monitors performance metrics and sends alerts for degradation or loss
 */

import type { NotificationManager } from './manager';
import type { PerformanceNotification } from './types';

interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp: number;
  baseline?: number;
  threshold?: {
    warning: number;
    critical: number;
    direction: 'above' | 'below'; // Whether to alert when above or below threshold
  };
}

interface PerformanceConfig {
  metrics: Record<string, {
    enabled: boolean;
    baseline?: number;
    thresholds: {
      warning: number;
      critical: number;
      direction: 'above' | 'below';
    };
    unit?: string;
    description?: string;
  }>;
  alertCooldown: number; // Minimum time between alerts for same metric (ms)
  trendAnalysis: {
    enabled: boolean;
    windowSize: number; // Number of data points for trend analysis
    degradationThreshold: number; // Percentage degradation to trigger alert
  };
}

export class PerformanceMonitor {
  private notificationManager: NotificationManager;
  private config: PerformanceConfig;
  private metricHistory: Map<string, PerformanceMetric[]> = new Map();
  private lastAlertTime: Map<string, number> = new Map();
  private baselines: Map<string, number> = new Map();

  constructor(notificationManager: NotificationManager, config: PerformanceConfig) {
    this.notificationManager = notificationManager;
    this.config = config;
  }

  /**
   * Record a performance metric measurement
   */
  recordMetric(name: string, value: number, unit?: string): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit: unit || this.config.metrics[name]?.unit,
      timestamp: Date.now(),
      baseline: this.baselines.get(name) || this.config.metrics[name]?.baseline,
      threshold: this.config.metrics[name]?.thresholds
    };

    // Store in history
    if (!this.metricHistory.has(name)) {
      this.metricHistory.set(name, []);
    }
    const history = this.metricHistory.get(name)!;
    history.push(metric);

    // Keep only recent history (configurable window)
    const maxHistory = Math.max(this.config.trendAnalysis.windowSize, 100);
    if (history.length > maxHistory) {
      history.splice(0, history.length - maxHistory);
    }

    // Check for alerts
    this.checkMetricAlert(metric);

    // Update baseline if needed (simple moving average)
    this.updateBaseline(name);
  }

  /**
   * Record multiple metrics at once
   */
  recordMetrics(metrics: Record<string, { value: number; unit?: string }>): void {
    Object.entries(metrics).forEach(([name, data]) => {
      this.recordMetric(name, data.value, data.unit);
    });
  }

  /**
   * Check if metric triggers an alert
   */
  private async checkMetricAlert(metric: PerformanceMetric): Promise<void> {
    if (!metric.threshold) return;

    const config = this.config.metrics[metric.name];
    if (!config?.enabled) return;

    // Check cooldown
    const lastAlert = this.lastAlertTime.get(metric.name);
    if (lastAlert && Date.now() - lastAlert < this.config.alertCooldown) {
      return;
    }

    let alertTriggered = false;
    let priority: 'medium' | 'high' | 'critical' = 'medium';
    let title = '';
    let message = '';

    const { warning, critical, direction } = metric.threshold;
    const isAboveThreshold = direction === 'above' ? metric.value > critical : metric.value < critical;
    const isWarningThreshold = direction === 'above' ? metric.value > warning : metric.value < warning;

    if (isAboveThreshold) {
      alertTriggered = true;
      priority = 'critical';
      title = `🚨 CRITICAL: ${metric.name} Performance Issue`;
      message = this.formatThresholdMessage(metric, critical, direction, 'critical');
    } else if (isWarningThreshold) {
      alertTriggered = true;
      priority = 'high';
      title = `⚠️ WARNING: ${metric.name} Performance Degradation`;
      message = this.formatThresholdMessage(metric, warning, direction, 'warning');
    }

    // Check for trend degradation if enabled
    if (!alertTriggered && this.config.trendAnalysis.enabled) {
      const trendAlert = this.checkTrendDegradation(metric);
      if (trendAlert) {
        alertTriggered = true;
        priority = 'medium';
        title = `📉 TREND: ${metric.name} Performance Degrading`;
        message = trendAlert.message;
      }
    }

    if (alertTriggered) {
      const notification: PerformanceNotification = {
        id: `perf-${metric.name}-${Date.now()}`,
        timestamp: metric.timestamp,
        topic: 'performance',
        priority,
        title,
        message,
        metric: metric.name,
        value: metric.value,
        threshold: direction === 'above' ? critical : warning,
        unit: metric.unit,
        baseline: metric.baseline,
        trend: this.calculateTrend(metric.name),
        data: {
          history: this.getRecentHistory(metric.name, 5),
          config: config
        },
        metadata: {
          source: 'performance-monitor',
          correlationId: `perf-${metric.name}-${metric.timestamp}`,
          tags: ['performance', priority, metric.name.toLowerCase()]
        }
      };

      await this.notificationManager.send(notification);
      this.lastAlertTime.set(metric.name, Date.now());
    }
  }

  /**
   * Check for performance trend degradation
   */
  private checkTrendDegradation(metric: PerformanceMetric): { message: string } | null {
    const history = this.metricHistory.get(metric.name);
    if (!history || history.length < this.config.trendAnalysis.windowSize) {
      return null;
    }

    const recent = history.slice(-this.config.trendAnalysis.windowSize);
    const avgRecent = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;

    const older = history.slice(-this.config.trendAnalysis.windowSize * 2, -this.config.trendAnalysis.windowSize);
    if (older.length === 0) return null;

    const avgOlder = older.reduce((sum, m) => sum + m.value, 0) / older.length;

    const degradation = ((avgOlder - avgRecent) / avgOlder) * 100;

    if (degradation > this.config.trendAnalysis.degradationThreshold) {
      return {
        message: `${metric.name} has degraded by ${degradation.toFixed(1)}% over the last ${this.config.trendAnalysis.windowSize} measurements.\n\nRecent avg: ${avgRecent.toFixed(2)}${metric.unit || ''}\nPrevious avg: ${avgOlder.toFixed(2)}${metric.unit || ''}`
      };
    }

    return null;
  }

  /**
   * Format threshold violation message
   */
  private formatThresholdMessage(
    metric: PerformanceMetric,
    threshold: number,
    direction: 'above' | 'below',
    level: 'warning' | 'critical'
  ): string {
    const directionText = direction === 'above' ? 'exceeded' : 'fell below';
    const deviation = direction === 'above'
      ? ((metric.value - threshold) / threshold * 100)
      : ((threshold - metric.value) / threshold * 100);

    let message = `${metric.name} has ${directionText} the ${level} threshold.\n\n`;
    message += `Current: <b>${metric.value.toFixed(2)}${metric.unit || ''}</b>\n`;
    message += `Threshold: ${threshold.toFixed(2)}${metric.unit || ''}\n`;
    message += `Deviation: ${deviation.toFixed(1)}%\n`;

    if (metric.baseline) {
      const baselineDiff = ((metric.value - metric.baseline) / metric.baseline * 100);
      message += `vs Baseline: ${baselineDiff > 0 ? '+' : ''}${baselineDiff.toFixed(1)}%\n`;
    }

    return message;
  }

  /**
   * Calculate current trend for a metric
   */
  private calculateTrend(metricName: string): 'improving' | 'degrading' | 'stable' {
    const history = this.metricHistory.get(metricName);
    if (!history || history.length < 3) return 'stable';

    const recent = history.slice(-3);
    const values = recent.map(m => m.value);
    const trend = values[2] - values[0];

    const avgChange = Math.abs(trend) / values[0];
    if (avgChange < 0.01) return 'stable'; // Less than 1% change

    return trend > 0 ? 'improving' : 'degrading';
  }

  /**
   * Update baseline using exponential moving average
   */
  private updateBaseline(metricName: string): void {
    const history = this.metricHistory.get(metricName);
    if (!history || history.length < 10) return;

    // Use recent stable values (exclude outliers)
    const values = history.slice(-20).map(m => m.value).sort((a, b) => a - b);
    const q1 = values[Math.floor(values.length * 0.25)];
    const q3 = values[Math.floor(values.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const stableValues = values.filter(v => v >= lowerBound && v <= upperBound);
    const baseline = stableValues.reduce((sum, v) => sum + v, 0) / stableValues.length;

    this.baselines.set(metricName, baseline);
  }

  /**
   * Get recent history for a metric
   */
  private getRecentHistory(metricName: string, count: number): PerformanceMetric[] {
    const history = this.metricHistory.get(metricName);
    return history ? history.slice(-count) : [];
  }

  /**
   * Set baseline value for a metric
   */
  setBaseline(metricName: string, baseline: number): void {
    this.baselines.set(metricName, baseline);
  }

  /**
   * Get current baseline for a metric
   */
  getBaseline(metricName: string): number | undefined {
    return this.baselines.get(metricName);
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    metrics: string[];
    activeAlerts: string[];
    baselines: Record<string, number>;
    historyCounts: Record<string, number>;
  } {
    return {
      metrics: Array.from(this.metricHistory.keys()),
      activeAlerts: Array.from(this.lastAlertTime.entries())
        .filter(([_, time]) => Date.now() - time < this.config.alertCooldown)
        .map(([metric, _]) => metric),
      baselines: Object.fromEntries(this.baselines),
      historyCounts: Object.fromEntries(
        Array.from(this.metricHistory.entries()).map(([name, history]) => [name, history.length])
      )
    };
  }

  /**
   * Reset alert cooldown for a metric (useful for testing)
   */
  resetAlertCooldown(metricName: string): void {
    this.lastAlertTime.delete(metricName);
  }

  /**
   * Clear history for a metric
   */
  clearHistory(metricName?: string): void {
    if (metricName) {
      this.metricHistory.delete(metricName);
      this.baselines.delete(metricName);
      this.lastAlertTime.delete(metricName);
    } else {
      this.metricHistory.clear();
      this.baselines.clear();
      this.lastAlertTime.clear();
    }
  }
}
