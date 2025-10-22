/**
 * Telegram Bot Commands
 *
 * Exports all command handlers for the Arsenal Lab bot.
 */

export { handleBenchmark } from './benchmark';
export { handleCompare } from './compare';
export { handleStats } from './stats';
export { handleHelp } from './help';

import type { CommandHandler } from '../types';
import { handleBenchmark } from './benchmark';
import { handleCompare } from './compare';
import { handleStats } from './stats';
import { handleHelp } from './help';

/**
 * Command registry
 */
export const commands: Record<string, CommandHandler> = {
  benchmark: handleBenchmark,
  compare: handleCompare,
  stats: handleStats,
  help: handleHelp,
  start: handleHelp, // /start shows help
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
