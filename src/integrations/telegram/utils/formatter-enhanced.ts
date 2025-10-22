/**
 * Enhanced Message Formatter
 *
 * Supports HTML and MarkdownV2 with proper escaping.
 * Includes modern Telegram entities (spoilers, blockquotes).
 */

import type { BenchmarkResult, BotStats } from '../types';

export enum FormatMode {
  Markdown = 'Markdown',
  MarkdownV2 = 'MarkdownV2',
  HTML = 'HTML',
}

export class MessageFormatter {
  private mode: FormatMode;

  constructor(mode: FormatMode = FormatMode.HTML) {
    this.mode = mode;
  }

  /**
   * Format benchmark results
   */
  formatBenchmarkResult(result: BenchmarkResult): string {
    if (this.mode === FormatMode.HTML) {
      return this.formatBenchmarkHTML(result);
    }
    return this.formatBenchmarkMarkdown(result);
  }

  private formatBenchmarkHTML(result: BenchmarkResult): string {
    const { type, bunTime, nodeTime, speedup, memoryUsage } = result;

    let html = `🔐 <b>${this.capitalize(type)} Benchmark Results</b>\n\n`;
    html += `━━━━━━━━━━━━━━━━━━━━\n`;
    html += `⚡ Bun: <code>${bunTime.toFixed(2)}ms</code>\n`;

    if (nodeTime) {
      html += `🟢 Node.js: <code>${nodeTime.toFixed(2)}ms</code>\n\n`;
      html += `📊 <b>Speedup</b>: ${speedup?.toFixed(2)}× faster\n`;
    }

    if (memoryUsage) {
      html += `💾 <b>Memory</b>: ${(memoryUsage / 1024 / 1024).toFixed(2)} MB\n`;
    }

    html += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    html += `📈 <a href="https://brendadeeznuts1111.github.io/Arsenal-Lab/">Try it yourself</a>\n`;
    html += `💬 <a href="https://t.me/arsenallab">Join discussion</a>`;

    return html;
  }

  private formatBenchmarkMarkdown(result: BenchmarkResult): string {
    const { type, bunTime, nodeTime, speedup } = result;

    let md = `🔐 *${this.escapeMarkdownV2(this.capitalize(type))} Benchmark Results*\n\n`;
    md += `━━━━━━━━━━━━━━━━━━━━\n`;
    md += `⚡ Bun: \`${bunTime.toFixed(2)}ms\`\n`;

    if (nodeTime) {
      md += `🟢 Node\\.js: \`${nodeTime.toFixed(2)}ms\`\n\n`;
      md += `📊 *Speedup*: ${speedup?.toFixed(2)}× faster\n`;
    }

    md += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    md += `📈 [Try it yourself](https://brendadeeznuts1111\\.github\\.io/Arsenal\\-Lab/)\n`;
    md += `💬 [Join discussion](https://t\\.me/arsenallab)`;

    return md;
  }

  /**
   * Format multiple benchmark results
   */
  formatBenchmarkResults(results: BenchmarkResult[]): string {
    if (this.mode === FormatMode.HTML) {
      let html = `🚀 <b>Arsenal Lab Benchmark Suite</b>\n\n`;

      for (const result of results) {
        html += `<b>${this.capitalize(result.type)}</b>\n`;
        html += `  • Bun: <code>${result.bunTime.toFixed(2)}ms</code>\n`;

        if (result.nodeTime) {
          html += `  • Node: <code>${result.nodeTime.toFixed(2)}ms</code>\n`;
          html += `  • Speedup: <code>${result.speedup?.toFixed(2)}×</code>\n`;
        }

        html += `\n`;
      }

      html += `━━━━━━━━━━━━━━━━━━━━\n`;
      html += `📊 <a href="https://brendadeeznuts1111.github.io/Arsenal-Lab/">Full results</a>`;

      return html;
    }

    // MarkdownV2 version
    let md = `🚀 *Arsenal Lab Benchmark Suite*\n\n`;

    for (const result of results) {
      md += `*${this.escapeMarkdownV2(this.capitalize(result.type))}*\n`;
      md += `  • Bun: \`${result.bunTime.toFixed(2)}ms\`\n`;

      if (result.nodeTime) {
        md += `  • Node: \`${result.nodeTime.toFixed(2)}ms\`\n`;
        md += `  • Speedup: \`${result.speedup?.toFixed(2)}×\`\n`;
      }

      md += `\n`;
    }

    md += `━━━━━━━━━━━━━━━━━━━━\n`;
    md += `📊 [Full results](https://brendadeeznuts1111\\.github\\.io/Arsenal\\-Lab/)`;

    return md;
  }

  /**
   * Format stats
   */
  formatStats(stats: BotStats): string {
    const uptimeHours = Math.floor(stats.uptime / 3600);
    const uptimeMinutes = Math.floor((stats.uptime % 3600) / 60);

    if (this.mode === FormatMode.HTML) {
      let html = `📊 <b>Arsenal Lab Bot Statistics</b>\n\n`;
      html += `━━━━━━━━━━━━━━━━━━━━\n`;
      html += `👥 Total Users: <code>${stats.totalUsers}</code>\n`;
      html += `🟢 Active Users: <code>${stats.activeUsers}</code>\n`;
      html += `⚡ Commands Processed: <code>${stats.commandsProcessed}</code>\n`;
      html += `⏱️ Uptime: <code>${uptimeHours}h ${uptimeMinutes}m</code>\n`;
      html += `📦 Version: <code>${stats.version}</code>\n`;
      html += `━━━━━━━━━━━━━━━━━━━━\n\n`;
      html += `🤖 Powered by Bun ${process.versions.bun}`;

      return html;
    }

    // MarkdownV2 version
    let md = `📊 *Arsenal Lab Bot Statistics*\n\n`;
    md += `━━━━━━━━━━━━━━━━━━━━\n`;
    md += `👥 Total Users: \`${stats.totalUsers}\`\n`;
    md += `🟢 Active Users: \`${stats.activeUsers}\`\n`;
    md += `⚡ Commands Processed: \`${stats.commandsProcessed}\`\n`;
    md += `⏱️ Uptime: \`${uptimeHours}h ${uptimeMinutes}m\`\n`;
    md += `📦 Version: \`${this.escapeMarkdownV2(stats.version)}\`\n`;
    md += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    md += `🤖 Powered by Bun ${this.escapeMarkdownV2(process.versions.bun || '1.0.0')}`;

    return md;
  }

  /**
   * Format error with optional stack trace in spoiler
   */
  formatErrorWithStackTrace(error: string, stackTrace?: string): string {
    if (this.mode === FormatMode.HTML) {
      let html = `❌ <b>Error</b>\n\n${this.escapeHTML(error)}\n`;

      if (stackTrace) {
        html += `\n<span class="tg-spoiler">${this.escapeHTML(stackTrace)}</span>`;
      }

      return html;
    }

    // MarkdownV2 version
    let md = `❌ *Error*\n\n${this.escapeMarkdownV2(error)}\n`;

    if (stackTrace) {
      md += `\n||${this.escapeMarkdownV2(stackTrace)}||`;
    }

    return md;
  }

  /**
   * Format expandable section with blockquote
   */
  formatExpandableSection(title: string, content: string): string {
    if (this.mode === FormatMode.HTML) {
      return `<b>${this.escapeHTML(title)}</b>\n<blockquote expandable>${this.escapeHTML(content)}</blockquote>`;
    }

    return `*${this.escapeMarkdownV2(title)}*\n>${this.escapeMarkdownV2(content)}`;
  }

  /**
   * Format comparison result
   */
  formatComparison(runtime1: string, runtime2: string, results: Record<string, number>): string {
    if (this.mode === FormatMode.HTML) {
      let html = `⚖️ <b>Runtime Comparison</b>\n\n`;
      html += `<code>${this.escapeHTML(runtime1)}</code> vs <code>${this.escapeHTML(runtime2)}</code>\n\n`;
      html += `━━━━━━━━━━━━━━━━━━━━\n\n`;
      html += `📊 <b>Results:</b>\n`;

      Object.entries(results).forEach(([metric, value]) => {
        html += `  • ${this.escapeHTML(this.capitalize(metric))}: <code>${value.toFixed(2)}ms</code>\n`;
      });

      html += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;
      html += `📈 <a href="https://brendadeeznuts1111.github.io/Arsenal-Lab/">View detailed analysis</a>`;

      return html;
    }

    // MarkdownV2 version
    let md = `⚖️ *Runtime Comparison*\n\n`;
    md += `\`${this.escapeMarkdownV2(runtime1)}\` vs \`${this.escapeMarkdownV2(runtime2)}\`\n\n`;
    md += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    md += `📊 *Results:*\n`;

    Object.entries(results).forEach(([metric, value]) => {
      md += `  • ${this.escapeMarkdownV2(this.capitalize(metric))}: \`${value.toFixed(2)}ms\`\n`;
    });

    md += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    md += `📈 [View detailed analysis](https://brendadeeznuts1111\\.github\\.io/Arsenal\\-Lab/)`;

    return md;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Escape MarkdownV2 special characters
   */
  private escapeMarkdownV2(text: string): string {
    return text.replace(/([_*\[\]()~`>#@!|{}.+=\-\\])/g, '\\$1');
  }

  /**
   * Capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Export default HTML formatter
export const htmlFormatter = new MessageFormatter(FormatMode.HTML);
export const markdownFormatter = new MessageFormatter(FormatMode.MarkdownV2);
