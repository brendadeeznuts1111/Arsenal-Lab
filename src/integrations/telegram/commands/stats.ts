/**
 * Stats Command Handler
 *
 * Shows bot usage statistics and Arsenal Lab metrics.
 */

import type { BotContext, BotStats } from '../types';
import { formatStats } from '../utils/formatter';
import { telegramMetrics } from '../utils/metrics';

// Track bot start time for uptime calculation
const botStartTime = Date.now();

export async function handleStats(ctx: BotContext): Promise<string> {
  const stats = await getActualStats();
  return formatStats(stats);
}

/**
 * Get actual stats from metrics system
 */
async function getActualStats(): Promise<BotStats> {
  const metrics = telegramMetrics.getMetrics();

  // Calculate uptime in seconds
  const uptimeMs = Date.now() - botStartTime;
  const uptimeSeconds = Math.floor(uptimeMs / 1000);

  // Get version from package.json or default
  const version = process.env.npm_package_version || '1.0.0';

  return {
    totalUsers: metrics.uniqueUsers,
    activeUsers: metrics.uniqueUsers, // All users are active (no time-based filtering yet)
    commandsProcessed: metrics.commandsProcessed,
    uptime: uptimeSeconds,
    version,
  };
}
