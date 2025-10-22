/**
 * Channel and Topic Management System
 *
 * Organizes notifications by channels, topics, and categories
 */

import type { NotificationChannel, NotificationPriority, NotificationTopic } from './types';

export interface ChannelConfig {
  id: string;
  name: string;
  type: NotificationChannel;
  channelId?: string; // Telegram channel/group ID
  webhookUrl?: string;
  enabled: boolean;
  description?: string;
  settings: {
    rateLimit?: {
      maxPerHour: number;
      maxPerDay: number;
    };
    quietHours?: {
      start: string; // HH:MM format
      end: string;   // HH:MM format
      timezone: string;
    };
    batchNotifications?: {
      enabled: boolean;
      maxBatchSize: number;
      batchWindow: number; // milliseconds
    };
  };
}

export interface TopicConfig {
  name: NotificationTopic;
  displayName: string;
  description: string;
  emoji: string;
  defaultPriority: NotificationPriority;
  enabled: boolean;
  channels: string[]; // Channel IDs that handle this topic
  rules: {
    deduplicationWindow: number; // milliseconds
    escalationThreshold?: number; // Number of similar notifications before escalation
    autoResolveAfter?: number; // Auto-resolve after this time
  };
  metadata: {
    category: string;
    tags: string[];
    requiresAck: boolean;
  };
}

export interface CategoryConfig {
  name: string;
  displayName: string;
  description: string;
  emoji: string;
  topics: NotificationTopic[];
  priority: NotificationPriority;
  channels: string[];
  settings: {
    consolidatedReporting: boolean;
    summaryFrequency: 'hourly' | 'daily' | 'weekly';
    escalationPolicy: {
      levels: NotificationPriority[];
      delays: number[]; // Delay before escalating to next level
    };
  };
}

export class ChannelTopicManager {
  private channels: Map<string, ChannelConfig> = new Map();
  private topics: Map<NotificationTopic, TopicConfig> = new Map();
  private categories: Map<string, CategoryConfig> = new Map();
  private topicChannelMapping: Map<NotificationTopic, Set<string>> = new Map();

  constructor() {
    this.initializeDefaults();
  }

  /**
   * Initialize default channels, topics, and categories
   */
  private initializeDefaults(): void {
    // Default channels
    this.addChannel({
      id: 'telegram-main',
      name: 'Main Telegram Channel',
      type: 'telegram',
      enabled: true,
      description: 'Primary notification channel',
      settings: {}
    });

    this.addChannel({
      id: 'telegram-security',
      name: 'Security Alerts',
      type: 'telegram',
      enabled: true,
      description: 'Critical security notifications',
      settings: {}
    });

    this.addChannel({
      id: 'webhook-monitoring',
      name: 'Monitoring Webhook',
      type: 'webhook',
      enabled: true,
      description: 'External monitoring integration',
      settings: {}
    });

    // Default topics
    this.addTopic({
      name: 'security',
      displayName: 'Security',
      description: 'Security vulnerabilities and patches',
      emoji: '🔒',
      defaultPriority: 'high',
      enabled: true,
      channels: ['telegram-security', 'webhook-monitoring'],
      rules: {
        deduplicationWindow: 300000, // 5 minutes
        escalationThreshold: 3
      },
      metadata: {
        category: 'security',
        tags: ['security', 'vulnerability'],
        requiresAck: true
      }
    });

    this.addTopic({
      name: 'performance',
      displayName: 'Performance',
      description: 'Performance metrics and degradation alerts',
      emoji: '⚡',
      defaultPriority: 'medium',
      enabled: true,
      channels: ['telegram-main', 'webhook-monitoring'],
      rules: {
        deduplicationWindow: 600000, // 10 minutes
      },
      metadata: {
        category: 'monitoring',
        tags: ['performance', 'metrics'],
        requiresAck: false
      }
    });

    this.addTopic({
      name: 'system',
      displayName: 'System',
      description: 'System status and health alerts',
      emoji: '🖥️',
      defaultPriority: 'high',
      enabled: true,
      channels: ['telegram-main', 'webhook-monitoring'],
      rules: {
        deduplicationWindow: 300000,
      },
      metadata: {
        category: 'infrastructure',
        tags: ['system', 'health'],
        requiresAck: true
      }
    });

    this.addTopic({
      name: 'build',
      displayName: 'Build',
      description: 'Build status and CI/CD alerts',
      emoji: '🔨',
      defaultPriority: 'medium',
      enabled: true,
      channels: ['telegram-main'],
      rules: {
        deduplicationWindow: 60000, // 1 minute
      },
      metadata: {
        category: 'development',
        tags: ['build', 'ci', 'cd'],
        requiresAck: false
      }
    });

    this.addTopic({
      name: 'deployment',
      displayName: 'Deployment',
      description: 'Deployment status and release alerts',
      emoji: '🚀',
      defaultPriority: 'high',
      enabled: true,
      channels: ['telegram-main', 'webhook-monitoring'],
      rules: {
        deduplicationWindow: 300000,
      },
      metadata: {
        category: 'deployment',
        tags: ['deployment', 'release'],
        requiresAck: true
      }
    });

    this.addTopic({
      name: 'monitoring',
      displayName: 'Monitoring',
      description: 'General monitoring and alerting',
      emoji: '📊',
      defaultPriority: 'medium',
      enabled: true,
      channels: ['telegram-main'],
      rules: {
        deduplicationWindow: 300000,
      },
      metadata: {
        category: 'monitoring',
        tags: ['monitoring', 'alerts'],
        requiresAck: false
      }
    });

    this.addTopic({
      name: 'maintenance',
      displayName: 'Maintenance',
      description: 'Maintenance windows and updates',
      emoji: '🔧',
      defaultPriority: 'low',
      enabled: true,
      channels: ['telegram-main'],
      rules: {
        deduplicationWindow: 3600000, // 1 hour
      },
      metadata: {
        category: 'maintenance',
        tags: ['maintenance', 'updates'],
        requiresAck: false
      }
    });

    this.addTopic({
      name: 'emergency',
      displayName: 'Emergency',
      description: 'Critical system emergencies',
      emoji: '🚨',
      defaultPriority: 'critical',
      enabled: true,
      channels: ['telegram-main', 'telegram-security', 'webhook-monitoring'],
      rules: {
        deduplicationWindow: 60000, // 1 minute - allow emergency spam
      },
      metadata: {
        category: 'emergency',
        tags: ['emergency', 'critical'],
        requiresAck: true
      }
    });

    this.addTopic({
      name: 'betting',
      displayName: 'Betting',
      description: 'Betting activity monitoring and alerts',
      emoji: '🎯',
      defaultPriority: 'medium',
      enabled: true,
      channels: ['telegram-main', 'webhook-monitoring'],
      rules: {
        deduplicationWindow: 300000, // 5 minutes
      },
      metadata: {
        category: 'betting',
        tags: ['betting', 'wagers', 'gambling'],
        requiresAck: false
      }
    });

    this.addTopic({
      name: 'financial',
      displayName: 'Financial',
      description: 'Financial transactions and loss/profit alerts',
      emoji: '💰',
      defaultPriority: 'high',
      enabled: true,
      channels: ['telegram-main', 'telegram-security', 'webhook-monitoring'],
      rules: {
        deduplicationWindow: 60000, // 1 minute
      },
      metadata: {
        category: 'financial',
        tags: ['financial', 'transactions', 'profit', 'loss'],
        requiresAck: true
      }
    });

    // Default categories
    this.addCategory({
      name: 'security',
      displayName: 'Security',
      description: 'Security-related notifications',
      emoji: '🛡️',
      topics: ['security'],
      priority: 'high',
      channels: ['telegram-security', 'webhook-monitoring'],
      settings: {
        consolidatedReporting: true,
        summaryFrequency: 'daily',
        escalationPolicy: {
          levels: ['medium', 'high', 'critical'],
          delays: [300000, 600000] // 5min, 10min
        }
      }
    });

    this.addCategory({
      name: 'infrastructure',
      displayName: 'Infrastructure',
      description: 'System and infrastructure notifications',
      emoji: '🏗️',
      topics: ['system', 'performance', 'monitoring'],
      priority: 'medium',
      channels: ['telegram-main', 'webhook-monitoring'],
      settings: {
        consolidatedReporting: true,
        summaryFrequency: 'hourly',
        escalationPolicy: {
          levels: ['low', 'medium', 'high'],
          delays: [600000, 1800000] // 10min, 30min
        }
      }
    });

    this.addCategory({
      name: 'development',
      displayName: 'Development',
      description: 'Development and deployment notifications',
      emoji: '💻',
      topics: ['build', 'deployment'],
      priority: 'medium',
      channels: ['telegram-main'],
      settings: {
        consolidatedReporting: false,
        summaryFrequency: 'daily',
        escalationPolicy: {
          levels: ['low', 'medium', 'high'],
          delays: [300000] // 5min
        }
      }
    });

    this.addCategory({
      name: 'betting',
      displayName: 'Betting & Financial',
      description: 'Betting activity and financial transaction monitoring',
      emoji: '🎰',
      topics: ['betting', 'financial'],
      priority: 'high',
      channels: ['telegram-main', 'telegram-security', 'webhook-monitoring'],
      settings: {
        consolidatedReporting: true,
        summaryFrequency: 'hourly',
        escalationPolicy: {
          levels: ['medium', 'high', 'critical'],
          delays: [600000, 1800000] // 10min, 30min
        }
      }
    });
  }

  /**
   * Add a channel configuration
   */
  addChannel(config: ChannelConfig): void {
    this.channels.set(config.id, config);
  }

  /**
   * Remove a channel
   */
  removeChannel(channelId: string): void {
    this.channels.delete(channelId);

    // Remove from topic mappings
    this.topics.forEach(topic => {
      topic.channels = topic.channels.filter(id => id !== channelId);
    });

    // Remove from category mappings
    this.categories.forEach(category => {
      category.channels = category.channels.filter(id => id !== channelId);
    });
  }

  /**
   * Add a topic configuration
   */
  addTopic(config: TopicConfig): void {
    this.topics.set(config.name, config);

    // Update channel mapping
    if (!this.topicChannelMapping.has(config.name)) {
      this.topicChannelMapping.set(config.name, new Set());
    }
    const channelSet = this.topicChannelMapping.get(config.name)!;
    config.channels.forEach(channelId => channelSet.add(channelId));
  }

  /**
   * Remove a topic
   */
  removeTopic(topicName: NotificationTopic): void {
    this.topics.delete(topicName);
    this.topicChannelMapping.delete(topicName);

    // Remove from categories
    this.categories.forEach(category => {
      category.topics = category.topics.filter(topic => topic !== topicName);
    });
  }

  /**
   * Add a category configuration
   */
  addCategory(config: CategoryConfig): void {
    this.categories.set(config.name, config);
  }

  /**
   * Remove a category
   */
  removeCategory(categoryName: string): void {
    this.categories.delete(categoryName);
  }

  /**
   * Get channels for a specific topic
   */
  getChannelsForTopic(topic: NotificationTopic): ChannelConfig[] {
    const topicConfig = this.topics.get(topic);
    if (!topicConfig) return [];

    return topicConfig.channels
      .map(channelId => this.channels.get(channelId))
      .filter((channel): channel is ChannelConfig => channel !== undefined && channel.enabled);
  }

  /**
   * Get topics for a specific category
   */
  getTopicsForCategory(category: string): TopicConfig[] {
    const categoryConfig = this.categories.get(category);
    if (!categoryConfig) return [];

    return categoryConfig.topics
      .map(topicName => this.topics.get(topicName))
      .filter((topic): topic is TopicConfig => topic !== undefined && topic.enabled);
  }

  /**
   * Get all enabled channels
   */
  getEnabledChannels(): ChannelConfig[] {
    return Array.from(this.channels.values()).filter(channel => channel.enabled);
  }

  /**
   * Get all enabled topics
   */
  getEnabledTopics(): TopicConfig[] {
    return Array.from(this.topics.values()).filter(topic => topic.enabled);
  }

  /**
   * Get category for a topic
   */
  getCategoryForTopic(topic: NotificationTopic): CategoryConfig | undefined {
    for (const category of this.categories.values()) {
      if (category.topics.includes(topic)) {
        return category;
      }
    }
    return undefined;
  }

  /**
   * Check if a channel is in quiet hours
   */
  isChannelInQuietHours(channelId: string): boolean {
    const channel = this.channels.get(channelId);
    if (!channel?.settings.quietHours) return false;

    const now = new Date();
    const timezone = channel.settings.quietHours.timezone || 'UTC';

    // This is a simplified check - in production you'd use a proper timezone library
    const [startHour, startMinute] = channel.settings.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = channel.settings.quietHours.end.split(':').map(Number);

    const start = new Date(now);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(now);
    end.setHours(endHour, endMinute, 0, 0);

    return now >= start && now <= end;
  }

  /**
   * Get topic configuration
   */
  getTopicConfig(topic: NotificationTopic): TopicConfig | undefined {
    return this.topics.get(topic);
  }

  /**
   * Get channel configuration
   */
  getChannelConfig(channelId: string): ChannelConfig | undefined {
    return this.channels.get(channelId);
  }

  /**
   * Get category configuration
   */
  getCategoryConfig(categoryName: string): CategoryConfig | undefined {
    return this.categories.get(categoryName);
  }

  /**
   * Get comprehensive channel-topic mapping
   */
  getChannelTopicMapping(): Record<string, NotificationTopic[]> {
    const mapping: Record<string, NotificationTopic[]> = {};

    for (const [channelId, channel] of this.channels) {
      if (channel.enabled) {
        mapping[channelId] = [];
        for (const [topicName, topic] of this.topics) {
          if (topic.enabled && topic.channels.includes(channelId)) {
            mapping[channelId].push(topicName);
          }
        }
      }
    }

    return mapping;
  }

  /**
   * Get statistics about the configuration
   */
  getStats(): {
    channels: number;
    enabledChannels: number;
    topics: number;
    enabledTopics: number;
    categories: number;
    channelTopicMappings: number;
  } {
    return {
      channels: this.channels.size,
      enabledChannels: Array.from(this.channels.values()).filter(c => c.enabled).length,
      topics: this.topics.size,
      enabledTopics: Array.from(this.topics.values()).filter(t => t.enabled).length,
      categories: this.categories.size,
      channelTopicMappings: Array.from(this.topicChannelMapping.values())
        .reduce((sum, set) => sum + set.size, 0)
    };
  }

  /**
   * Export configuration as JSON
   */
  exportConfig(): {
    channels: ChannelConfig[];
    topics: TopicConfig[];
    categories: CategoryConfig[];
  } {
    return {
      channels: Array.from(this.channels.values()),
      topics: Array.from(this.topics.values()),
      categories: Array.from(this.categories.values())
    };
  }

  /**
   * Import configuration from JSON
   */
  importConfig(config: {
    channels?: ChannelConfig[];
    topics?: TopicConfig[];
    categories?: CategoryConfig[];
  }): void {
    if (config.channels) {
      config.channels.forEach(channel => this.addChannel(channel));
    }

    if (config.topics) {
      config.topics.forEach(topic => this.addTopic(topic));
    }

    if (config.categories) {
      config.categories.forEach(category => this.addCategory(category));
    }
  }
}
