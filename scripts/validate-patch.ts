#!/usr/bin/env bun
import { $ } from "bun";
import { existsSync, readFileSync } from "node:fs";

interface PatchValidationResult {
  package: string;
  patchFile: string;
  exists: boolean;
  size: number;
  lines: number;
  hasDiff: boolean;
  hasHunks: boolean;
  lastModified: Date;
}

async function validateAllPatches(): Promise<PatchValidationResult[]> {
  const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
  const patchedDeps = pkg.patchedDependencies || {};

  const results: PatchValidationResult[] = [];

  for (const [pkgName, patchPath] of Object.entries(patchedDeps)) {
    const exists = existsSync(patchPath as string);
    let size = 0, lines = 0, hasDiff = false, hasHunks = false, lastModified = new Date(0);

    if (exists) {
      const content = readFileSync(patchPath as string, "utf-8");
      size = content.length;
      lines = content.split("\n").length;
      hasDiff = content.includes("diff --git");
      hasHunks = content.includes("@@");
      lastModified = new Date((await Bun.file(patchPath as string).stat()).mtime);
    }

    results.push({
      package: pkgName,
      patchFile: patchPath as string,
      exists,
      size,
      lines,
      hasDiff,
      hasHunks,
      lastModified
    });
  }

  return results;
}

async function runAudit() {
  console.log("🔍 Running comprehensive patch audit...\n");

  const results = await validateAllPatches();

  if (results.length === 0) {
    console.log("ℹ️  No patched dependencies found");
    return;
  }

  let validCount = 0;
  let issues: string[] = [];

  console.log("📊 Patch Audit Results:\n");

  for (const result of results) {
    console.log(`📦 ${result.package}`);

    if (!result.exists) {
      console.log(`   ❌ MISSING: ${result.patchFile}`);
      issues.push(`${result.package}: missing patch file`);
      continue;
    }

    console.log(`   ✅ Found: ${result.patchFile}`);
    console.log(`   📏 Size: ${result.size} bytes, ${result.lines} lines`);
    console.log(`   📅 Modified: ${result.lastModified.toLocaleDateString()}`);

    if (!result.hasDiff) {
      console.log(`   ⚠️  WARNING: No diff header found`);
      issues.push(`${result.package}: invalid patch format (no diff header)`);
    } else {
      console.log(`   ✅ Valid diff format`);
    }

    if (!result.hasHunks) {
      console.log(`   ⚠️  WARNING: No hunks found`);
      issues.push(`${result.package}: invalid patch format (no hunks)`);
    } else {
      console.log(`   ✅ Contains hunks`);
    }

    // Check if patch is still applicable
    try {
      const testResult = await $`patch --dry-run -p1 < ${result.patchFile}`.nothrow();
      if (testResult.exitCode === 0) {
        console.log(`   ✅ Patch applies cleanly`);
        validCount++;
      } else {
        console.log(`   ❌ Patch conflicts detected`);
        issues.push(`${result.package}: patch conflicts`);
      }
    } catch (error) {
      console.log(`   ⚠️  Could not test patch application`);
      issues.push(`${result.package}: cannot test patch application`);
    }

    console.log("");
  }

  console.log("📈 Summary:");
  console.log(`   Total patches: ${results.length}`);
  console.log(`   Valid patches: ${validCount}`);
  console.log(`   Issues found: ${issues.length}`);

  if (issues.length > 0) {
    console.log("\n🚨 Issues to resolve:");
    issues.forEach(issue => console.log(`   • ${issue}`));
    process.exit(1);
  } else {
    console.log("\n✅ All patches passed audit!");
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--audit-all")) {
    await runAudit();
  } else {
    console.log("Usage: bun run validate-patch.ts --audit-all");
    console.log("Runs comprehensive validation of all patched dependencies");
  }
}

if (import.meta.main) await main();
