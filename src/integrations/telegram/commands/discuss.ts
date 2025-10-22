/**
 * Discuss Command Handler
 *
 * Lists recent GitHub Discussions
 */

import type { BotContext } from '../types';
import { getDiscussions, GitHubAPIError } from '../../github/api';
import { htmlFormatter } from '../utils/formatter-enhanced';

export async function handleDiscuss(ctx: BotContext): Promise<string> {
  try {
    const discussions = await getDiscussions(5);

    if (discussions.length === 0) {
      return '💬 <b>GitHub Discussions</b>\n\n' +
             'No discussions found yet.\n\n' +
             '🔗 <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab/discussions">Start a Discussion</a>';
    }

    let html = '💬 <b>Latest Discussions</b>\n\n';
    html += '━━━━━━━━━━━━━━━━━━━━\n\n';

    discussions.forEach((discussion, index) => {
      const updatedAt = new Date(discussion.updatedAt);
      const timeAgo = getTimeAgo(updatedAt);

      html += `${index + 1}. <a href="${discussion.url}">${htmlFormatter.escapeHTML(discussion.title)}</a>\n`;
      html += `   👤 by ${htmlFormatter.escapeHTML(discussion.author.login)}`;

      // Category badge
      html += ` • 🏷️ ${htmlFormatter.escapeHTML(discussion.category.name)}`;

      // Stats
      const stats = [];
      if (discussion.upvoteCount > 0) {
        stats.push(`👍 ${discussion.upvoteCount}`);
      }
      if (discussion.comments.totalCount > 0) {
        stats.push(`💬 ${discussion.comments.totalCount}`);
      }
      if (discussion.isAnswered) {
        stats.push('✅ Answered');
      }

      if (stats.length > 0) {
        html += ` • ${stats.join(' • ')}`;
      }

      html += `\n   🕒 <i>${timeAgo}</i>\n\n`;
    });

    html += '━━━━━━━━━━━━━━━━━━━━\n\n';
    html += '🔗 <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab/discussions">View All Discussions</a>\n';
    html += '\n<i>💡 Join the conversation and share your ideas!</i>';

    return html;
  } catch (error) {
    if (error instanceof GitHubAPIError) {
      if (error.status === 403) {
        return '❌ <b>GitHub API Rate Limit Exceeded</b>\n\n' +
               'The API rate limit has been reached. Please try again later.\n\n' +
               '<i>Tip: A GitHub token can increase the rate limit.</i>';
      }

      if (error.message.includes('GraphQL')) {
        return '❌ <b>GitHub Discussions Unavailable</b>\n\n' +
               'Discussions may not be enabled for this repository, or a GitHub token is required.\n\n' +
               '🔗 <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab/discussions">Visit Discussions</a>';
      }

      return `❌ <b>GitHub API Error</b>\n\n${htmlFormatter.escapeHTML(error.message)}`;
    }

    return `❌ <b>Failed to fetch discussions</b>\n\n${htmlFormatter.escapeHTML(error instanceof Error ? error.message : 'Unknown error')}`;
  }
}

/**
 * Convert date to relative time string
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
  return `${Math.floor(seconds / 31536000)} years ago`;
}
