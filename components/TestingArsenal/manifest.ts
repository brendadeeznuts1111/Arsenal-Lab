// components/TestingArsenal/manifest.ts
import type { ArsenalManifest } from '../../src/types/arsenal';

export const manifest: ArsenalManifest = {
  id: 'testing',
  name: 'Testing Arsenal',
  description: 'Concurrent execution, advanced matchers, and type testing capabilities',
  icon: '🧪',
  color: 'purple',
  version: '1.3.0',
  complexity: 'intermediate',
  category: 'testing',
  tags: ['testing', 'concurrent', 'matchers', 'type-testing', 'assertions'],

  build: {
    entryPoint: 'index.tsx',
    dependencies: ['react', 'react-dom', 'clsx'],
    assets: ['styles.css'],
    preload: ['hooks/useTestingArsenal.ts']
  },

  performance: {
    estimatedLoadTime: 'fast',
    bundleSize: 'small',
    memoryUsage: 'low',
    cpuIntensity: 'moderate'
  },

  enterprise: {
    supportsTeams: true,
    auditLogging: true,
    roleBasedAccess: false,
    apiIntegration: true
  },

  enabled: true,
  order: 3
};
