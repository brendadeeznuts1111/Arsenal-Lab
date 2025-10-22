#!/usr/bin/env bun
// scripts/build.ts - Production build orchestrator for Arsenal Lab

import type { BuildOutput } from 'bun';
import { getBuildConfig } from '../build.config';

interface BuildResult {
  success: boolean;
  duration: number;
  totalSize: number;
  outputs: number;
  errors: string[];
}

/**
 * Main build function
 */
async function build() {
  console.log('🚀 Starting Arsenal Lab build process...\n');

  const startTime = performance.now();

  try {
    // Parse command line arguments
    const args = parseArgs();

    // Clean previous builds
    if (!args.skipClean) {
      await cleanDistDirectory();
    }

    // Execute build based on target
    let result: BuildOutput;

    if (args.target === 'all') {
      result = await buildAll();
    } else {
      result = await buildTarget(args.target);
    }

    // Copy static assets for web deployments
    if (args.target === 'static' || args.target === 'all') {
      await copyStaticAssets(args.target);
    }

    // Check for build errors
    if (!result.success) {
      console.error('❌ Build failed with errors:\n');
      for (const log of result.logs) {
        console.error(`  ${log.message}`);
      }
      process.exit(1);
    }

    // Generate build report
    const buildResult = generateBuildResult(result, startTime);

    // Display results
    displayBuildResults(buildResult, args.target);

    // Generate detailed report if requested
    if (args.analyze) {
      await generateBuildReport(result, args.target);
    }

    console.log('\n✅ Build completed successfully!');

  } catch (error) {
    console.error('\n❌ Build error:', error);
    process.exit(1);
  }
}

/**
 * Build all targets
 */
async function buildAll(): Promise<BuildOutput> {
  console.log('📦 Building all targets...\n');

  const targets = ['static', 'dev', 'production', 'cli'] as const;
  const results: BuildOutput[] = [];

  for (const target of targets) {
    console.log(`\n🔨 Building ${target}...`);
    const result = await buildTarget(target);
    results.push(result);

    if (!result.success) {
      return result; // Return first failure
    }
  }

  // Combine all results
  return {
    success: true,
    outputs: results.flatMap(r => r.outputs),
    logs: results.flatMap(r => r.logs),
  };
}

/**
 * Build specific target
 */
async function buildTarget(target: 'static' | 'dev' | 'production' | 'cli'): Promise<BuildOutput> {
  const config = getBuildConfig(target);

  console.log(`📊 Configuration:`);
  console.log(`  Entry points: ${config.entrypoints?.length || 0}`);
  console.log(`  Output dir: ${config.outdir}`);
  console.log(`  Minify: ${config.minify ? 'enabled' : 'disabled'}`);
  console.log(`  Sourcemaps: ${config.sourcemap || 'none'}`);
  console.log(`  Code splitting: ${config.splitting ? 'enabled' : 'disabled'}\n`);

  return await Bun.build(config);
}

/**
 * Clean dist directory
 */
async function cleanDistDirectory() {
  console.log('🧹 Cleaning previous build...');

  try {
    await Bun.spawn(['rm', '-rf', 'dist']).exited;
    await Bun.spawn(['mkdir', '-p', 'dist']).exited;
    console.log('✓ Clean complete\n');
  } catch (error) {
    console.warn('⚠️  Could not clean dist directory:', error);
  }
}

/**
 * Update HTML asset paths with built file hashes
 */
function updateAssetPaths(htmlContent: string): string {
  // Find the JavaScript and CSS files in dist/static
  const fs = require('fs');
  const staticDir = './dist/static';

  try {
    const files = fs.readdirSync(staticDir);
    const jsFiles = files.filter((f: string) => f.endsWith('.js') && f.startsWith('lab.'));
    const cssFiles = files.filter((f: string) => f.endsWith('.css') && f.startsWith('lab.'));

    // Use the first JS and CSS files found (should be the entry points)
    const jsFile = jsFiles[0] || 'lab.js';
    const cssFile = cssFiles[0] || 'lab.css';

    // Replace placeholder paths with actual hashed paths
    let updatedHtml = htmlContent.replace(
      /<script type="module" src="static\/lab\.[a-z0-9]+\.js"><\/script>/,
      `<script type="module" src="static/${jsFile}"></script>`
    );

    updatedHtml = updatedHtml.replace(
      /<link rel="stylesheet" href="static\/lab\.[a-z0-9]+\.css">/,
      `<link rel="stylesheet" href="static/${cssFile}">`
    );

    return updatedHtml;
  } catch (error) {
    console.warn('⚠️  Could not update asset paths, using placeholders:', error);
    return htmlContent;
  }
}

/**
 * Copy static assets (HTML, images, etc.) to dist
 */
async function copyStaticAssets(target: string) {
  console.log('📋 Copying static assets...');

  try {
    // Copy index.html to dist and update asset paths
    const htmlContent = await Bun.file('index.html').text();
    const updatedHtml = updateAssetPaths(htmlContent);
    await Bun.write('dist/index.html', updatedHtml);

    // Copy public directory if it exists
    try {
      const publicExists = await Bun.file('public').exists();
      if (publicExists) {
        await Bun.spawn(['cp', '-r', 'public/', 'dist/']).exited;
      }
    } catch {
      // Public directory doesn't exist, skip
    }

    // Copy manifest files and favicons
    const manifestFiles = [
      'site.webmanifest',
      'manifest.json',
      'favicon.svg',
      'apple-touch-icon.svg',
      'icon-192.svg',
      'icon-512.svg'
    ];

    for (const file of manifestFiles) {
      try {
        const content = await Bun.file(file).text();
        await Bun.write(`dist/${file}`, content);
      } catch {
        // File doesn't exist, skip
      }
    }

    console.log('✓ Static assets copied\n');
  } catch (error) {
    console.warn('⚠️  Could not copy static assets:', error);
  }
}

/**
 * Generate build result summary
 */
function generateBuildResult(result: BuildOutput, startTime: number): BuildResult {
  const duration = performance.now() - startTime;
  const totalSize = result.outputs.reduce((sum, output) => sum + output.size, 0);

  return {
    success: result.success,
    duration,
    totalSize,
    outputs: result.outputs.length,
    errors: result.logs.filter(log => log.level === 'error').map(log => log.message),
  };
}

/**
 * Display build results
 */
function displayBuildResults(result: BuildResult, target: string) {
  console.log('\n' + '='.repeat(50));
  console.log('📊 Build Summary');
  console.log('='.repeat(50));
  console.log(`Target:         ${target}`);
  console.log(`Duration:       ${(result.duration / 1000).toFixed(2)}s`);
  console.log(`Total Size:     ${(result.totalSize / 1024).toFixed(2)} KB`);
  console.log(`Output Files:   ${result.outputs}`);
  console.log(`Status:         ${result.success ? '✅ Success' : '❌ Failed'}`);
  console.log('='.repeat(50));
}

/**
 * Generate detailed build report
 */
async function generateBuildReport(result: BuildOutput, target: string) {
  const report = {
    timestamp: new Date().toISOString(),
    target,
    outputs: result.outputs.map(output => ({
      path: output.path,
      size: output.size,
      kind: output.kind,
      loader: output.loader,
      hash: output.hash,
    })),
    logs: result.logs.map(log => ({
      level: log.level,
      message: log.message,
    })),
    stats: {
      totalFiles: result.outputs.length,
      totalSize: result.outputs.reduce((sum, o) => sum + o.size, 0),
      entryPoints: result.outputs.filter(o => o.kind === 'entry-point').length,
      chunks: result.outputs.filter(o => o.kind === 'chunk').length,
      assets: result.outputs.filter(o => o.kind === 'asset').length,
    },
  };

  const reportPath = `dist/build-report-${target}.json`;
  await Bun.write(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📈 Build analysis saved to: ${reportPath}`);
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);

  return {
    target: (args.includes('--target')
      ? args[args.indexOf('--target') + 1]
      : 'static') as 'static' | 'dev' | 'production' | 'cli' | 'all',
    analyze: args.includes('--analyze'),
    skipClean: args.includes('--skip-clean'),
    verbose: args.includes('--verbose'),
  };
}

/**
 * Display help
 */
function displayHelp() {
  console.log(`
Arsenal Lab Build Script

Usage:
  bun run scripts/build.ts [options]

Options:
  --target <type>    Build target: static, dev, production, cli, all (default: static)
  --analyze          Generate detailed build analysis report
  --skip-clean       Skip cleaning dist directory before build
  --verbose          Enable verbose logging
  --help             Display this help message

Examples:
  bun run scripts/build.ts --target static --analyze
  bun run scripts/build.ts --target all
  bun run scripts/build.ts --target production --skip-clean
`);
}

// Handle --help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  displayHelp();
  process.exit(0);
}

// Run build if called directly
if (import.meta.main) {
  await build();
}

export { build, buildAll, buildTarget };

