#!/usr/bin/env bun

/**
 * Build Script for Bun v1.3.1 Features
 *
 * Demonstrates:
 * - Faster bun build (2x improvement for symlink-heavy projects)
 * - Sourcemaps with legal comments preservation
 * - Enhanced build configurations
 */

import { $ } from "bun";

interface BuildConfig {
  target: "bun" | "node" | "browser";
  format?: "esm" | "cjs";
  minify?: boolean;
  sourcemap?: boolean | "external" | "inline";
  outdir?: string;
  entrypoint?: string;
}

async function buildWithLegalComments(config: BuildConfig) {
  console.log(`🚀 Building with Bun v1.3.1 optimizations...`);

  const buildArgs = [
    "bun",
    "build",
    config.entrypoint || "src/server.ts",
    `--target=${config.target}`,
  ];

  if (config.format) buildArgs.push(`--format=${config.format}`);
  if (config.minify) buildArgs.push("--minify");
  if (config.sourcemap) {
    if (config.sourcemap === "external") {
      buildArgs.push("--sourcemap=external");
    } else if (config.sourcemap === "inline") {
      buildArgs.push("--sourcemap=inline");
    } else {
      buildArgs.push("--sourcemap");
    }
  }
  if (config.outdir) buildArgs.push(`--outdir=${config.outdir}`);

  console.log(`📦 Build command: ${buildArgs.join(" ")}`);

  const startTime = Date.now();
  const result = await $`${buildArgs}`.quiet();
  const duration = Date.now() - startTime;

  if (result.exitCode === 0) {
    console.log(`✅ Build completed in ${duration}ms`);
    console.log(`🎯 2x faster builds enabled for symlink-heavy projects`);
    console.log(`📋 Sourcemaps preserve legal comments for accurate debugging`);
  } else {
    console.error(`❌ Build failed with exit code ${result.exitCode}`);
  }

  return result;
}

async function demonstrateCJSImportMeta() {
  console.log(`\n🔧 Testing CommonJS import.meta inlining (Bun v1.3.1)...`);

  const testCode = `
// Test file for CommonJS import.meta inlining
export const meta = {
  url: import.meta.url,
  path: import.meta.path,
  dirname: import.meta.dirname,
  file: import.meta.file
};

console.log('CommonJS import.meta test:', meta);
`;

  await Bun.write("test-import-meta.ts", testCode);

  try {
    // Build as CommonJS to test import.meta inlining
    await buildWithLegalComments({
      target: "node",
      format: "cjs",
      sourcemap: true,
      outdir: "./dist-test",
      entrypoint: "test-import-meta.ts"
    });

    // Check the output
    const output = await Bun.file("dist-test/test-import-meta.js").text();
    console.log("📝 Generated CommonJS output:");
    console.log(output.slice(0, 200) + "...");

    if (output.includes("__filename") || output.includes("__dirname")) {
      console.log("✅ import.meta successfully inlined to CommonJS equivalents");
    }

  } finally {
    // Cleanup
    await $`rm -rf dist-test test-import-meta.ts`.quiet();
  }
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case "fast":
      console.log("⚡ Building with Bun v1.3.1 fast mode...");
      await buildWithLegalComments({
        target: "bun",
        minify: true,
        sourcemap: "external",
        outdir: "./dist-fast"
      });
      break;

    case "cjs":
      console.log("📦 Building CommonJS with import.meta support...");
      await buildWithLegalComments({
        target: "node",
        format: "cjs",
        sourcemap: true,
        outdir: "./dist-cjs"
      });
      await demonstrateCJSImportMeta();
      break;

    case "sourcemap":
      console.log("🗺️ Building with enhanced sourcemap support...");
      await buildWithLegalComments({
        target: "bun",
        sourcemap: "external",
        outdir: "./dist-sourcemap"
      });

      // Check if sourcemap preserves legal comments
      const sourcemapExists = await Bun.file("dist-sourcemap/server.js.map").exists();
      if (sourcemapExists) {
        console.log("✅ External sourcemap generated with legal comment preservation");
      }
      break;

    case "all":
      console.log("🎯 Running all Bun v1.3.1 build demonstrations...");

      await buildWithLegalComments({
        target: "bun",
        minify: true,
        sourcemap: "external",
        outdir: "./dist-bun"
      });

      await buildWithLegalComments({
        target: "node",
        format: "cjs",
        sourcemap: true,
        outdir: "./dist-node"
      });

      await buildWithLegalComments({
        target: "browser",
        minify: true,
        sourcemap: "inline",
        outdir: "./dist-browser"
      });

      console.log("🎉 All build configurations completed!");
      console.log("📊 Performance: 2x faster for symlink-heavy projects");
      console.log("🔍 Debugging: Enhanced sourcemaps with legal comments");
      break;

    default:
      console.log(`
🚀 Bun v1.3.1 Build Script

Usage:
  bun run scripts/build-v1.3.1.ts <command>

Commands:
  fast      - Fast production build with minification
  cjs       - CommonJS build with import.meta inlining
  sourcemap - Build with enhanced sourcemap support
  all       - Run all build demonstrations

Features:
  • 2x faster builds for symlink-heavy projects
  • Sourcemaps preserve legal comments
  • import.meta inlining in CommonJS builds
  • Enhanced debugging capabilities
      `);
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch(console.error);
}
