/**
 * Notification Manager
 *
 * Central notification system for managing alerts, channels, and recipients
 */

import type {
  Notification,
  NotificationConfig,
  NotificationRecipient,
  NotificationResult,
  NotificationStats,
  NotificationChannel,
  NotificationTopic,
  NotificationPriority
} from './types';
import { TelegramChannel } from './channels/telegram';
import { WebhookChannel } from './channels/webhook';

export class NotificationManager {
  private config: NotificationConfig;
  private channels: Map<NotificationChannel, NotificationChannelHandler>;
  private stats: NotificationStats;
  private deduplicationCache: Map<string, number>;
  private retryQueue: Array<{ notification: Notification; recipient: NotificationRecipient; attempt: number }> = [];

  constructor(config: NotificationConfig) {
    this.config = config;
    this.channels = new Map();
    this.stats = this.initializeStats();
    this.deduplicationCache = new Map();

    this.initializeChannels();
    this.startRetryProcessor();
  }

  /**
   * Send notification to all eligible recipients
   */
  async send(notification: Notification): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    // Check deduplication
    if (this.isDuplicate(notification)) {
      console.log(`Notification ${notification.id} is duplicate, skipping`);
      return [];
    }

    // Find eligible recipients
    const eligibleRecipients = this.getEligibleRecipients(notification);

    for (const recipient of eligibleRecipients) {
      try {
        const result = await this.sendToRecipient(notification, recipient);
        results.push(result);
        this.updateStats(result);
      } catch (error) {
        console.error(`Failed to send notification ${notification.id} to recipient ${recipient.id}:`, error);
        const failedResult: NotificationResult = {
          success: false,
          notificationId: notification.id,
          channel: recipient.channel,
          recipientId: recipient.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        results.push(failedResult);
        this.updateStats(failedResult);

        // Queue for retry if appropriate
        if (this.shouldRetry(notification, failedResult)) {
          this.retryQueue.push({ notification, recipient, attempt: 1 });
        }
      }
    }

    // Mark as processed for deduplication
    this.markAsProcessed(notification);

    return results;
  }

  /**
   * Send notification to specific recipient
   */
  private async sendToRecipient(notification: Notification, recipient: NotificationRecipient): Promise<NotificationResult> {
    const channel = this.channels.get(recipient.channel);
    if (!channel) {
      throw new Error(`Channel ${recipient.channel} not configured`);
    }

    const result = await channel.send(notification, recipient);
    return {
      success: result.success,
      notificationId: notification.id,
      channel: recipient.channel,
      recipientId: recipient.id,
      error: result.error,
      sentAt: result.success ? Date.now() : undefined
    };
  }

  /**
   * Get recipients eligible for this notification
   */
  private getEligibleRecipients(notification: Notification): NotificationRecipient[] {
    return this.config.recipients.filter(recipient => {
      // Check if enabled
      if (!recipient.enabled) return false;

      // Check if topic is subscribed
      if (!recipient.topics.includes(notification.topic)) return false;

      // Check priority threshold
      if (this.getPriorityLevel(notification.priority) < this.getPriorityLevel(recipient.priorityThreshold)) {
        return false;
      }

      // Check filters
      if (recipient.filters && !this.matchesFilters(notification, recipient.filters)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Check if notification matches recipient filters
   */
  private matchesFilters(notification: Notification, filters: NotificationRecipient['filters'] = []): boolean {
    return filters.every(filter => {
      const value = this.getFilterValue(notification, filter.type);
      if (value === undefined) return false;

      switch (filter.operator) {
        case 'eq': return value === filter.value;
        case 'ne': return value !== filter.value;
        case 'gt': return typeof value === 'number' && typeof filter.value === 'number' && value > filter.value;
        case 'lt': return typeof value === 'number' && typeof filter.value === 'number' && value < filter.value;
        case 'gte': return typeof value === 'number' && typeof filter.value === 'number' && value >= filter.value;
        case 'lte': return typeof value === 'number' && typeof filter.value === 'number' && value <= filter.value;
        case 'contains': return typeof value === 'string' && typeof filter.value === 'string' && value.includes(filter.value);
        case 'regex': return typeof value === 'string' && typeof filter.value === 'string' && new RegExp(filter.value).test(value);
        default: return false;
      }
    });
  }

  /**
   * Get value for filter matching
   */
  private getFilterValue(notification: Notification, filterType: string): any {
    switch (filterType) {
      case 'severity':
        return notification.topic === 'security' ? (notification as any).severity : undefined;
      case 'package':
        return notification.topic === 'security' ? (notification as any).package : undefined;
      case 'cve':
        return notification.topic === 'security' ? (notification as any).cve : undefined;
      case 'metric':
        return notification.topic === 'performance' ? (notification as any).metric : undefined;
      case 'threshold':
        return notification.topic === 'performance' ? (notification as any).threshold : undefined;
      default:
        return notification.data?.[filterType];
    }
  }

  /**
   * Check if notification is duplicate within deduplication window
   */
  private isDuplicate(notification: Notification): boolean {
    const key = this.getDeduplicationKey(notification);
    const lastSent = this.deduplicationCache.get(key);
    const now = Date.now();

    if (lastSent && (now - lastSent) < this.config.settings.deduplicationWindow) {
      return true;
    }

    return false;
  }

  /**
   * Mark notification as processed for deduplication
   */
  private markAsProcessed(notification: Notification): void {
    const key = this.getDeduplicationKey(notification);
    this.deduplicationCache.set(key, Date.now());

    // Clean up old entries
    for (const [k, timestamp] of this.deduplicationCache.entries()) {
      if (Date.now() - timestamp > this.config.settings.deduplicationWindow) {
        this.deduplicationCache.delete(k);
      }
    }
  }

  /**
   * Generate deduplication key for notification
   */
  private getDeduplicationKey(notification: Notification): string {
    // Create a key based on notification content that should be unique per logical event
    const keyParts = [
      notification.topic,
      notification.title,
      notification.metadata?.correlationId || ''
    ];

    // Add topic-specific identifiers
    switch (notification.topic) {
      case 'security':
        const sec = notification as any;
        keyParts.push(sec.cve || '', sec.package || '');
        break;
      case 'performance':
        const perf = notification as any;
        keyParts.push(perf.metric || '', perf.value?.toString() || '');
        break;
      case 'build':
        const build = notification as any;
        keyParts.push(build.project || '', build.buildId || '');
        break;
    }

    return keyParts.join('|');
  }

  /**
   * Convert priority to numeric level for comparison
   */
  private getPriorityLevel(priority: NotificationPriority): number {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[priority];
  }

  /**
   * Initialize notification channels
   */
  private initializeChannels(): void {
    if (this.config.channels.telegram) {
      this.channels.set('telegram', new TelegramChannel(this.config.channels.telegram));
    }

    if (this.config.channels.webhook) {
      this.channels.set('webhook', new WebhookChannel(this.config.channels.webhook));
    }

    // TODO: Add other channels (email, slack, discord)
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): NotificationStats {
    return {
      totalSent: 0,
      totalFailed: 0,
      byTopic: {} as Record<NotificationTopic, number>,
      byPriority: {} as Record<NotificationPriority, number>,
      byChannel: {} as Record<NotificationChannel, number>,
      recentErrors: []
    };
  }

  /**
   * Update statistics
   */
  private updateStats(result: NotificationResult): void {
    if (result.success) {
      this.stats.totalSent++;
    } else {
      this.stats.totalFailed++;
      this.stats.recentErrors.unshift({
        timestamp: Date.now(),
        error: result.error || 'Unknown error',
        notificationId: result.notificationId
      });

      // Keep only last 100 errors
      if (this.stats.recentErrors.length > 100) {
        this.stats.recentErrors = this.stats.recentErrors.slice(0, 100);
      }
    }

    // Update topic stats
    const notification = { topic: 'system' as NotificationTopic }; // This would need to be passed or looked up
    // TODO: Improve this to track by topic properly

    // Update channel stats
    this.stats.byChannel[result.channel] = (this.stats.byChannel[result.channel] || 0) + 1;
  }

  /**
   * Check if notification should be retried
   */
  private shouldRetry(notification: Notification, result: NotificationResult): boolean {
    return !result.success &&
           (result.retryCount || 0) < this.config.settings.maxRetries &&
           notification.priority !== 'low'; // Don't retry low priority notifications
  }

  /**
   * Start retry processor
   */
  private startRetryProcessor(): void {
    setInterval(async () => {
      const now = Date.now();
      const toRetry = this.retryQueue.filter(item =>
        now - item.notification.timestamp > this.config.settings.retryDelay * Math.pow(2, item.attempt - 1)
      );

      for (const item of toRetry) {
        try {
          const result = await this.sendToRecipient(item.notification, item.recipient);
          if (result.success) {
            // Remove from retry queue
            const index = this.retryQueue.indexOf(item);
            if (index > -1) this.retryQueue.splice(index, 1);
          } else {
            item.attempt++;
            if (item.attempt >= this.config.settings.maxRetries) {
              // Remove from retry queue after max retries
              const index = this.retryQueue.indexOf(item);
              if (index > -1) this.retryQueue.splice(index, 1);
            }
          }
        } catch (error) {
          item.attempt++;
          if (item.attempt >= this.config.settings.maxRetries) {
            const index = this.retryQueue.indexOf(item);
            if (index > -1) this.retryQueue.splice(index, 1);
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get notification statistics
   */
  getStats(): NotificationStats {
    return { ...this.stats };
  }

  /**
   * Add or update recipient
   */
  addRecipient(recipient: NotificationRecipient): void {
    const existingIndex = this.config.recipients.findIndex(r => r.id === recipient.id);
    if (existingIndex >= 0) {
      this.config.recipients[existingIndex] = recipient;
    } else {
      this.config.recipients.push(recipient);
    }
  }

  /**
   * Remove recipient
   */
  removeRecipient(recipientId: string): void {
    this.config.recipients = this.config.recipients.filter(r => r.id !== recipientId);
  }

  /**
   * Get all recipients
   */
  getRecipients(): NotificationRecipient[] {
    return [...this.config.recipients];
  }
}

/**
 * Channel handler interface
 */
export interface NotificationChannelHandler {
  send(notification: Notification, recipient: NotificationRecipient): Promise<{
    success: boolean;
    error?: string;
  }>;
}
