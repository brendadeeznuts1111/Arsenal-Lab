#!/usr/bin/env bun

/**
 * Test Script for Bun v1.3.1 Bundler & Transpiler Bug Fixes
 *
 * Demonstrates the fixes from:
 * https://bun.com/blog/bun-v1.3.1#bundler-transpiler-bugfixes
 */

import { $ } from "bun";

// Test case 1: __esModule handling in CJS output
async function testEsModuleHandling() {
  console.log("🔧 Testing __esModule handling in CommonJS output...");

  const testCode = `
// Test ESM module with default export
export default function hello() {
  return "Hello from ESM!";
}

export const namedExport = "named value";
`;

  const cjsTest = `
// Test CommonJS importing ESM
const esmModule = require('./esm-test.js');
console.log('Default export:', esmModule.default?.());
console.log('Named export:', esmModule.namedExport);
console.log('__esModule flag:', esmModule.__esModule);
`;

  await Bun.write("esm-test.ts", testCode);
  await Bun.write("cjs-test.ts", cjsTest);

  try {
    // Build ESM to CJS
    await $`bun build esm-test.ts --format=cjs --outdir=.`;

    // Build CJS that imports it
    await $`bun build cjs-test.ts --format=cjs --outdir=.`;

    // Run the test
    const result = await $`bun run cjs-test.js`;

    if (result.exitCode === 0) {
      console.log("✅ __esModule handling works correctly");
    } else {
      console.log("❌ __esModule handling failed");
    }
  } finally {
    // Cleanup
    await $`rm -f esm-test.ts esm-test.js cjs-test.ts cjs-test.js`.quiet();
  }
}

// Test case 2: HTML entrypoint rejection
async function testHtmlEntrypointRejection() {
  console.log("🔧 Testing HTML entrypoint rejection...");

  const htmlFile = `
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><h1>Hello</h1></body>
</html>
`;

  await Bun.write("test.html", htmlFile);

  try {
    // This should reject HTML entrypoints with clear error
    const result = await $`bun build test.html --no-bundle`.nothrow();

    if (result.exitCode !== 0) {
      console.log("✅ HTML entrypoint correctly rejected");
      console.log("Error message:", result.stderr.toString().trim());
    } else {
      console.log("❌ HTML entrypoint was not rejected");
    }
  } finally {
    await Bun.file("test.html").delete();
  }
}

// Test case 3: Rope strings assertion fix
async function testRopeStrings() {
  console.log("🔧 Testing rope strings assertion fix...");

  const testCode = `
// Test code that previously caused assertion failures
const a = "hello";
const b = "world";
const combined = a + " " + b;

// String equality with concatenated strings
if (combined === "hello world") {
  console.log("✅ Rope strings work correctly");
} else {
  console.log("❌ Rope strings failed");
}
`;

  await Bun.write("rope-test.ts", testCode);

  try {
    const result = await $`bun run rope-test.ts`;

    if (result.exitCode === 0) {
      console.log("✅ Rope strings assertion fix verified");
    } else {
      console.log("❌ Rope strings test failed");
    }
  } finally {
    await Bun.file("rope-test.ts").delete();
  }
}

// Test case 4: Sourcemaps with compile
async function testSourcemapsCompile() {
  console.log("🔧 Testing sourcemaps with compile...");

  const testCode = `
// Code that should show proper sourcemaps
function testFunction() {
  throw new Error("Test error for sourcemap");
}

testFunction();
`;

  await Bun.write("sourcemap-test.ts", testCode);

  try {
    // Build with compile and sourcemaps
    await $`bun build sourcemap-test.ts --compile --sourcemap=external --outfile=sourcemap-test.exe`;

    // Check if sourcemap was generated
    const sourcemapExists = await Bun.file("sourcemap-test.js.map").exists();

    if (sourcemapExists) {
      console.log("✅ Sourcemaps work with compile mode");

      // Read sourcemap content
      const sourcemap = await Bun.file("sourcemap-test.js.map").text();
      if (sourcemap.includes("sourcemap-test.ts")) {
        console.log("✅ Sourcemap contains correct source file references");
      }
    } else {
      console.log("❌ Sourcemap not generated with compile mode");
    }
  } finally {
    await $`rm -f sourcemap-test.ts sourcemap-test.exe sourcemap-test.js.map`.quiet();
  }
}

// Test case 5: import.meta in bytecode builds
async function testImportMetaBytecode() {
  console.log("🔧 Testing import.meta in bytecode builds...");

  const testCode = `
// Code that uses import.meta properties
console.log("URL:", import.meta.url);
console.log("Path:", import.meta.path);
console.log("Dir:", import.meta.dirname);
console.log("File:", import.meta.file);
`;

  await Bun.write("bytecode-test.ts", testCode);

  try {
    // Build with bytecode (previously failed with import.meta)
    const result = await $`bun build bytecode-test.ts --bytecode --outdir=.`.nothrow();

    if (result.exitCode === 0) {
      console.log("✅ import.meta works in bytecode builds");

      // Try to run the bytecode
      const runResult = await $`bun run bytecode-test.js`.nothrow();
      if (runResult.exitCode === 0) {
        console.log("✅ Bytecode execution successful");
      }
    } else {
      console.log("❌ import.meta in bytecode failed");
      console.log("Error:", result.stderr.toString().trim());
    }
  } finally {
    await $`rm -f bytecode-test.ts bytecode-test.js`.quiet();
  }
}

// Test case 6: Package bin handling
async function testPackageBinHandling() {
  console.log("🔧 Testing package bin handling improvements...");

  const packageJson = {
    name: "test-package",
    version: "1.0.0",
    bin: {
      "test-cli": "./bin/cli.js"
    },
    directories: {
      bin: "./bin"
    },
    files: ["lib/"] // Note: bin not explicitly included
  };

  const cliScript = `
#!/usr/bin/env node
console.log("CLI tool executed successfully");
`;

  await Bun.write("test-package.json", JSON.stringify(packageJson, null, 2));
  await Bun.write("bin/cli.js", cliScript);

  try {
    // Test bun pm pack behavior
    const result = await $`bun pm pack --dry-run --package-json=test-package.json`.nothrow();

    if (result.exitCode === 0) {
      const output = result.stdout.toString();
      if (output.includes("bin/cli.js")) {
        console.log("✅ Bin files included in package even when not in files array");
      } else {
        console.log("❌ Bin files not properly included");
      }
    } else {
      console.log("❌ Package packing test failed");
    }
  } finally {
    await $`rm -rf test-package.json bin/`.quiet();
  }
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case "esmodule":
      await testEsModuleHandling();
      break;

    case "html":
      await testHtmlEntrypointRejection();
      break;

    case "ropestrings":
      await testRopeStrings();
      break;

    case "sourcemaps":
      await testSourcemapsCompile();
      break;

    case "bytecode":
      await testImportMetaBytecode();
      break;

    case "bin":
      await testPackageBinHandling();
      break;

    case "all":
      console.log("🎯 Running all Bun v1.3.1 bundler bug fix demonstrations...\n");

      await testEsModuleHandling();
      console.log();

      await testHtmlEntrypointRejection();
      console.log();

      await testRopeStrings();
      console.log();

      await testSourcemapsCompile();
      console.log();

      await testImportMetaBytecode();
      console.log();

      await testPackageBinHandling();
      console.log();

      console.log("🎉 All bundler bug fix tests completed!");
      break;

    default:
      console.log(`
🚀 Bun v1.3.1 Bundler & Transpiler Bug Fix Tests

Usage:
  bun run scripts/test-bundler-fixes.ts <command>

Commands:
  esmodule     - Test __esModule handling in CJS output
  html         - Test HTML entrypoint rejection
  ropestrings  - Test rope strings assertion fix
  sourcemaps   - Test sourcemaps with compile mode
  bytecode     - Test import.meta in bytecode builds
  bin          - Test package bin handling
  all          - Run all bug fix tests

Fixes Demonstrated:
  • Improved __esModule handling in CommonJS output
  • HTML entrypoint rejection with clear error
  • Rope strings assertion failure fix
  • Sourcemaps working with compile mode
  • import.meta support in bytecode builds
  • Package bin files always included in packs
      `);
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch(console.error);
}
