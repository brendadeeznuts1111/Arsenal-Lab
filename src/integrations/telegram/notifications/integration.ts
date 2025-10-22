/**
 * Notification Integration Layer
 *
 * Integrates notification system with existing monitoring and bridge systems
 */

import type { BettingMonitor } from './betting-monitor';
import type { ChannelTopicManager } from './channel-manager';
import type { NotificationManager } from './manager';
import type { PerformanceMonitor } from './performance-monitor';
import type { SecurityMonitor } from './security-monitor';
import type { AuditResult } from './types';

interface IntegrationConfig {
  pollingIntervals: {
    securityAudit: number;     // milliseconds
    performanceMetrics: number;
    systemHealth: number;
    buildStatus: number;
    bettingData: number;       // milliseconds
  };
  endpoints: {
    health: string;
    telemetry: string;
    diagnostics: string;
    securityAudit: string;
    buildStatus: string;
    bettingData: string;
  };
  enabledIntegrations: {
    fantasyBridge: boolean;
    securityScanner: boolean;
    performanceMonitor: boolean;
    systemHealth: boolean;
    buildMonitor: boolean;
    bettingMonitor: boolean;
  };
}

export class NotificationIntegration {
  private config: IntegrationConfig;
  private notificationManager: NotificationManager;
  private securityMonitor: SecurityMonitor;
  private performanceMonitor: PerformanceMonitor;
  private channelManager: ChannelTopicManager;
  private bettingMonitor: BettingMonitor;
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    config: IntegrationConfig,
    notificationManager: NotificationManager,
    securityMonitor: SecurityMonitor,
    performanceMonitor: PerformanceMonitor,
    channelManager: ChannelTopicManager,
    bettingMonitor: BettingMonitor
  ) {
    this.config = config;
    this.notificationManager = notificationManager;
    this.securityMonitor = securityMonitor;
    this.performanceMonitor = performanceMonitor;
    this.channelManager = channelManager;
    this.bettingMonitor = bettingMonitor;
  }

  /**
   * Start all enabled integrations
   */
  async start(): Promise<void> {
    console.log('🚀 Starting notification integrations...');

    if (this.config.enabledIntegrations.securityScanner) {
      this.startSecurityIntegration();
    }

    if (this.config.enabledIntegrations.performanceMonitor) {
      this.startPerformanceIntegration();
    }

    if (this.config.enabledIntegrations.systemHealth) {
      this.startSystemHealthIntegration();
    }

    if (this.config.enabledIntegrations.fantasyBridge) {
      this.startFantasyBridgeIntegration();
    }

    if (this.config.enabledIntegrations.buildMonitor) {
      this.startBuildIntegration();
    }

    if (this.config.enabledIntegrations.bettingMonitor) {
      this.startBettingIntegration();
    }

    console.log('✅ Notification integrations started');
  }

  /**
   * Stop all integrations
   */
  stop(): void {
    console.log('🛑 Stopping notification integrations...');

    for (const [name, interval] of this.intervals) {
      clearInterval(interval);
      console.log(`Stopped ${name} integration`);
    }

    this.intervals.clear();
    console.log('✅ Notification integrations stopped');
  }

  /**
   * Start security scanner integration
   */
  private startSecurityIntegration(): void {
    const interval = setInterval(async () => {
      try {
        await this.pollSecurityAudits();
      } catch (error) {
        console.error('Security integration error:', error);
      }
    }, this.config.pollingIntervals.securityAudit);

    this.intervals.set('security', interval);
    console.log(`🔒 Security integration started (every ${this.config.pollingIntervals.securityAudit}ms)`);
  }

  /**
   * Start performance monitoring integration
   */
  private startPerformanceIntegration(): void {
    const interval = setInterval(async () => {
      try {
        await this.pollPerformanceMetrics();
      } catch (error) {
        console.error('Performance integration error:', error);
      }
    }, this.config.pollingIntervals.performanceMetrics);

    this.intervals.set('performance', interval);
    console.log(`⚡ Performance integration started (every ${this.config.pollingIntervals.performanceMetrics}ms)`);
  }

  /**
   * Start system health monitoring integration
   */
  private startSystemHealthIntegration(): void {
    const interval = setInterval(async () => {
      try {
        await this.pollSystemHealth();
      } catch (error) {
        console.error('System health integration error:', error);
      }
    }, this.config.pollingIntervals.systemHealth);

    this.intervals.set('system-health', interval);
    console.log(`🖥️ System health integration started (every ${this.config.pollingIntervals.systemHealth}ms)`);
  }

  /**
   * Start fantasy bridge integration
   */
  private startFantasyBridgeIntegration(): void {
    // Monitor fantasy bridge taps and performance
    const interval = setInterval(async () => {
      try {
        await this.pollFantasyBridgeMetrics();
      } catch (error) {
        console.error('Fantasy bridge integration error:', error);
      }
    }, 30000); // Every 30 seconds for real-time monitoring

    this.intervals.set('fantasy-bridge', interval);
    console.log('🎯 Fantasy bridge integration started (every 30s)');
  }

  /**
   * Start build monitoring integration
   */
  private startBuildIntegration(): void {
    const interval = setInterval(async () => {
      try {
        await this.pollBuildStatus();
      } catch (error) {
        console.error('Build integration error:', error);
      }
    }, this.config.pollingIntervals.buildStatus);

    this.intervals.set('build', interval);
    console.log(`🔨 Build integration started (every ${this.config.pollingIntervals.buildStatus}ms)`);
  }

  /**
   * Start betting monitoring integration
   */
  private startBettingIntegration(): void {
    const interval = setInterval(async () => {
      try {
        await this.pollBettingData();
      } catch (error) {
        console.error('Betting integration error:', error);
      }
    }, this.config.pollingIntervals.bettingData);

    this.intervals.set('betting', interval);
    console.log(`🎯 Betting integration started (every ${this.config.pollingIntervals.bettingData}ms)`);
  }

  /**
   * Poll security audit results
   */
  private async pollSecurityAudits(): Promise<void> {
    try {
      const response = await fetch(this.config.endpoints.securityAudit);
      if (!response.ok) {
        console.warn(`Security audit endpoint returned ${response.status}`);
        return;
      }

      const auditResult: AuditResult = await response.json();
      await this.securityMonitor.processAuditResults(auditResult);

    } catch (error) {
      console.error('Failed to poll security audits:', error);
    }
  }

  /**
   * Poll performance metrics
   */
  private async pollPerformanceMetrics(): Promise<void> {
    try {
      // Poll various performance metrics
      const metrics = await this.gatherPerformanceMetrics();
      Object.entries(metrics).forEach(([name, data]) => {
        this.performanceMonitor.recordMetric(name, data.value, data.unit);
      });

    } catch (error) {
      console.error('Failed to poll performance metrics:', error);
    }
  }

  /**
   * Poll system health status
   */
  private async pollSystemHealth(): Promise<void> {
    try {
      const [healthRes, telemetryRes, diagnosticsRes] = await Promise.allSettled([
        fetch(this.config.endpoints.health),
        fetch(this.config.endpoints.telemetry),
        fetch(this.config.endpoints.diagnostics)
      ]);

      const healthData = healthRes.status === 'fulfilled' && healthRes.value.ok
        ? await healthRes.value.json() : null;
      const telemetryData = telemetryRes.status === 'fulfilled' && telemetryRes.value.ok
        ? await telemetryRes.value.json() : null;
      const diagnosticsData = diagnosticsRes.status === 'fulfilled' && diagnosticsRes.value.ok
        ? await diagnosticsRes.value.json() : null;

      await this.processSystemHealthData(healthData, telemetryData, diagnosticsData);

    } catch (error) {
      console.error('Failed to poll system health:', error);
    }
  }

  /**
   * Poll fantasy bridge metrics
   */
  private async pollFantasyBridgeMetrics(): Promise<void> {
    try {
      // Check fantasy bridge health and metrics
      const bridgeHealth = await fetch('http://localhost:3655/healthz').then(r => r.ok);
      const bridgeMetrics = await fetch('http://localhost:3655/metrics').then(r => r.ok ? r.text() : null);

      // Record bridge-specific metrics
      this.performanceMonitor.recordMetric('fantasy_bridge_alive', bridgeHealth ? 1 : 0, 'boolean');

      if (bridgeMetrics) {
        // Parse and record metrics from /metrics endpoint
        this.parseAndRecordBridgeMetrics(bridgeMetrics);
      }

      // Check for bridge-specific alerts
      if (!bridgeHealth) {
        const notification = {
          id: `bridge-down-${Date.now()}`,
          timestamp: Date.now(),
          topic: 'system' as const,
          priority: 'critical' as const,
          title: '🚨 Fantasy Bridge Down',
          message: 'Fantasy bridge service is not responding. Immediate attention required.',
          data: { component: 'fantasy-bridge' },
          metadata: {
            source: 'integration',
            correlationId: `bridge-health-${Date.now()}`,
            tags: ['bridge', 'down', 'critical']
          }
        };
        await this.notificationManager.send(notification);
      }

    } catch (error) {
      console.error('Failed to poll fantasy bridge metrics:', error);
    }
  }

  /**
   * Poll build status
   */
  private async pollBuildStatus(): Promise<void> {
    try {
      const response = await fetch(this.config.endpoints.buildStatus);
      if (!response.ok) return;

      const buildData = await response.json();
      await this.processBuildData(buildData);

    } catch (error) {
      console.error('Failed to poll build status:', error);
    }
  }

  /**
   * Poll betting data for analysis and alerts
   */
  private async pollBettingData(): Promise<void> {
    try {
      // Poll monitored wagers for updates using the API client
      await this.bettingMonitor.pollMonitoredWagers();

      // Optionally fetch active wagers if available
      // This would require implementing getActiveWagers in the API client
      // const activeWagers = await this.bettingMonitor.getActiveWagers();
      // if (activeWagers.length > 0) {
      //   await this.bettingMonitor.processWagers(activeWagers);
      // }

    } catch (error) {
      console.error('Failed to poll betting data:', error);
    }
  }

  /**
   * Gather performance metrics from various sources
   */
  private async gatherPerformanceMetrics(): Promise<Record<string, { value: number; unit?: string }>> {
    const metrics: Record<string, { value: number; unit?: string }> = {};

    try {
      // CPU usage
      const cpuUsage = process.cpuUsage();
      metrics['process_cpu_user'] = { value: cpuUsage.user / 1000000, unit: 'seconds' }; // Convert to seconds
      metrics['process_cpu_system'] = { value: cpuUsage.system / 1000000, unit: 'seconds' };

      // Memory usage
      const memUsage = process.memoryUsage();
      metrics['process_memory_rss'] = { value: memUsage.rss, unit: 'bytes' };
      metrics['process_memory_heap_used'] = { value: memUsage.heapUsed, unit: 'bytes' };
      metrics['process_memory_heap_total'] = { value: memUsage.heapTotal, unit: 'bytes' };

      // Event loop lag (simplified)
      const start = process.hrtime.bigint();
      await new Promise(resolve => setImmediate(resolve));
      const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to milliseconds
      metrics['event_loop_lag'] = { value: lag, unit: 'ms' };

      // Telegram bot metrics (if available)
      try {
        const telegramMetrics = await fetch('http://localhost:3655/api/telegram/metrics').then(r => r.json());
        if (telegramMetrics) {
          metrics['telegram_messages_sent'] = { value: telegramMetrics.messagesSent || 0 };
          metrics['telegram_messages_received'] = { value: telegramMetrics.messagesReceived || 0 };
          metrics['telegram_active_users'] = { value: telegramMetrics.activeUsers || 0 };
        }
      } catch {
        // Ignore telegram metrics if not available
      }

    } catch (error) {
      console.error('Error gathering performance metrics:', error);
    }

    return metrics;
  }

  /**
   * Process system health data and send notifications
   */
  private async processSystemHealthData(
    healthData: any,
    telemetryData: any,
    diagnosticsData: any
  ): Promise<void> {
    // Check overall system health
    if (healthData?.status !== 'healthy') {
      const notification = {
        id: `system-unhealthy-${Date.now()}`,
        timestamp: Date.now(),
        topic: 'system' as const,
        priority: 'high' as const,
        title: '🟡 System Health Warning',
        message: `System status: ${healthData?.status || 'unknown'}. ${healthData?.message || ''}`,
        data: { health: healthData, telemetry: telemetryData, diagnostics: diagnosticsData },
        metadata: {
          source: 'system-health-monitor',
          correlationId: `health-${Date.now()}`,
          tags: ['health', 'system']
        }
      };
      await this.notificationManager.send(notification);
    }

    // Process telemetry data for performance insights
    if (telemetryData) {
      // Record key telemetry metrics
      Object.entries(telemetryData).forEach(([key, value]) => {
        if (typeof value === 'number') {
          this.performanceMonitor.recordMetric(`telemetry_${key}`, value);
        }
      });
    }

    // Check for critical diagnostics
    if (diagnosticsData?.critical && diagnosticsData.critical.length > 0) {
      const notification = {
        id: `diagnostics-critical-${Date.now()}`,
        timestamp: Date.now(),
        topic: 'system' as const,
        priority: 'critical' as const,
        title: '🚨 Critical System Diagnostics',
        message: `Critical issues detected: ${diagnosticsData.critical.join(', ')}`,
        data: { diagnostics: diagnosticsData },
        metadata: {
          source: 'diagnostics-monitor',
          correlationId: `diagnostics-${Date.now()}`,
          tags: ['diagnostics', 'critical']
        }
      };
      await this.notificationManager.send(notification);
    }
  }

  /**
   * Parse and record bridge-specific metrics
   */
  private parseAndRecordBridgeMetrics(metricsText: string): void {
    const lines = metricsText.split('\n');

    for (const line of lines) {
      if (line.startsWith('#')) continue; // Skip comments

      const [name, value] = line.split(' ');
      if (name && value && !isNaN(Number(value))) {
        this.performanceMonitor.recordMetric(`bridge_${name}`, Number(value));
      }
    }
  }

  /**
   * Process build data and send notifications
   */
  private async processBuildData(buildData: any): Promise<void> {
    if (!buildData) return;

    // Handle build status changes
    if (buildData.status && buildData.previousStatus !== buildData.status) {
      const priority = buildData.status === 'failed' ? 'high' : 'medium';

      const notification = {
        id: `build-${buildData.id}-${Date.now()}`,
        timestamp: Date.now(),
        topic: 'build' as const,
        priority: priority as const,
        title: `${buildData.status === 'failed' ? '❌' : buildData.status === 'success' ? '✅' : '🔄'} Build ${buildData.status.toUpperCase()}`,
        message: `Build ${buildData.id} ${buildData.status}${buildData.duration ? ` in ${Math.round(buildData.duration / 1000)}s` : ''}`,
        data: buildData,
        metadata: {
          source: 'build-monitor',
          correlationId: `build-${buildData.id}`,
          tags: ['build', buildData.status]
        }
      };

      await this.notificationManager.send(notification);
    }
  }

  /**
   * Get integration status
   */
  getStatus(): {
    enabledIntegrations: IntegrationConfig['enabledIntegrations'];
    activeIntervals: string[];
    config: IntegrationConfig;
  } {
    return {
      enabledIntegrations: this.config.enabledIntegrations,
      activeIntervals: Array.from(this.intervals.keys()),
      config: this.config
    };
  }

  /**
   * Manually trigger security audit check
   */
  async triggerSecurityAudit(): Promise<void> {
    await this.pollSecurityAudits();
  }

  /**
   * Manually trigger performance check
   */
  async triggerPerformanceCheck(): Promise<void> {
    await this.pollPerformanceMetrics();
  }

  /**
   * Manually trigger system health check
   */
  async triggerSystemHealthCheck(): Promise<void> {
    await this.pollSystemHealth();
  }
}
