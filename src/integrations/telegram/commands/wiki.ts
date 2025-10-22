/**
 * Wiki Command Handler
 *
 * Searches Arsenal Lab wiki pages
 */

import type { BotContext } from '../types';
import { searchWiki, getWikiPage, getPageSummary } from '../../github/wiki';
import { htmlFormatter } from '../utils/formatter-enhanced';

export async function handleWiki(ctx: BotContext): Promise<string> {
  const query = ctx.args.join(' ').trim();

  if (!query) {
    return '📖 <b>Arsenal Lab Wiki</b>\n\n' +
           'Usage: <code>/wiki &lt;search query&gt;</code>\n\n' +
           'Examples:\n' +
           '• <code>/wiki home</code>\n' +
           '• <code>/wiki performance</code>\n' +
           '• <code>/wiki getting started</code>\n\n' +
           '🔗 <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab/wiki">Browse All Pages</a>';
  }

  try {
    // Try exact match first
    const exactMatch = await getWikiPage(query);

    if (exactMatch) {
      const summary = getPageSummary(exactMatch);

      let html = '📖 <b>Wiki Page Found</b>\n\n';
      html += `<b>${htmlFormatter.escapeHTML(exactMatch.title)}</b>\n\n`;

      if (summary) {
        html += `${htmlFormatter.escapeHTML(summary)}\n\n`;
      }

      html += `🔗 <a href="${exactMatch.url}">Read Full Page</a>`;

      return html;
    }

    // Search for matches
    const results = await searchWiki(query, true);

    if (results.length === 0) {
      return `📖 <b>No Wiki Pages Found</b>\n\n` +
             `No pages matching <code>${htmlFormatter.escapeHTML(query)}</code> were found.\n\n` +
             `🔗 <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab/wiki">Browse All Pages</a>`;
    }

    // Show top 5 results
    const topResults = results.slice(0, 5);

    let html = `📖 <b>Wiki Search Results</b>\n\n`;
    html += `Found ${results.length} page(s) matching <code>${htmlFormatter.escapeHTML(query)}</code>\n\n`;
    html += '━━━━━━━━━━━━━━━━━━━━\n\n';

    topResults.forEach((page, index) => {
      html += `${index + 1}. <a href="${page.url}">${htmlFormatter.escapeHTML(page.title)}</a>\n`;

      const summary = getPageSummary(page);
      if (summary && summary.length > 0) {
        const shortSummary = summary.length > 100
          ? summary.substring(0, 100) + '...'
          : summary;
        html += `   <i>${htmlFormatter.escapeHTML(shortSummary)}</i>\n`;
      }

      html += '\n';
    });

    if (results.length > 5) {
      html += `<i>...and ${results.length - 5} more results</i>\n\n`;
    }

    html += '🔗 <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab/wiki">View All Pages</a>';

    return html;
  } catch (error) {
    return `❌ <b>Wiki Search Failed</b>\n\n` +
           `${htmlFormatter.escapeHTML(error instanceof Error ? error.message : 'Unknown error')}\n\n` +
           `<i>The wiki repository may not be available. Try again later.</i>`;
  }
}
