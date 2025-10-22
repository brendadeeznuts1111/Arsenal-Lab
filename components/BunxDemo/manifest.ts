// components/BunxDemo/manifest.ts
import type { ArsenalManifest } from '../../src/types/arsenal';

export const manifest: ArsenalManifest = {
  id: 'bunx',
  name: 'bunx Demo Arsenal',
  description: 'Execute npm packages without installation using Bun\'s package runner',
  icon: '🚀',
  color: 'pink',
  version: '1.0.0',
  complexity: 'beginner',
  category: 'demo',
  tags: ['bunx', 'npx', 'package-runner', 'demo', 'cli'],

  build: {
    entryPoint: 'index.tsx',
    dependencies: ['react', 'react-dom'],
    assets: ['styles.css'],
    preload: []
  },

  performance: {
    estimatedLoadTime: 'instant',
    bundleSize: 'small',
    memoryUsage: 'low',
    cpuIntensity: 'low'
  },

  enterprise: {
    supportsTeams: false,
    auditLogging: false,
    roleBasedAccess: false,
    apiIntegration: false
  },

  enabled: true,
  order: 9
};
