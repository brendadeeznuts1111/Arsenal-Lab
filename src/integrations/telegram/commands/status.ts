/**
 * System Status Command
 *
 * Provides comprehensive system status and metrics
 */

import type { BotContext } from '../types';
import { formatSystemStatus } from '../utils/formatter-enhanced';

export async function handleStatus(ctx: BotContext): Promise<void> {
  try {
    // Get multiple API endpoints for comprehensive status
    const [healthRes, telemetryRes, diagnosticsRes] = await Promise.all([
      fetch('http://localhost:3655/api/health'),
      fetch('http://localhost:3655/api/telemetry'),
      fetch('http://localhost:3655/api/diagnostics')
    ]);

    if (!healthRes.ok || !telemetryRes.ok || !diagnosticsRes.ok) {
      await ctx.reply('❌ Unable to retrieve complete system status. Some services may be unavailable.');
      return;
    }

    const [healthData, telemetryData, diagnosticsData] = await Promise.all([
      healthRes.json(),
      telemetryRes.json(),
      diagnosticsRes.json()
    ]);

    // Format comprehensive system status
    const message = formatSystemStatus({
      health: healthData,
      telemetry: telemetryData,
      diagnostics: diagnosticsData
    });

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🏥 Health', callback_data: 'status_health' },
            { text: '📊 Telemetry', callback_data: 'status_telemetry' }
          ],
          [
            { text: '🔧 Diagnostics', callback_data: 'status_diagnostics' },
            { text: '🔄 Refresh', callback_data: 'status_refresh' }
          ]
        ]
      }
    });

  } catch (error) {
    console.error('Status command error:', error);
    await ctx.reply('❌ Error retrieving system status. Please try again later.');
  }
}
