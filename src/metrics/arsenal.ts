// src/metrics/arsenal.ts
// Simple Prometheus metrics implementation (no external deps)

export class PrometheusRegistry {
  private metrics: Map<string, PrometheusMetric> = new Map();

  register(metric: PrometheusMetric): void {
    this.metrics.set(metric.name, metric);
  }

  collect(): string {
    let output = '# Arsenal Performance Metrics\n';
    output += `# Collected at ${new Date().toISOString()}\n\n`;

    for (const metric of this.metrics.values()) {
      output += metric.toPrometheusFormat() + '\n';
    }

    return output;
  }

  getMetric(name: string): PrometheusMetric | undefined {
    return this.metrics.get(name);
  }
}

export abstract class PrometheusMetric {
  name: string;
  help: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  labels: string[];

  constructor(name: string, help: string, type: PrometheusMetric['type'], labels: string[] = []) {
    this.name = name;
    this.help = help;
    this.type = type;
    this.labels = labels;
  }

  abstract toPrometheusFormat(): string;
}

export class Gauge extends PrometheusMetric {
  private value: number = 0;
  private labelValues: Map<string, number> = new Map();

  constructor(name: string, help: string, labels: string[] = []) {
    super(name, help, 'gauge', labels);
  }

  set(value: number, labelValues?: Record<string, string>): void {
    if (labelValues && this.labels.length > 0) {
      const key = this.labels.map(label => labelValues[label] || '').join(',');
      this.labelValues.set(key, value);
    } else {
      this.value = value;
    }
  }

  toPrometheusFormat(): string {
    let output = `# HELP ${this.name} ${this.help}\n`;
    output += `# TYPE ${this.name} gauge\n`;

    if (this.labelValues.size > 0) {
      for (const [labelStr, value] of this.labelValues) {
        const labels = labelStr.split(',');
        const labelPairs = this.labels.map((label, index) =>
          `${label}="${labels[index]}"`
        ).join(',');
        output += `${this.name}{${labelPairs}} ${value}\n`;
      }
    } else {
      output += `${this.name} ${this.value}\n`;
    }

    return output;
  }
}

export class Histogram extends PrometheusMetric {
  private buckets: number[];
  private values: Map<string, number[]> = new Map();
  private sums: Map<string, number> = new Map();
  private counts: Map<string, number> = new Map();

  constructor(
    name: string,
    help: string,
    labels: string[] = [],
    buckets: number[] = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
  ) {
    super(name, help, 'histogram', labels);
    this.buckets = buckets;
  }

  observe(value: number, labelValues?: Record<string, string>): void {
    const key = labelValues ? this.labels.map(label => labelValues[label] || '').join(',') : '';

    if (!this.values.has(key)) {
      this.values.set(key, []);
      this.sums.set(key, 0);
      this.counts.set(key, 0);
    }

    const values = this.values.get(key)!;
    values.push(value);
    this.sums.set(key, this.sums.get(key)! + value);
    this.counts.set(key, this.counts.get(key)! + 1);
  }

  toPrometheusFormat(): string {
    let output = `# HELP ${this.name} ${this.help}\n`;
    output += `# TYPE ${this.name} histogram\n`;

    for (const [labelStr, values] of this.values) {
      const sum = this.sums.get(labelStr)!;
      const count = this.counts.get(labelStr)!;
      const sortedValues = [...values].sort((a, b) => a - b);

      // Bucket counts
      for (const bucket of this.buckets) {
        const bucketCount = sortedValues.filter(v => v <= bucket).length;
        if (labelStr) {
          const labels = labelStr.split(',');
          const labelPairs = this.labels.map((label, index) =>
            `${label}="${labels[index]}"`
          ).join(',');
          output += `${this.name}_bucket{${labelPairs},le="${bucket}"} ${bucketCount}\n`;
        } else {
          output += `${this.name}_bucket{le="${bucket}"} ${bucketCount}\n`;
        }
      }

      // +Inf bucket
      if (labelStr) {
        const labels = labelStr.split(',');
        const labelPairs = this.labels.map((label, index) =>
          `${label}="${labels[index]}"`
        ).join(',');
        output += `${this.name}_bucket{${labelPairs},le="+Inf"} ${count}\n`;
        output += `${this.name}_sum{${labelPairs}} ${sum}\n`;
        output += `${this.name}_count{${labelPairs}} ${count}\n`;
      } else {
        output += `${this.name}_bucket{le="+Inf"} ${count}\n`;
        output += `${this.name}_sum ${sum}\n`;
        output += `${this.name}_count ${count}\n`;
      }
    }

    return output;
  }
}

// Global registry instance
const registry = new PrometheusRegistry();

// Arsenal-specific metrics
export const benchDuration = new Histogram(
  "arsenal_benchmark_duration_ms",
  "Benchmark execution time in milliseconds",
  ["test", "runtime"],
  [0.1, 0.5, 1, 5, 10, 50, 100, 500, 1000, 5000]
);

export const benchThroughput = new Gauge(
  "arsenal_benchmark_throughput_ops",
  "Benchmark throughput in operations per second",
  ["test", "runtime"]
);

export const benchMemoryUsage = new Gauge(
  "arsenal_benchmark_memory_mb",
  "Memory usage during benchmark execution",
  ["test", "runtime"]
);

export const benchSuccessRate = new Gauge(
  "arsenal_benchmark_success_rate",
  "Benchmark success rate (0.0 to 1.0)",
  ["test"]
);

export const systemInfo = new Gauge(
  "arsenal_system_info",
  "System information",
  ["cpu_cores", "memory_gb", "platform"]
);

// Register all metrics
registry.register(benchDuration);
registry.register(benchThroughput);
registry.register(benchMemoryUsage);
registry.register(benchSuccessRate);
registry.register(systemInfo);

// Utility functions
export function recordBenchmarkResult(
  testName: string,
  runtime: string,
  duration: number,
  throughput: number,
  memory: number
): void {
  benchDuration.observe(duration, { test: testName, runtime });
  benchThroughput.set(throughput, { test: testName, runtime });
  benchMemoryUsage.set(memory, { test: testName, runtime });
}

export function recordSystemInfo(): void {
  const cpuCores = navigator.hardwareConcurrency || 4;
  const memoryGB = Math.round((navigator as any).deviceMemory || 8);
  const platform = navigator.platform;

  systemInfo.set(1, {
    cpu_cores: cpuCores.toString(),
    memory_gb: memoryGB.toString(),
    platform
  });
}

export function getPrometheusMetrics(): string {
  return registry.collect();
}

export function writeMetricsToFile(filename = 'metrics.prom'): void {
  const metrics = getPrometheusMetrics();
  Bun.write(filename, metrics);
  console.log(`📊 Metrics written to ${filename}`);
}

export default registry;
