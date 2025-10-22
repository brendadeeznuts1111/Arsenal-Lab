/**
 * Notification System Index
 *
 * Main entry point for the Arsenal Lab notification system
 */

export * from './channel-manager';
export * from './integration';
export * from './manager';
export * from './performance-monitor';
export * from './security-monitor';
export * from './types';

// Re-export channel implementations
export * from './channels/telegram';
export * from './channels/webhook';

/**
 * Initialize the complete notification system
 */
export async function initializeNotificationSystem(config: {
  telegram?: {
    botToken: string;
    channelId?: string;
    groupId?: string;
    webhookUrl?: string;
  };
  webhooks?: {
    urls: string[];
    headers?: Record<string, string>;
  };
  security?: {
    severityThresholds?: Record<string, boolean>;
  };
  performance?: {
    metrics: Record<string, any>;
  };
  betting?: {
    thresholds: {
      largeBetAmount: number;
      volumeSpikeMultiplier: number;
      unusualPatternThreshold: number;
      riskAlertThreshold: number;
    };
    monitoring: {
      enabled: boolean;
      checkInterval: number;
      maxHistorySize: number;
      agentRiskTracking: boolean;
      customerRiskTracking: boolean;
    };
  };
} = {}): Promise<{
  notificationManager: import('./manager').NotificationManager;
  securityMonitor: import('./security-monitor').SecurityMonitor;
  performanceMonitor: import('./performance-monitor').PerformanceMonitor;
  channelManager: import('./channel-manager').ChannelTopicManager;
  bettingMonitor: import('./betting-monitor').BettingMonitor;
  integration: import('./integration').NotificationIntegration;
}> {
  const { NotificationManager } = await import('./manager');
  const { SecurityMonitor } = await import('./security-monitor');
  const { PerformanceMonitor } = await import('./performance-monitor');
  const { ChannelTopicManager } = await import('./channel-manager');
  const { BettingMonitor } = await import('./betting-monitor');
  const { createBettingAPIClient } = await import('./betting-api-client');
  const { NotificationIntegration } = await import('./integration');

  // Create notification configuration
  const notificationConfig = {
    channels: {
      telegram: config.telegram ? {
        botToken: config.telegram.botToken,
        channelId: config.telegram.channelId,
        groupId: config.telegram.groupId
      } : undefined,
      webhook: config.webhooks ? {
        urls: config.webhooks.urls,
        headers: config.webhooks.headers
      } : undefined
    },
    topics: {
      security: { enabled: true, defaultPriority: 'high' as const },
      performance: { enabled: true, defaultPriority: 'medium' as const },
      system: { enabled: true, defaultPriority: 'high' as const },
      build: { enabled: true, defaultPriority: 'medium' as const },
      deployment: { enabled: true, defaultPriority: 'high' as const },
      monitoring: { enabled: true, defaultPriority: 'medium' as const },
      maintenance: { enabled: true, defaultPriority: 'low' as const },
      emergency: { enabled: true, defaultPriority: 'critical' as const },
      betting: { enabled: true, defaultPriority: 'medium' as const },
      financial: { enabled: true, defaultPriority: 'high' as const }
    },
    recipients: [], // Will be populated by users subscribing
    settings: {
      deduplicationWindow: 300000, // 5 minutes
      maxRetries: 3,
      retryDelay: 60000, // 1 minute
      batchSize: 10
    }
  };

  // Initialize components
  const notificationManager = new NotificationManager(notificationConfig);
  const securityMonitor = new SecurityMonitor(notificationManager);
  const performanceMonitor = new PerformanceMonitor(notificationManager, {
    metrics: config.performance?.metrics || {},
    alertCooldown: 300000, // 5 minutes
    trendAnalysis: {
      enabled: true,
      windowSize: 10,
      degradationThreshold: 10 // 10% degradation
    }
  });
  const channelManager = new ChannelTopicManager();

  // Create betting API client
  const bettingApiClient = createBettingAPIClient();

  const bettingMonitor = new BettingMonitor(notificationManager, {
    thresholds: {
      largeBetAmount: config.betting?.thresholds?.largeBetAmount || 10000,
      volumeSpikeMultiplier: config.betting?.thresholds?.volumeSpikeMultiplier || 2.0,
      unusualPatternThreshold: config.betting?.thresholds?.unusualPatternThreshold || 5,
      riskAlertThreshold: config.betting?.thresholds?.riskAlertThreshold || 10
    },
    monitoring: {
      enabled: config.betting?.monitoring?.enabled ?? true,
      checkInterval: config.betting?.monitoring?.checkInterval || 300000, // 5 minutes
      maxHistorySize: config.betting?.monitoring?.maxHistorySize || 10000,
      agentRiskTracking: config.betting?.monitoring?.agentRiskTracking ?? true,
      customerRiskTracking: config.betting?.monitoring?.customerRiskTracking ?? true
    }
  }, bettingApiClient);

  // Set security thresholds
  if (config.security?.severityThresholds) {
    securityMonitor.setSeverityThresholds(config.security.severityThresholds);
  }

  // Initialize integration
  const integration = new NotificationIntegration(
    {
      pollingIntervals: {
        securityAudit: 3600000, // 1 hour
        performanceMetrics: 300000, // 5 minutes
        systemHealth: 600000, // 10 minutes
        buildStatus: 60000, // 1 minute
        bettingData: config.betting?.monitoring?.checkInterval || 300000 // 5 minutes
      },
      endpoints: {
        health: 'http://localhost:3655/api/health',
        telemetry: 'http://localhost:3655/api/telemetry',
        diagnostics: 'http://localhost:3655/api/diagnostics',
        securityAudit: 'http://localhost:3655/api/security/audit',
        buildStatus: 'http://localhost:3655/api/build/status',
        bettingData: 'http://localhost:3655/api/betting/data'
      },
      enabledIntegrations: {
        fantasyBridge: true,
        securityScanner: true,
        performanceMonitor: true,
        systemHealth: true,
        buildMonitor: true,
        bettingMonitor: config.betting?.monitoring?.enabled ?? true
      }
    },
    notificationManager,
    securityMonitor,
    performanceMonitor,
    channelManager,
    bettingMonitor
  );

  return {
    notificationManager,
    securityMonitor,
    performanceMonitor,
    channelManager,
    bettingMonitor,
    integration
  };
}

/**
 * Quick setup for development/testing
 */
export async function createDevNotificationSystem(): Promise<{
  notificationManager: import('./manager').NotificationManager;
  securityMonitor: import('./security-monitor').SecurityMonitor;
  performanceMonitor: import('./performance-monitor').PerformanceMonitor;
  channelManager: import('./channel-manager').ChannelTopicManager;
  bettingMonitor: import('./betting-monitor').BettingMonitor;
  integration: import('./integration').NotificationIntegration;
}> {
  return initializeNotificationSystem({
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN || 'dev-token',
      channelId: process.env.TELEGRAM_CHANNEL_ID,
      groupId: process.env.TELEGRAM_GROUP_ID
    },
    webhooks: {
      urls: ['http://localhost:3000/webhook/notifications']
    },
    security: {
      severityThresholds: {
        info: false,
        low: false,
        moderate: true,
        high: true,
        critical: true
      }
    },
    performance: {
      metrics: {
        'response_time': {
          enabled: true,
          baseline: 100,
          thresholds: {
            warning: 150,
            critical: 300,
            direction: 'above'
          },
          unit: 'ms'
        },
        'error_rate': {
          enabled: true,
          baseline: 0.01,
          thresholds: {
            warning: 0.05,
            critical: 0.10,
            direction: 'above'
          },
          unit: 'percent'
        }
      }
    },
    betting: {
      thresholds: {
        largeBetAmount: 10000,
        volumeSpikeMultiplier: 2.0,
        unusualPatternThreshold: 5,
        riskAlertThreshold: 10
      },
      monitoring: {
        enabled: true,
        checkInterval: 300000, // 5 minutes
        maxHistorySize: 10000,
        agentRiskTracking: true,
        customerRiskTracking: true
      }
    }
  });
}
