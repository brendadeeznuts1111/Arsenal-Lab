#!/usr/bin/env bun
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { $ } from "bun";

interface PatchAnalytics {
  patchedDeps: Record<string, string>;
  violations: any[];
  canaryState: any;
  lastSync: string;
  uptime: number;
  version: string;
}

async function getPatchedDeps(): Promise<Record<string, string>> {
  try {
    const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
    return pkg.patchedDependencies || {};
  } catch (error) {
    return {};
  }
}

async function getViolations(): Promise<any[]> {
  try {
    const result = await $`bun run invariant:validate 2>/dev/null`.nothrow();
    if (result.exitCode === 0) {
      // In a real implementation, this would parse structured output
      return [];
    }
    return [{ type: "execution_error", message: "Failed to run validation" }];
  } catch (error) {
    return [{ type: "runtime_error", message: error.message }];
  }
}

async function readCanaryMatrix(): Promise<any> {
  try {
    return parse(readFileSync("config/canary-matrix.yml", "utf-8"));
  } catch (error) {
    return { error: "Cannot read canary matrix" };
  }
}

async function lastUpstreamSync(): Promise<string> {
  try {
    // Check when patches were last modified
    const result = await $`find patches -name "*.patch" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1`.nothrow();
    if (result.exitCode === 0 && result.stdout.trim()) {
      const [timestamp] = result.stdout.trim().split(' ');
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toISOString();
    }
    return "never";
  } catch (error) {
    return "unknown";
  }
}

export async function getPatchAnalytics(): Promise<PatchAnalytics> {
  const [patchedDeps, violations, canaryState, lastSync] = await Promise.all([
    getPatchedDeps(),
    getViolations(),
    readCanaryMatrix(),
    lastUpstreamSync()
  ]);

  return {
    patchedDeps,
    violations,
    canaryState,
    lastSync,
    uptime: process.uptime(),
    version: "2.0.0"
  };
}

// Hono middleware for patch analytics endpoint
export function patchAnalyticsMiddleware(app: any) {
  app.get("/__debug/patches", async (c: any) => {
    try {
      const analytics = await getPatchAnalytics();
      return c.json(analytics);
    } catch (error) {
      return c.json({
        error: "Failed to generate patch analytics",
        message: error.message
      }, 500);
    }
  });

  // Health check for patch system
  app.get("/__debug/patches/health", async (c: any) => {
    const analytics = await getPatchAnalytics();
    const isHealthy = analytics.violations.length === 0;

    return c.json({
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      violations_count: analytics.violations.length,
      patches_count: Object.keys(analytics.patchedDeps).length
    });
  });
}

export default patchAnalyticsMiddleware;
