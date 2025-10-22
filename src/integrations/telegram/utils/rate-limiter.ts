/**
 * Rate Limiter for Telegram Bot
 *
 * Prevents abuse by limiting the number of requests per user/chat.
 */

export interface RateLimitOptions {
  maxRequests: number;  // Maximum number of requests
  windowMs: number;      // Time window in milliseconds
  message?: string;      // Custom rate limit message
}

export class RateLimiter {
  private requests = new Map<number, number[]>();
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = {
      maxRequests: options.maxRequests || 10,
      windowMs: options.windowMs || 60000, // Default: 10 requests per minute
      message: options.message || '⚠️ Rate limit exceeded. Please try again later.',
    };

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if a request is allowed for the given user/chat ID
   */
  isAllowed(id: number): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(id) || [];

    // Filter out requests outside the time window
    const recentRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.options.windowMs
    );

    // Check if limit exceeded
    if (recentRequests.length >= this.options.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(id, recentRequests);

    return true;
  }

  /**
   * Get remaining requests for a user
   */
  getRemaining(id: number): number {
    const now = Date.now();
    const userRequests = this.requests.get(id) || [];

    const recentRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.options.windowMs
    );

    return Math.max(0, this.options.maxRequests - recentRequests.length);
  }

  /**
   * Get time until rate limit resets for a user
   */
  getResetTime(id: number): number {
    const userRequests = this.requests.get(id) || [];

    if (userRequests.length === 0) {
      return 0;
    }

    const oldestRequest = Math.min(...userRequests);
    const resetTime = oldestRequest + this.options.windowMs;

    return Math.max(0, resetTime - Date.now());
  }

  /**
   * Clean up old request records
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [id, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter(
        (timestamp) => now - timestamp < this.options.windowMs
      );

      if (recentRequests.length === 0) {
        this.requests.delete(id);
      } else {
        this.requests.set(id, recentRequests);
      }
    }
  }

  /**
   * Reset rate limit for a specific user
   */
  reset(id: number): void {
    this.requests.delete(id);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.requests.clear();
  }
}

// Predefined rate limiters for different command types
export const rateLimiters = {
  // Benchmark commands: 5 per minute (resource-intensive)
  benchmark: new RateLimiter({
    maxRequests: 5,
    windowMs: 60000,
    message: '⚠️ Benchmark rate limit exceeded. Please wait before running another benchmark.',
  }),

  // Comparison commands: 10 per minute
  compare: new RateLimiter({
    maxRequests: 10,
    windowMs: 60000,
    message: '⚠️ Too many comparison requests. Please try again in a moment.',
  }),

  // Stats/info commands: 20 per minute (lightweight)
  stats: new RateLimiter({
    maxRequests: 20,
    windowMs: 60000,
    message: '⚠️ Too many requests. Please slow down.',
  }),

  // Default: 15 per minute
  default: new RateLimiter({
    maxRequests: 15,
    windowMs: 60000,
    message: '⚠️ Rate limit exceeded. Please try again later.',
  }),
};
