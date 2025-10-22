// src/ui/FlameGraph.tsx
import { useEffect, useRef, useState } from "react";

export interface FlameGraphProps {
  samples: number[];
  width?: number;
  height?: number;
  color?: string;
  title?: string;
  showStats?: boolean;
}


// Simple flame graph renderer using HTML5 Canvas
function renderFlameGraph(
  ctx: CanvasRenderingContext2D,
  samples: number[],
  options: {
    width: number;
    height: number;
    color: string;
  }
) {
  const { width, height, color } = options;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  if (samples.length === 0) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('No samples yet', width / 2, height / 2);
    return;
  }

  // Calculate statistics
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const range = max - min || 1; // Avoid division by zero

  // Create histogram buckets
  const bucketCount = Math.min(50, Math.ceil(Math.sqrt(samples.length)));
  const buckets = new Array(bucketCount).fill(0);
  const bucketWidth = range / bucketCount;

  // Fill buckets
  for (const sample of samples) {
    const bucketIndex = Math.min(bucketCount - 1, Math.floor((sample - min) / bucketWidth));
    buckets[bucketIndex]++;
  }

  // Find max bucket count for scaling
  const maxBucketCount = Math.max(...buckets);

  // Draw flame bars
  const barWidth = width / bucketCount;
  const baseHue = color === '#3b82f6' ? 210 : 120; // Blue or green

  buckets.forEach((count, index) => {
    const x = index * barWidth;
    const barHeight = (count / maxBucketCount) * height;
    const y = height - barHeight;

    // Color based on value (hotter = more red/yellow)
    const intensity = count / maxBucketCount;
    const hue = baseHue + (intensity * 60); // Shift towards red/yellow
    const saturation = 70 + (intensity * 30);
    const lightness = 40 + (intensity * 20);

    ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    ctx.fillRect(x, y, barWidth - 1, barHeight);

    // Add a subtle border
    ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness - 10}%)`;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, barWidth - 1, barHeight);
  });

  // Draw axes and labels
  ctx.strokeStyle = '#6b7280';
  ctx.lineWidth = 1;

  // X-axis
  ctx.beginPath();
  ctx.moveTo(0, height - 1);
  ctx.lineTo(width, height - 1);
  ctx.stroke();

  // Y-axis
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, height);
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#374151';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';

  // Min/Max labels on X-axis
  ctx.fillText(min.toFixed(2) + 'ms', barWidth / 2, height + 12);
  ctx.fillText(max.toFixed(2) + 'ms', width - barWidth / 2, height + 12);

  // Count labels on Y-axis
  ctx.textAlign = 'right';
  ctx.fillText(maxBucketCount.toString(), -5, 12);
  ctx.fillText('0', -5, height - 5);
}

export function FlameGraph({
  samples,
  width = 480,
  height = 120,
  color = '#3b82f6',
  title = 'Flame Graph',
  showStats = true
}: FlameGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState({
    count: 0,
    mean: 0,
    min: 0,
    max: 0,
    p95: 0,
    p99: 0
  });

  useEffect(() => {
    if (samples.length > 0) {
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const sorted = [...samples].sort((a, b) => a - b);
      const p95Index = Math.floor(sorted.length * 0.95);
      const p99Index = Math.floor(sorted.length * 0.99);
      const p95 = sorted[p95Index] ?? 0;
      const p99 = sorted[p99Index] ?? 0;

      setStats({
        count: samples.length,
        mean,
        min: Math.min(...samples),
        max: Math.max(...samples),
        p95,
        p99
      });
    }
  }, [samples]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderFlameGraph(ctx, samples, { width, height, color });
  }, [samples, width, height, color]);

  return (
    <div className="flame-graph-container">
      <div className="flame-graph-header">
        <h4 className="flame-graph-title">{title}</h4>
        {showStats && (
          <div className="flame-graph-stats">
            <span className="stat-item">Samples: {stats.count.toLocaleString()}</span>
            <span className="stat-item">Mean: {stats.mean.toFixed(3)}ms</span>
            <span className="stat-item">Min: {stats.min.toFixed(3)}ms</span>
            <span className="stat-item">Max: {stats.max.toFixed(3)}ms</span>
            <span className="stat-item">P95: {stats.p95.toFixed(3)}ms</span>
            <span className="stat-item">P99: {stats.p99.toFixed(3)}ms</span>
          </div>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="flame-graph-canvas"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      <div className="flame-graph-footer">
        <span className="flame-graph-axis-label">Time (ms)</span>
        <span className="flame-graph-axis-label">Frequency</span>
      </div>
    </div>
  );
}

// Mini version for embedding in cards
export function MiniFlameGraph({ samples, color = '#3b82f6' }: Omit<FlameGraphProps, 'width' | 'height' | 'title' | 'showStats'>) {
  return (
    <FlameGraph
      samples={samples}
      width={200}
      height={60}
      color={color}
      showStats={false}
    />
  );
}
