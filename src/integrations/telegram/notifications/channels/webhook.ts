/**
 * Webhook Notification Channel
 *
 * Handles sending notifications via HTTP webhooks
 */

import type { Notification, NotificationRecipient } from '../types';
import type { NotificationChannelHandler } from '../manager';

interface WebhookChannelConfig {
  urls: string[];
  headers?: Record<string, string>;
  timeout?: number;
}

export class WebhookChannel implements NotificationChannelHandler {
  private config: WebhookChannelConfig;

  constructor(config: WebhookChannelConfig) {
    this.config = {
      timeout: 10000, // 10 seconds default
      ...config
    };
  }

  async send(notification: Notification, recipient: NotificationRecipient): Promise<{ success: boolean; error?: string }> {
    const urls = recipient.channelId ? [recipient.channelId] : this.config.urls;

    if (urls.length === 0) {
      return { success: false, error: 'No webhook URLs configured' };
    }

    const payload = this.formatPayload(notification);
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'ArsenalLab-Notifications/1.0',
      ...this.config.headers
    };

    const results = await Promise.allSettled(
      urls.map(url => this.sendToWebhook(url, payload, headers))
    );

    const failures = results.filter(result => result.status === 'rejected' || !result.value.success);

    if (failures.length === 0) {
      return { success: true };
    }

    const errorMessages = failures.map((failure, index) => {
      if (failure.status === 'rejected') {
        return `Webhook ${urls[index]}: ${failure.reason}`;
      }
      return `Webhook ${urls[index]}: ${failure.value.error}`;
    });

    return {
      success: false,
      error: `Failed to send to ${failures.length}/${urls.length} webhooks: ${errorMessages.join('; ')}`
    };
  }

  /**
   * Send payload to a specific webhook URL
   */
  private async sendToWebhook(url: string, payload: any, headers: Record<string, string>): Promise<{ success: boolean; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`
        };
      }

      return { success: true };

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { success: false, error: 'Request timeout' };
        }
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Unknown error' };
    }
  }

  /**
   * Format notification as webhook payload
   */
  private formatPayload(notification: Notification): any {
    return {
      id: notification.id,
      timestamp: notification.timestamp,
      topic: notification.topic,
      priority: notification.priority,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      metadata: notification.metadata,
      formatted: {
        timestamp: new Date(notification.timestamp).toISOString(),
        priority_level: this.getPriorityLevel(notification.priority),
        topic_emoji: this.getTopicEmoji(notification.topic)
      },
      // Include topic-specific structured data
      ...this.getTopicSpecificData(notification)
    };
  }

  /**
   * Get topic-specific structured data
   */
  private getTopicSpecificData(notification: Notification): any {
    switch (notification.topic) {
      case 'security':
        const sec = notification as any;
        return {
          security: {
            severity: sec.severity,
            cve: sec.cve,
            package: sec.package,
            affected_versions: sec.affectedVersions,
            patched_version: sec.patchedVersion,
            advisory_url: sec.advisoryUrl,
            exploit_available: sec.exploitAvailable
          }
        };

      case 'performance':
        const perf = notification as any;
        return {
          performance: {
            metric: perf.metric,
            value: perf.value,
            threshold: perf.threshold,
            unit: perf.unit,
            trend: perf.trend,
            baseline: perf.baseline,
            deviation: perf.baseline ? ((perf.value - perf.baseline) / perf.baseline * 100) : null
          }
        };

      case 'system':
        const sys = notification as any;
        return {
          system: {
            component: sys.component,
            status: sys.status,
            description: sys.description,
            affected_services: sys.affectedServices
          }
        };

      case 'build':
        const build = notification as any;
        return {
          build: {
            project: build.project,
            status: build.status,
            build_id: build.buildId,
            duration_ms: build.duration,
            commit_hash: build.commitHash,
            branch: build.branch,
            commit_url: build.commitHash ? `https://github.com/brendadeeznuts1111/Arsenal-Lab/commit/${build.commitHash}` : null
          }
        };

      case 'deployment':
        const deploy = notification as any;
        return {
          deployment: {
            environment: deploy.environment,
            status: deploy.status,
            version: deploy.version,
            rollback_version: deploy.rollbackVersion,
            affected_services: deploy.affectedServices
          }
        };

      default:
        return {};
    }
  }

  /**
   * Get numeric priority level
   */
  private getPriorityLevel(priority: string): number {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[priority as keyof typeof levels] || 0;
  }

  /**
   * Get emoji for notification topic
   */
  private getTopicEmoji(topic: string): string {
    const emojis: Record<string, string> = {
      security: '🔒',
      performance: '⚡',
      system: '🖥️',
      build: '🔨',
      deployment: '🚀',
      monitoring: '📊',
      maintenance: '🔧',
      emergency: '🚨'
    };
    return emojis[topic] || '📢';
  }
}
