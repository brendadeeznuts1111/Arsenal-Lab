/**
 * Telegram Bot Commands
 *
 * Exports all command handlers for the Arsenal Lab bot.
 */

export { handleAdmin } from './admin';
export { handleBenchmark } from './benchmark';
export { handleCompare } from './compare';
export { handleDeploy } from './deploy';
export { handleDiscuss } from './discuss';
export { handleHealth } from './health';
export { handleHelp } from './help';
export { handleMetrics } from './metrics';
export { handleNotifications } from './notifications';
export { handleStats } from './stats';
export { handleStatus } from './status';
export { handleWiki } from './wiki';

import type { CommandHandler } from '../types';
import { handleAdmin } from './admin';
import { handleBenchmark } from './benchmark';
import { handleCompare } from './compare';
import { handleDeploy } from './deploy';
import { handleDiscuss } from './discuss';
import { handleHealth } from './health';
import { handleHelp } from './help';
import { handleMetrics } from './metrics';
import { handleNotifications } from './notifications';
import { handleStats } from './stats';
import { handleStatus } from './status';
import { handleWiki } from './wiki';

/**
 * Command registry
 */
export const commands: Record<string, CommandHandler> = {
  benchmark: handleBenchmark,
  compare: handleCompare,
  stats: handleStats,
  help: handleHelp,
  start: handleHelp, // /start shows help
  metrics: handleMetrics,
  wiki: handleWiki,
  discuss: handleDiscuss,
  deploy: handleDeploy,
  health: handleHealth,
  status: handleStatus,
  admin: handleAdmin,
  notify: handleNotifications,
};

/**
 * Get command handler by name
 */
export function getCommandHandler(command: string): CommandHandler | undefined {
  return commands[command.toLowerCase()];
}

/**
 * Check if a command exists
 */
export function hasCommand(command: string): boolean {
  return command.toLowerCase() in commands;
}
