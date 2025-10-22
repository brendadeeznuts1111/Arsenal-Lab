#!/usr/bin/env bun
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import type { InvariantRule } from './index.ts';

const rule: InvariantRule = {
  name: "dependency-boundary",
  description: "Patches cannot introduce cross-layer dependencies",
  severity: "high",
  tags: ["architecture", "dependencies", "layers"],

  validate: async (patchContent: string, packageName: string) => {
    try {
      // Load dependency layers configuration
      const layersConfig = parse(readFileSync("config/dependency-layers.yml", "utf-8"));

      if (!layersConfig.global_rules?.enforce_layer_boundaries) {
        return true; // Layer enforcement disabled
      }

      // Determine which layer this package belongs to
      const packageLayer = findPackageLayer(packageName, layersConfig.layers);

      if (!packageLayer) {
        console.warn(`Warning: Package ${packageName} not assigned to any layer`);
        return true; // Allow if not explicitly layered
      }

      // Check for import statements in the patch
      const importRegex = /(?:import|require)\s*\(?["']([^"']+)["']\)?/g;
      const imports: string[] = [];
      let match;

      while ((match = importRegex.exec(patchContent)) !== null) {
        imports.push(match[1]);
      }

      // Check each import against layer boundaries
      for (const importPath of imports) {
        const importPackage = extractPackageName(importPath);
        if (!importPackage) continue;

        const importLayer = findPackageLayer(importPackage, layersConfig.layers);
        if (!importLayer) continue; // External packages allowed

        // Check if this cross-layer import is allowed
        const allowedImports = layersConfig.layers[packageLayer].allowed_imports || [];
        if (!allowedImports.includes(importLayer)) {
          console.error(`Layer violation: ${packageLayer} cannot import from ${importLayer} (${importPackage})`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.warn(`Layer boundary check failed: ${error.message}`);
      return true; // Fail open on configuration errors
    }
  }
};

function findPackageLayer(packageName: string, layers: Record<string, any>): string | null {
  for (const [layerName, layerConfig] of Object.entries(layers)) {
    const packages = layerConfig.packages || [];
    for (const pattern of packages) {
      if (matchesPattern(packageName, pattern)) {
        return layerName;
      }
    }
  }
  return null;
}

function matchesPattern(packageName: string, pattern: string): boolean {
  // Simple glob matching for package patterns
  const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
  return regex.test(packageName);
}

function extractPackageName(importPath: string): string | null {
  // Extract package name from import path
  // Handle scoped packages, relative imports, etc.
  if (importPath.startsWith('@')) {
    // Scoped package
    const parts = importPath.split('/');
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0];
  } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
    // Relative import - skip
    return null;
  } else {
    // Regular package
    const parts = importPath.split('/');
    return parts[0];
  }
}

export default rule;
