// components/PackageManagementArsenal/manifest.ts
import type { ArsenalManifest } from '../../src/types/arsenal';

export const manifest: ArsenalManifest = {
  id: 'package-mgmt',
  name: 'Package Management Arsenal',
  description: 'Catalog-aware package info, outdated checks, security audits, and persistent patching',
  icon: '📦',
  color: 'violet',
  version: '1.3.0',
  complexity: 'advanced',
  category: 'management',
  tags: ['package', 'npm', 'audit', 'outdated', 'patch', 'security', 'governance'],

  build: {
    entryPoint: 'index.tsx',
    dependencies: ['react', 'react-dom', 'clsx'],
    assets: [],
    preload: []
  },

  performance: {
    estimatedLoadTime: 'fast',
    bundleSize: 'medium',
    memoryUsage: 'moderate',
    cpuIntensity: 'low'
  },

  enterprise: {
    supportsTeams: true,
    auditLogging: true,
    roleBasedAccess: true,
    apiIntegration: true
  },

  enabled: true,
  order: 8
};
