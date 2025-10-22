// components/ProcessShellArsenal/hooks/useProcessShellArsenal.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { copyToClipboard } from '../../PerformanceArsenal/utils/copyToClipboard';
import { getHardwareInfo } from '../../PerformanceArsenal/utils/hardware';
import { runBufferBenchmark } from '../benchmarks/buffer';
import { runMemoryBenchmark } from '../benchmarks/memory';
import { runStreamBenchmark } from '../benchmarks/streams';
import { runTimeoutBenchmark } from '../benchmarks/timeout';
import { simulateSocketInfo } from '../utils/socketSimulator';

export function useProcessShellArsenal() {
  const [tab, setTab] = useState<'timeout' | 'buffer' | 'socket' | 'streams' | 'memory'>('timeout');
  const [timeoutValue, setTimeoutValue] = useState(1000);
  const [maxBufferSize, setMaxBufferSize] = useState(1024 * 1024);
  const [isRunning, setIsRunning] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<any>(null);
  const [hardwareInfo, setHardwareInfo] = useState(getHardwareInfo());
  void setHardwareInfo; // Explicitly ignore unused variable

  const [processStats, setProcessStats] = useState({
    memoryUsage: 0,
    cpuUsage: 0,
    activeProcesses: 0
  });
  const [socketInfo, setSocketInfo] = useState(simulateSocketInfo());

  const intervalRef = useRef<NodeJS.Timeout>();

  // Live process monitoring
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProcessStats({
        memoryUsage: Math.random() * 100,
        cpuUsage: Math.random() * 100,
        activeProcesses: Math.floor(Math.random() * 10) + 1
      });

      // Simulate socket info updates
      if (tab === 'socket') {
        setSocketInfo(simulateSocketInfo());
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tab]);

  const runBenchmark = useCallback(async (type: string) => {
    setIsRunning(true);
    try {
      let results;
      switch (type) {
        case 'timeout':
          results = await runTimeoutBenchmark(timeoutValue);
          break;
        case 'buffer':
          results = await runBufferBenchmark(maxBufferSize);
          break;
        case 'streams':
          results = await runStreamBenchmark();
          break;
        case 'memory':
          results = await runMemoryBenchmark();
          break;
      }
      setBenchmarkResults(results);
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      setIsRunning(false);
    }
  }, [timeoutValue, maxBufferSize]);

  const copyCode = useCallback(async (code: string) => {
    try {
      await copyToClipboard(code);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw error;
    }
  }, []);

  return {
    tab,
    setTab,
    timeoutValue,
    setTimeoutValue,
    maxBufferSize,
    setMaxBufferSize,
    isRunning,
    benchmarkResults,
    runBenchmark,
    copyCode,
    hardwareInfo,
    processStats,
    socketInfo
  };
}
