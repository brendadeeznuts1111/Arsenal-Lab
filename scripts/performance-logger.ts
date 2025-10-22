#!/usr/bin/env bun

/**
 * Performance Logger for Arsenal Lab
 * Logs performance metrics to console and optionally to external monitoring systems
 */

import { $ } from "bun";

interface PerformanceLogEntry {
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  fps?: number;
  systemLoad?: number[];
  version: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

class PerformanceLogger {
  private intervalId: number | null = null;
  private logInterval: number = 30000; // 30 seconds
  private enableExternalLogging = false;
  private externalEndpoint?: string;

  constructor(options?: {
    logInterval?: number;
    enableExternalLogging?: boolean;
    externalEndpoint?: string;
  }) {
    this.logInterval = options?.logInterval ?? this.logInterval;
    this.enableExternalLogging = options?.enableExternalLogging ?? false;
    this.externalEndpoint = options?.externalEndpoint;
  }

  start(): void {
    console.log("🚀 Performance Logger started - monitoring every", this.logInterval / 1000, "seconds");

    this.intervalId = setInterval(() => {
      this.logPerformanceMetrics();
    }, this.logInterval);

    // Log initial metrics
    this.logPerformanceMetrics();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("🛑 Performance Logger stopped");
    }
  }

  private getPerformanceStatus(memoryUsage: number, fps?: number): PerformanceLogEntry['status'] {
    if ((fps && fps >= 120) || memoryUsage < 50) return 'excellent';
    if ((fps && fps >= 60) || memoryUsage < 100) return 'good';
    if ((fps && fps >= 30) || memoryUsage < 200) return 'fair';
    return 'poor';
  }

  private async logPerformanceMetrics(): Promise<void> {
    try {
      const memUsage = process.memoryUsage();
      const uptime = process.uptime();

      // Try to get FPS from a global reference (if available)
      let fps: number | undefined;
      try {
        // @ts-ignore - This would be set by the performance monitor hook
        if (typeof window !== 'undefined' && window.arsenalPerformanceMonitor) {
          // @ts-ignore
          fps = window.arsenalPerformanceMonitor.fps;
        }
      } catch (error) {
        // FPS not available, continue without it
      }

      // Try to get system load (Bun-specific)
      let systemLoad: number[] | undefined;
      try {
        // @ts-ignore - Bun-specific
        if (typeof Bun !== 'undefined' && Bun?.os?.loadavg) {
          systemLoad = Bun.os.loadavg();
        }
      } catch (error) {
        // System load not available, continue without it
      }

      const memoryUsage = Math.round(memUsage.heapUsed / 1024 / 1024);
      const status = this.getPerformanceStatus(memoryUsage, fps);

      const logEntry: PerformanceLogEntry = {
        timestamp: new Date().toISOString(),
        uptime: Math.round(uptime),
        memory: {
          used: memoryUsage,
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024),
        },
        fps,
        systemLoad,
        version: "Bun v1.3.1-enhanced",
        status,
      };

      // Console logging
      const statusEmoji = {
        excellent: '🚀',
        good: '✅',
        fair: '⚠️',
        poor: '❌',
      }[status];

      console.log(`${statusEmoji} Arsenal Lab Performance:`, {
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        memory: `${memoryUsage} MB`,
        fps: fps ? `${fps} FPS` : 'N/A',
        status: status.toUpperCase(),
        timestamp: new Date().toLocaleTimeString(),
      });

      // External logging (if enabled)
      if (this.enableExternalLogging && this.externalEndpoint) {
        try {
          await fetch(this.externalEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(logEntry),
          });
        } catch (error) {
          console.warn('Failed to send metrics to external endpoint:', error);
        }
      }

    } catch (error) {
      console.error('Performance logging error:', error);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Arsenal Lab Performance Logger

Usage: bun run scripts/performance-logger.ts [options]

Options:
  --interval <ms>       Log interval in milliseconds (default: 30000)
  --external <url>      Enable external logging to specified endpoint
  --help, -h           Show this help message

Examples:
  bun run scripts/performance-logger.ts
  bun run scripts/performance-logger.ts --interval 10000
  bun run scripts/performance-logger.ts --external https://metrics-api.example.com/log
`);
    return;
  }

  const interval = args.includes('--interval')
    ? parseInt(args[args.indexOf('--interval') + 1]) || 30000
    : 30000;

  const externalEndpoint = args.includes('--external')
    ? args[args.indexOf('--external') + 1]
    : undefined;

  const logger = new PerformanceLogger({
    logInterval: interval,
    enableExternalLogging: !!externalEndpoint,
    externalEndpoint,
  });

  console.log("📊 Starting Arsenal Lab Performance Logger");
  console.log(`   Interval: ${interval}ms`);
  console.log(`   External logging: ${externalEndpoint ? 'enabled' : 'disabled'}`);
  console.log("   Press Ctrl+C to stop\n");

  logger.start();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log("\n🛑 Shutting down performance logger...");
    logger.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log("\n🛑 Shutting down performance logger...");
    logger.stop();
    process.exit(0);
  });
}

// Run if called directly
if (import.meta.main) {
  main().catch(console.error);
}

export { PerformanceLogger };
export type { PerformanceLogEntry };
