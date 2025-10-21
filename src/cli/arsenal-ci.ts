// src/cli/arsenal-ci.ts
import { runTimeoutSuite } from "../bench/timeout";
import { toJUnit } from "../bench/micro";
import { recordBenchmarkResult, recordSystemInfo, writeMetricsToFile } from "../metrics/arsenal";
import { $ } from "bun";

interface CIConfig {
  outputDir?: string;
  junitFile?: string;
  promFile?: string;
  verbose?: boolean;
  timeout?: number;
}

export async function runArsenalCI(config: CIConfig = {}) {
  const {
    outputDir = 'coverage',
    junitFile = 'junit-bench.xml',
    promFile = 'metrics.prom',
    verbose = false,
    timeout = 300000 // 5 minutes
  } = config;

  console.log('🚀 Starting Arsenal CI Mode...');
  console.log(`📁 Output directory: ${outputDir}`);
  console.log(`⏱️ Timeout: ${timeout}ms`);
  console.log('');

  // Create output directory
  await $`mkdir -p ${outputDir}`.quiet();

  // Record system info
  recordSystemInfo();

  const startTime = Date.now();
  const results: any[] = [];
  let successCount = 0;
  let failureCount = 0;

  try {
    // Run timeout benchmark suite
    console.log('⏱️ Running timeout benchmarks...');
    const timeoutResults = await runTimeoutSuite();

    for (const result of timeoutResults) {
      results.push({
        name: `timeout_${result.bun.name.split(' ')[1]}`,
        bun: result.bun,
        node: result.node,
        speedup: result.speedup,
        memory: result.memory,
        success: result.speedup > 1 // Consider it a success if Bun is faster
      });

      // Record metrics
      recordBenchmarkResult(
        `timeout_${result.bun.name.split(' ')[1]}`,
        'bun',
        result.bun.mean,
        result.bun.throughput,
        result.memory
      );
      recordBenchmarkResult(
        `timeout_${result.node.name.split(' ')[1]}`,
        'node',
        result.node.mean,
        result.node.throughput,
        result.memory
      );

      if (result.speedup > 1) {
        successCount++;
      } else {
        failureCount++;
      }

      if (verbose) {
        console.log(`  ✅ ${result.bun.name}: ${(result.speedup).toFixed(2)}× speedup`);
      }
    }

    // Export JUnit results
    const junitPath = `${outputDir}/${junitFile}`;
    const junitXml = toJUnit(timeoutResults.map(r => r.bun), 'ArsenalBenchmarks');
    await Bun.write(junitPath, junitXml);
    console.log(`📄 JUnit results written to ${junitPath}`);

    // Export Prometheus metrics
    const promPath = `${outputDir}/${promFile}`;
    writeMetricsToFile(promPath);

    const duration = Date.now() - startTime;
    console.log('');
    console.log('🎯 CI Results Summary:');
    console.log(`  ⏱️ Total duration: ${(duration / 1000).toFixed(1)}s`);
    console.log(`  ✅ Successful benchmarks: ${successCount}`);
    console.log(`  ❌ Failed benchmarks: ${failureCount}`);
    console.log(`  📊 Average speedup: ${(results.reduce((sum, r) => sum + r.speedup, 0) / results.length).toFixed(2)}×`);
    console.log('');
    console.log('📁 Artifacts:');
    console.log(`  - ${junitPath} (JUnit XML)`);
    console.log(`  - ${promPath} (Prometheus metrics)`);

    // Exit with appropriate code
    process.exit(failureCount > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ CI run failed:', error);
    process.exit(1);
  }
}

// CLI entry point
if (import.meta.main) {
  const args = process.argv.slice(2);
  const config: CIConfig = {};

  // Parse CLI arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--output-dir':
      case '-o':
        config.outputDir = args[++i];
        break;
      case '--junit-file':
        config.junitFile = args[++i];
        break;
      case '--prom-file':
        config.promFile = args[++i];
        break;
      case '--verbose':
      case '-v':
        config.verbose = true;
        break;
      case '--timeout':
        config.timeout = parseInt(args[++i]);
        break;
      case '--help':
      case '-h':
        console.log('Arsenal CI Mode');
        console.log('');
        console.log('Usage: bun run arsenal:ci [options]');
        console.log('');
        console.log('Options:');
        console.log('  -o, --output-dir <dir>    Output directory (default: coverage)');
        console.log('  --junit-file <file>       JUnit XML output file (default: junit-bench.xml)');
        console.log('  --prom-file <file>        Prometheus metrics file (default: metrics.prom)');
        console.log('  -v, --verbose             Verbose output');
        console.log('  --timeout <ms>            Timeout in milliseconds (default: 300000)');
        console.log('  -h, --help                Show this help');
        process.exit(0);
    }
  }

  runArsenalCI(config);
}
