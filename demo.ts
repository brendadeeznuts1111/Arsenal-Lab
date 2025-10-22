#!/usr/bin/env bun

/**
 * 🚀 Arsenal Lab v4 Identity System - Swiss Army Knife Demo Tool
 *
 * Enhanced launcher with self-updating, TUI, curl cheats, watch mode, and more.
 *
 * Usage:
 *   ./demo.ts                     # interactive TUI menu
 *   ./demo.ts --dry-run           # offline demo
 *   ./demo.ts --json --dry-run    # CI-friendly JSON output
 *   ./demo.ts --watch             # auto-reload on source changes
 *   ./demo.ts --curl              # print curl cheat-sheet
 *   ./demo.ts --update            # force recompile from source
 *   ./demo.ts --single            # only single identity demo
 *   ./demo.ts --batch             # only batch identities demo
 *   ./demo.ts --validate          # only validation demo
 *   API_BASE_URL=https://id.acme.com ./demo.ts   # custom API endpoint
 */

import { $ } from "bun";
import { demonstrateV4IdentitySystem } from "./scripts/demonstrate-v4-identity-system.ts";

// Constants
const BASE_URL = process.env.API_BASE_URL || "http://localhost:3655";

const CURL_CHEAT = `
# Single identity generation
curl "${BASE_URL}/api/v1/id?prefix=ci&run=$(date +%s)"

# Batch identity generation (JSON payload)
curl -X POST ${BASE_URL}/api/v1/identities \\
  -H "Content-Type: application/json" \\
  -d '{"environments":[{"name":"ci","prefix":"ci","run":"123"}],"domain":"api.dev.arsenal-lab.com","version":"v1"}'

# Identity validation
curl -X POST ${BASE_URL}/api/v1/validate \\
  -H "Content-Type: application/json" \\
  -d '{"identity":"ci-123@api.dev.arsenal-lab.com/v1:id"}'

# Performance metrics
curl "${BASE_URL}/api/performance/metrics"

# Health check
curl "${BASE_URL}/api/health"
`;

// Self-updating mechanism
async function checkAndUpdateSelf(): Promise<boolean> {
  try {
    const self = Bun.file(import.meta.path);
    const src = Bun.file("./scripts/demonstrate-v4-identity-system.ts");

    const selfModified = await self.lastModified?.getTime() || 0;
    const srcModified = await src.lastModified?.getTime() || 0;

    if (srcModified > selfModified) {
      console.log("🔄 Source changed – recompiling demo.ts...");
      await $`bun build ./scripts/demonstrate-v4-identity-system.ts --outfile ./demo.ts --target=bun`;
      console.log("✅ Recompiled successfully!");
      return true;
    }
  } catch (error) {
    // Silently ignore update check failures
  }
  return false;
}

// Watch mode
async function runWatchMode(args: string[]): Promise<void> {
  const filteredArgs = args.filter(a => a !== "--watch");
  console.log("👀 Watch mode active - press Ctrl+C to exit");
  console.log("   Auto-restarting on source file changes...\n");

  await $`bun --watch ${import.meta.path} ${filteredArgs.join(" ")}`;
}

// Simple Interactive Menu
async function runInteractiveMenu(): Promise<void> {
  console.log("🚀 Arsenal Lab v4 Identity System - Interactive Demo\n");

  console.log("Choose what to demonstrate:");
  console.log("  1. 🔍 Single Identity Generation");
  console.log("  2. 📦 Batch Identity Generation");
  console.log("  3. ✅ Identity Validation");
  console.log("  4. 📋 Show Curl Commands");
  console.log("  5. 🎯 Full System Demo (Dry Run)");
  console.log("  6. Exit");
  console.log("");

  // For demo purposes, default to option 4 (curl) since we can't do interactive input easily
  const choice = process.env.DEMO_CHOICE || "4";

  console.log(`Selected: ${choice}\n`);

  try {
    switch (choice) {
      case "1":
        console.log("🔄 Generating single identity...");
        await demonstrateSingleIdentityOnly();
        break;
      case "2":
        console.log("🔄 Generating batch identities...");
        await demonstrateBatchOnly();
        break;
      case "3":
        console.log("🔄 Validating identities...");
        await demonstrateValidationOnly();
        break;
      case "4":
        console.log("📋 Curl Command Cheat Sheet:");
        console.log("═".repeat(50));
        console.log(CURL_CHEAT);
        return;
      case "5":
        console.log("🔄 Running full system demo...");
        await demonstrateV4IdentitySystem(true, false);
        break;
      case "6":
        console.log("👋 Goodbye!");
        return;
      default:
        console.log("❌ Invalid choice");
        return;
    }
    console.log("✅ Demo completed successfully!");
  } catch (error) {
    console.error("❌ Demo failed:", error);
  }
}

// Specialized demo functions
async function demonstrateSingleIdentityOnly(): Promise<void> {
  console.log("🔄 Generating single identity...");
  try {
    const response = await fetch(`${BASE_URL}/api/v1/id?prefix=demo&run=${Date.now()}`);
    const identity = await response.json();

    console.log("✅ Generated successfully!");
    console.log("\n🔍 Single Identity Result:");
    console.log(`   📧 Email: ${identity.id}`);
    console.log(`   ⏰ TTL: ${identity.ttl}s (${Math.round(identity.ttl / 3600)}h)`);
    console.log(`   🏷️  Type: ${identity.metadata.type}`);
    console.log(`   🔧 Compatible: ${identity.metadata.compatible.join(', ')}`);
  } catch (error) {
    console.log("⚠️  Using mock data (server not available):");
    console.log(`   📧 Email: demo-${Date.now()}@api.dev.arsenal-lab.com/v1:id`);
    console.log(`   ⏰ TTL: 7200s (2h)`);
    console.log(`   🏷️  Type: disposable`);
  }
}

async function demonstrateBatchOnly(): Promise<void> {
  console.log("🔄 Generating batch identities...");
  const payload = {
    environments: [
      { name: "ci-pipeline", prefix: "ci", run: Date.now().toString() },
      { name: "staging-deploy", prefix: "staging", run: (Date.now() + 1).toString() },
      { name: "production-deploy", prefix: "prod", run: (Date.now() + 2).toString() }
    ],
    domain: "api.dev.arsenal-lab.com",
    version: "v1",
    ttl: 7200
  };

  try {
    const response = await fetch(`${BASE_URL}/api/v1/identities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    console.log("✅ Generated successfully!");
    console.log("\n📦 Batch Identity Results:");
    result.identities.forEach((identity: any, index: number) => {
      console.log(`   ${index + 1}. ${identity.metadata?.environment}: ${identity.id}`);
    });
    console.log(`   📊 Total: ${result.total} identities`);
  } catch (error) {
    console.log("⚠️  Using mock data (server not available):");
    payload.environments.forEach((env, index) => {
      console.log(`   ${index + 1}. ${env.name}: ${env.prefix}-${env.run}@api.dev.arsenal-lab.com/v1:id`);
    });
  }
}

async function demonstrateValidationOnly(): Promise<void> {
  console.log("🔄 Validating identities...");
  const testIdentities = [
    "ci-123456789@api.dev.arsenal-lab.com/v1:id",
    "staging-987654321@api.dev.arsenal-lab.com/v1:id",
    "invalid-email-format",
    "prod-111@api.dev.arsenal-lab.com/v2:id"
  ];

  const results = [];
  for (const identity of testIdentities) {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity })
      });
      const result = await response.json();
      results.push(result);
    } catch (error) {
      // Mock validation for offline mode
      const isValid = /^([a-z]+)-(\d+)@[^/]+\/v1:id$/.test(identity);
      results.push({
        identity,
        valid: isValid,
        rfc5322_compliant: isValid
      });
    }
  }

  console.log("✅ Validation completed!");
  console.log("\n✅ Identity Validation Results:");
  results.forEach(result => {
    const status = result.valid ? '✅' : '❌';
    console.log(`   ${status} ${result.identity}`);
  });
}

// Force update
async function forceUpdate(): Promise<void> {
  console.log("🔄 Force recompiling demo.ts from source...");
  try {
    await $`bun build ./scripts/demonstrate-v4-identity-system.ts --outfile ./demo.ts --target=bun`;
    console.log("✅ Recompiled successfully!");
  } catch (error) {
    console.error("❌ Recompilation failed:", error);
  }
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Check for special modes first
  if (args.includes("--watch")) {
    await runWatchMode(args);
    return;
  }

  if (args.includes("--update")) {
    await forceUpdate();
    return;
  }

  if (args.includes("--curl")) {
    console.log("\n📋 Curl Command Cheat Sheet:");
    console.log("═".repeat(50));
    console.log(CURL_CHEAT);
    return;
  }

  // Self-update check
  const wasUpdated = await checkAndUpdateSelf();
  if (wasUpdated) {
    console.log("💡 Restarting with updated version...");
    // Re-exec with same arguments
    await $`${import.meta.path} ${args.join(" ")}`;
    return;
  }

  // Parse regular arguments
  const dryRun = args.includes("--dry-run");
  const jsonOutput = args.includes("--json");
  const singleOnly = args.includes("--single");
  const batchOnly = args.includes("--batch");
  const validateOnly = args.includes("--validate");

  // Interactive menu if no flags provided
  if (!dryRun && !jsonOutput && !singleOnly && !batchOnly && !validateOnly && args.length === 0) {
    await runInteractiveMenu();
    return;
  }

  // Specialized demos
  if (singleOnly) {
    await demonstrateSingleIdentityOnly();
    return;
  }

  if (batchOnly) {
    await demonstrateBatchOnly();
    return;
  }

  if (validateOnly) {
    await demonstrateValidationOnly();
    return;
  }

  // Full demo
  await demonstrateV4IdentitySystem(dryRun, jsonOutput);
}

// Execute main function
main().catch(console.error);

