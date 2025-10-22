/**
 * Metrics System for Telegram Bot
 *
 * Tracks messages sent, rate limits, errors, and queue health.
 */

export class TelegramMetrics {
  private messagesSent = 0;
  private messagesQueued = 0;
  private rateLimitHits = 0;
  private retryAttempts = 0;
  private errors = new Map<string, number>();
  private commandUsage = new Map<string, number>();
  private startTime = Date.now();

  /**
   * Record a message sent
   */
  recordMessageSent(): void {
    this.messagesSent++;
  }

  /**
   * Record a message queued
   */
  recordQueued(): void {
    this.messagesQueued++;
  }

  /**
   * Record a rate limit hit
   */
  recordRateLimit(): void {
    this.rateLimitHits++;
  }

  /**
   * Record a retry attempt
   */
  recordRetry(): void {
    this.retryAttempts++;
  }

  /**
   * Record an error
   */
  recordError(type: string): void {
    this.errors.set(type, (this.errors.get(type) || 0) + 1);
  }

  /**
   * Record command usage
   */
  recordCommand(command: string): void {
    this.commandUsage.set(command, (this.commandUsage.get(command) || 0) + 1);
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      uptime,
      messagesSent: this.messagesSent,
      messagesQueued: this.messagesQueued,
      rateLimitHits: this.rateLimitHits,
      retryAttempts: this.retryAttempts,
      errors: Object.fromEntries(this.errors),
      commandUsage: Object.fromEntries(this.commandUsage),
      queueHealth: this.calculateQueueHealth(),
      errorRate: this.calculateErrorRate(),
    };
  }

  /**
   * Calculate queue health (0-1, higher is better)
   */
  private calculateQueueHealth(): number {
    if (this.messagesSent === 0) return 1;
    return 1 - Math.min(this.messagesQueued / this.messagesSent, 1);
  }

  /**
   * Calculate error rate (0-1, lower is better)
   */
  private calculateErrorRate(): number {
    const totalErrors = Array.from(this.errors.values()).reduce((sum, count) => sum + count, 0);
    const totalMessages = this.messagesSent + totalErrors;

    if (totalMessages === 0) return 0;
    return totalErrors / totalMessages;
  }

  /**
   * Get report as formatted string
   */
  getReport(): string {
    const metrics = this.getMetrics();

    return `
📊 Telegram Bot Metrics

Uptime: ${this.formatUptime(metrics.uptime)}
Messages Sent: ${metrics.messagesSent}
Messages Queued: ${metrics.messagesQueued}
Rate Limit Hits: ${metrics.rateLimitHits}
Retry Attempts: ${metrics.retryAttempts}

Queue Health: ${(metrics.queueHealth * 100).toFixed(1)}%
Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%

Top Commands:
${this.formatCommandUsage()}

Errors:
${this.formatErrors()}
    `.trim();
  }

  /**
   * Format uptime
   */
  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  /**
   * Format command usage
   */
  private formatCommandUsage(): string {
    const sorted = Array.from(this.commandUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sorted.length === 0) {
      return '  (no commands yet)';
    }

    return sorted.map(([cmd, count]) => `  /${cmd}: ${count}`).join('\n');
  }

  /**
   * Format errors
   */
  private formatErrors(): string {
    if (this.errors.size === 0) {
      return '  (no errors)';
    }

    return Array.from(this.errors.entries())
      .map(([type, count]) => `  ${type}: ${count}`)
      .join('\n');
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.messagesSent = 0;
    this.messagesQueued = 0;
    this.rateLimitHits = 0;
    this.retryAttempts = 0;
    this.errors.clear();
    this.commandUsage.clear();
    this.startTime = Date.now();
  }
}

// Global metrics instance
export const telegramMetrics = new TelegramMetrics();
