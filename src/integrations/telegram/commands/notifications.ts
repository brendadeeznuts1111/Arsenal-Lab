/**
 * Notification Management Commands
 *
 * Commands for managing notification subscriptions and preferences
 */

import type { NotificationManager } from '../../notifications/manager';
import type { NotificationPriority, NotificationRecipient, NotificationTopic } from '../../notifications/types';
import type { BotContext } from '../types';

export class NotificationCommands {
  private notificationManager: NotificationManager;
  private bettingMonitor?: any; // Will be injected

  constructor(notificationManager: NotificationManager, bettingMonitor?: any) {
    this.notificationManager = notificationManager;
    this.bettingMonitor = bettingMonitor;
  }

  /**
   * Handle /notify command - main notification management
   */
  async handleNotify(ctx: BotContext): Promise<string> {
    const args = ctx.args;
    const subCommand = args[0]?.toLowerCase();

    switch (subCommand) {
      case 'subscribe':
      case 'sub':
        return this.handleSubscribe(ctx);
      case 'unsubscribe':
      case 'unsub':
        return this.handleUnsubscribe(ctx);
      case 'list':
      case 'ls':
        return this.handleListSubscriptions(ctx);
      case 'topics':
        return this.handleListTopics(ctx);
      case 'config':
      case 'settings':
        return this.handleConfig(ctx);
      case 'test':
        return this.handleTest(ctx);
      case 'bet':
      case 'wager':
        return this.handleBetting(ctx);
      default:
        return this.showHelp(ctx);
    }
  }

  /**
   * Handle subscription to notifications
   */
  private async handleSubscribe(ctx: BotContext): Promise<string> {
    const args = ctx.args.slice(1); // Remove 'subscribe'
    const userId = ctx.user.id.toString();
    const chatId = ctx.chat.id.toString();

    if (args.length === 0) {
      return `❌ Please specify topics to subscribe to.\n\nUse: /notify subscribe <topics>\nExample: /notify subscribe security performance\n\nAvailable topics: ${this.getAvailableTopics().join(', ')}`;
    }

    // Parse topics and priority
    const topics: NotificationTopic[] = [];
    let priorityThreshold: NotificationPriority = 'medium';
    let channelId: string | undefined;

    for (const arg of args) {
      const lowerArg = arg.toLowerCase();

      if (this.isValidTopic(lowerArg)) {
        topics.push(lowerArg as NotificationTopic);
      } else if (this.isValidPriority(lowerArg)) {
        priorityThreshold = lowerArg as NotificationPriority;
      } else if (lowerArg.startsWith('channel:') || lowerArg.startsWith('topic:')) {
        channelId = arg;
      } else {
        return `❌ Unknown topic or priority: ${arg}\n\nAvailable topics: ${this.getAvailableTopics().join(', ')}\nAvailable priorities: low, medium, high, critical`;
      }
    }

    if (topics.length === 0) {
      return '❌ Please specify at least one topic to subscribe to.';
    }

    // Get or create recipient
    let recipient = this.notificationManager.getRecipients().find(r => r.id === userId);
    if (!recipient) {
      recipient = {
        id: userId,
        channel: 'telegram',
        channelId: channelId || chatId,
        topics: [],
        priorityThreshold: 'medium',
        enabled: true
      };
    }

    // Add new topics (avoid duplicates)
    const newTopics = topics.filter(topic => !recipient.topics.includes(topic));
    recipient.topics.push(...newTopics);

    // Update priority if specified
    if (priorityThreshold !== 'medium' || recipient.priorityThreshold === undefined) {
      recipient.priorityThreshold = priorityThreshold;
    }

    // Update channel ID if specified
    if (channelId) {
      recipient.channelId = channelId;
    }

    this.notificationManager.addRecipient(recipient);

    const topicList = recipient.topics.join(', ');
    return `✅ Subscribed to notifications!\n\n📋 Topics: ${topicList}\n🎯 Priority threshold: ${recipient.priorityThreshold}\n📺 Channel: ${recipient.channelId || 'default'}`;
  }

  /**
   * Handle unsubscription from notifications
   */
  private async handleUnsubscribe(ctx: BotContext): Promise<string> {
    const args = ctx.args.slice(1); // Remove 'unsubscribe'
    const userId = ctx.user.id.toString();

    const recipient = this.notificationManager.getRecipients().find(r => r.id === userId);
    if (!recipient) {
      return '❌ You are not subscribed to any notifications.';
    }

    if (args.length === 0) {
      // Unsubscribe from all
      recipient.topics = [];
      recipient.enabled = false;
      this.notificationManager.addRecipient(recipient);
      return '✅ Unsubscribed from all notifications.';
    }

    // Unsubscribe from specific topics
    const topicsToRemove: NotificationTopic[] = [];
    for (const arg of args) {
      const lowerArg = arg.toLowerCase();
      if (this.isValidTopic(lowerArg)) {
        topicsToRemove.push(lowerArg as NotificationTopic);
      } else {
        return `❌ Unknown topic: ${arg}`;
      }
    }

    recipient.topics = recipient.topics.filter(topic => !topicsToRemove.includes(topic));
    this.notificationManager.addRecipient(recipient);

    if (recipient.topics.length === 0) {
      return '✅ Unsubscribed from all notifications.';
    }

    return `✅ Unsubscribed from: ${topicsToRemove.join(', ')}\n\n📋 Remaining topics: ${recipient.topics.join(', ')}`;
  }

  /**
   * Handle listing current subscriptions
   */
  private async handleListSubscriptions(ctx: BotContext): Promise<string> {
    const userId = ctx.user.id.toString();
    const recipient = this.notificationManager.getRecipients().find(r => r.id === userId);

    if (!recipient || !recipient.enabled || recipient.topics.length === 0) {
      return '❌ You are not subscribed to any notifications.\n\nUse /notify subscribe <topics> to subscribe.';
    }

    let message = '📋 Your Notification Subscriptions:\n\n';
    message += `📺 Channel: ${recipient.channelId || 'default'}\n`;
    message += `🎯 Priority threshold: ${recipient.priorityThreshold}\n`;
    message += `📊 Topics: ${recipient.topics.join(', ')}\n\n`;

    if (recipient.filters && recipient.filters.length > 0) {
      message += '🔍 Filters:\n';
      recipient.filters.forEach((filter, index) => {
        message += `${index + 1}. ${filter.type} ${filter.operator} ${filter.value}\n`;
      });
    }

    return message;
  }

  /**
   * Handle listing available topics
   */
  private async handleListTopics(ctx: BotContext): Promise<string> {
    const topics = this.getAvailableTopics();
    const descriptions: Record<string, string> = {
      security: '🔒 Security vulnerabilities and patches',
      performance: '⚡ Performance metrics and alerts',
      system: '🖥️ System status and health',
      build: '🔨 Build status and results',
      deployment: '🚀 Deployment status and changes',
      monitoring: '📊 General monitoring alerts',
      maintenance: '🔧 Maintenance windows and updates',
      emergency: '🚨 Critical system emergencies'
    };

    let message = '📚 Available Notification Topics:\n\n';
    topics.forEach(topic => {
      message += `<b>${topic}</b> - ${descriptions[topic as keyof typeof descriptions]}\n`;
    });

    message += '\n🎯 Priority Levels: low, medium, high, critical\n\n';
    message += '💡 Usage: /notify subscribe security performance high';

    return message;
  }

  /**
   * Handle notification configuration
   */
  private async handleConfig(ctx: BotContext): Promise<string> {
    const args = ctx.args.slice(1); // Remove 'config'
    const userId = ctx.user.id.toString();

    if (args.length === 0) {
      return '❌ Please specify configuration option.\n\nUsage:\n/notify config priority <level>\n/notify config channel <channel_id>\n/notify config filter add <type> <operator> <value>\n/notify config filter remove <index>';
    }

    const recipient = this.notificationManager.getRecipients().find(r => r.id === userId);
    if (!recipient) {
      return '❌ You need to subscribe to notifications first. Use /notify subscribe <topics>';
    }

    const option = args[0].toLowerCase();

    switch (option) {
      case 'priority':
        return this.handlePriorityConfig(recipient, args[1]);
      case 'channel':
        return this.handleChannelConfig(recipient, args[1]);
      case 'filter':
        return this.handleFilterConfig(recipient, args.slice(1));
      default:
        return '❌ Unknown configuration option.';
    }
  }

  /**
   * Handle priority configuration
   */
  private handlePriorityConfig(recipient: NotificationRecipient, priority?: string): string {
    if (!priority) {
      return '❌ Please specify priority level: low, medium, high, critical';
    }

    if (!this.isValidPriority(priority)) {
      return '❌ Invalid priority level. Use: low, medium, high, critical';
    }

    recipient.priorityThreshold = priority as NotificationPriority;
    this.notificationManager.addRecipient(recipient);

    return `✅ Priority threshold set to: ${priority}`;
  }

  /**
   * Handle channel configuration
   */
  private handleChannelConfig(recipient: NotificationRecipient, channelId?: string): string {
    if (!channelId) {
      return '❌ Please specify channel ID or "default"';
    }

    recipient.channelId = channelId === 'default' ? undefined : channelId;
    this.notificationManager.addRecipient(recipient);

    return `✅ Channel set to: ${recipient.channelId || 'default'}`;
  }

  /**
   * Handle filter configuration
   */
  private handleFilterConfig(recipient: NotificationRecipient, filterArgs: string[]): string {
    if (filterArgs.length < 1) {
      return '❌ Please specify filter action: add or remove';
    }

    const action = filterArgs[0].toLowerCase();

    if (action === 'add') {
      if (filterArgs.length < 4) {
        return '❌ Usage: /notify config filter add <type> <operator> <value>\n\nTypes: severity, package, cve, metric, threshold\nOperators: eq, ne, gt, lt, gte, lte, contains, regex';
      }

      const [_, type, operator, value] = filterArgs;
      if (!recipient.filters) recipient.filters = [];

      recipient.filters.push({
        type: type as any,
        operator: operator as any,
        value: isNaN(Number(value)) ? value : Number(value)
      });

      this.notificationManager.addRecipient(recipient);
      return `✅ Filter added: ${type} ${operator} ${value}`;

    } else if (action === 'remove') {
      if (!recipient.filters || recipient.filters.length === 0) {
        return '❌ No filters configured.';
      }

      const index = parseInt(filterArgs[1]) - 1;
      if (isNaN(index) || index < 0 || index >= recipient.filters.length) {
        return `❌ Invalid filter index. Use 1-${recipient.filters.length}`;
      }

      const removed = recipient.filters.splice(index, 1)[0];
      this.notificationManager.addRecipient(recipient);

      return `✅ Filter removed: ${removed.type} ${removed.operator} ${removed.value}`;
    }

    return '❌ Unknown filter action. Use: add or remove';
  }

  /**
   * Handle test notification
   */
  private async handleTest(ctx: BotContext): Promise<string> {
    const userId = ctx.user.id.toString();
    const recipient = this.notificationManager.getRecipients().find(r => r.id === userId);

    if (!recipient || !recipient.enabled) {
      return '❌ You need to subscribe to notifications first. Use /notify subscribe <topics>';
    }

    // Send a test notification
    const testNotification = {
      id: `test-${Date.now()}`,
      timestamp: Date.now(),
      topic: 'monitoring' as NotificationTopic,
      priority: 'low' as NotificationPriority,
      title: '🧪 Test Notification',
      message: 'This is a test notification to verify your subscription settings.',
      metadata: {
        source: 'telegram-bot',
        correlationId: `test-${userId}`,
        tags: ['test']
      }
    };

    try {
      await this.notificationManager.send(testNotification);
      return '✅ Test notification sent! Check your configured channel.';
    } catch (error) {
      return '❌ Failed to send test notification.';
    }
  }

  /**
   * Handle betting/wager monitoring commands
   */
  private async handleBetting(ctx: BotContext): Promise<string> {
    const args = ctx.args.slice(1); // Remove 'bet'/'wager'
    const action = args[0]?.toLowerCase();

    if (!this.bettingMonitor) {
      return '❌ Betting monitor not available. Check system configuration.';
    }

    switch (action) {
      case 'monitor':
      case 'add':
        return this.handleAddWagerNumbers(ctx, args.slice(1));
      case 'remove':
      case 'stop':
        return this.handleRemoveWagerNumbers(ctx, args.slice(1));
      case 'list':
        return this.handleListMonitoredWagers(ctx);
      case 'stats':
        return this.handleBettingStats(ctx);
      case 'poll':
        return this.handlePollWagers(ctx);
      default:
        return `❌ Unknown betting command: ${action}\n\nUsage:\n/notify bet monitor <wager_numbers> - Add wagers to monitor\n/notify bet remove <wager_numbers> - Remove wagers from monitoring\n/notify bet list - List monitored wagers\n/notify bet stats - Show betting statistics\n/notify bet poll - Poll wager updates`;
    }
  }

  /**
   * Add wager numbers to monitor
   */
  private handleAddWagerNumbers(ctx: BotContext, wagerArgs: string[]): string {
    if (wagerArgs.length === 0) {
      return '❌ Please provide wager numbers to monitor.\nExample: /notify bet monitor 725385092 725385120';
    }

    const wagerNumbers: number[] = [];
    for (const arg of wagerArgs) {
      const num = parseInt(arg);
      if (isNaN(num)) {
        return `❌ Invalid wager number: ${arg}`;
      }
      wagerNumbers.push(num);
    }

    try {
      this.bettingMonitor.addWagerNumbers(wagerNumbers);
      return `✅ Added ${wagerNumbers.length} wager(s) to monitoring: ${wagerNumbers.join(', ')}`;
    } catch (error) {
      return `❌ Failed to add wager numbers: ${error}`;
    }
  }

  /**
   * Remove wager numbers from monitoring
   */
  private handleRemoveWagerNumbers(ctx: BotContext, wagerArgs: string[]): string {
    if (wagerArgs.length === 0) {
      return '❌ Please provide wager numbers to remove.\nExample: /notify bet remove 725385092';
    }

    const wagerNumbers: number[] = [];
    for (const arg of wagerArgs) {
      const num = parseInt(arg);
      if (isNaN(num)) {
        return `❌ Invalid wager number: ${arg}`;
      }
      wagerNumbers.push(num);
    }

    try {
      this.bettingMonitor.removeWagerNumbers(wagerNumbers);
      return `✅ Removed ${wagerNumbers.length} wager(s) from monitoring: ${wagerNumbers.join(', ')}`;
    } catch (error) {
      return `❌ Failed to remove wager numbers: ${error}`;
    }
  }

  /**
   * List monitored wager numbers
   */
  private handleListMonitoredWagers(ctx: BotContext): string {
    try {
      // This would need to be added to the betting monitor
      // For now, return a placeholder
      return '📊 Monitored wagers: Feature not yet implemented in betting monitor.';
    } catch (error) {
      return `❌ Failed to get monitored wagers: ${error}`;
    }
  }

  /**
   * Show betting statistics
   */
  private handleBettingStats(ctx: BotContext): string {
    try {
      const stats = this.bettingMonitor.getStats();
      return `📊 Betting Monitor Stats:

Total Wagers: ${stats.totalWagers}
Unique Agents: ${stats.uniqueAgents}
Unique Customers: ${stats.uniqueCustomers}
Total Volume: $${stats.totalVolume.toLocaleString()}
Avg Wager Size: $${stats.avgWagerSize.toFixed(2)}`;
    } catch (error) {
      return `❌ Failed to get betting stats: ${error}`;
    }
  }

  /**
   * Poll wager updates manually
   */
  private async handlePollWagers(ctx: BotContext): Promise<string> {
    try {
      await this.bettingMonitor.pollMonitoredWagers();
      return '✅ Polled wager updates successfully.';
    } catch (error) {
      return `❌ Failed to poll wagers: ${error}`;
    }
  }

  /**
   * Show help for notify command
   */
  private showHelp(ctx: BotContext): string {
    return `📢 <b>Notification Management</b>

<b>Subscribe to topics:</b>
<code>/notify subscribe security performance</code>
<code>/notify subscribe monitoring high</code>

<b>Unsubscribe:</b>
<code>/notify unsubscribe security</code>
<code>/notify unsubscribe all</code>

<b>View subscriptions:</b>
<code>/notify list</code>

<b>Available topics:</b>
${this.getAvailableTopics().join(', ')}

<b>Configuration:</b>
<code>/notify config priority medium</code>
<code>/notify config channel topic:12345</code>

<b>Filters:</b>
<code>/notify config filter add severity gte high</code>

<b>Betting Monitoring:</b>
<code>/notify bet monitor 725385092 725385120</code>
<code>/notify bet stats</code>
<code>/notify bet poll</code>

<b>Test notification:</b>
<code>/notify test</code>

<b>View topics:</b>
<code>/notify topics</code>`;
  }

  /**
   * Get list of available topics
   */
  private getAvailableTopics(): NotificationTopic[] {
    return ['security', 'performance', 'system', 'build', 'deployment', 'monitoring', 'maintenance', 'emergency'];
  }

  /**
   * Check if topic is valid
   */
  private isValidTopic(topic: string): boolean {
    return this.getAvailableTopics().includes(topic as NotificationTopic);
  }

  /**
   * Check if priority is valid
   */
  private isValidPriority(priority: string): boolean {
    return ['low', 'medium', 'high', 'critical'].includes(priority);
  }
}

// Export the handler function
export async function handleNotifications(ctx: BotContext): Promise<string> {
  // This would need to be initialized with the notification manager
  // For now, return a placeholder
  return '❌ Notification system not yet initialized.';
}
