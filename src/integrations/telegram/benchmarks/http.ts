/**
 * HTTP Benchmarks for Telegram Bot
 *
 * Server-side HTTP request benchmarks using fetch()
 */

export async function runHTTPBenchmark(): Promise<{
  bunTime: number;
  requests: number;
  averageLatency: number;
}> {
  const iterations = 10;
  const times: number[] = [];

  // Use a fast, reliable endpoint
  const testUrl = 'https://httpbin.org/get';

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();

    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Arsenal-Lab-Bot/1.0' },
      });

      await response.text(); // Consume response
      const duration = performance.now() - start;
      times.push(duration);
    } catch (error) {
      // Skip failed requests
      continue;
    }
  }

  const averageLatency = times.reduce((sum, t) => sum + t, 0) / times.length;

  return {
    bunTime: averageLatency,
    requests: times.length,
    averageLatency,
  };
}

export async function runLocalHTTPBenchmark(): Promise<{
  bunTime: number;
  requestsPerSecond: number;
}> {
  const iterations = 100;
  const start = performance.now();

  // Benchmark against a local endpoint (if Arsenal Lab server is running)
  const localUrl = 'http://localhost:3655';

  let successfulRequests = 0;

  for (let i = 0; i < iterations; i++) {
    try {
      const response = await fetch(localUrl, {
        method: 'GET',
      });

      if (response.ok) {
        successfulRequests++;
      }
    } catch {
      // Local server might not be running, skip
      continue;
    }
  }

  const totalTime = performance.now() - start;
  const bunTime = totalTime / successfulRequests;

  return {
    bunTime,
    requestsPerSecond: (successfulRequests / totalTime) * 1000,
  };
}
