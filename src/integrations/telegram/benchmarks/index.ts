/**
 * Benchmark exports for Telegram bot
 */

export {
  runCryptoBenchmark,
  runX25519Benchmark,
  runEd25519Benchmark,
} from './crypto';

export {
  runHTTPBenchmark,
  runLocalHTTPBenchmark,
} from './http';

export {
  runFileReadBenchmark,
  runFileWriteBenchmark,
  runFileStreamBenchmark,
} from './file-io';

// Convenience function to run all crypto benchmarks
export async function runAllCryptoBenchmarks() {
  const [sha256, x25519, ed25519] = await Promise.all([
    runCryptoBenchmark(),
    runX25519Benchmark(),
    runEd25519Benchmark(),
  ]);

  return { sha256, x25519, ed25519 };
}

// Convenience function to run all HTTP benchmarks
export async function runAllHTTPBenchmarks() {
  const [remote, local] = await Promise.all([
    runHTTPBenchmark().catch(() => null),
    runLocalHTTPBenchmark().catch(() => null),
  ]);

  return { remote, local };
}

// Convenience function to run all file I/O benchmarks
export async function runAllFileIOBenchmarks() {
  const [read, write, stream] = await Promise.all([
    runFileReadBenchmark(),
    runFileWriteBenchmark(),
    runFileStreamBenchmark(),
  ]);

  return { read, write, stream };
}
