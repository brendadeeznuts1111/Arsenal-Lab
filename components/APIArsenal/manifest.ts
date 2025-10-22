// components/APIArsenal/manifest.ts
export const APIArsenalManifest = {
  name: 'API Arsenal',
  version: '1.0.0',
  description: 'Interactive API toolkit and developer tools with v4 identity system',
  author: 'Arsenal Lab',
  license: 'MIT',
  repository: 'https://github.com/brendadeeznuts1111/Arsenal-Lab',

  build: {
    entryPoint: 'index.tsx',
    dependencies: ['react', 'react-dom'],
    assets: ['styles.css'],
    preload: [],
  },

  features: [
    'API Testing Toolkit',
    'Developer Tools',
    'v4 Identity System',
    'Interactive Demos',
    'Real-time API Testing'
  ],

  apis: {
    performance: [
      'GET /api/performance/metrics',
      'GET /api/performance/history',
      'GET /api/performance/alerts',
      'GET /api/performance/benchmarks',
      'GET /api/performance/dashboard'
    ],
    health: [
      'GET /api/health',
      'GET /api/diagnostics',
      'GET /api/telemetry'
    ],
    identity: [
      'GET /api/v1/id',
      'POST /api/v1/identities',
      'POST /api/v1/validate'
    ]
  },

  tools: [
    './demo.ts --dry-run',
    './demo.ts --json --dry-run',
    'API_BASE_URL=https://prod-api.com ./demo.ts',
    'bun run demo:v4-identity',
    'bun run demo:v4-identity:dry',
    'bun run demo:v4-identity:json'
  ]
};
