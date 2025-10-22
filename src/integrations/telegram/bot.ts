/**
 * Arsenal Lab Telegram Bot
 *
 * Main bot entry point for handling Telegram updates and commands.
 *
 * TODO: Complete implementation
 * - Set up webhook or polling
 * - Handle all update types
 * - Implement error handling
 * - Add logging and monitoring
 * - Deploy to production
 */

import type { BotConfig, BotContext, TelegramUpdate, TelegramMessage } from './types';
import { getCommandHandler } from './commands';
import { rateLimiters } from './utils/rate-limiter';
import { formatWelcome, formatError, formatRateLimit } from './utils/formatter';

export class ArsenalLabBot {
  private config: BotConfig;
  private startTime: number;

  constructor(config: BotConfig) {
    this.config = config;
    this.startTime = Date.now();
  }

  /**
   * Process incoming Telegram update
   */
  async handleUpdate(update: TelegramUpdate): Promise<void> {
    try {
      // Extract message from update
      const message = update.message || update.edited_message;

      if (!message || !message.text) {
        // Ignore non-text messages for now
        // TODO: Handle other message types (photos, documents, etc.)
        return;
      }

      // Check if message is a command
      if (!message.text.startsWith('/')) {
        // Ignore non-command messages
        // TODO: Implement conversational responses
        return;
      }

      // Parse command and arguments
      const [commandWithSlash, ...args] = message.text.split(' ');
      const command = commandWithSlash.slice(1); // Remove leading slash

      // Create bot context
      const ctx: BotContext = {
        update,
        message,
        user: message.from!,
        chat: message.chat,
        text: message.text,
        command,
        args,
      };

      // Handle the command
      await this.handleCommand(ctx);
    } catch (error) {
      console.error('Error handling update:', error);
      // TODO: Send error message to user
    }
  }

  /**
   * Handle bot command
   */
  private async handleCommand(ctx: BotContext): Promise<void> {
    const { command, user, chat } = ctx;

    // Check rate limit
    const rateLimiter = this.getRateLimiter(command);
    if (!rateLimiter.isAllowed(user.id)) {
      const resetTime = rateLimiter.getResetTime(user.id);
      const response = formatRateLimit(resetTime);
      await this.sendMessage(chat.id, response);
      return;
    }

    // Get command handler
    const handler = getCommandHandler(command);

    if (!handler) {
      const response = formatError(
        `Unknown command: /${command}`,
        'Use /help to see available commands'
      );
      await this.sendMessage(chat.id, response);
      return;
    }

    try {
      // Execute command
      const response = await handler(ctx);

      if (response) {
        await this.sendMessage(chat.id, response);
      }
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
      const response = formatError(
        'An error occurred while processing your command',
        'Please try again later'
      );
      await this.sendMessage(chat.id, response);
    }
  }

  /**
   * Get rate limiter for command
   */
  private getRateLimiter(command: string) {
    switch (command) {
      case 'benchmark':
        return rateLimiters.benchmark;
      case 'compare':
        return rateLimiters.compare;
      case 'stats':
        return rateLimiters.stats;
      default:
        return rateLimiters.default;
    }
  }

  /**
   * Send message to Telegram chat
   * TODO: Implement actual API call
   */
  private async sendMessage(chatId: number, text: string): Promise<void> {
    const apiUrl = `https://api.telegram.org/bot${this.config.token}/sendMessage`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error sending message:', error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Get bot info
   */
  getInfo() {
    return {
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      config: {
        channelId: this.config.channelId,
        groupId: this.config.groupId,
        hasWebhook: !!this.config.webhookUrl,
      },
    };
  }
}

/**
 * Create bot instance from environment variables
 */
export function createBot(): ArsenalLabBot {
  const token = process.env.TELEGRAM_BOT_TOKEN || Bun.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN not found in environment variables');
  }

  const config: BotConfig = {
    token,
    channelId: process.env.TELEGRAM_CHANNEL_ID || Bun.env.TELEGRAM_CHANNEL_ID,
    groupId: process.env.TELEGRAM_GROUP_ID || Bun.env.TELEGRAM_GROUP_ID,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || Bun.env.TELEGRAM_WEBHOOK_URL,
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || Bun.env.TELEGRAM_WEBHOOK_SECRET,
  };

  return new ArsenalLabBot(config);
}

/**
 * TODO: Implement webhook handler
 *
 * Example implementation:
 *
 * export async function handleWebhook(request: Request): Promise<Response> {
 *   const bot = createBot();
 *   const update = await request.json() as TelegramUpdate;
 *
 *   await bot.handleUpdate(update);
 *
 *   return new Response('OK', { status: 200 });
 * }
 */

/**
 * TODO: Implement polling
 *
 * Example implementation:
 *
 * export async function startPolling() {
 *   const bot = createBot();
 *   let offset = 0;
 *
 *   while (true) {
 *     try {
 *       const updates = await getUpdates(offset);
 *
 *       for (const update of updates) {
 *         await bot.handleUpdate(update);
 *         offset = update.update_id + 1;
 *       }
 *     } catch (error) {
 *       console.error('Polling error:', error);
 *       await new Promise(resolve => setTimeout(resolve, 5000));
 *     }
 *   }
 * }
 *
 * async function getUpdates(offset: number): Promise<TelegramUpdate[]> {
 *   const token = process.env.TELEGRAM_BOT_TOKEN;
 *   const response = await fetch(
 *     `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}`
 *   );
 *   const data = await response.json();
 *   return data.result || [];
 * }
 */
