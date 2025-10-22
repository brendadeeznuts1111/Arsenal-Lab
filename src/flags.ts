#!/usr/bin/env bun
import { readFileSync } from "node:fs";

// Feature flag configuration
interface FeatureFlag {
  name: string;
  description: string;
  defaultValue: boolean;
  tags?: string[];
}

// Available feature flags
const FEATURE_FLAGS: FeatureFlag[] = [
  {
    name: "invariant-validation",
    description: "Enable/disable all invariant validation",
    defaultValue: true,
    tags: ["core", "validation"]
  },
  {
    name: "tension-monitoring",
    description: "Enable/disable tension monitoring",
    defaultValue: true,
    tags: ["monitoring", "tension"]
  },
  {
    name: "slack-notifications",
    description: "Enable/disable Slack notifications",
    defaultValue: false,
    tags: ["notifications", "slack"]
  },
  {
    name: "cosign-signing",
    description: "Enable/disable cosign signing requirements",
    defaultValue: true,
    tags: ["security", "signing"]
  },
  {
    name: "canary-deployments",
    description: "Enable/disable canary deployment features",
    defaultValue: true,
    tags: ["deployment", "canary"]
  },
  {
    name: "opentelemetry-metrics",
    description: "Enable/disable OpenTelemetry metrics",
    defaultValue: true,
    tags: ["monitoring", "metrics"]
  },
  {
    name: "auto-patch-renewal",
    description: "Enable/disable automatic patch renewal",
    defaultValue: false,
    tags: ["automation", "renewal"]
  },
  {
    name: "crypto-integrity",
    description: "Enable/disable cryptographic integrity checks",
    defaultValue: true,
    tags: ["security", "crypto"]
  },
  {
    name: "layer-boundary",
    description: "Enable/disable dependency layer boundary checks",
    defaultValue: true,
    tags: ["architecture", "dependencies"]
  },
  {
    name: "no-process-env",
    description: "Enable/disable process.env access restrictions",
    defaultValue: true,
    tags: ["security", "environment"]
  }
];

class FeatureFlagManager {
  private flags: Map<string, boolean> = new Map();
  private initialized = false;

  constructor() {
    this.loadLocalFlags();
  }

  /**
   * Initialize with LaunchDarkly or other provider
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Try to load LaunchDarkly client
      const ldToken = process.env.LD_SDK_KEY;
      if (ldToken) {
        await this.initializeLaunchDarkly(ldToken);
      } else {
        console.log("⚠️ LaunchDarkly not configured, using local feature flags");
      }
    } catch (error) {
      console.warn("⚠️ Feature flag provider initialization failed:", error.message);
    }

    this.initialized = true;
  }

  /**
   * Check if a feature flag is enabled
   */
  async isEnabled(flagName: string, context?: any): Promise<boolean> {
    await this.initialize();

    // Check LaunchDarkly first (if available)
    if (this.hasLaunchDarkly()) {
      try {
        const ldValue = await this.getLaunchDarklyFlag(flagName, context);
        if (ldValue !== undefined) {
          return ldValue;
        }
      } catch (error) {
        console.warn(`⚠️ LaunchDarkly flag check failed for ${flagName}:`, error.message);
      }
    }

    // Fallback to local configuration
    return this.flags.get(flagName) ?? this.getDefaultValue(flagName);
  }

  /**
   * Get all feature flags status
   */
  async getAllFlags(): Promise<Record<string, boolean>> {
    await this.initialize();

    const result: Record<string, boolean> = {};
    for (const flag of FEATURE_FLAGS) {
      result[flag.name] = await this.isEnabled(flag.name);
    }
    return result;
  }

  /**
   * Override a feature flag locally (for testing)
   */
  setLocalOverride(flagName: string, value: boolean): void {
    this.flags.set(flagName, value);
  }

  /**
   * Clear local override
   */
  clearLocalOverride(flagName: string): void {
    this.flags.delete(flagName);
  }

  private loadLocalFlags(): void {
    try {
      // Load from environment variables
      for (const flag of FEATURE_FLAGS) {
        const envVar = `BUN_GATE_${flag.name.toUpperCase().replace(/-/g, '_')}`;
        const envValue = process.env[envVar];

        if (envValue !== undefined) {
          this.flags.set(flag.name, envValue.toLowerCase() === 'true');
        }
      }

      // Load from local config file
      const configPath = "config/feature-flags.yml";
      if (Bun.file) {
        try {
          const configContent = readFileSync(configPath, "utf-8");
          const config = JSON.parse(configContent); // Assume JSON for simplicity

          for (const [key, value] of Object.entries(config)) {
            if (typeof value === 'boolean') {
              this.flags.set(key, value);
            }
          }
        } catch (error) {
          // Config file doesn't exist or is invalid, continue
        }
      }
    } catch (error) {
      console.warn("⚠️ Failed to load local feature flags:", error.message);
    }
  }

  private getDefaultValue(flagName: string): boolean {
    const flag = FEATURE_FLAGS.find(f => f.name === flagName);
    return flag?.defaultValue ?? false;
  }

  private hasLaunchDarkly(): boolean {
    return !!(globalThis as any).launchDarklyClient;
  }

  private async initializeLaunchDarkly(sdkKey: string): Promise<void> {
    try {
      // Dynamically import LaunchDarkly
      const { LaunchDarkly } = await import("@launchdarkly/node-server-sdk");

      const client = LaunchDarkly.init(sdkKey);
      await client.waitForInitialization();

      (globalThis as any).launchDarklyClient = client;
      console.log("✅ LaunchDarkly feature flags initialized");
    } catch (error) {
      throw new Error(`LaunchDarkly initialization failed: ${error.message}`);
    }
  }

  private async getLaunchDarklyFlag(flagName: string, context?: any): Promise<boolean | undefined> {
    const client = (globalThis as any).launchDarklyClient;
    if (!client) return undefined;

    const userContext = {
      key: "bun-system-gate",
      ...context
    };

    try {
      return await client.variation(flagName, userContext, this.getDefaultValue(flagName));
    } catch (error) {
      console.warn(`⚠️ LaunchDarkly variation call failed for ${flagName}:`, error.message);
      return undefined;
    }
  }
}

// Global instance
export const featureFlags = new FeatureFlagManager();

// Convenience functions
export async function isFeatureEnabled(flagName: string, context?: any): Promise<boolean> {
  return featureFlags.isEnabled(flagName, context);
}

export function setFeatureFlag(flagName: string, value: boolean): void {
  featureFlags.setLocalOverride(flagName, value);
}

export function clearFeatureFlag(flagName: string): void {
  featureFlags.clearLocalOverride(flagName);
}

// Initialize on import
if (import.meta.main) {
  featureFlags.initialize().catch(error => {
    console.warn("⚠️ Feature flag initialization failed:", error.message);
  });
}
