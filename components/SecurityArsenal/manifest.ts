// components/SecurityArsenal/manifest.ts
import type { ArsenalManifest } from '../../src/types/arsenal';

export const manifest: ArsenalManifest = {
  id: 'security',
  name: 'Security Arsenal',
  description: 'Comprehensive dependency vulnerability scanning with severity filtering and automated security audits',
  icon: '🔒',
  color: 'red',
  version: '1.3.0',
  complexity: 'intermediate',
  category: 'security',
  tags: ['security', 'vulnerability', 'scanning', 'audit', 'dependencies'],

  build: {
    entryPoint: 'index.tsx',
    dependencies: ['react', 'react-dom', 'clsx'],
    assets: ['styles.css'],
    preload: ['hooks/useSecurityArsenal.ts']
  },

  performance: {
    estimatedLoadTime: 'moderate',
    bundleSize: 'medium',
    memoryUsage: 'moderate',
    cpuIntensity: 'moderate'
  },

  enterprise: {
    supportsTeams: true,
    auditLogging: true,
    roleBasedAccess: true,
    apiIntegration: true
  },

  enabled: true,
  order: 7
};
