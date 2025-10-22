// src/core/arsenal-loader.ts - Dynamic Arsenal Component Loader

import type { ArsenalComponent } from '../types/arsenal';
import { getArsenal, type ArsenalId } from '../config/arsenal-registry';

/**
 * Cache for loaded components to avoid re-loading
 */
const componentCache = new Map<string, any>();

/**
 * Cache for preloaded assets
 */
const preloadCache = new Map<string, Promise<any>>();

/**
 * Loads an arsenal component dynamically
 * Works in both dev (dynamic import) and production (bundled chunks)
 */
export async function loadArsenalComponent(id: ArsenalId): Promise<any> {
  // Check cache first
  if (componentCache.has(id)) {
    return componentCache.get(id);
  }

  // Get arsenal from registry
  const arsenal = await getArsenal(id);
  if (!arsenal) {
    throw new Error(`Arsenal not found: ${id}`);
  }

  // Load the component module
  const module = await arsenal.component();

  // Cache the loaded component
  const componentName = getComponentName(id);
  const component = module[componentName];

  if (!component) {
    console.warn(`Component ${componentName} not found in module for ${id}`);
    // Try to find the default export or first export
    const firstExport = Object.values(module)[0];
    if (firstExport) {
      componentCache.set(id, firstExport);
      return firstExport;
    }
    throw new Error(`No component found for arsenal: ${id}`);
  }

  componentCache.set(id, component);
  return component;
}

/**
 * Preloads an arsenal's assets and dependencies
 */
export async function preloadArsenal(id: ArsenalId): Promise<void> {
  if (preloadCache.has(id)) {
    return preloadCache.get(id);
  }

  const arsenal = await getArsenal(id);
  if (!arsenal || !arsenal.preload) {
    return;
  }

  const preloadPromise = arsenal.preload();
  preloadCache.set(id, preloadPromise);

  try {
    await preloadPromise;
  } catch (error) {
    console.error(`Failed to preload arsenal ${id}:`, error);
    preloadCache.delete(id);
  }
}

/**
 * Preloads multiple arsenals in parallel
 */
export async function preloadArsenals(ids: ArsenalId[]): Promise<void> {
  await Promise.all(ids.map(id => preloadArsenal(id)));
}

/**
 * Clears the component cache (useful for hot reload)
 */
export function clearComponentCache(): void {
  componentCache.clear();
  preloadCache.clear();
}

/**
 * Gets the expected component name from arsenal ID
 */
function getComponentName(id: ArsenalId): string {
  const nameMap: Record<ArsenalId, string> = {
    'performance': 'PerformanceArsenal',
    'process-shell': 'ProcessShellArsenal',
    'testing': 'TestingArsenal',
    'testing-debugging': 'TestingDebuggingArsenal',
    'database-infra': 'DatabaseInfrastructureArsenal',
    'build-config': 'BuildConfigurationArsenal',
    'security': 'SecurityArsenal',
    'package-mgmt': 'PackageManagementArsenal',
    'bunx': 'BunxDemo',
  };

  return nameMap[id];
}

/**
 * Checks if an arsenal is currently loaded
 */
export function isArsenalLoaded(id: ArsenalId): boolean {
  return componentCache.has(id);
}

/**
 * Gets load status for all arsenals
 */
export function getLoadedArsenals(): ArsenalId[] {
  return Array.from(componentCache.keys()) as ArsenalId[];
}
