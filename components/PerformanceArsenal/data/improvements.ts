// components/PerformanceArsenal/data/improvements.ts
export const cryptoImprovements = [
  {
    name: 'Diffie-Hellman',
    description: '400× faster key exchange operations',
    improvement: '400×'
  },
  {
    name: 'AES-GCM',
    description: '300× faster authenticated encryption',
    improvement: '300×'
  },
  {
    name: 'SHA-256',
    description: '250× faster hashing for large files',
    improvement: '250×'
  },
  {
    name: 'ECDSA',
    description: '200× faster digital signatures',
    improvement: '200×'
  },
  {
    name: 'RSA',
    description: '150× faster asymmetric cryptography',
    improvement: '150×'
  },
  {
    name: 'HKDF',
    description: 'New algorithm support with 500× performance',
    improvement: '500×'
  }
];

export const memoryOptimizations = [
  {
    area: 'Startup Memory',
    description: '3MB reduction in baseline memory usage',
    improvement: '3MB less'
  },
  {
    area: 'Next.js Apps',
    description: '28% reduction in memory consumption',
    improvement: '28% less'
  },
  {
    area: 'Elysia Framework',
    description: '11% reduction in server memory usage',
    improvement: '11% less'
  },
  {
    area: 'Large File Fetch',
    description: 'Proper backpressure prevents memory spikes',
    improvement: 'No spikes'
  },
  {
    area: 'Worker Threads',
    description: 'Zero-copy message passing reduces overhead',
    improvement: 'Zero-copy'
  },
  {
    area: 'Bundle Analysis',
    description: 'Memory-efficient code splitting and tree shaking',
    improvement: '50% smaller'
  }
];
