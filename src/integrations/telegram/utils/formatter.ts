/**
 * Message Formatter for Telegram Bot
 *
 * Formats responses with proper Markdown/HTML and emoji styling.
 */

import type { BenchmarkResult, BotStats } from '../types';

/**
 * Format benchmark results for Telegram
 */
export function formatBenchmarkResult(result: BenchmarkResult): string {
  const { type, bunTime, nodeTime, speedup, memoryUsage } = result;

  let message = `🔐 **${capitalize(type)} Benchmark Results**\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `⚡ Bun: ${bunTime.toFixed(2)}ms\n`;

  if (nodeTime) {
    message += `🟢 Node.js: ${nodeTime.toFixed(2)}ms\n`;
  }

  if (speedup) {
    message += `\n📊 **Speedup**: ${speedup.toFixed(2)}× faster\n`;
  }

  if (memoryUsage) {
    message += `💾 **Memory**: ${(memoryUsage / 1024 / 1024).toFixed(2)} MB\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📈 [Try it yourself](https://brendadeeznuts1111.github.io/Arsenal-Lab/)\n`;
  message += `💬 [Join discussion](https://t.me/arsenallab)`;

  return message;
}

/**
 * Format multiple benchmark results
 */
export function formatBenchmarkResults(results: BenchmarkResult[]): string {
  let message = `🚀 **Arsenal Lab Benchmark Suite**\n\n`;

  for (const result of results) {
    message += `**${capitalize(result.type)}**\n`;
    message += `  • Bun: ${result.bunTime.toFixed(2)}ms\n`;

    if (result.nodeTime) {
      message += `  • Node: ${result.nodeTime.toFixed(2)}ms\n`;
      message += `  • Speedup: ${result.speedup?.toFixed(2)}×\n`;
    }

    message += `\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📊 Full results: https://brendadeeznuts1111.github.io/Arsenal-Lab/`;

  return message;
}

/**
 * Format bot stats
 */
export function formatStats(stats: BotStats): string {
  const uptimeHours = Math.floor(stats.uptime / 3600);
  const uptimeMinutes = Math.floor((stats.uptime % 3600) / 60);

  let message = `📊 **Arsenal Lab Bot Statistics**\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `👥 Total Users: ${stats.totalUsers}\n`;
  message += `🟢 Active Users: ${stats.activeUsers}\n`;
  message += `⚡ Commands Processed: ${stats.commandsProcessed}\n`;
  message += `⏱️ Uptime: ${uptimeHours}h ${uptimeMinutes}m\n`;
  message += `📦 Version: ${stats.version}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `🤖 Powered by Bun ${process.versions.bun}`;

  return message;
}

/**
 * Format help message
 */
export function formatHelp(): string {
  return `
🤖 **Arsenal Lab Bot - Available Commands**

━━━━━━━━━━━━━━━━━━━━

**📊 Benchmarks**
/benchmark [type] - Run performance benchmarks
  • crypto - Cryptography benchmarks
  • memory - Memory optimization tests
  • postmessage - postMessage performance
  • all - Run all benchmarks

**⚖️ Comparisons**
/compare <runtime1> <runtime2> - Compare runtimes
  Example: /compare bun node

**📈 Statistics**
/stats - Bot usage statistics
/latest - Latest Arsenal Lab release

**ℹ️ Information**
/help - Show this help message
/start - Welcome message

━━━━━━━━━━━━━━━━━━━━

💬 Join the community: https://t.me/arsenallab
📖 Documentation: https://github.com/brendadeeznuts1111/Arsenal-Lab
  `.trim();
}

/**
 * Format welcome message
 */
export function formatWelcome(username?: string): string {
  const greeting = username ? `Hey ${username}! 👋` : `Welcome! 👋`;

  return `
${greeting}

🏆 **Arsenal Lab Bot**
FAANG-grade performance testing for Bun runtime

━━━━━━━━━━━━━━━━━━━━

**What I can do:**
⚡ Run performance benchmarks
📊 Compare Bun vs Node.js
📈 Show real-time statistics
🚀 Share latest updates

**Quick Start:**
/benchmark crypto - Test crypto performance
/compare bun node - Runtime comparison
/help - See all commands

━━━━━━━━━━━━━━━━━━━━

🌐 Try the interactive lab:
https://brendadeeznuts1111.github.io/Arsenal-Lab/

💬 Join our community:
https://t.me/arsenallab
  `.trim();
}

/**
 * Format error message
 */
export function formatError(error: string, details?: string): string {
  let message = `❌ **Error**\n\n${error}\n`;

  if (details) {
    message += `\n*Details:* ${details}\n`;
  }

  message += `\n💡 Try /help for available commands`;

  return message;
}

/**
 * Format rate limit message
 */
export function formatRateLimit(resetTimeMs: number): string {
  const resetSeconds = Math.ceil(resetTimeMs / 1000);

  return `
⚠️ **Rate Limit Exceeded**

You've sent too many requests. Please try again in ${resetSeconds} seconds.

💡 Rate limits help ensure fair usage for all users.
  `.trim();
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Escape Markdown special characters
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

/**
 * Format comparison result
 */
export function formatComparison(runtime1: string, runtime2: string, results: Record<string, number>): string {
  return `
⚖️ **Runtime Comparison**

${runtime1} vs ${runtime2}

━━━━━━━━━━━━━━━━━━━━

📊 Results:
${Object.entries(results)
  .map(([metric, value]) => `  • ${capitalize(metric)}: ${value.toFixed(2)}ms`)
  .join('\n')}

━━━━━━━━━━━━━━━━━━━━

📈 [View detailed analysis](https://brendadeeznuts1111.github.io/Arsenal-Lab/)
  `.trim();
}
