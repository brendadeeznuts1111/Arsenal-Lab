#!/usr/bin/env bun
import { parse } from "yaml";
import { $ } from "bun";
import { existsSync } from "node:fs";

interface TensionRule {
  name: string;
  condition: string;
  severity: "BLOCK" | "AMBER" | "YELLOW";
  actions: string[];
}

interface PatchContext {
  patch_content: string;
  package_category: string;
  patch_size: number;
  package_name: string;
  has_imports: boolean;
  has_exports: boolean;
  line_count: number;
  security_keywords: string[];
}

function evaluateCondition(condition: string, ctx: Record<string, any>): boolean {
  try {
    return new Function(...Object.keys(ctx), `return (${condition})`)(...Object.values(ctx));
  } catch (error) {
    console.error(`❌ Error evaluating condition "${condition}":`, error.message);
    return false;
  }
}

function createContext(patchFile: string, pkg: string): PatchContext {
  const content = Bun.file(patchFile).textSync();
  const securityKeywords = ["crypto", "auth", "jwt", "hash", "security", "tls", "ssl", "encrypt", "decrypt"];
  const hasSecurityKeyword = securityKeywords.some(k => pkg.toLowerCase().includes(k));

  return {
    patch_content: content,
    package_category: hasSecurityKeyword ? "security" : "general",
    patch_size: content.length,
    package_name: pkg,
    has_imports: content.includes("import") || content.includes("require("),
    has_exports: content.includes("export") || content.includes("module.exports"),
    line_count: content.split("\n").length,
    security_keywords: securityKeywords.filter(k => content.toLowerCase().includes(k))
  };
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "BLOCK": return "🔴";
    case "AMBER": return "🟡";
    case "YELLOW": return "🟢";
    default: return "⚪";
  }
}

function getSeverityLevel(severity: string): number {
  switch (severity) {
    case "BLOCK": return 3;
    case "AMBER": return 2;
    case "YELLOW": return 1;
    default: return 0;
  }
}

export async function analyzePatch(patchFile: string, pkg: string): Promise<{
  violations: Array<{ rule: TensionRule; triggered: boolean }>;
  maxSeverity: string;
  recommendations: string[];
}> {
  if (!existsSync(patchFile)) {
    throw new Error(`Patch file ${patchFile} does not exist`);
  }

  const rules = parse(await Bun.file("tension-rules.yml").text()).patch_monitoring.rules as TensionRule[];
  const ctx = createContext(patchFile, pkg);

  console.log(`🔍 Analyzing ${pkg} (${ctx.package_category})`);
  console.log(`📊 Patch size: ${ctx.patch_size} chars, ${ctx.line_count} lines`);

  const violations: Array<{ rule: TensionRule; triggered: boolean }> = [];
  const triggeredRules: TensionRule[] = [];

  for (const rule of rules) {
    const triggered = evaluateCondition(rule.condition, ctx);
    violations.push({ rule, triggered });

    if (triggered) {
      triggeredRules.push(rule);
      console.log(`${getSeverityColor(rule.severity)} ${rule.severity} tension: ${rule.name}`);
    }
  }

  const maxSeverity = triggeredRules.length > 0
    ? triggeredRules.reduce((max, rule) =>
        getSeverityLevel(rule.severity) > getSeverityLevel(max) ? rule.severity : max, "YELLOW")
    : "CLEAR";

  const recommendations = triggeredRules.flatMap(rule => rule.actions);

  return { violations, maxSeverity, recommendations };
}

async function runAnalysis() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: bun run monitor-amber-edges.ts <patch-file> <package-name>");
    process.exit(1);
  }

  const [patchFile, pkg] = args;
  const result = await analyzePatch(patchFile, pkg);

  console.log(`\n📋 Analysis Summary:`);
  console.log(`🎯 Max Severity: ${getSeverityColor(result.maxSeverity)} ${result.maxSeverity}`);

  if (result.recommendations.length > 0) {
    console.log(`\n📝 Recommended Actions:`);
    result.recommendations.forEach(action => console.log(`   → ${action}`));
  }

  // Exit codes based on severity
  const exitCode = result.maxSeverity === "BLOCK" ? 1 : 0;
  process.exit(exitCode);
}

if (import.meta.main) await runAnalysis();
