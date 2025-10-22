/**
 * Retry Logic with Exponential Backoff
 *
 * Handles transient errors (429, 502, 503, 504) with exponential backoff.
 * Start: 1s, multiply by 2, cap at 30s.
 */

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;
  let delay = fullConfig.initialDelayMs;

  for (let attempt = 0; attempt <= fullConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Check if we've exhausted retries
      if (attempt === fullConfig.maxRetries) {
        break;
      }

      // Wait before retrying
      console.log(`Retry attempt ${attempt + 1}/${fullConfig.maxRetries} after ${delay}ms`);
      await sleep(delay);

      // Increase delay with backoff
      delay = Math.min(delay * fullConfig.backoffMultiplier, fullConfig.maxDelayMs);
    }
  }

  throw lastError || new Error('All retries exhausted');
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const message = error.message?.toLowerCase() || '';
  const errorCode = error.error_code || error.code || error.status;

  // Retry on rate limits and server errors
  return (
    errorCode === 429 || // Rate limit
    errorCode === 502 || // Bad Gateway
    errorCode === 503 || // Service Unavailable
    errorCode === 504 || // Gateway Timeout
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('retry after')
  );
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry with custom condition
 */
export async function retryUntil<T>(
  fn: () => Promise<T>,
  condition: (result: T) => boolean,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let delay = fullConfig.initialDelayMs;

  for (let attempt = 0; attempt <= fullConfig.maxRetries; attempt++) {
    try {
      const result = await fn();

      if (condition(result)) {
        return result;
      }

      if (attempt === fullConfig.maxRetries) {
        throw new Error('Condition not met after max retries');
      }

      await sleep(delay);
      delay = Math.min(delay * fullConfig.backoffMultiplier, fullConfig.maxDelayMs);
    } catch (error) {
      if (attempt === fullConfig.maxRetries) {
        throw error;
      }

      await sleep(delay);
      delay = Math.min(delay * fullConfig.backoffMultiplier, fullConfig.maxDelayMs);
    }
  }

  throw new Error('Max retries exhausted');
}
