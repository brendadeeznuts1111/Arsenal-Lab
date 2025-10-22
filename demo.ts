#!/usr/bin/env bun

/**
 * Arsenal Lab v4 Identity System Demo Runner
 *
 * Simple launcher for the enhanced v4 identity system demonstration.
 *
 * Usage:
 *   ./demo.ts --dry-run                 # offline demo
 *   ./demo.ts --json --dry-run          # machine output
 *   API_BASE_URL=https://id.corp.com ./demo.ts   # prod API
 */

import { demonstrateV4IdentitySystem } from "./scripts/demonstrate-v4-identity-system.ts";

// Parse CLI arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const jsonOutput = args.includes("--json");

// Run the demonstration
demonstrateV4IdentitySystem(dryRun, jsonOutput).catch(console.error);
