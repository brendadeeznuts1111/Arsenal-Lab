/**
 * GitHub Wiki Integration
 *
 * Clones and searches Arsenal Lab wiki pages
 */

import { tmpdir } from 'os';
import { join } from 'path';
import { $ } from 'bun';

const WIKI_REPO = 'https://github.com/brendadeeznuts1111/Arsenal-Lab.wiki.git';
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Wiki page interface
 */
export interface WikiPage {
  title: string;
  fileName: string;
  url: string;
  content?: string;
  lastModified?: Date;
}

/**
 * Wiki cache
 */
interface WikiCache {
  pages: WikiPage[];
  lastUpdated: number;
  wikiPath: string;
}

let wikiCache: WikiCache | null = null;

/**
 * Clone or update wiki repository
 */
async function cloneOrUpdateWiki(): Promise<string> {
  const wikiPath = join(tmpdir(), 'arsenal-lab-wiki');

  try {
    // Check if already cloned
    const exists = await Bun.file(join(wikiPath, '.git')).exists();

    if (exists) {
      // Update existing clone
      await $`cd ${wikiPath} && git pull origin master`.quiet();
    } else {
      // Fresh clone
      await $`git clone ${WIKI_REPO} ${wikiPath}`.quiet();
    }

    return wikiPath;
  } catch (error) {
    throw new Error(`Failed to clone wiki: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse markdown files from wiki directory
 */
async function parseWikiPages(wikiPath: string): Promise<WikiPage[]> {
  const pages: WikiPage[] = [];

  try {
    // Get all .md files
    const files = await Array.fromAsync(
      new Bun.Glob('*.md').scan({ cwd: wikiPath })
    );

    for (const fileName of files) {
      const filePath = join(wikiPath, fileName);
      const content = await Bun.file(filePath).text();

      // Extract title from filename (e.g., "Home.md" -> "Home")
      const title = fileName.replace(/\.md$/, '').replace(/-/g, ' ');

      // Get file stats for last modified
      const stats = await Bun.file(filePath).stat();

      pages.push({
        title,
        fileName,
        url: `https://github.com/brendadeeznuts1111/Arsenal-Lab/wiki/${encodeURIComponent(fileName.replace(/\.md$/, ''))}`,
        content,
        lastModified: stats?.mtime ? new Date(stats.mtime) : undefined,
      });
    }

    return pages;
  } catch (error) {
    throw new Error(`Failed to parse wiki pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get wiki pages (with caching)
 */
export async function getWikiPages(forceRefresh: boolean = false): Promise<WikiPage[]> {
  const now = Date.now();

  // Return cached pages if still valid
  if (
    !forceRefresh &&
    wikiCache &&
    now - wikiCache.lastUpdated < CACHE_DURATION_MS
  ) {
    return wikiCache.pages;
  }

  // Clone/update and parse
  const wikiPath = await cloneOrUpdateWiki();
  const pages = await parseWikiPages(wikiPath);

  // Update cache
  wikiCache = {
    pages,
    lastUpdated: now,
    wikiPath,
  };

  return pages;
}

/**
 * Search wiki pages by title or content
 */
export async function searchWiki(query: string, includeContent: boolean = true): Promise<WikiPage[]> {
  const pages = await getWikiPages();
  const lowerQuery = query.toLowerCase();

  return pages.filter((page) => {
    // Search in title
    if (page.title.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Search in filename
    if (page.fileName.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Search in content (if enabled)
    if (includeContent && page.content) {
      return page.content.toLowerCase().includes(lowerQuery);
    }

    return false;
  });
}

/**
 * Get a specific wiki page by title
 */
export async function getWikiPage(title: string): Promise<WikiPage | null> {
  const pages = await getWikiPages();
  const normalizedTitle = title.toLowerCase().replace(/\s+/g, '-');

  return (
    pages.find(
      (page) =>
        page.title.toLowerCase() === title.toLowerCase() ||
        page.fileName.toLowerCase() === `${normalizedTitle}.md`
    ) || null
  );
}

/**
 * Get wiki page summary (first 200 chars)
 */
export function getPageSummary(page: WikiPage): string {
  if (!page.content) return '';

  // Remove markdown headers
  let summary = page.content
    .replace(/^#+\s+.+$/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/[*_`]/g, '') // Remove formatting
    .trim();

  // Get first 200 characters
  if (summary.length > 200) {
    summary = summary.substring(0, 200) + '...';
  }

  return summary;
}

/**
 * Clear wiki cache (useful for testing)
 */
export function clearWikiCache(): void {
  wikiCache = null;
}
