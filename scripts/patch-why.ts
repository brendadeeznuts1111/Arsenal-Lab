#!/usr/bin/env bun
import { $ } from "bun";
import { existsSync, readFileSync } from "node:fs";

interface PatchMetadata {
  reason: string;
  date: string;
  pr?: string;
  invariants: string[];
  description?: string;
}

async function getPatchMetadata(pkg: string): Promise<PatchMetadata | null> {
  const pkgJson = JSON.parse(readFileSync("package.json", "utf-8"));
  const patchedDeps = pkgJson.patchedDependencies || {};

  // Find the exact package match
  const pkgKey = Object.keys(patchedDeps).find(key => key.startsWith(`${pkg}@`));
  if (!pkgKey) {
    console.error(`❌ Package ${pkg} is not patched`);
    return null;
  }

  // Check for metadata file
  const patchPath = patchedDeps[pkgKey];
  const metadataPath = patchPath.replace('.patch', '.md');

  if (existsSync(metadataPath)) {
    try {
      const content = readFileSync(metadataPath, "utf-8");
      return parseMetadataFile(content);
    } catch (error) {
      console.warn(`⚠️ Could not parse metadata file: ${error.message}`);
    }
  }

  // Fallback: extract from patch file header
  if (existsSync(patchPath)) {
    const patchContent = readFileSync(patchPath, "utf-8");
    return extractMetadataFromPatch(patchContent, pkgKey);
  }

  return null;
}

function parseMetadataFile(content: string): PatchMetadata {
  const lines = content.split('\n');
  const metadata: any = {};

  for (const line of lines) {
    if (line.startsWith('Reason:')) {
      metadata.reason = line.replace('Reason:', '').trim();
    } else if (line.startsWith('Date:')) {
      metadata.date = line.replace('Date:', '').trim();
    } else if (line.startsWith('PR:')) {
      metadata.pr = line.replace('PR:', '').trim();
    } else if (line.startsWith('Description:')) {
      metadata.description = line.replace('Description:', '').trim();
    } else if (line.startsWith('Invariants:')) {
      metadata.invariants = line.replace('Invariants:', '').trim().split(',').map(s => s.trim());
    }
  }

  return metadata as PatchMetadata;
}

function extractMetadataFromPatch(patchContent: string, pkgKey: string): PatchMetadata {
  const lines = patchContent.split('\n');
  const metadata: any = {
    reason: "security", // default assumption
    date: "unknown",
    invariants: ["unknown"]
  };

  // Try to extract from header comments
  for (const line of lines.slice(0, 10)) {
    if (line.includes('# Category: security')) {
      metadata.reason = "security";
    } else if (line.includes('# Category: features')) {
      metadata.reason = "feature enhancement";
    } else if (line.includes('# Created:')) {
      const dateMatch = line.match(/Created:\s*(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        metadata.date = dateMatch[1];
      }
    } else if (line.includes('# Description:')) {
      metadata.description = line.replace('# Description:', '').trim();
    }
  }

  return metadata as PatchMetadata;
}

async function runInvariantCheck(pkg: string): Promise<string[]> {
  try {
    // Run the invariant validation and capture output
    const result = await $`bun run invariant:validate 2>&1`.nothrow();

    if (result.exitCode === 0) {
      return ["✅ All invariants passed"];
    } else {
      // Parse violations from output
      const lines = result.stderr.split('\n');
      const violations: string[] = [];

      for (const line of lines) {
        if (line.includes('CRITICAL') || line.includes('HIGH')) {
          violations.push(`❌ ${line.trim()}`);
        }
      }

      return violations.length > 0 ? violations : ["⚠️ Validation completed with warnings"];
    }
  } catch (error) {
    return [`⚠️ Could not run invariant check: ${error.message}`];
  }
}

async function displayPatchInfo(pkg: string) {
  console.log(`🔍 Analyzing patch for ${pkg}...\n`);

  const metadata = await getPatchMetadata(pkg);
  if (!metadata) {
    console.log(`❌ Could not find patch information for ${pkg}`);
    return;
  }

  console.log(`${pkg} was patched:`);
  console.log(`- Reason: ${metadata.reason}`);
  console.log(`- Date: ${metadata.date}`);
  if (metadata.pr) console.log(`- PR: ${metadata.pr}`);
  if (metadata.description) console.log(`- Description: ${metadata.description}`);

  const invariantStatus = await runInvariantCheck(pkg);
  console.log(`- Invariants: ${metadata.invariants.join(', ')}`);
  console.log(`- Status: ${invariantStatus.join('\n          ')}`);

  // Additional context
  console.log(`\n💡 To see the actual patch:`);
  console.log(`   cat patches/${pkg}@*.patch`);

  console.log(`\n🔧 To update this patch:`);
  console.log(`   bun patch ${pkg}`);
  console.log(`   # edit files in node_modules/${pkg}/`);
  console.log(`   bun patch --commit ${pkg}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("🔍 Patch Why Tool - Understand why packages are patched");
    console.log("");
    console.log("Usage: bun run patch-why <package-name>");
    console.log("");
    console.log("Examples:");
    console.log("  bun patch:why react");
    console.log("  bun patch:why lodash");
    console.log("  bun patch:why axios");
    console.log("");
    console.log("The tool will show:");
    console.log("  • Why the package was patched");
    console.log("  • When it was patched");
    console.log("  • Which invariants it satisfies");
    console.log("  • Current validation status");
    return;
  }

  const pkg = args[0];
  await displayPatchInfo(pkg);
}

if (import.meta.main) await main();
