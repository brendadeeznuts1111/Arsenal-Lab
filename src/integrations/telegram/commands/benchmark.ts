/**
 * Benchmark Command Handler
 *
 * Runs server-side performance benchmarks and returns results.
 */

import type { BotContext, BenchmarkResult } from '../types';
import { formatBenchmarkResult, formatBenchmarkResults } from '../utils/formatter';
import {
  runCryptoBenchmark,
  runHTTPBenchmark,
  runFileReadBenchmark,
  runFileWriteBenchmark,
  runAllCryptoBenchmarks,
  runAllHTTPBenchmarks,
  runAllFileIOBenchmarks,
} from '../benchmarks';

export async function handleBenchmark(ctx: BotContext): Promise<string> {
  const benchmarkType = ctx.args[0] || 'all';

  // Validate benchmark type
  const validTypes = ['crypto', 'http', 'fileio', 'all'];
  if (!validTypes.includes(benchmarkType)) {
    return `❌ Invalid benchmark type. Valid types: ${validTypes.join(', ')}`;
  }

  try {
    // Run actual benchmarks
    const results = await runActualBenchmarks(benchmarkType);

    if (benchmarkType === 'all') {
      return formatBenchmarkResults(results);
    } else {
      return formatBenchmarkResult(results[0]);
    }
  } catch (error) {
    return `❌ Benchmark failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Run actual server-side benchmarks
 */
async function runActualBenchmarks(type: string): Promise<BenchmarkResult[]> {
  switch (type) {
    case 'crypto': {
      const cryptoResult = await runCryptoBenchmark();
      return [{
        type: 'crypto',
        bunTime: cryptoResult.bunTime,
        nodeTime: cryptoResult.nodeTime,
        speedup: cryptoResult.speedup,
        memoryUsage: process.memoryUsage().heapUsed,
      }];
    }

    case 'http': {
      const httpResult = await runHTTPBenchmark();
      return [{
        type: 'http',
        bunTime: httpResult.bunTime,
        nodeTime: undefined,
        speedup: undefined,
        memoryUsage: process.memoryUsage().heapUsed,
      }];
    }

    case 'fileio': {
      const fileResult = await runFileReadBenchmark();
      return [{
        type: 'fileio',
        bunTime: fileResult.bunTime,
        nodeTime: undefined,
        speedup: undefined,
        memoryUsage: process.memoryUsage().heapUsed,
      }];
    }

    case 'all': {
      // Run all benchmarks in parallel
      const [cryptoResults, httpResults, fileIOResults] = await Promise.all([
        runAllCryptoBenchmarks(),
        runAllHTTPBenchmarks(),
        runAllFileIOBenchmarks(),
      ]);

      const results: BenchmarkResult[] = [];

      // Add crypto benchmarks
      if (cryptoResults.sha256) {
        results.push({
          type: 'crypto-sha256',
          bunTime: cryptoResults.sha256.bunTime,
          nodeTime: cryptoResults.sha256.nodeTime,
          speedup: cryptoResults.sha256.speedup,
          memoryUsage: process.memoryUsage().heapUsed,
        });
      }

      // Add HTTP benchmarks
      if (httpResults.remote) {
        results.push({
          type: 'http-remote',
          bunTime: httpResults.remote.bunTime,
          nodeTime: undefined,
          speedup: undefined,
          memoryUsage: process.memoryUsage().heapUsed,
        });
      }

      // Add file I/O benchmarks
      if (fileIOResults.read) {
        results.push({
          type: 'fileio-read',
          bunTime: fileIOResults.read.bunTime,
          nodeTime: undefined,
          speedup: undefined,
          memoryUsage: process.memoryUsage().heapUsed,
        });
      }

      return results;
    }

    default:
      throw new Error(`Unknown benchmark type: ${type}`);
  }
}
