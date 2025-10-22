#!/usr/bin/env bun

/**
 * Analyze Current Hoisting Configuration in Arsenal Lab
 *
 * Shows how Bun v1.3.1 hoisting patterns work in the current project
 */

import { $ } from "bun";
import { join } from "path";

async function analyzeCurrentHoisting() {
  console.log("🔍 Analyzing Current Hoisting Configuration in Arsenal Lab\n");

  // Read current bunfig.toml
  console.log("1️⃣ Current bunfig.toml hoisting configuration:");
  try {
    const bunfigContent = await Bun.file("bunfig.toml").text();
    const installSection = bunfigContent.match(/\[install\][\s\S]*?(?=\[|$)/)?.[0];

    if (installSection) {
      console.log("   📄 [install] section:");
      console.log(installSection.trim());
    } else {
      console.log("   ⚠️ No [install] section found");
    }
  } catch (error) {
    console.log("   ❌ Error reading bunfig.toml:", error.message);
  }

  console.log();

  // Check current node_modules structure
  console.log("2️⃣ Analyzing current node_modules structure:");

  const rootNodeModules = "node_modules";
  const bunNodeModules = "node_modules/.bun/node_modules";

  // Check root node_modules
  try {
    const rootExists = await Bun.file(join(rootNodeModules, "package.json")).exists().catch(() => false);
    if (rootExists) {
      console.log("   📁 Root node_modules: ✅ exists");

      // Check for publicly hoisted packages
      const checks = [
        ["typescript", "TypeScript compiler"],
        ["eslint", "ESLint"],
        ["@types/node", "Node.js types"],
        ["@types/bun", "Bun types"],
        ["prettier", "Prettier"],
      ];

      for (const [pkg, description] of checks) {
        const exists = await Bun.file(join(rootNodeModules, pkg)).exists().catch(() => false);
        console.log(`   • ${description}: ${exists ? "✅ publicly hoisted" : "❌ not hoisted"}`);
      }
    } else {
      console.log("   📁 Root node_modules: ❌ not created");
    }
  } catch (error) {
    console.log("   ❌ Error checking root node_modules:", error.message);
  }

  console.log();

  // Check .bun internal node_modules
  try {
    const bunExists = await Bun.file(join(bunNodeModules, "package.json")).exists().catch(() => false);
    if (bunExists) {
      console.log("   📁 .bun node_modules: ✅ exists");

      // Check for internally hoisted packages
      const internalChecks = [
        ["@types/node", "Node.js types"],
        ["typescript", "TypeScript"],
        ["eslint", "ESLint"],
        ["prettier", "Prettier"],
        ["happy-dom", "Happy DOM"],
      ];

      for (const [pkg, description] of internalChecks) {
        const exists = await Bun.file(join(bunNodeModules, pkg)).exists().catch(() => false);
        console.log(`   • ${description}: ${exists ? "✅ internally hoisted" : "❌ not hoisted"}`);
      }
    } else {
      console.log("   📁 .bun node_modules: ❌ not created");
    }
  } catch (error) {
    console.log("   ❌ Error checking .bun node_modules:", error.message);
  }

  console.log();

  // Test tool accessibility
  console.log("3️⃣ Testing tool accessibility:");

  const tools = [
    ["tsc", "TypeScript compiler", "./node_modules/.bin/tsc"],
    ["eslint", "ESLint", "./node_modules/.bin/eslint"],
    ["prettier", "Prettier", "./node_modules/.bin/prettier"],
  ];

  for (const [cmd, description, path] of tools) {
    try {
      const result = await $`${path} --version 2>/dev/null`.nothrow();
      if (result.exitCode === 0) {
        console.log(`   ✅ ${description}: accessible`);
      } else {
        console.log(`   ❌ ${description}: not accessible`);
      }
    } catch (error) {
      console.log(`   ⚠️ ${description}: error testing (${error.message})`);
    }
  }

  console.log();

  // Analyze package.json for hoisting candidates
  console.log("4️⃣ Analyzing package.json for hoisting opportunities:");

  try {
    const pkg = await Bun.file("package.json").json();

    const devDeps = Object.keys(pkg.devDependencies || {});
    const deps = Object.keys(pkg.dependencies || {});

    console.log("   📦 DevDependencies that could benefit from hoisting:");
    const hoistableDevDeps = devDeps.filter(dep =>
      dep.includes("eslint") ||
      dep.includes("typescript") ||
      dep.includes("@types/") ||
      dep.includes("prettier") ||
      dep.includes("jest") ||
      dep.includes("vitest")
    );

    if (hoistableDevDeps.length > 0) {
      hoistableDevDeps.forEach(dep => console.log(`   • ${dep}`));
    } else {
      console.log("   • None found");
    }

    console.log("   📦 Runtime dependencies:");
    if (deps.length > 0) {
      deps.slice(0, 5).forEach(dep => console.log(`   • ${dep}`));
      if (deps.length > 5) {
        console.log(`   • ... and ${deps.length - 5} more`);
      }
    } else {
      console.log("   • None found");
    }

  } catch (error) {
    console.log("   ❌ Error analyzing package.json:", error.message);
  }

  console.log();

  // Recommendations
  console.log("5️⃣ Hoisting Recommendations for Arsenal Lab:");

  console.log("   🎯 Current Configuration Benefits:");
  console.log("   • TypeScript globally accessible for type checking");
  console.log("   • ESLint available across all packages");
  console.log("   • @types/* packages hoisted for better IntelliSense");
  console.log("   • Happy DOM available for testing");

  console.log("\n   💡 Potential Improvements:");
  console.log("   • Add 'vitest' to hoistPattern if using Vitest");
  console.log("   • Consider hoisting build tools like 'rollup', 'webpack'");
  console.log("   • Add 'nodemon' for development if used");
  console.log("   • Include 'concurrently' for complex scripts");

  console.log("\n   🔧 Usage Examples:");
  console.log("   # TypeScript available globally");
  console.log("   bunx tsc --version");
  console.log("   ");
  console.log("   # ESLint accessible everywhere");
  console.log("   bunx eslint src/");
  console.log("   ");
  console.log("   # Types available for better DX");
  console.log("   # @types/node, @types/bun auto-discovered");

  console.log("\n🔗 Reference: https://bun.com/blog/bun-v1.3.1#publichoistpattern-and-hoistpattern");
}

// Run if called directly
if (import.meta.main) {
  analyzeCurrentHoisting().catch(console.error);
}
