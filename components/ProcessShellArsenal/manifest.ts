// components/ProcessShellArsenal/manifest.ts
import type { ArsenalManifest } from '../../src/types/arsenal';

export const manifest: ArsenalManifest = {
  id: 'process-shell',
  name: 'Process & Shell Arsenal',
  description: 'Advanced process management with streams, buffers, sockets, and timers',
  icon: '🔧',
  color: 'blue',
  version: '1.3.0',
  complexity: 'advanced',
  category: 'performance',
  tags: ['process', 'shell', 'streams', 'buffers', 'sockets', 'timers', 'system'],

  build: {
    entryPoint: 'index.tsx',
    dependencies: ['react', 'react-dom', 'clsx'],
    assets: ['styles.css'],
    preload: ['hooks/useProcessShellArsenal.ts']
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
  order: 2
};
