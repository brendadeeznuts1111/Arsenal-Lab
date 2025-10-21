// components/PerformanceArsenal/workers/benchmark.worker.ts
const benchmarkWorker = `
self.onmessage = async (e) => {
  const { type, payload, id } = e.data;
  const start = performance.now();

  try {
    let result;
    switch (type) {
      case 'postMessage':
        result = await runPostMessageBenchmark(payload.size);
        break;
      case 'registry':
        result = await runRegistryBenchmark(payload.action);
        break;
      case 'crypto':
        result = await runCryptoBenchmark(payload.algorithm);
        break;
      default:
        throw new Error('Unknown benchmark type');
    }

    const end = performance.now();

    self.postMessage({
      id,
      type: 'success',
      duration: end - start,
      result,
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null
    });
  } catch (error) {
    self.postMessage({
      id,
      type: 'error',
      error: error.message
    });
  }
};

async function runPostMessageBenchmark(size: string) {
  // Simulate different payload sizes
  const payloads = {
    small: 'Hello World!',
    medium: generatePayload(50 * 1024), // 50KB
    large: generatePayload(3 * 1024 * 1024) // 3MB
  };

  const payload = payloads[size as keyof typeof payloads];
  const worker = createWorker();

  return new Promise((resolve) => {
    const start = performance.now();
    worker.postMessage(payload);
    worker.onmessage = () => {
      const end = performance.now();
      worker.terminate();
      resolve({
        duration: end - start,
        payloadSize: payload.length
      });
    };
  });
}

function generatePayload(size: number): string {
  return 'x'.repeat(size);
}

function createWorker(): Worker {
  const workerCode = \`
    self.onmessage = (e) => {
      // Simulate processing
      const result = { length: e.data.length, processed: true };
      self.postMessage(result);
    };
  \`;
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}

async function runRegistryBenchmark(action: string) {
  // Simulate network latency
  await new Promise(resolve =>
    setTimeout(resolve, action === 'upload' ? 120 : 95)
  );

  return {
    simulated: true,
    action
  };
}

async function runCryptoBenchmark(algorithm: string) {
  // Simulate crypto operations
  const iterations = algorithm === 'diffieHellman' ? 1000 : 100;
  let result = '';

  for (let i = 0; i < iterations; i++) {
    result += Math.random().toString(36).substring(2);
  }

  return {
    iterations,
    algorithm
  };
}
`;

export class BenchmarkWorker {
  private worker: Worker;
  private callbacks = new Map<string, (data: any) => void>();

  constructor() {
    const blob = new Blob([benchmarkWorker], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));
    this.worker.onmessage = this.handleMessage.bind(this);
  }

  private handleMessage(e: MessageEvent) {
    const { id, type, ...data } = e.data;
    const callback = this.callbacks.get(id);

    if (callback) {
      callback({ type, ...data });
      this.callbacks.delete(id);
    }
  }

  async runBenchmark(type: string, payload: any): Promise<any> {
    const id = Math.random().toString(36).substring(2, 15);

    return new Promise((resolve, reject) => {
      this.callbacks.set(id, (result) => {
        if (result.type === 'success') {
          resolve(result);
        } else {
          reject(new Error(result.error));
        }
      });

      this.worker.postMessage({ type, payload, id });
    });
  }

  terminate() {
    this.worker.terminate();
    this.callbacks.clear();
  }
}
