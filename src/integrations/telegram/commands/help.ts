/**
 * Help Command Handler
 *
 * Shows available bot commands and usage information.
 */

import type { BotContext } from '../types';
import { formatHelp } from '../utils/formatter';

export async function handleHelp(ctx: BotContext): Promise<string> {
  return formatHelp();
}
