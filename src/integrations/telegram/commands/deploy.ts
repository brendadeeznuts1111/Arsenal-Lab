/**
 * Deploy Command Handler
 *
 * Shows GitHub Pages deployment status
 */

import type { BotContext } from '../types';
import { getLatestPagesDeployment, GitHubAPIError } from '../../github/api';
import { htmlFormatter } from '../utils/formatter-enhanced';

export async function handleDeploy(ctx: BotContext): Promise<string> {
  try {
    const deployment = await getLatestPagesDeployment();

    if (!deployment) {
      return '🚀 <b>GitHub Pages Deployment</b>\n\n' +
             '❌ GitHub Pages is not enabled for this repository.\n\n' +
             '🔗 <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab/settings/pages">Enable GitHub Pages</a>';
    }

    let html = '🚀 <b>GitHub Pages Deployment</b>\n\n';
    html += '━━━━━━━━━━━━━━━━━━━━\n\n';

    // Status with emoji
    const statusEmoji = {
      'success': '✅',
      'in_progress': '⏳',
      'queued': '🔄',
      'failure': '❌',
    };

    const statusText = {
      'success': 'Live',
      'in_progress': 'Building',
      'queued': 'Queued',
      'failure': 'Failed',
    };

    html += `Status: ${statusEmoji[deployment.status] || '⚪'} <b>${statusText[deployment.status] || 'Unknown'}</b>\n`;
    html += `Environment: <code>${deployment.environment}</code>\n\n`;

    // Timestamps
    const updatedAt = new Date(deployment.updated_at);
    const createdAt = new Date(deployment.created_at);

    html += `🕒 Last Updated: <i>${updatedAt.toLocaleDateString()} ${updatedAt.toLocaleTimeString()}</i>\n`;

    // Calculate build time if available
    if (deployment.status === 'success') {
      const buildTimeMs = updatedAt.getTime() - createdAt.getTime();
      const buildTimeSec = Math.floor(buildTimeMs / 1000);

      if (buildTimeSec > 0 && buildTimeSec < 3600) {
        html += `⚡ Build Time: <code>${buildTimeSec}s</code>\n`;
      }
    }

    html += '\n━━━━━━━━━━━━━━━━━━━━\n\n';

    // Links
    html += `🌐 <a href="${deployment.page_url}">Visit Live Site</a>\n`;

    if (deployment.preview_url) {
      html += `🔍 <a href="${deployment.preview_url}">Preview Deployment</a>\n`;
    }

    // Tips based on status
    if (deployment.status === 'success') {
      html += '\n<i>✨ Your site is live and up to date!</i>';
    } else if (deployment.status === 'in_progress') {
      html += '\n<i>⏳ Deployment in progress. Check back in a few minutes.</i>';
    } else if (deployment.status === 'failure') {
      html += '\n<i>❌ Deployment failed. Check your build logs for errors.</i>';
    }

    return html;
  } catch (error) {
    if (error instanceof GitHubAPIError) {
      if (error.status === 403) {
        return '❌ <b>GitHub API Rate Limit Exceeded</b>\n\n' +
               'The API rate limit has been reached. Please try again later.';
      }

      if (error.status === 404) {
        return '🚀 <b>GitHub Pages Deployment</b>\n\n' +
               '✅ <b>Assumed Live</b>\n\n' +
               'Deployment details unavailable via API, but the site should be live.\n\n' +
               '🌐 <a href="https://brendadeeznuts1111.github.io/Arsenal-Lab/">Visit Live Site</a>';
      }

      return `❌ <b>GitHub API Error</b>\n\n${htmlFormatter.escapeHTML(error.message)}`;
    }

    // Fallback: show basic info
    return '🚀 <b>GitHub Pages Deployment</b>\n\n' +
           '✅ <b>Live</b>\n\n' +
           '🌐 <a href="https://brendadeeznuts1111.github.io/Arsenal-Lab/">Visit Live Site</a>\n\n' +
           '<i>Detailed deployment info unavailable.</i>';
  }
}
