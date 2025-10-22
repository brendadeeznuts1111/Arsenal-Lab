/**
 * Telegram Notification Channel
 *
 * Handles sending notifications via Telegram Bot API
 */

import type { NotificationChannelHandler } from '../manager';
import type { Notification, NotificationRecipient } from '../types';

interface TelegramChannelConfig {
  botToken: string;
  channelId?: string;
  groupId?: string;
  topicSupport?: boolean;
}

export class TelegramChannel implements NotificationChannelHandler {
  private config: TelegramChannelConfig;
  private baseUrl: string;

  constructor(config: TelegramChannelConfig) {
    this.config = config;
    this.baseUrl = `https://api.telegram.org/bot${config.botToken}`;
  }

  async send(notification: Notification, recipient: NotificationRecipient): Promise<{ success: boolean; error?: string }> {
    try {
      const chatId = this.getChatId(recipient);
      if (!chatId) {
        return { success: false, error: 'No chat ID configured for recipient' };
      }

      const message = this.formatMessage(notification);
      const payload: any = {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_notification: this.shouldDisableNotification(notification)
      };

      // Add topic support for groups that support it
      if (this.config.topicSupport && recipient.channelId && this.isGroupChat(chatId)) {
        // Extract topic ID from channelId if it contains topic information
        const topicMatch = recipient.channelId.match(/topic:(\d+)/);
        if (topicMatch) {
          payload.message_thread_id = parseInt(topicMatch[1]);
        }
      }

      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Telegram API error: ${response.status} ${error}` };
      }

      const result = await response.json();
      return { success: result.ok, error: result.ok ? undefined : result.description };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get the appropriate chat ID for the recipient
   */
  private getChatId(recipient: NotificationRecipient): string | undefined {
    // Use recipient-specific channel ID if provided
    if (recipient.channelId) {
      return recipient.channelId;
    }

    // Fall back to configured defaults based on notification topic
    // This allows different topics to go to different channels
    const topic = recipient.topics[0]; // Use first topic as primary

    switch (topic) {
      case 'security':
        return this.config.channelId; // Security goes to main channel
      case 'emergency':
        return this.config.groupId; // Emergency goes to group for immediate attention
      case 'performance':
      case 'monitoring':
        return this.config.groupId || this.config.channelId;
      default:
        return this.config.groupId || this.config.channelId;
    }
  }

  /**
   * Format notification as Telegram message
   */
  private formatMessage(notification: Notification): string {
    const emoji = this.getTopicEmoji(notification.topic);
    const priorityEmoji = this.getPriorityEmoji(notification.priority);

    let message = `${emoji} ${priorityEmoji} <b>${notification.title}</b>\n\n`;
    message += `${notification.message}\n\n`;

    // Add topic-specific details
    message += this.formatTopicDetails(notification);

    // Add metadata if present
    if (notification.metadata) {
      message += `\n<i>Topic: ${notification.topic}`;
      if (notification.metadata.source) {
        message += ` | Source: ${notification.metadata.source}`;
      }
      if (notification.metadata.correlationId) {
        message += ` | ID: ${notification.metadata.correlationId.slice(-8)}`;
      }
      message += '</i>';
    }

    // Add timestamp
    const timestamp = new Date(notification.timestamp).toLocaleString();
    message += `\n<code>${timestamp}</code>`;

    return message;
  }

  /**
   * Format topic-specific details
   */
  private formatTopicDetails(notification: Notification): string {
    switch (notification.topic) {
      case 'security':
        const sec = notification as any;
        let details = '';
        if (sec.severity) {
          details += `Severity: <b>${sec.severity.toUpperCase()}</b>\n`;
        }
        if (sec.cve) {
          details += `CVE: <code>${sec.cve}</code>\n`;
        }
        if (sec.package) {
          details += `Package: <code>${sec.package}</code>\n`;
        }
        if (sec.advisoryUrl) {
          details += `Advisory: ${sec.advisoryUrl}\n`;
        }
        if (sec.exploitAvailable) {
          details += `⚠️ <b>EXPLOIT AVAILABLE</b>\n`;
        }
        return details;

      case 'performance':
        const perf = notification as any;
        let perfDetails = '';
        if (perf.metric) {
          perfDetails += `Metric: <code>${perf.metric}</code>\n`;
        }
        if (perf.value !== undefined) {
          perfDetails += `Value: <b>${perf.value}${perf.unit || ''}</b>\n`;
        }
        if (perf.threshold !== undefined) {
          perfDetails += `Threshold: ${perf.threshold}${perf.unit || ''}\n`;
        }
        if (perf.trend) {
          const trendEmoji = perf.trend === 'improving' ? '📈' : perf.trend === 'degrading' ? '📉' : '➡️';
          perfDetails += `Trend: ${trendEmoji} ${perf.trend}\n`;
        }
        return perfDetails;

      case 'system':
        const sys = notification as any;
        let sysDetails = '';
        if (sys.component) {
          sysDetails += `Component: <code>${sys.component}</code>\n`;
        }
        const statusEmoji = sys.status === 'up' ? '🟢' : sys.status === 'down' ? '🔴' : sys.status === 'degraded' ? '🟡' : '🟠';
        sysDetails += `Status: ${statusEmoji} ${sys.status.toUpperCase()}\n`;
        if (sys.affectedServices?.length) {
          sysDetails += `Affected: ${sys.affectedServices.join(', ')}\n`;
        }
        return sysDetails;

      case 'build':
        const build = notification as any;
        let buildDetails = '';
        if (build.project) {
          buildDetails += `Project: <code>${build.project}</code>\n`;
        }
        if (build.branch) {
          buildDetails += `Branch: <code>${build.branch}</code>\n`;
        }
        if (build.commitHash) {
          buildDetails += `Commit: <code>${build.commitHash.slice(0, 8)}</code>\n`;
        }
        if (build.duration) {
          buildDetails += `Duration: ${Math.round(build.duration / 1000)}s\n`;
        }
        return buildDetails;

      case 'deployment':
        const deploy = notification as any;
        let deployDetails = '';
        if (deploy.environment) {
          deployDetails += `Environment: <code>${deploy.environment}</code>\n`;
        }
        if (deploy.version) {
          deployDetails += `Version: <code>${deploy.version}</code>\n`;
        }
        if (deploy.affectedServices?.length) {
          deployDetails += `Services: ${deploy.affectedServices.join(', ')}\n`;
        }
        return deployDetails;

      case 'betting':
        const bet = notification as any;
        let betDetails = '';
        if (bet.wagerId) {
          betDetails += `Wager ID: <code>${bet.wagerId}</code>\n`;
        }
        if (bet.customerId) {
          betDetails += `Customer: <code>${bet.customerId}</code>\n`;
        }
        if (bet.amount) {
          betDetails += `Amount: <b>$${bet.amount.toLocaleString()}</b>\n`;
        }
        if (bet.potentialPayout) {
          betDetails += `Potential Payout: <b>$${bet.potentialPayout.toLocaleString()}</b>\n`;
        }
        if (bet.anomalyType) {
          const anomalyEmoji = {
            'large_bet': '💰',
            'unusual_pattern': '📊',
            'volume_spike': '📈',
            'risk_alert': '⚠️'
          }[bet.anomalyType] || '🎯';
          betDetails += `Alert: ${anomalyEmoji} ${bet.anomalyType.replace('_', ' ').toUpperCase()}\n`;
        }
        if (bet.riskLevel) {
          const riskEmoji = {
            'low': '🟢',
            'medium': '🟡',
            'high': '🟠',
            'critical': '🔴'
          }[bet.riskLevel] || '⚪';
          betDetails += `Risk Level: ${riskEmoji} ${bet.riskLevel.toUpperCase()}\n`;
        }
        return betDetails;

      case 'financial':
        const fin = notification as any;
        let finDetails = '';
        if (fin.transactionType) {
          finDetails += `Type: <code>${fin.transactionType.toUpperCase()}</code>\n`;
        }
        if (fin.amount) {
          finDetails += `Amount: <b>$${fin.amount.toLocaleString()}</b>\n`;
        }
        if (fin.accountId) {
          finDetails += `Account: <code>${fin.accountId}</code>\n`;
        }
        if (fin.netPosition !== undefined) {
          const positionEmoji = fin.netPosition >= 0 ? '📈' : '📉';
          finDetails += `Net Position: ${positionEmoji} $${fin.netPosition.toLocaleString()}\n`;
        }
        if (fin.alertType) {
          const alertEmoji = {
            'profit_threshold': '💰',
            'loss_threshold': '📉',
            'volume_spike': '📊',
            'cash_flow_alert': '💸'
          }[fin.alertType] || '💰';
          finDetails += `Alert: ${alertEmoji} ${fin.alertType.replace('_', ' ').toUpperCase()}\n`;
        }
        return finDetails;

      default:
        return '';
    }
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
      emergency: '🚨',
      betting: '🎯',
      financial: '💰'
    };
    return emojis[topic] || '📢';
  }

  /**
   * Get emoji for notification priority
   */
  private getPriorityEmoji(priority: string): string {
    const emojis: Record<string, string> = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🔔',
      critical: '🚨'
    };
    return emojis[priority] || '📢';
  }

  /**
   * Check if chat ID represents a group/supergroup
   */
  private isGroupChat(chatId: string): boolean {
    // Telegram group IDs are negative numbers
    return chatId.startsWith('-');
  }

  /**
   * Determine if notification should disable sound
   */
  private shouldDisableNotification(notification: Notification): boolean {
    // Disable sound for low priority notifications
    return notification.priority === 'low';
  }
}
