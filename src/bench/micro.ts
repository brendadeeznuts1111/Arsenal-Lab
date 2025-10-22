// src/bench/micro.ts

// Statistical functions (jStat-like implementation)
export function mean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

export function variance(values: number[], isSample = true): number {
  const avg = mean(values);
  const squareDiffs = values.map(val => Math.pow(val - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return isSample ? avgSquareDiff * (values.length / (values.length - 1)) : avgSquareDiff;
}

export function standardDeviation(values: number[], isSample = true): number {
  return Math.sqrt(variance(values, isSample));
}

export function confidenceInterval(values: number[], _confidence = 0.95): [number, number] {
  const n = values.length;
  const avg = mean(values);
  const std = standardDeviation(values);
  const criticalValue = 1.96; // z-score for 95% confidence
  const marginOfError = criticalValue * (std / Math.sqrt(n));

  return [avg - marginOfError, avg + marginOfError];
}

export function filterOutliers(values: number[], threshold = 2): number[] {
  const avg = mean(values);
  const std = standardDeviation(values);
  return values.filter(val => Math.abs(val - avg) <= threshold * std);
}

export function quantile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (upper >= sorted.length) return sorted[sorted.length - 1]!;
  if (lower < 0 || upper >= sorted.length) return 0;
  return sorted[lower]! * (1 - weight) + sorted[upper]! * weight;
}

export type MicroResult = {
  name: string;
  samples: number[];
  mean: number;
  median: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
  ci: [number, number]; // 95% confidence interval
  outliers: number;
  throughput: number; // ops/sec
  stdDev: number;
  cv: number; // coefficient of variation
};

export type MicroOptions = {
  warmup?: number;
  samples?: number;
  confidence?: number;
  outlierThreshold?: number;
};

export async function micro(
  name: string,
  fn: () => void | Promise<void>,
  opts: MicroOptions = {}
): Promise<MicroResult> {
  const {
    warmup = 1000,
    samples = 10_000,
    confidence = 0.95,
    outlierThreshold = 2
  } = opts;

  // JIT warmup phase
  console.log(`🔥 Warming up ${name}...`);
  for (let i = 0; i < warmup; i++) {
    await fn();
  }

  // Benchmark sampling phase
  console.log(`📊 Benchmarking ${name} (${samples} samples)...`);
  const times: number[] = [];

  for (let i = 0; i < samples; i++) {
    const t0 = performance.now();
    await fn();
    const duration = performance.now() - t0;
    times.push(duration);

    // Progress indicator
    if ((i + 1) % 1000 === 0) {
      console.log(`  ${((i + 1) / samples * 100).toFixed(1)}% complete`);
    }
  }

  // Statistical analysis
  const cleanSamples = filterOutliers(times, outlierThreshold);
  const m = mean(cleanSamples);
  const med = quantile(cleanSamples, 0.5);
  const p95 = quantile(cleanSamples, 0.95);
  const p99 = quantile(cleanSamples, 0.99);
  const ci = confidenceInterval(cleanSamples, confidence);
  const std = standardDeviation(cleanSamples);
  const cv = std / m; // coefficient of variation

  const result: MicroResult = {
    name,
    samples: cleanSamples,
    mean: m,
    median: med,
    min: Math.min(...cleanSamples),
    max: Math.max(...cleanSamples),
    p95,
    p99,
    ci,
    outliers: times.length - cleanSamples.length,
    throughput: 1000 / m, // ops/sec
    stdDev: std,
    cv
  };

  console.log(`✅ ${name} complete: ${result.throughput.toFixed(0)} ops/sec (mean: ${m.toFixed(3)}ms)`);

  return result;
}

// Batch benchmarking utility
export async function microBatch(
  benchmarks: Array<{ name: string; fn: () => void | Promise<void>; opts?: MicroOptions }>
): Promise<MicroResult[]> {
  const results: MicroResult[] = [];

  for (const bench of benchmarks) {
    const result = await micro(bench.name, bench.fn, bench.opts);
    results.push(result);
  }

  return results;
}

// Comparison utility
export function compareResults(baseline: MicroResult, comparison: MicroResult) {
  const speedup = baseline.mean / comparison.mean;
  const throughputGain = comparison.throughput / baseline.throughput;

  return {
    baseline: baseline.name,
    comparison: comparison.name,
    speedup,
    throughputGain,
    meanDiff: comparison.mean - baseline.mean,
    ciOverlap: comparison.ci[0] <= baseline.ci[1] && comparison.ci[1] >= baseline.ci[0],
    statisticalSignificance: Math.abs(speedup - 1) > 0.05 // 5% difference threshold
  };
}

// Export utilities for CI/JUnit
export function toJUnit(results: MicroResult[], suiteName = 'MicroBenchmarks'): string {
  const totalTests = results.length;
  const failures = results.filter(r => r.cv > 0.1).length; // High variance = failure
  const time = results.reduce((sum, r) => sum + r.mean * r.samples.length, 0) / 1000;

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<testsuite name="${suiteName}" tests="${totalTests}" failures="${failures}" time="${time}">\n`;

  for (const result of results) {
    const failure = result.cv > 0.1 ? `<failure>High coefficient of variation: ${(result.cv * 100).toFixed(1)}%</failure>` : '';
    xml += `  <testcase name="${result.name}" time="${(result.mean * result.samples.length) / 1000}">\n`;
    if (failure) xml += `    ${failure}\n`;
    xml += '  </testcase>\n';
  }

  xml += '</testsuite>\n';
  return xml;
}
