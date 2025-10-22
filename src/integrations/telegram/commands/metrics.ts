/**
 * Metrics Command Handler
 *
 * Shows live GitHub repository statistics
 */

import type { BotContext } from '../types';
import { getRepoStats, GitHubAPIError } from '../../github/api';
import { htmlFormatter } from '../utils/formatter-enhanced';

export async function handleMetrics(ctx: BotContext): Promise<string> {
  try {
    const stats = await getRepoStats();

    // Format statistics using HTML
    let html = '📊 <b>Arsenal Lab GitHub Metrics</b>\n\n';
    html += '━━━━━━━━━━━━━━━━━━━━\n\n';

    // Repository stats
    html += `⭐ Stars: <b>${stats.stargazers_count}</b>\n`;
    html += `🍴 Forks: <b>${stats.forks_count}</b>\n`;
    html += `🐛 Open Issues: <b>${stats.open_issues_count}</b>\n`;
    html += `👀 Watchers: <b>${stats.watchers_count}</b>\n`;

    // Additional info
    html += `\n💻 Language: <code>${stats.language || 'N/A'}</code>\n`;
    html += `📦 Size: <code>${(stats.size / 1024).toFixed(2)} MB</code>\n`;

    // Timestamps
    const updatedAt = new Date(stats.updated_at);
    html += `\n🕒 Last Updated: <i>${updatedAt.toLocaleDateString()} ${updatedAt.toLocaleTimeString()}</i>\n`;

    // Links
    html += '\n━━━━━━━━━━━━━━━━━━━━\n\n';
    html += `🔗 <a href="${stats.html_url}">View Repository</a>\n`;

    if (stats.homepage) {
      html += `🌐 <a href="${stats.homepage}">Live Site</a>\n`;
    } else {
      html += `🌐 <a href="https://brendadeeznuts1111.github.io/Arsenal-Lab/">Live Site</a>\n`;
    }

    html += '\n<i>💡 Tip: Use /wiki to search documentation</i>';

    return html;
  } catch (error) {
    if (error instanceof GitHubAPIError) {
      if (error.status === 403) {
        return '❌ <b>GitHub API Rate Limit Exceeded</b>\n\n' +
               'The API rate limit has been reached. Please try again later.\n\n' +
               '<i>Add a GitHub token to increase the rate limit from 60 to 5000 requests per hour.</i>';
      }

      return `❌ <b>GitHub API Error</b>\n\n${htmlFormatter.escapeHTML(error.message)}`;
    }

    return `❌ <b>Failed to fetch metrics</b>\n\n${htmlFormatter.escapeHTML(error instanceof Error ? error.message : 'Unknown error')}`;
  }
}
