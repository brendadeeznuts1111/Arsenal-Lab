#!/usr/bin/env bun
import { $ } from "bun";
import { readFileSync, existsSync } from "node:fs";
import { parse } from "yaml";

type Severity = "low" | "high" | "critical";
interface InvariantViolation { invariant: string; description: string; severity: Severity }
interface ValidationResult { package: string; isValid: boolean; violations: InvariantViolation[] }

const invariants = [
  {
    name: "no-direct-process-env",
    description: "Patches cannot introduce new process.env access",
    severity: "high" as Severity,
    validate: (patch: string, orig: string) =>
      (orig.match(/\bprocess\.env\.[A-Z_]/g) || []).length >=
      (patch.match(/\bprocess\.env\.[A-Z_]/g) || []).length,
  },
  {
    name: "cryptographic-integrity",
    description: "Security pkgs cannot use insecure hashing",
    severity: "critical" as Severity,
    validate: (patch: string, pkg: string) =>
      !["rapidhash", "md5", "sha1"].some((x) => patch.includes(x)) || !isSecurity(pkg),
  },
  {
    name: "dependency-boundary",
    description: "Patches cannot introduce cross-layer deps",
    severity: "high" as Severity,
    validate: (patch: string, meta: any) => true, // TODO: layer check
  },
  {
    name: "no-eval-usage",
    description: "Patches cannot introduce eval() or Function() constructors",
    severity: "critical" as Severity,
    validate: (patch: string) => !patch.includes("eval(") && !patch.includes("new Function("),
  },
  {
    name: "no-global-mutation",
    description: "Patches cannot modify global objects",
    severity: "high" as Severity,
    validate: (patch: string) =>
      !patch.includes("global.") && !patch.includes("window.") && !patch.includes("globalThis."),
  },
];

function isSecurity(pkg: string) {
  return ["crypto", "auth", "jwt", "hash", "security", "tls", "ssl"].some((k) => pkg.toLowerCase().includes(k));
}

async function validatePatch(pkg: string, patchFile: string): Promise<ValidationResult> {
  if (!existsSync(patchFile)) {
    return {
      package: pkg,
      isValid: false,
      violations: [{
        invariant: "patch-file-exists",
        description: `Patch file ${patchFile} does not exist`,
        severity: "critical"
      }]
    };
  }

  const patch = await Bun.file(patchFile).text();
  const violations: InvariantViolation[] = [];

  for (const inv of invariants) {
    try {
      if (!inv.validate(patch, pkg)) {
        violations.push({
          invariant: inv.name,
          description: inv.description,
          severity: inv.severity
        });
      }
    } catch (error) {
      violations.push({
        invariant: "validation-error",
        description: `Failed to validate invariant ${inv.name}: ${error.message}`,
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
      const [name, version] = p.split("@");
      const file = `patches/${name}@${version}.patch`;
      console.log(`🔍 Validating ${p}...`);
      return validatePatch(p, file);
    })
  );

  const critical = results.filter((r) => r.violations.some((v) => v.severity === "critical"));
  const high = results.filter((r) => r.violations.some((v) => v.severity === "high"));
  const valid = results.filter((r) => r.isValid);

  console.log(`\n📊 Validation Results:`);
  console.log(`✅ Valid patches: ${valid.length}`);
  console.log(`⚠️  High severity violations: ${high.length}`);
  console.log(`🚨 Critical violations: ${critical.length}`);

  if (critical.length > 0) {
    console.error("\n🚨 CRITICAL INVARIANT VIOLATIONS:");
    critical.forEach(result => {
      console.error(`\n📦 ${result.package}:`);
      result.violations.forEach(v => {
        console.error(`   ${v.severity.toUpperCase()}: ${v.description}`);
      });
    });
    process.exit(1);
  }

  if (high.length > 0) {
    console.warn("\n⚠️  HIGH SEVERITY VIOLATIONS (non-blocking):");
    high.forEach(result => {
      console.warn(`\n📦 ${result.package}:`);
      result.violations.forEach(v => {
        console.warn(`   ${v.severity.toUpperCase()}: ${v.description}`);
      });
    });
  }

  if (valid.length === results.length) {
    console.log("\n✅ All patch invariants passed!");
  } else {
    console.log(`\n✅ ${valid.length}/${results.length} patches passed validation`);
  }
}

if (import.meta.main) await run();
