#!/usr/bin/env bun
import { existsSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import { rules } from "../rules/index.ts";

type Severity = "low" | "high" | "critical";
interface InvariantViolation { invariant: string; description: string; severity: Severity }
interface ValidationResult { package: string; isValid: boolean; violations: InvariantViolation[] }

async function loadEnabledInvariants() {
  try {
    const config = parse(readFileSync("config/invariant-definitions.yml", "utf-8"));
    return config.invariants.filter((inv: any) => inv.enabled !== false);
  } catch (error) {
    console.warn("Could not load invariant configuration, using all rules");
    return Array.from(rules.values());
  }
}

async function validatePatch(pkg: string, patchFile: string): Promise<ValidationResult> {
  if (!existsSync(patchFile)) {
    return {
      package: pkg,
      isValid: false,
      violations: [{
        invariant: "patch-file-exists",
        description: "Patch file does not exist: " + patchFile,
        severity: "critical"
      }]
    };
  }

  const patch = await Bun.file(patchFile).text();
  const violations: InvariantViolation[] = [];
  const enabledInvariants = await loadEnabledInvariants();

  for (const inv of enabledInvariants) {
    try {
      const ruleImpl = rules.get(inv.rule);
      if (!ruleImpl) {
        console.warn("Rule " + inv.rule + " not found in rules/ directory");
        continue;
      }

      const isValid = await ruleImpl.validate(patch, pkg);
      if (!isValid) {
        violations.push({
          invariant: inv.name,
          description: inv.description,
          severity: inv.severity
        });
      }
    } catch (error) {
      violations.push({
        invariant: "validation-error",
        description: "Failed to validate invariant " + inv.name + ": " + error.message,
        severity: "high"
      });
    }
  }

  return { package: pkg, isValid: violations.length === 0, violations };
}

async function getPatchedDeps() {
  const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
  return Object.keys(pkg.patchedDependencies || {});
}

async function run() {
  console.log("🔍 Running patch invariant validation...\n");

  const patched = await getPatchedDeps();
  if (patched.length === 0) {
    console.log("ℹ️  No patched dependencies found");
    return;
  }

  const results = await Promise.all(
    patched.map(async (p) => {
      const file = "patches/" + p.replace("@", "+") + ".patch";
      console.log("🔍 Validating " + p + "...");
      return validatePatch(p, file);
    })
  );

  const critical = results.filter((r) => r.violations.some((v) => v.severity === "critical"));
  const valid = results.filter((r) => r.isValid);

  console.log("\n📊 Validation Results:");
  console.log("✅ Valid patches: " + valid.length);
  console.log("🚨 Critical violations: " + critical.length);

  if (critical.length > 0) {
    console.error("\n🚨 CRITICAL INVARIANT VIOLATIONS:");
    critical.forEach(result => {
      console.error("\n📦 " + result.package + ":");
      result.violations.forEach(v => {
        console.error("   " + v.severity.toUpperCase() + ": " + v.description);
      });
    });
    process.exit(1);
  }

  if (valid.length === results.length) {
    console.log("\n✅ All patch invariants passed!");
  } else {
    console.log("\n✅ " + valid.length + "/" + results.length + " patches passed validation");
  }
}

if (import.meta.main) await run();