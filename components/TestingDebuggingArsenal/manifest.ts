// components/TestingDebuggingArsenal/manifest.ts
import type { ArsenalManifest } from '../../src/types/arsenal';

export const manifest: ArsenalManifest = {
  id: 'testing-debugging',
  name: 'Testing & Debugging Arsenal',
  description: 'Complete testing ecosystem with async traces and CI/CD integration',
  icon: '🔍',
  color: 'indigo',
  version: '1.3.0',
  complexity: 'advanced',
  category: 'testing',
  tags: ['testing', 'debugging', 'async-traces', 'ci-cd', 'stack-traces'],

  build: {
    entryPoint: 'index.tsx',
    dependencies: ['react', 'react-dom', 'clsx'],
    assets: ['styles.css'],
    preload: ['hooks/useTestingDebuggingArsenal.ts']
  },

  performance: {
    estimatedLoadTime: 'fast',
    bundleSize: 'medium',
    memoryUsage: 'moderate',
    cpuIntensity: 'moderate'
  },

  enterprise: {
    supportsTeams: true,
    auditLogging: true,
    roleBasedAccess: false,
    apiIntegration: true
  },

  enabled: true,
  order: 4
};
