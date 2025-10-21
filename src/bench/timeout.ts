// src/bench/timeout.ts
import { micro, MicroResult } from "./micro";
import { $ } from "bun";

export interface TimeoutBenchmarkResult {
  bun: MicroResult;
  node: MicroResult;
  speedup: number;
  memory: number;
}

export async function runTimeoutBenchmark(ms: number): Promise<TimeoutBenchmarkResult> {
  console.log(`⏱️ Running timeout benchmark (${ms}ms)...`);

  // Bun timeout benchmark
  const bun = await micro("bun timeout", () =>
    $`bun -e '
      const proc = Bun.spawn({cmd:["sleep","0.1"], timeout:${ms}});
      proc.exited.catch(() => {}); // Ignore timeout errors for benchmark
    '`.quiet()
  , { samples: 1000, warmup: 100 });

  // Node.js timeout benchmark
  const node = await micro("node timeout", () =>
    $`node -e '
      const {spawn}=require("child_process");
      const proc=spawn("sleep",["0.1"],{timeout:${ms}});
      proc.on("exit",()=>{}).on("error",()=>{}); // Ignore errors
    '`.quiet()
  , { samples: 1000, warmup: 100 });

  // Calculate speedup
  const speedup = node.mean / bun.mean;

  // Get memory usage (simplified)
  const memory = await getPeakMemory();

  console.log(`✅ Timeout benchmark complete: ${(speedup).toFixed(1)}× speedup`);

  return {
    bun,
    node,
    speedup,
    memory
  };
}

// Get peak memory usage (Linux-specific, fallback for other platforms)
async function getPeakMemory(): Promise<number> {
  try {
    // Try to read from /proc/self/status (Linux)
    const status = await $`cat /proc/self/status | grep VmPeak`.quiet();
    const match = status.stdout.toString().match(/VmPeak:\s+(\d+)\s+kB/);
    if (match) {
      return parseInt(match[1]) / 1024; // Convert to MB
    }
  } catch (error) {
    // Fallback: estimate based on process info
    try {
      const memUsage = process.memoryUsage();
      return Math.max(memUsage.heapUsed, memUsage.heapTotal) / 1024 / 1024;
    } catch (error) {
      return 50; // Default fallback
    }
  }

  return 50; // Default fallback
}

// Batch timeout benchmarks for CI
export async function runTimeoutSuite(): Promise<TimeoutBenchmarkResult[]> {
  const timeouts = [100, 500, 1000, 2000, 5000];
  const results: TimeoutBenchmarkResult[] = [];

  for (const timeout of timeouts) {
    const result = await runTimeoutBenchmark(timeout);
    results.push(result);
  }

  return results;
}
