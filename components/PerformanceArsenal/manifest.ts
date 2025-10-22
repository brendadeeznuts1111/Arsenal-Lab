// components/PerformanceArsenal/manifest.ts
import type { ArsenalManifest } from '../../src/types/arsenal';

export const manifest: ArsenalManifest = {
  id: 'performance',
  name: 'Performance Arsenal',
  description: '500× faster operations with zero-copy communication, optimized crypto, and memory management',
  icon: '⚡',
  color: 'green',
  version: '2.0.0',
  complexity: 'advanced',
  category: 'performance',
  tags: ['benchmarking', 'optimization', 'profiling', 'crypto', 'memory', 'postMessage', 'registry'],

  build: {
    entryPoint: 'index.tsx',
    dependencies: [
      'react',
      'react-dom',
      'clsx'
    ],
    assets: [
      'styles.css',
      'data/improvements.ts'
    ],
    preload: [
      'utils/performanceObserver.ts',
      'hooks/usePerformanceArsenal.ts',
      'workers/WorkerManager.ts'
    ]
  },

  performance: {
    estimatedLoadTime: 'fast',
    bundleSize: 'medium',
    memoryUsage: 'moderate',
    cpuIntensity: 'very-high' // During benchmarks
  },

  enterprise: {
    supportsTeams: true,
    auditLogging: true,
    roleBasedAccess: false,
    apiIntegration: true
  },

  enabled: true,
  order: 1
};
