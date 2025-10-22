// src/config/arsenal-registry.ts - Arsenal Auto-Discovery and Registry

import type { ArsenalManifest, ArsenalComponent, ArsenalRegistry } from '../types/arsenal';

/**
 * Automatically discovers and registers all Arsenal components
 * by importing their manifest files from the components directory.
 */
async function discoverArsenals(): Promise<ArsenalRegistry> {
  const registry: ArsenalRegistry = {};

  // Import all manifests
  const manifestModules = {
    'performance': await import('../../components/PerformanceArsenal/manifest'),
    'process-shell': await import('../../components/ProcessShellArsenal/manifest'),
    'testing': await import('../../components/TestingArsenal/manifest'),
    'testing-debugging': await import('../../components/TestingDebuggingArsenal/manifest'),
    'database-infra': await import('../../components/DatabaseInfrastructureArsenal/manifest'),
    'build-config': await import('../../components/BuildConfigurationArsenal/manifest'),
    'security': await import('../../components/SecurityArsenal/manifest'),
    'package-mgmt': await import('../../components/PackageManagementArsenal/manifest'),
    'bunx': await import('../../components/BunxDemo/manifest'),
  };

  // Register each arsenal
  for (const [id, module] of Object.entries(manifestModules)) {
    const manifest: ArsenalManifest = module.manifest;

    if (!manifest.enabled) {
      continue; // Skip disabled arsenals
    }

    registry[id] = {
      manifest,
      // Lazy-loaded component using dynamic import
      component: async () => {
        switch (id) {
          case 'performance':
            return import('../../components/PerformanceArsenal');
          case 'process-shell':
            return import('../../components/ProcessShellArsenal');
          case 'testing':
            return import('../../components/TestingArsenal');
          case 'testing-debugging':
            return import('../../components/TestingDebuggingArsenal');
          case 'database-infra':
            return import('../../components/DatabaseInfrastructureArsenal');
          case 'build-config':
            return import('../../components/BuildConfigurationArsenal');
          case 'security':
            return import('../../components/SecurityArsenal');
          case 'package-mgmt':
            return import('../../components/PackageManagementArsenal');
          case 'bunx':
            return import('../../components/BunxDemo');
          default:
            throw new Error(`Unknown arsenal: ${id}`);
        }
      },
    };
  }

  return registry;
}

// Create and cache the registry
let cachedRegistry: ArsenalRegistry | null = null;

/**
 * Gets the arsenal registry, creating it if necessary
 */
export async function getArsenalRegistry(): Promise<ArsenalRegistry> {
  if (!cachedRegistry) {
    cachedRegistry = await discoverArsenals();
  }
  return cachedRegistry;
}

/**
 * Gets a specific arsenal by ID
 */
export async function getArsenal(id: string): Promise<ArsenalComponent | null> {
  const registry = await getArsenalRegistry();
  return registry[id] || null;
}

/**
 * Gets all enabled arsenals sorted by order
 */
export async function getAllArsenals(): Promise<ArsenalComponent[]> {
  const registry = await getArsenalRegistry();
  return Object.values(registry).sort((a, b) => {
    const orderA = a.manifest.order || 999;
    const orderB = b.manifest.order || 999;
    return orderA - orderB;
  });
}

/**
 * Gets arsenals by category
 */
export async function getArsenalsByCategory(category: ArsenalManifest['category']): Promise<ArsenalComponent[]> {
  const registry = await getArsenalRegistry();
  return Object.values(registry)
    .filter(arsenal => arsenal.manifest.category === category)
    .sort((a, b) => {
      const orderA = a.manifest.order || 999;
      const orderB = b.manifest.order || 999;
      return orderA - orderB;
    });
}

/**
 * Gets all arsenal IDs
 */
export async function getArsenalIds(): Promise<string[]> {
  const registry = await getArsenalRegistry();
  return Object.keys(registry);
}

/**
 * Type-safe arsenal ID union
 */
export type ArsenalId =
  | 'performance'
  | 'process-shell'
  | 'testing'
  | 'testing-debugging'
  | 'database-infra'
  | 'build-config'
  | 'security'
  | 'package-mgmt'
  | 'bunx';

/**
 * Validates if a string is a valid arsenal ID
 */
export function isValidArsenalId(id: string): id is ArsenalId {
  return [
    'performance',
    'process-shell',
    'testing',
    'testing-debugging',
    'database-infra',
    'build-config',
    'security',
    'package-mgmt',
    'bunx',
  ].includes(id);
}
