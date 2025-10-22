/**
 * Telegram Bot Polling Implementation
 *
 * Long polling for development and testing.
 * Use webhooks for production.
 */

import { createBot } from './bot';
import type { TelegramUpdate } from './types';
import { telegramMetrics } from './utils/metrics';

export async function startPolling(): Promise<void> {
  const bot = createBot();
  let offset = 0;
  let running = true;

  console.log('🤖 Starting Telegram bot polling...');
  console.log('📡 Listening for updates...');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⏹️  Stopping bot...');
    running = false;
  });

  process.on('SIGTERM', () => {
    console.log('\n⏹️  Stopping bot...');
    running = false;
  });

  while (running) {
    try {
      const updates = await getUpdates(offset);

      for (const update of updates) {
        try {
          await bot.handleUpdate(update);
          offset = update.update_id + 1;
        } catch (error) {
          console.error('Error handling update:', error);
          telegramMetrics.recordError('update_handling');
        }
      }

      // Small delay to avoid hammering the API
      await sleep(100);
    } catch (error: any) {
      console.error('Polling error:', error);
      telegramMetrics.recordError('polling');

      // Back off on errors
      await sleep(5000);
    }
  }

  console.log('✅ Bot stopped');
}

/**
 * Get updates from Telegram
 */
async function getUpdates(offset: number): Promise<TelegramUpdate[]> {
  const token = process.env.TELEGRAM_BOT_TOKEN || Bun.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN not found in environment');
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/getUpdates`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offset,
        timeout: 30, // Long polling timeout
        allowed_updates: ['message', 'edited_message', 'callback_query'],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get updates: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.result || [];
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main entry point for polling mode
 */
if (import.meta.main) {
  startPolling().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
