// components/PerformanceArsenal/utils/formatters.ts
export function formatTime(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(0)}μs`;
  } else if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

export function formatSpeedup(bun: number, node: number): string {
  const speedup = node / bun;
  return `${speedup.toFixed(1)}×`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
