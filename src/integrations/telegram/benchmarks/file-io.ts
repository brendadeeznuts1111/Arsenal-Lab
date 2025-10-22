/**
 * File I/O Benchmarks for Telegram Bot
 *
 * Server-side file operations using Bun.file() and Bun.write()
 */

import { tmpdir } from 'os';
import { join } from 'path';

export async function runFileReadBenchmark(): Promise<{
  bunTime: number;
  fileSize: number;
  operations: number;
}> {
  const iterations = 100;
  const testFile = join(tmpdir(), 'arsenal-lab-benchmark.txt');

  // Create test file
  const testData = 'Arsenal Lab Performance Test\n'.repeat(1000); // ~30KB
  await Bun.write(testFile, testData);

  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    const file = Bun.file(testFile);
    await file.text();
  }

  const bunTime = (performance.now() - start) / iterations;

  // Cleanup
  try {
    await Bun.write(testFile, ''); // Clear file
  } catch {
    // Ignore cleanup errors
  }

  return {
    bunTime,
    fileSize: testData.length,
    operations: iterations,
  };
}

export async function runFileWriteBenchmark(): Promise<{
  bunTime: number;
  fileSize: number;
  operations: number;
}> {
  const iterations = 100;
  const testFile = join(tmpdir(), 'arsenal-lab-write-benchmark.txt');
  const testData = 'Arsenal Lab Write Test\n'.repeat(1000); // ~30KB

  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    await Bun.write(testFile, testData);
  }

  const bunTime = (performance.now() - start) / iterations;

  // Cleanup
  try {
    await Bun.write(testFile, ''); // Clear file
  } catch {
    // Ignore cleanup errors
  }

  return {
    bunTime,
    fileSize: testData.length,
    operations: iterations,
  };
}

export async function runFileStreamBenchmark(): Promise<{
  bunTime: number;
  throughput: number;
}> {
  const testFile = join(tmpdir(), 'arsenal-lab-stream-benchmark.txt');

  // Create larger test file for streaming
  const testData = 'Arsenal Lab Stream Test\n'.repeat(10000); // ~300KB
  await Bun.write(testFile, testData);

  const start = performance.now();

  const file = Bun.file(testFile);
  const stream = file.stream();
  const reader = stream.getReader();

  let bytesRead = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.length;
  }

  const bunTime = performance.now() - start;

  // Cleanup
  try {
    await Bun.write(testFile, '');
  } catch {
    // Ignore cleanup errors
  }

  return {
    bunTime,
    throughput: (bytesRead / 1024 / 1024) / (bunTime / 1000), // MB/s
  };
}
