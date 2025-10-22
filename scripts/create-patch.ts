#!/usr/bin/env bun
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "path";
import { $ } from "bun";

interface PatchCreationOptions {
  package: string;
  version?: string;
  category?: "security" | "features";
  description?: string;
}

async function createPatch(options: PatchCreationOptions) {
  const { package: pkg, version, category = "features", description } = options;

  console.log(`📝 Creating patch for ${pkg}${version ? `@${version}` : ""}...`);

  // Determine version if not provided
  let actualVersion = version;
  if (!actualVersion) {
    try {
      const npmInfo = await $`npm view ${pkg} version`.text();
      actualVersion = npmInfo.trim();
      console.log(`📦 Detected version: ${actualVersion}`);
    } catch (error) {
      console.log(`⚠️  Could not detect version for ${pkg}, using 'latest'`);
      actualVersion = "latest";
    }
  }

  // Create patch directory structure
  const patchDir = join("patches", category);
  if (!existsSync(patchDir)) {
    mkdirSync(patchDir, { recursive: true });
  }

  // Generate patch filename
  const patchFile = join(patchDir, `${pkg}@${actualVersion}.patch`);

  // Create initial patch content
  const patchContent = `# Patch for ${pkg}@${actualVersion}
# Category: ${category}
# Created: ${new Date().toISOString()}
${description ? `# Description: ${description}` : ""}
#
# To apply this patch:
# 1. Run: bun patch ${pkg}
# 2. Edit files in node_modules/${pkg}/
# 3. Run: bun patch --commit ${pkg}

# This is a template patch file.
# Replace this content with actual diff output after making changes.
`.trim();

  writeFileSync(patchFile, patchContent);
  console.log(`✅ Created patch template: ${patchFile}`);

  // Update package.json if not already present
  const pkgJson = JSON.parse(readFileSync("package.json", "utf-8"));
  const patchedDeps = pkgJson.patchedDependencies || {};

  const pkgKey = `${pkg}@${actualVersion}`;
  if (!patchedDeps[pkgKey]) {
    patchedDeps[pkgKey] = patchFile.replace(/\\/g, "/"); // Normalize path separators
    pkgJson.patchedDependencies = patchedDeps;

    writeFileSync("package.json", JSON.stringify(pkgJson, null, 2));
    console.log(`✅ Added to package.json patchedDependencies`);
  } else {
    console.log(`ℹ️  Already exists in package.json patchedDependencies`);
  }

  console.log(`\n🚀 Next steps:`);
  console.log(`1. Run: bun patch ${pkg}`);
  console.log(`2. Edit files in node_modules/${pkg}/`);
  console.log(`3. Replace template content in ${patchFile} with actual diff`);
  console.log(`4. Run: bun patch --commit ${pkg}`);
  console.log(`5. Run: bun run patch:audit`);
}

async function listTemplates() {
  console.log("📋 Available patch categories:");
  console.log("  security/  - Security-related patches");
  console.log("  features/  - Feature enhancement patches");
  console.log("");
  console.log("📝 Usage examples:");
  console.log("  bun run patch:create --package react --category security");
  console.log("  bun run patch:create --package lodash --category features --description 'Performance optimization'");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    console.log("🔧 Patch Creation Tool");
    console.log("");
    console.log("Usage:");
    console.log("  bun run patch:create --package <name> [--version <ver>] [--category <cat>] [--description <desc>]");
    console.log("");
    console.log("Options:");
    console.log("  --package     Package name (required)");
    console.log("  --version     Package version (auto-detected if not provided)");
    console.log("  --category    Patch category: security | features (default: features)");
    console.log("  --description Brief description of the patch");
    console.log("  --help        Show this help");
    console.log("");
    await listTemplates();
    return;
  }

  // Parse arguments
  const packageArg = args.find((arg, i) => arg === "--package" && args[i + 1]);
  const versionArg = args.find((arg, i) => arg === "--version" && args[i + 1]);
  const categoryArg = args.find((arg, i) => arg === "--category" && args[i + 1]);
  const descArg = args.find((arg, i) => arg === "--description" && args[i + 1]);

  if (!packageArg) {
    console.error("❌ --package is required");
    process.exit(1);
  }

  const packageName = args[args.indexOf("--package") + 1];
  const version = versionArg ? args[args.indexOf("--version") + 1] : undefined;
  const category = (categoryArg ? args[args.indexOf("--category") + 1] : "features") as "security" | "features";
  const description = descArg ? args[args.indexOf("--description") + 1] : undefined;

  await createPatch({
    package: packageName,
    version,
    category,
    description
  });
}

if (import.meta.main) await main();
