/**
 * Message Queue with Leaky Bucket Rate Limiting
 *
 * Ensures 350ms spacing between messages to comply with Telegram's rate limits:
 * - Private chats: 1 msg/s
 * - Groups/channels: 20 msg/min (1 msg per 3s)
 *
 * Uses 350ms spacing to safely respect the most restrictive limit.
 */

import type { BotConfig } from '../types';

interface QueuedMessage {
  chatId: number;
  text: string;
  options?: MessageOptions;
  retries?: number;
}

interface MessageOptions {
  parseMode?: 'HTML' | 'MarkdownV2' | 'Markdown';
  disableNotification?: boolean;
  replyMarkup?: any;
  messageThreadId?: number;
}

export class MessageQueue {
  private queue: QueuedMessage[] = [];
  private processing = false;
  private lastSent = new Map<number, number>();
  private config: BotConfig;

  // Rate limiting configuration
  private readonly SPACING_MS = 350; // 350ms between messages
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_BACKOFF_MS = 1000;
  private readonly BACKOFF_MULTIPLIER = 2;
  private readonly MAX_BACKOFF_MS = 30000;

  constructor(config: BotConfig) {
    this.config = config;
  }

  /**
   * Add message to queue
   */
  async send(chatId: number, text: string, options?: MessageOptions): Promise<void> {
    this.queue.push({ chatId, text, options, retries: 0 });

    if (!this.processing) {
      await this.processQueue();
    }
  }

  /**
   * Process message queue with rate limiting
   */
  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const message = this.queue.shift()!;
      const now = Date.now();
      const lastSent = this.lastSent.get(message.chatId) || 0;
      const timeSinceLastSent = now - lastSent;

      // Enforce minimum spacing per chat
      if (timeSinceLastSent < this.SPACING_MS) {
        await this.sleep(this.SPACING_MS - timeSinceLastSent);
      }

      try {
        await this.sendMessageDirect(message.chatId, message.text, message.options);
        this.lastSent.set(message.chatId, Date.now());
      } catch (error: any) {
        await this.handleError(error, message);
      }
    }

    this.processing = false;
  }

  /**
   * Send message directly to Telegram API
   */
  private async sendMessageDirect(
    chatId: number,
    text: string,
    options?: MessageOptions
  ): Promise<void> {
    const payload: any = {
      chat_id: chatId,
      text,
    };

    if (options?.parseMode) {
      payload.parse_mode = options.parseMode;
    }

    if (options?.disableNotification) {
      payload.disable_notification = true;
    }

    if (options?.replyMarkup) {
      payload.reply_markup = options.replyMarkup;
    }

    if (options?.messageThreadId) {
      payload.message_thread_id = options.messageThreadId;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${this.config.token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new TelegramAPIError(error);
    }
  }

  /**
   * Handle API errors with retry logic
   */
  private async handleError(error: any, message: QueuedMessage): Promise<void> {
    if (this.isRateLimitError(error)) {
      // Rate limit hit - re-queue with exponential backoff
      const retries = (message.retries || 0) + 1;

      if (retries <= this.MAX_RETRIES) {
        const backoffMs = Math.min(
          this.INITIAL_BACKOFF_MS * Math.pow(this.BACKOFF_MULTIPLIER, retries - 1),
          this.MAX_BACKOFF_MS
        );

        console.warn(`Rate limit hit for chat ${message.chatId}. Retrying in ${backoffMs}ms (attempt ${retries}/${this.MAX_RETRIES})`);

        await this.sleep(backoffMs);

        // Re-queue at front with updated retry count
        this.queue.unshift({ ...message, retries });
      } else {
        console.error(`Max retries exceeded for chat ${message.chatId}. Dropping message.`);
      }
    } else if (this.isRetryableError(error)) {
      // Server error - retry once
      const retries = (message.retries || 0) + 1;

      if (retries <= 1) {
        console.warn(`Server error for chat ${message.chatId}. Retrying once.`);
        await this.sleep(1000);
        this.queue.unshift({ ...message, retries });
      } else {
        console.error(`Retryable error persists for chat ${message.chatId}:`, error);
      }
    } else {
      // Permanent error - log and drop
      console.error(`Permanent error for chat ${message.chatId}:`, error);
    }
  }

  /**
   * Check if error is a rate limit (429)
   */
  private isRateLimitError(error: any): boolean {
    return (
      error.error_code === 429 ||
      error.description?.includes('Too Many Requests') ||
      error.description?.includes('retry after')
    );
  }

  /**
   * Check if error is retryable (5xx)
   */
  private isRetryableError(error: any): boolean {
    const code = error.error_code;
    return code === 502 || code === 503 || code === 504;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      chatsTracked: this.lastSent.size,
    };
  }

  /**
   * Clear the queue (for testing or emergency shutdown)
   */
  clear(): void {
    this.queue = [];
    this.lastSent.clear();
    this.processing = false;
  }
}

/**
 * Custom error class for Telegram API errors
 */
class TelegramAPIError extends Error {
  error_code?: number;
  description?: string;
  parameters?: any;

  constructor(errorData: any) {
    super(errorData.description || 'Telegram API error');
    this.error_code = errorData.error_code;
    this.description = errorData.description;
    this.parameters = errorData.parameters;
  }
}
