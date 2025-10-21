// components/PerformanceArsenal/data/examples.ts
export const codeExamples = {
  postMessage: `// Worker thread (worker.js)
self.onmessage = (e) => {
  // Large strings are zero-copy in Bun 1.3
  const processed = processData(e.data);
  self.postMessage(processed);
};

// Main thread
const worker = new Worker('./worker.js');
const largeData = await fetchLargeJSON(); // 3MB payload
worker.postMessage(largeData); // 500× faster in Bun`,

  diffieHellman: `import { createDiffieHellman } from 'crypto';

// 400× faster in Bun 1.3
const alice = createDiffieHellman(2048);
const bob = createDiffieHellman(alice.getPrime(), alice.getGenerator());

const aliceKey = alice.generateKeys();
const bobKey = bob.generateKeys();

const aliceSecret = alice.computeSecret(bobKey);
const bobSecret = bob.computeSecret(aliceKey);

// aliceSecret === bobSecret (400× faster)`,

  registry: `// Zero-copy package publishing
import { publish } from 'bun:registry';

await publish({
  name: 'my-package',
  version: '1.0.0',
  files: ['./dist/**/*']
}); // 8× faster than npm publish`,

  memory: `// Memory-efficient large file handling
const response = await fetch('large-file.zip');
const reader = response.body.getReader();

for await (const chunk of reader) {
  // Process chunks without loading entire file
  await processChunk(chunk);
}
// Automatic backpressure prevents memory spikes`
};
