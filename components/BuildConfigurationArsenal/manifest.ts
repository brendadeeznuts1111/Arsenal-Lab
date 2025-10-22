// components/BuildConfigurationArsenal/manifest.ts
import type { ArsenalManifest } from '../../src/types/arsenal';

export const manifest: ArsenalManifest = {
  id: 'build-config',
  name: 'Build Configuration Arsenal',
  description: 'Complete Bun bundler playground with JS API and CLI command generation',
  icon: '🔧',
  color: 'orange',
  version: '1.3.0',
  complexity: 'expert',
  category: 'build',
  tags: ['bundler', 'build', 'configuration', 'minification', 'tree-shaking'],

  build: {
    entryPoint: 'index.tsx',
    dependencies: ['react', 'react-dom', 'clsx'],
    assets: ['styles.css'],
    preload: ['hooks/useBuildConfigurationArsenal.ts']
  },

  performance: {
    estimatedLoadTime: 'fast',
    bundleSize: 'large',
    memoryUsage: 'high',
    cpuIntensity: 'high'
  },

  enterprise: {
    supportsTeams: true,
    auditLogging: true,
    roleBasedAccess: false,
    apiIntegration: true
  },

  enabled: true,
  order: 6
};
