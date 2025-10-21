// components/PerformanceArsenal/benchmarks/postMessage.ts
export async function runRealPostMessageBench(size: 'small' | 'medium' | 'large') {
  return new Promise((resolve, reject) => {
    try {
      // Create web worker for heavy computations
      const worker = new Worker('./worker.js');

      // Set up timeout for safety
      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error('Benchmark timed out'));
      }, 30000); // 30 second timeout

      worker.onmessage = (e) => {
        clearTimeout(timeout);
        worker.terminate();

        if (e.data.success) {
          resolve(e.data.result);
        } else {
          reject(new Error(e.data.error));
        }
      };

      worker.onerror = (error) => {
        clearTimeout(timeout);
        worker.terminate();
        reject(new Error(`Worker error: ${error.message}`));
      };

      // Start benchmark in worker
      worker.postMessage({
        type: 'postMessage',
        data: { size }
      });
    } catch (error) {
      reject(new Error(`Failed to create worker: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
}
