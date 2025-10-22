/**
 * Telegram Bot Commands
 *
 * Exports all command handlers for the Arsenal Lab bot.
 */

export { handleBenchmark } from './benchmark';
export { handleCompare } from './compare';
export { handleStats } from './stats';
export { handleHelp } from './help';
export { handleMetrics } from './metrics';
export { handleWiki } from './wiki';
export { handleDiscuss } from './discuss';
export { handleDeploy } from './deploy';

import type { CommandHandler } from '../types';
import { handleBenchmark } from './benchmark';
import { handleCompare } from './compare';
import { handleStats } from './stats';
import { handleHelp } from './help';
import { handleMetrics } from './metrics';
import { handleWiki } from './wiki';
import { handleDiscuss } from './discuss';
import { handleDeploy } from './deploy';

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
