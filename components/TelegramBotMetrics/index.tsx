/**
 * Telegram Bot Metrics Component
 *
 * Displays live metrics from the Telegram bot
 */

import React, { useState, useEffect } from 'react';
import './styles.css';

interface BotMetrics {
  commandsProcessed: number;
  uniqueUsers: number;
  averageResponseTime: number;
  errorsEncountered: number;
  lastUpdated: string;
  uptime: number;
  version: string;
  runtimeInfo: {
    bunVersion: string;
    platform: string;
    architecture: string;
  };
}

export function TelegramBotMetrics() {
  const [metrics, setMetrics] = useState<BotMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchMetrics() {
    try {
      const response = await fetch(
        'https://brendadeeznuts1111.github.io/Arsenal-Lab/metrics/metrics.json'
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }

  function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  function formatLastUpdated(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="telegram-bot-metrics loading">
        <div className="metrics-header">
          <h3>🤖 Telegram Bot Metrics</h3>
        </div>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="telegram-bot-metrics error">
        <div className="metrics-header">
          <h3>🤖 Telegram Bot Metrics</h3>
        </div>
        <div className="error-message">
          {error || 'No metrics available'}
        </div>
        <a
          href="https://t.me/arsenallab_bot"
          className="bot-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Try the Bot
        </a>
      </div>
    );
  }

  return (
    <div className="telegram-bot-metrics">
      <div className="metrics-header">
        <h3>🤖 Telegram Bot Metrics</h3>
        <span className="live-indicator">
          <span className="pulse"></span>
          Live
        </span>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.commandsProcessed.toLocaleString()}</div>
            <div className="metric-label">Commands Processed</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.uniqueUsers.toLocaleString()}</div>
            <div className="metric-label">Unique Users</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <div className="metric-value">
              {metrics.averageResponseTime > 0
                ? `${metrics.averageResponseTime.toFixed(0)}ms`
                : '—'}
            </div>
            <div className="metric-label">Avg Response Time</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔥</div>
          <div className="metric-content">
            <div className="metric-value">{formatUptime(metrics.uptime)}</div>
            <div className="metric-label">Uptime</div>
          </div>
        </div>
      </div>

      <div className="metrics-footer">
        <div className="runtime-info">
          <span>Bun {metrics.runtimeInfo.bunVersion}</span>
          <span>•</span>
          <span>v{metrics.version}</span>
        </div>
        <div className="last-updated">
          Updated {formatLastUpdated(metrics.lastUpdated)}
        </div>
      </div>

      <div className="bot-actions">
        <a
          href="https://t.me/arsenallab_bot"
          className="bot-link primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          🤖 Try the Bot
        </a>
        <a
          href="https://t.me/arsenallab"
          className="bot-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          💬 Join Group
        </a>
        <a
          href="https://t.me/arsenallab_channel"
          className="bot-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          📢 Channel
        </a>
      </div>
    </div>
  );
}
