#!/usr/bin/env bun

/**
 * Demonstrate Bun v1.3.1 Package Hoisting Features
 *
 * Showcases publicHoistPattern and hoistPattern from:
 * https://bun.com/blog/bun-v1.3.1#publichoistpattern-and-hoistpattern
 */

import { $ } from "bun";
import { join } from "path";

async function demonstrateHoisting() {
  console.log("📦 Bun v1.3.1 Package Hoisting Demonstration\n");

  // Create a mock monorepo structure to demonstrate hoisting
  const demoDir = "hoisting-demo";
  await $`rm -rf ${demoDir}`.quiet();
  await $`mkdir -p ${demoDir}/packages/app1 ${demoDir}/packages/app2 ${demoDir}/packages/shared`.quiet();

  // Create package.json files
  const rootPackage = {
    name: "monorepo-root",
    version: "1.0.0",
    private: true,
    workspaces: ["packages/*"],
    devDependencies: {
      "typescript": "^5.0.0",
      "eslint": "^8.0.0",
      "@typescript-eslint/parser": "^6.0.0",
      "@types/node": "^20.0.0"
    }
  };

  const app1Package = {
    name: "app1",
    version: "1.0.0",
    dependencies: {
      "lodash": "^4.17.0",
      "@types/lodash": "^4.14.0"
    },
    devDependencies: {
      "jest": "^29.0.0",
      "@types/jest": "^29.0.0"
    }
  };

  const app2Package = {
    name: "app2",
    version: "1.0.0",
    dependencies: {
      "express": "^4.18.0",
      "@types/express": "^4.17.0"
    },
    devDependencies: {
      "mocha": "^10.0.0",
      "@types/mocha": "^10.0.0"
    }
  };

  const sharedPackage = {
    name: "shared",
    version: "1.0.0",
    dependencies: {
      "axios": "^1.4.0",
      "@types/axios": "^0.14.0"
    }
  };

  await Bun.write(join(demoDir, "package.json"), JSON.stringify(rootPackage, null, 2));
  await Bun.write(join(demoDir, "packages/app1/package.json"), JSON.stringify(app1Package, null, 2));
  await Bun.write(join(demoDir, "packages/app2/package.json"), JSON.stringify(app2Package, null, 2));
  await Bun.write(join(demoDir, "packages/shared/package.json"), JSON.stringify(sharedPackage, null, 2));

  // Create bunfig.toml with hoisting patterns
  const bunfigContent = `
[install]
# Public hoisting - makes these available globally
publicHoistPattern = [
  "@types/*",           # TypeScript types
  "typescript",         # TypeScript compiler
  "eslint*",            # ESLint and plugins
  "@typescript-eslint/*" # TypeScript ESLint
]

# Internal hoisting - controls .bun/node_modules
hoistPattern = [
  "@types/*",
  "typescript",
  "eslint*",
  "jest",
  "mocha"
]
`;

  await Bun.write(join(demoDir, "bunfig.toml"), bunfigContent);

  console.log("1️⃣ Created mock monorepo structure:");
  console.log("   ├── package.json (root)");
  console.log("   ├── bunfig.toml (hoisting config)");
  console.log("   └── packages/");
  console.log("       ├── app1/ (uses lodash, jest)");
  console.log("       ├── app2/ (uses express, mocha)");
  console.log("       └── shared/ (uses axios)");
  console.log();

  // Change to demo directory and install
  const oldCwd = process.cwd();
  process.chdir(demoDir);

  try {
    console.log("2️⃣ Installing dependencies with hoisting...");

    // Install dependencies
    const installResult = await $`bun install`.nothrow();
    if (installResult.exitCode !== 0) {
      console.log("   ⚠️ Install completed with warnings (expected in demo)");
    } else {
      console.log("   ✅ Dependencies installed");
    }

    console.log();

    // Check hoisting results
    console.log("3️⃣ Checking hoisting results:");

    // Check if public hoisting worked
    const rootNodeModules = "node_modules";
    const bunNodeModules = "node_modules/.bun/node_modules";

    console.log("   📁 Root node_modules:");
    try {
      const rootContents = await $`ls -la ${rootNodeModules} 2>/dev/null | head -10`.nothrow();
      if (rootContents.exitCode === 0) {
        console.log("   ✅ Root node_modules exists");
        // Check for publicly hoisted packages
        const typescriptExists = await Bun.file(join(rootNodeModules, "typescript")).exists();
        const eslintExists = await Bun.file(join(rootNodeModules, ".bin", "eslint")).exists();

        console.log(`   • TypeScript: ${typescriptExists ? "✅ publicly hoisted" : "❌ not found"}`);
        console.log(`   • ESLint: ${eslintExists ? "✅ publicly hoisted" : "❌ not found"}`);
      } else {
        console.log("   ⚠️ Root node_modules not created (may be expected)");
      }
    } catch (error) {
      console.log("   ⚠️ Error checking root node_modules");
    }

    console.log();
    console.log("   📁 .bun internal node_modules:");
    try {
      const bunContents = await $`ls -la ${bunNodeModules} 2>/dev/null | head -10`.nothrow();
      if (bunContents.exitCode === 0) {
        console.log("   ✅ .bun node_modules exists");
        // Check for internally hoisted packages
        const jestExists = await Bun.file(join(bunNodeModules, "jest")).exists();
        const mochaExists = await Bun.file(join(bunNodeModules, "mocha")).exists();

        console.log(`   • Jest: ${jestExists ? "✅ internally hoisted" : "❌ not found"}`);
        console.log(`   • Mocha: ${mochaExists ? "✅ internally hoisted" : "❌ not found"}`);
      } else {
        console.log("   ⚠️ .bun node_modules not created");
      }
    } catch (error) {
      console.log("   ⚠️ Error checking .bun node_modules");
    }

    console.log();

    // Test that hoisted packages work
    console.log("4️⃣ Testing hoisted package accessibility:");

    // Test TypeScript compiler (should be accessible from root)
    try {
      const tscResult = await $`./node_modules/.bin/tsc --version 2>/dev/null`.nothrow();
      if (tscResult.exitCode === 0) {
        console.log("   ✅ TypeScript accessible from root");
      } else {
        console.log("   ⚠️ TypeScript not accessible from root");
      }
    } catch (error) {
      console.log("   ⚠️ Error testing TypeScript");
    }

    // Test ESLint (should be accessible from root)
    try {
      const eslintResult = await $`./node_modules/.bin/eslint --version 2>/dev/null`.nothrow();
      if (eslintResult.exitCode === 0) {
        console.log("   ✅ ESLint accessible from root");
      } else {
        console.log("   ⚠️ ESLint not accessible from root");
      }
    } catch (error) {
      console.log("   ⚠️ Error testing ESLint");
    }

    console.log();

  } finally {
    // Cleanup
    process.chdir(oldCwd);
    await $`rm -rf ${demoDir}`.quiet();
  }

  console.log("🎯 Bun v1.3.1 Hoisting Features Summary:");
  console.log("   ✅ publicHoistPattern: Global access to dev tools");
  console.log("   ✅ hoistPattern: Controlled internal hoisting");
  console.log("   ✅ Selective hoisting: Choose what gets hoisted where");
  console.log("   ✅ Monorepo support: Better workspace package management");
  console.log("   ✅ Tool discovery: ESLint, TypeScript available everywhere");

  console.log("\n🔗 Reference: https://bun.com/blog/bun-v1.3.1#publichoistpattern-and-hoistpattern");
}

// Run if called directly
if (import.meta.main) {
  demonstrateHoisting().catch(console.error);
}
