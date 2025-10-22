#!/usr/bin/env bun
import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "yaml";
import { $ } from "bun";

interface CanaryPatch {
  stage: "stable" | "canary";
  rollout: number; // percentage 0-100
  rollout_strategy: "random" | " gradual";
  monitoring_window: string;
  rollback_on_errors: boolean;
  rollback_threshold: number;
}

async function loadCanaryMatrix(): Promise<Record<string, CanaryPatch>> {
  const matrix = parse(readFileSync("config/canary-matrix.yml", "utf-8"));
  return matrix.patches || {};
}

async function saveCanaryMatrix(patches: Record<string, CanaryPatch>): Promise<void> {
  const matrix = {
    patches,
    global: {
      default_rollout_percentage: 5,
      monitoring_enabled: true,
      prometheus_metrics_enabled: true,
      slack_notifications_enabled: true,
      auto_promotion_enabled: true,
      auto_promotion_criteria: {
        no_errors_for: "24h",
        success_rate_above: 99.9,
        latency_regression_below: 5
      }
    }
  };

  writeFileSync("config/canary-matrix.yml", parse(matrix));
}

function isValidRollout(percentage: number): boolean {
  return percentage >= 0 && percentage <= 100;
}

function shouldRolloutCanary(percentage: number): boolean {
  if (percentage >= 100) return true;
  if (percentage <= 0) return false;

  // Simple random rollout - in production, this would use more sophisticated logic
  const random = Math.random() * 100;
  return random <= percentage;
}

async function promoteToStable(pkg: string): Promise<void> {
  const matrix = await loadCanaryMatrix();

  if (!matrix[pkg]) {
    throw new Error(`Package ${pkg} not found in canary matrix`);
  }

  matrix[pkg] = {
    ...matrix[pkg],
    stage: "stable",
    rollout: 100
  };

  await saveCanaryMatrix(matrix);
  console.log(`✅ Promoted ${pkg} to stable (100% rollout)`);
}

async function demoteToCanary(pkg: string, rolloutPercentage: number = 5): Promise<void> {
  const matrix = await loadCanaryMatrix();

  if (!matrix[pkg]) {
    matrix[pkg] = {
      stage: "canary",
      rollout: rolloutPercentage,
      rollout_strategy: "random",
      monitoring_window: "24h",
      rollback_on_errors: true,
      rollback_threshold: 5
    };
  } else {
    matrix[pkg] = {
      ...matrix[pkg],
      stage: "canary",
      rollout: rolloutPercentage
    };
  }

  await saveCanaryMatrix(matrix);
  console.log(`⚠️ Demoted ${pkg} to canary (${rolloutPercentage}% rollout)`);
}

async function setRollout(pkg: string, percentage: number): Promise<void> {
  if (!isValidRollout(percentage)) {
    throw new Error(`Invalid rollout percentage: ${percentage}. Must be 0-100.`);
  }

  const matrix = await loadCanaryMatrix();

  if (!matrix[pkg]) {
    throw new Error(`Package ${pkg} not found in canary matrix. Use 'add' command first.`);
  }

  matrix[pkg] = {
    ...matrix[pkg],
    rollout: percentage,
    stage: percentage === 100 ? "stable" : "canary"
  };

  await saveCanaryMatrix(matrix);
  console.log(`🔄 Set ${pkg} rollout to ${percentage}%`);
}

async function addPackage(pkg: string, rolloutPercentage: number = 5): Promise<void> {
  if (!isValidRollout(rolloutPercentage)) {
    throw new Error(`Invalid rollout percentage: ${rolloutPercentage}. Must be 0-100.`);
  }

  const matrix = await loadCanaryMatrix();

  if (matrix[pkg]) {
    throw new Error(`Package ${pkg} already exists in canary matrix`);
  }

  matrix[pkg] = {
    stage: "canary",
    rollout: rolloutPercentage,
    rollout_strategy: "random",
    monitoring_window: "24h",
    rollback_on_errors: true,
    rollback_threshold: 5
  };

  await saveCanaryMatrix(matrix);
  console.log(`➕ Added ${pkg} to canary matrix (${rolloutPercentage}% rollout)`);
}

async function removePackage(pkg: string): Promise<void> {
  const matrix = await loadCanaryMatrix();

  if (!matrix[pkg]) {
    throw new Error(`Package ${pkg} not found in canary matrix`);
  }

  delete matrix[pkg];
  await saveCanaryMatrix(matrix);
  console.log(`➖ Removed ${pkg} from canary matrix`);
}

async function listPackages(): Promise<void> {
  const matrix = await loadCanaryMatrix();

  if (Object.keys(matrix).length === 0) {
    console.log("📭 No packages in canary matrix");
    return;
  }

  console.log("🎯 Canary Matrix Status:\n");
  for (const [pkg, config] of Object.entries(matrix)) {
    const status = config.stage === "stable" ? "✅ STABLE" : `🟡 CANARY (${config.rollout}%)`;
    console.log(`${status} ${pkg}`);
  }
}

async function checkRollout(pkg: string): Promise<void> {
  const matrix = await loadCanaryMatrix();

  if (!matrix[pkg]) {
    console.log(`❌ ${pkg} not in canary matrix`);
    return;
  }

  const config = matrix[pkg];
  const shouldRollout = shouldRolloutCanary(config.rollout);

  console.log(`🎲 Rollout decision for ${pkg}:`);
  console.log(`   Stage: ${config.stage}`);
  console.log(`   Percentage: ${config.rollout}%`);
  console.log(`   Should rollout: ${shouldRollout ? "✅ YES" : "❌ NO"}`);

  return shouldRollout;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case "promote":
        if (args.length < 2) throw new Error("Usage: canary-ctl promote <package>");
        await promoteToStable(args[1]);
        break;

      case "demote":
        if (args.length < 3) throw new Error("Usage: canary-ctl demote <package> <percentage>");
        await demoteToCanary(args[1], parseInt(args[2]));
        break;

      case "rollout":
        if (args.length < 3) throw new Error("Usage: canary-ctl rollout <package> <percentage>");
        await setRollout(args[1], parseInt(args[2]));
        break;

      case "add":
        if (args.length < 2) throw new Error("Usage: canary-ctl add <package> [percentage]");
        await addPackage(args[1], args[2] ? parseInt(args[2]) : 5);
        break;

      case "remove":
        if (args.length < 2) throw new Error("Usage: canary-ctl remove <package>");
        await removePackage(args[1]);
        break;

      case "list":
        await listPackages();
        break;

      case "check":
        if (args.length < 2) throw new Error("Usage: canary-ctl check <package>");
        await checkRollout(args[1]);
        break;

      default:
        console.log("🎯 Canary Control Tool");
        console.log("");
        console.log("Commands:");
        console.log("  add <pkg> [pct]     Add package to canary matrix");
        console.log("  remove <pkg>        Remove package from canary matrix");
        console.log("  promote <pkg>       Promote canary to stable (100%)");
        console.log("  demote <pkg> [pct]  Demote stable to canary (default 5%)");
        console.log("  rollout <pkg> <pct> Set rollout percentage");
        console.log("  check <pkg>         Check if package should rollout");
        console.log("  list                List all packages in matrix");
        console.log("");
        console.log("Examples:");
        console.log("  bun run canary-ctl add react 10");
        console.log("  bun run canary-ctl promote lodash");
        console.log("  bun run canary-ctl rollout axios 25");
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.main) await main();
