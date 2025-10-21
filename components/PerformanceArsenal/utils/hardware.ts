// components/PerformanceArsenal/utils/hardware.ts
export function getHardwareInfo() {
  // Check if we're in a browser environment
  const isBrowser = typeof navigator !== 'undefined' && typeof performance !== 'undefined';

  const cores = isBrowser ? (navigator.hardwareConcurrency || 4) : 4;
  const isLowEnd = cores <= 2;

  // Try to get memory info (only available in some browsers)
  let memory = 'Unknown';
  if (isBrowser && performance.memory) {
    memory = `${Math.round((performance.memory as any).totalJSHeapSize / 1024 / 1024)} MB`;
  }

  return {
    cores,
    isLowEnd,
    memory
  };
}
