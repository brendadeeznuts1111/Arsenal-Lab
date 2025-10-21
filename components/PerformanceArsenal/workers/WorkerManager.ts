// components/PerformanceArsenal/workers/WorkerManager.ts
import { BenchmarkWorker } from './benchmark.worker';

export class WorkerManager {
  private static instance: WorkerManager;
  private workers: Map<string, BenchmarkWorker> = new Map();
  private activeWorkers: Set<string> = new Set();

  private constructor() {}

  static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }
    return WorkerManager.instance;
  }

  async runBenchmark(type: string, payload: any): Promise<any> {
    const workerId = `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create new worker for this benchmark
    const worker = new BenchmarkWorker();
    this.workers.set(workerId, worker);
    this.activeWorkers.add(workerId);

    try {
      const result = await worker.runBenchmark(type, payload);
      return result;
    } finally {
      // Cleanup worker after use
      this.cleanupWorker(workerId);
    }
  }

  private cleanupWorker(workerId: string) {
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.terminate();
      this.workers.delete(workerId);
      this.activeWorkers.delete(workerId);
    }
  }

  cleanup() {
    // Cleanup all active workers
    for (const workerId of this.activeWorkers) {
      this.cleanupWorker(workerId);
    }

    // Clear all references
    this.workers.clear();
    this.activeWorkers.clear();
  }

  getActiveWorkerCount(): number {
    return this.activeWorkers.size;
  }

  getTotalWorkersCreated(): number {
    return this.workers.size;
  }
}
