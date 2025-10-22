#!/usr/bin/env bun
import { readdirSync } from "node:fs";
import { join } from "path";

export interface InvariantRule {
  name: string;
  validate: (patchContent: string, packageName: string, context?: any) => boolean | Promise<boolean>;
  description: string;
  severity: "low" | "moderate" | "high" | "critical";
  tags?: string[];
}

// Auto-discover and load all rule files
const rules = new Map<string, InvariantRule>();

async function loadRules() {
  const ruleFiles = readdirSync(__dirname)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts');

  console.log(`🔍 Found ${ruleFiles.length} rule files in rules/ directory`);

  for (const file of ruleFiles) {
    const ruleName = file.replace('.ts', '');
    try {
      const ruleModule = await import(join(__dirname, file));
      if (ruleModule.default && typeof ruleModule.default === 'object') {
        rules.set(ruleName, ruleModule.default);
        console.log(`✅ Loaded rule: ${ruleName}`);
      } else {
        console.warn(`⚠️  Rule ${ruleName} has no default export`);
      }
    } catch (error) {
      console.warn(`❌ Failed to load rule ${ruleName}:`, error.message);
    }
  }

  console.log(`📊 Total rules loaded: ${rules.size}`);
}

// Initialize rules on module load
if (import.meta.main) {
  await loadRules();
}

export { rules };
export default rules;
