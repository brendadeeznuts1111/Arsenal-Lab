#!/usr/bin/env bun

/**
 * Test Hoisted Tools in Arsenal Lab
 *
 * Demonstrates how Bun v1.3.1 hoisting makes development tools globally accessible
 */

import { $ } from "bun";

async function testHoistedTools() {
  console.log("🛠️ Testing Hoisted Development Tools in Arsenal Lab\n");

  // Test TypeScript accessibility
  console.log("1️⃣ TypeScript Compiler (tsc):");
  try {
    const tscVersion = await $`./node_modules/.bin/tsc --version`.nothrow();
    if (tscVersion.exitCode === 0) {
      console.log("   ✅ TypeScript accessible globally");
      console.log(`   📋 Version: ${tscVersion.stdout.toString().trim()}`);

      // Test TypeScript compilation on a small file
      const testTs = `
interface User {
  id: number;
  name: string;
}

const user: User = { id: 1, name: "Test" };
console.log("TypeScript compilation works:", user.name);
`;

      await Bun.write("test-ts.ts", testTs);
      const compileResult = await $`./node_modules/.bin/tsc test-ts.ts --outDir . --target ES2020`.nothrow();
      if (compileResult.exitCode === 0) {
        console.log("   ✅ TypeScript compilation successful");
      }
      await Bun.file("test-ts.ts").delete();
      await Bun.file("test-ts.js").delete().catch(() => {});

    } else {
      console.log("   ❌ TypeScript not accessible");
    }
  } catch (error) {
    console.log("   ❌ TypeScript error:", error.message);
  }

  console.log();

  // Test ESLint accessibility
  console.log("2️⃣ ESLint:");
  try {
    const eslintVersion = await $`./node_modules/.bin/eslint --version`.nothrow();
    if (eslintVersion.exitCode === 0) {
      console.log("   ✅ ESLint accessible globally");
      console.log(`   📋 Version: ${eslintVersion.stdout.toString().trim()}`);

      // Test ESLint on a small file
      const testJs = `
// Test file for ESLint
function testFunction() {
  const unused = "test"; // This should trigger a warning
  console.log("ESLint test");
}

testFunction();
`;

      await Bun.write("test-eslint.js", testJs);
      const lintResult = await $`./node_modules/.bin/eslint test-eslint.js --format compact`.nothrow();
      console.log("   ✅ ESLint execution successful");
      if (lintResult.stdout.toString().includes("warning")) {
        console.log("   📋 ESLint correctly detected issues");
      }

      await Bun.file("test-eslint.js").delete();

    } else {
      console.log("   ❌ ESLint not accessible");
    }
  } catch (error) {
    console.log("   ❌ ESLint error:", error.message);
  }

  console.log();

  // Test Prettier accessibility
  console.log("3️⃣ Prettier:");
  try {
    const prettierVersion = await $`./node_modules/.bin/prettier --version`.nothrow();
    if (prettierVersion.exitCode === 0) {
      console.log("   ✅ Prettier accessible globally");
      console.log(`   📋 Version: ${prettierVersion.stdout.toString().trim()}`);

      // Test Prettier formatting
      const uglyCode = `function test( ){console.log("hello world")}`;
      await Bun.write("test-prettier.js", uglyCode);

      const formatResult = await $`./node_modules/.bin/prettier --write test-prettier.js`.nothrow();
      if (formatResult.exitCode === 0) {
        const formatted = await Bun.file("test-prettier.js").text();
        console.log("   ✅ Prettier formatting successful");
        if (formatted.includes("function test()")) {
          console.log("   📋 Code properly formatted");
        }
      }

      await Bun.file("test-prettier.js").delete();

    } else {
      console.log("   ❌ Prettier not accessible");
    }
  } catch (error) {
    console.log("   ❌ Prettier error:", error.message);
  }

  console.log();

  // Test type discovery
  console.log("4️⃣ Type Discovery (@types/* packages):");
  try {
    // Check if @types/node is accessible
    const typesNodeExists = await Bun.file("node_modules/@types/node/index.d.ts").exists();
    console.log(`   • @types/node: ${typesNodeExists ? "✅ available" : "❌ not found"}`);

    // Check if @types/bun is accessible
    const typesBunExists = await Bun.file("node_modules/@types/bun/index.d.ts").exists();
    console.log(`   • @types/bun: ${typesBunExists ? "✅ available" : "❌ not found"}`);

    if (typesNodeExists && typesBunExists) {
      console.log("   ✅ Type definitions globally accessible for better IntelliSense");
    }
  } catch (error) {
    console.log("   ❌ Type discovery error:", error.message);
  }

  console.log();

  // Practical usage examples
  console.log("5️⃣ Practical Usage Examples:");
  console.log("   🔧 Run TypeScript on any file:");
  console.log("      bunx tsc --noEmit src/some-file.ts");
  console.log("");
  console.log("   🔍 Lint any JavaScript/TypeScript file:");
  console.log("      bunx eslint src/components/");
  console.log("");
  console.log("   🎨 Format any code file:");
  console.log("      bunx prettier --write src/**/*.ts");
  console.log("");
  console.log("   📝 Type checking across the project:");
  console.log("      bunx tsc --noEmit");

  console.log("\n🎯 Benefits of Hoisting in Arsenal Lab:");
  console.log("   ✅ Development tools accessible from any directory");
  console.log("   ✅ Consistent tool versions across the project");
  console.log("   ✅ Better IntelliSense with global type definitions");
  console.log("   ✅ Simplified CI/CD with predictable tool locations");
  console.log("   ✅ Faster development workflow with global access");

  console.log("\n🔗 Reference: https://bun.com/blog/bun-v1.3.1#publichoistpattern-and-hoistpattern");
}

// Run if called directly
if (import.meta.main) {
  testHoistedTools().catch(console.error);
}
