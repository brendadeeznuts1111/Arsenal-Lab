/**
 * Media Sender for Photos and Documents
 *
 * Handles sending benchmark graphs and other media files.
 */

import type { BenchmarkResult } from '../types';

/**
 * Send photo to Telegram
 */
export async function sendPhoto(
  token: string,
  chatId: number,
  photoBuffer: Buffer,
  caption?: string,
  threadId?: number
): Promise<void> {
  // Ensure image is under 10 MB
  if (photoBuffer.length > 10 * 1024 * 1024) {
    throw new Error('Photo exceeds 10 MB limit');
  }

  const formData = new FormData();
  formData.append('chat_id', chatId.toString());
  formData.append('photo', new Blob([photoBuffer]), 'image.png');

  if (caption) {
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');
  }

  if (threadId) {
    formData.append('message_thread_id', threadId.toString());
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendPhoto`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to send photo: ${JSON.stringify(error)}`);
  }
}

/**
 * Send document to Telegram
 */
export async function sendDocument(
  token: string,
  chatId: number,
  documentBuffer: Buffer,
  filename: string,
  caption?: string,
  threadId?: number
): Promise<void> {
  // Ensure document is under 50 MB
  if (documentBuffer.length > 50 * 1024 * 1024) {
    throw new Error('Document exceeds 50 MB limit');
  }

  const formData = new FormData();
  formData.append('chat_id', chatId.toString());
  formData.append('document', new Blob([documentBuffer]), filename);

  if (caption) {
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');
  }

  if (threadId) {
    formData.append('message_thread_id', threadId.toString());
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendDocument`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to send document: ${JSON.stringify(error)}`);
  }
}

/**
 * Generate and send benchmark graph
 *
 * TODO: Implement actual graph generation
 * This is a placeholder that needs a charting library
 */
export async function sendBenchmarkGraph(
  token: string,
  chatId: number,
  graphData: BenchmarkResult[],
  threadId?: number
): Promise<void> {
  // TODO: Generate graph as PNG
  // const imageBuffer = await generateBenchmarkGraph(graphData);

  // For now, throw error indicating this needs implementation
  throw new Error('Graph generation not yet implemented. Needs charting library integration.');

  // When implemented:
  // await sendPhoto(token, chatId, imageBuffer, 'Arsenal Lab Benchmark Results', threadId);
}

/**
 * Placeholder for graph generation
 *
 * TODO: Implement with a charting library like:
 * - chart.js + canvas
 * - plotly
 * - d3.js
 */
async function generateBenchmarkGraph(data: BenchmarkResult[]): Promise<Buffer> {
  // This would generate a PNG chart showing benchmark comparisons
  throw new Error('Not implemented');
}
