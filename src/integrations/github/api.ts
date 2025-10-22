/**
 * GitHub API Integration
 *
 * Fetches live data from Arsenal Lab repository:
 * - Repository statistics (stars, forks, issues)
 * - GitHub Discussions
 * - GitHub Pages deployment status
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'brendadeeznuts1111';
const REPO_NAME = 'Arsenal-Lab';
const REPO = `${REPO_OWNER}/${REPO_NAME}`;
const GITHUB_API = 'https://api.github.com';

/**
 * GitHub API error type
 */
export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

/**
 * Make authenticated GitHub API request
 */
async function githubRequest<T>(endpoint: string): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Arsenal-Lab-Bot/1.0',
  };

  // Add token if available (increases rate limit from 60/hour to 5000/hour)
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }

  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    headers,
  });

  // Check rate limits
  const remaining = response.headers.get('x-ratelimit-remaining');
  const resetTime = response.headers.get('x-ratelimit-reset');

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));

    // Rate limit exceeded
    if (response.status === 403 && remaining === '0') {
      const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : new Date();
      throw new GitHubAPIError(
        `GitHub API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`,
        response.status,
        error
      );
    }

    throw new GitHubAPIError(
      error.message || `GitHub API error: ${response.status}`,
      response.status,
      error
    );
  }

  return response.json();
}

/**
 * Repository statistics interface
 */
export interface RepoStats {
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  subscribers_count: number;
  size: number;
  language: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
}

/**
 * Get repository statistics
 */
export async function getRepoStats(): Promise<RepoStats> {
  return githubRequest<RepoStats>(`/repos/${REPO}`);
}

/**
 * Discussion interface (GraphQL API)
 */
export interface Discussion {
  id: string;
  title: string;
  url: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  category: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  comments: {
    totalCount: number;
  };
  upvoteCount: number;
  isAnswered: boolean;
}

/**
 * Get recent discussions using GraphQL API
 */
export async function getDiscussions(limit: number = 5): Promise<Discussion[]> {
  // GitHub Discussions require GraphQL API
  const query = `
    query {
      repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
        discussions(first: ${limit}, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            id
            title
            url
            author {
              login
              avatarUrl
            }
            category {
              name
            }
            createdAt
            updatedAt
            comments {
              totalCount
            }
            upvoteCount
            isAnswered
          }
        }
      }
    }
  `;

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'Arsenal-Lab-Bot/1.0',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new GitHubAPIError(
      error.message || `GitHub GraphQL error: ${response.status}`,
      response.status,
      error
    );
  }

  const result = await response.json();

  if (result.errors) {
    throw new GitHubAPIError(
      result.errors[0]?.message || 'GraphQL query failed',
      400,
      result.errors
    );
  }

  return result.data?.repository?.discussions?.nodes || [];
}

/**
 * GitHub Pages deployment interface
 */
export interface PagesDeployment {
  status_url: string;
  page_url: string;
  preview_url: string | null;
  environment: string;
  created_at: string;
  updated_at: string;
  status: 'queued' | 'in_progress' | 'success' | 'failure';
}

/**
 * Get latest GitHub Pages deployment
 *
 * Note: This endpoint is not officially documented, may require specific permissions
 */
export async function getLatestPagesDeployment(): Promise<PagesDeployment | null> {
  try {
    // Try to get Pages info first
    const pages = await githubRequest<any>(`/repos/${REPO}/pages`);

    return {
      status_url: pages.html_url,
      page_url: pages.html_url || `https://${REPO_OWNER}.github.io/${REPO_NAME}/`,
      preview_url: null,
      environment: 'github-pages',
      created_at: pages.created_at || new Date().toISOString(),
      updated_at: pages.updated_at || new Date().toISOString(),
      status: pages.status === 'built' ? 'success' : 'in_progress',
    };
  } catch (error) {
    // Fallback: return basic info if API fails
    if (error instanceof GitHubAPIError && error.status === 404) {
      return null; // Pages not enabled
    }

    // Return best-effort info
    return {
      status_url: `https://${REPO_OWNER}.github.io/${REPO_NAME}/`,
      page_url: `https://${REPO_OWNER}.github.io/${REPO_NAME}/`,
      preview_url: null,
      environment: 'github-pages',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'success',
    };
  }
}

/**
 * Get rate limit information
 */
export async function getRateLimitInfo() {
  const response = await githubRequest<any>('/rate_limit');

  return {
    core: {
      limit: response.resources.core.limit,
      remaining: response.resources.core.remaining,
      reset: new Date(response.resources.core.reset * 1000),
    },
    graphql: {
      limit: response.resources.graphql.limit,
      remaining: response.resources.graphql.remaining,
      reset: new Date(response.resources.graphql.reset * 1000),
    },
  };
}
