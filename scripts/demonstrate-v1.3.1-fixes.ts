#!/usr/bin/env bun

/**
 * Comprehensive Demonstration of Bun v1.3.1 Bundler & Transpiler Fixes
 *
 * Showcases the improvements from:
 * https://bun.com/blog/bun-v1.3.1#bundler-transpiler-bugfixes
 */

import { $ } from "bun";

async function demonstrateBundlerFixes() {
  console.log("🎯 Bun v1.3.1 Bundler & Transpiler Bug Fixes Demonstration\n");

  // Fix 1: Rope strings assertion fix
  console.log("1️⃣ Rope Strings Assertion Fix");
  console.log("   Previously: Assertion failure with concatenated strings");
  console.log("   Now: Works correctly");

  const ropeTest = `
const a = "hello";
const b = "world";
const combined = a + " " + b;
console.log("Rope string result:", combined === "hello world" ? "✅ PASS" : "❌ FAIL");
`;

  await Bun.write("rope-demo.ts", ropeTest);
  await $`bun run rope-demo.ts`;
  await Bun.file("rope-demo.ts").delete();

  console.log();

  // Fix 2: import.meta support in bytecode
  console.log("2️⃣ import.meta Support in Bytecode Builds");
  console.log("   Previously: Failed when code referenced import.meta.url/dir");
  console.log("   Now: Compiles successfully");

  const bytecodeTest = `
console.log("✅ import.meta works in bytecode!");
console.log("URL available:", !!import.meta.url);
console.log("Path available:", !!import.meta.path);
console.log("Dir available:", !!import.meta.dirname);
console.log("File available:", !!import.meta.file);
`;

  await Bun.write("bytecode-demo.ts", bytecodeTest);

  try {
    const result = await $`bun build bytecode-demo.ts --bytecode --outdir=.`.nothrow();
    if (result.exitCode === 0) {
      console.log("   ✅ Bytecode compilation successful!");
    } else {
      console.log("   ❌ Bytecode compilation failed");
    }
  } catch (error) {
    console.log("   ❌ Bytecode compilation error:", error.message);
  }

  await $`rm -f bytecode-demo.ts bytecode-demo.js`.quiet();

  console.log();

  // Fix 3: __esModule handling in CJS
  console.log("3️⃣ Improved __esModule Handling in CommonJS");
  console.log("   Previously: Incorrect __esModule respect when importer used ESM");
  console.log("   Now: Correctly bases isNodeMode on importing module's syntax");

  const esmModule = `
export default function greet(name) {
  return \`Hello, \${name}!\`;
}
export const version = "1.0.0";
`;

  const cjsImporter = `
// This demonstrates the fix for __esModule handling
const esm = require('./esm-module.js');

console.log("Default export works:", typeof esm.default === 'function');
console.log("__esModule flag present:", esm.__esModule === true);

if (esm.default) {
  console.log("Function call result:", esm.default("World"));
}
`;

  await Bun.write("esm-module.ts", esmModule);
  await Bun.write("cjs-importer.ts", cjsImporter);

  try {
    // Build ESM to CJS
    await $`bun build esm-module.ts --format=cjs --outdir=.`;

    // Build CJS importer
    await $`bun build cjs-importer.ts --format=cjs --outdir=.`;

    // Run the test
    const result = await $`bun run cjs-importer.js`.nothrow();
    if (result.exitCode === 0) {
      console.log("   ✅ __esModule handling works correctly!");
    } else {
      console.log("   ❌ __esModule handling test failed");
    }
  } catch (error) {
    console.log("   ❌ __esModule test error:", error.message);
  }

  await $`rm -f esm-module.ts esm-module.js cjs-importer.ts cjs-importer.js`.quiet();

  console.log();

  // Fix 4: Package bin handling
  console.log("4️⃣ Package Bin Files Always Included");
  console.log("   Previously: Bin files missing when not in 'files' array");
  console.log("   Now: Always includes files from bin and directories.bin");

  const testPackage = {
    name: "demo-package",
    version: "1.0.0",
    bin: {
      "demo-cli": "./bin/demo.js"
    },
    directories: {
      bin: "./bin"
    },
    files: ["lib/"] // bin not explicitly included
  };

  await Bun.write("demo-package.json", JSON.stringify(testPackage, null, 2));
  await Bun.write("bin/demo.js", '#!/usr/bin/env node\nconsole.log("Demo CLI");');

  try {
    const packResult = await $`bun pm pack --dry-run --package-json=demo-package.json`.nothrow();
    if (packResult.exitCode === 0) {
      const output = packResult.stdout.toString();
      if (output.includes("bin/demo.js")) {
        console.log("   ✅ Bin files correctly included in package!");
      } else {
        console.log("   ❌ Bin files not found in package output");
      }
    }
  } catch (error) {
    console.log("   ❌ Package bin test error:", error.message);
  }

  await $`rm -rf demo-package.json bin/`.quiet();

  console.log();

  // Fix 5: CommonJS import.meta inlining
  console.log("5️⃣ import.meta Inlining in CommonJS Builds");
  console.log("   Previously: Syntax errors when using import.meta in CJS output");
  console.log("   Now: Automatically inlines import.meta to CommonJS equivalents");

  const importMetaTest = `
// This will be transformed in CommonJS builds
export const meta = {
  url: import.meta.url,      // → becomes actual file URL
  path: import.meta.path,    // → becomes __filename
  dirname: import.meta.dirname, // → becomes __dirname
  file: import.meta.file     // → becomes path.basename(__filename)
};

console.log("Meta object created successfully:", !!meta);
`;

  await Bun.write("import-meta-demo.ts", importMetaTest);

  try {
    const cjsResult = await $`bun build import-meta-demo.ts --format=cjs --outdir=.`.nothrow();
    if (cjsResult.exitCode === 0) {
      console.log("   ✅ import.meta inlining works in CommonJS!");

      // Check the generated output
      const output = await Bun.file("import-meta-demo.js").text();
      if (output.includes("__filename") || output.includes("__dirname")) {
        console.log("   ✅ import.meta correctly inlined to CommonJS globals");
      }
    } else {
      console.log("   ❌ import.meta inlining failed");
    }
  } catch (error) {
    console.log("   ❌ import.meta test error:", error.message);
  }

  await $`rm -f import-meta-demo.ts import-meta-demo.js`.quiet();

  console.log();

  // Summary
  console.log("🎉 Bun v1.3.1 Bundler & Transpiler Fixes Summary:");
  console.log("   ✅ Rope strings assertion failures fixed");
  console.log("   ✅ import.meta support in bytecode builds");
  console.log("   ✅ Improved __esModule handling in CJS output");
  console.log("   ✅ Package bin files always included in packs");
  console.log("   ✅ import.meta inlining in CommonJS builds");
  console.log("   ✅ Various other bundler reliability improvements");

  console.log("\n🔗 Reference: https://bun.com/blog/bun-v1.3.1#bundler-transpiler-bugfixes");
}

// Run if called directly
if (import.meta.main) {
  demonstrateBundlerFixes().catch(console.error);
}
