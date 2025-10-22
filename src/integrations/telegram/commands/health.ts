/**
 * Health Check Command
 *
 * Provides system health status via Telegram bot
 */

import type { BotContext } from '../types';
import { formatHealthStatus } from '../utils/formatter-enhanced';

export async function handleHealth(ctx: BotContext): Promise<void> {
  try {
    // Make API call to health endpoint
    const response = await fetch('http://localhost:3655/api/health');
    const healthData = await response.json();

    if (!response.ok) {
      await ctx.reply('❌ Failed to check system health. API unavailable.');
      return;
    }

    // Format health status for Telegram
    const message = formatHealthStatus(healthData);

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🔄 Refresh Health',
            callback_data: 'health_refresh'
          },
          {
            text: '📊 Full Diagnostics',
            callback_data: 'diagnostics'
          }
        ]]
      }
    });

  } catch (error) {
    console.error('Health command error:', error);
    await ctx.reply('❌ Error checking system health. Please try again later.');
  }
}
