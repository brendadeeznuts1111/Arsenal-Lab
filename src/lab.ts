// src/lab.ts
// Arsenal Lab - FAANG-grade performance testing suite
import React from 'react';
import ReactDOM from 'react-dom/client';
import { getAnalyticsTracker } from '../components/PerformanceArsenal/utils/analytics';
import { getPerformanceMonitor } from '../components/PerformanceArsenal/utils/performanceObserver';
import { getPrometheusMetrics } from './metrics/arsenal';

// Lab state
let currentTab = 'performance';
let performanceMonitor = getPerformanceMonitor();
let analyticsTracker = getAnalyticsTracker();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('🔧 SW registered:', registration.scope);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                showUpdateNotification();
              }
            });
          }
        });
      })
      .catch(error => {
        console.log('❌ SW registration failed:', error);
      });
  });
}

function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <div class="update-content">
      <span>🔄 Update available!</span>
      <button onclick="window.location.reload()">Refresh</button>
    </div>
  `;
  document.body.appendChild(notification);
}

// Lab UI
function renderLab() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="arsenal-lab">
      <header class="lab-header">
        <div class="lab-title">
          <h1>🚀 Arsenal Lab</h1>
          <p>FAANG-grade performance testing suite</p>
        </div>
        <div class="lab-controls">
          <button onclick="switchTab('performance')" class="${currentTab === 'performance' ? 'active' : ''}">
            ⚡ Performance
          </button>
          <button onclick="switchTab('process')" class="${currentTab === 'process' ? 'active' : ''}">
            🔧 Process & Shell
          </button>
          <button onclick="switchTab('testing')" class="${currentTab === 'testing' ? 'active' : ''}">
            🧪 Testing
          </button>
          <button onclick="switchTab('debugging')" class="${currentTab === 'debugging' ? 'active' : ''}">
            🔍 Testing & Debugging
          </button>
          <button onclick="switchTab('database')" class="${currentTab === 'database' ? 'active' : ''}">
            🗄️ Database & Infra
          </button>
          <button onclick="switchTab('build')" class="${currentTab === 'build' ? 'active' : ''}">
            🔧 Build Config
          </button>
          <button onclick="switchTab('bunx')" class="${currentTab === 'bunx' ? 'active' : ''}">
            🚀 bunx Demo
          </button>
          <button onclick="exportMetrics()">
            📊 Export Metrics
          </button>
        </div>
      </header>

      <main class="lab-content">
        <div id="tab-content"></div>
      </main>

      <footer class="lab-footer">
        <div class="lab-stats">
          <span>FPS: <span id="fps">0</span></span>
          <span>Memory: <span id="memory">0</span> MB</span>
          <span>Analytics: <span id="analytics">${analyticsTracker.isAnalyticsEnabled() ? 'ON' : 'OFF'}</span></span>
        </div>
        <div class="lab-links">
          <a href="https://github.com/oven-sh/bun" target="_blank">GitHub</a>
          <a href="https://bun.sh/docs" target="_blank">Docs</a>
          <a href="https://github.com/oven-sh/bun/issues" target="_blank">Issues</a>
        </div>
      </footer>
    </div>
  `;

  renderTabContent();
  startStatsUpdates();
}

function switchTab(tab: string) {
  currentTab = tab;
  renderLab();
}

function renderTabContent() {
  const content = document.getElementById('tab-content');
  if (!content) return;

  if (currentTab === 'performance') {
    // Mount React Performance Arsenal
    import('../components/PerformanceArsenal').then(({ PerformanceArsenal }) => {
      const root = ReactDOM.createRoot(content);
      root.render(React.createElement(PerformanceArsenal));
    });
  } else if (currentTab === 'process') {
    // Mount React Process & Shell Arsenal
    import('../components/ProcessShellArsenal').then(({ ProcessShellArsenal }) => {
      const root = ReactDOM.createRoot(content);
      root.render(React.createElement(ProcessShellArsenal));
    });
  } else if (currentTab === 'testing') {
    // Mount React Testing Arsenal
    import('../components/TestingArsenal').then(({ TestingArsenal }) => {
      const root = ReactDOM.createRoot(content);
      root.render(React.createElement(TestingArsenal));
    });
  } else if (currentTab === 'debugging') {
    // Mount React Testing & Debugging Arsenal
    import('../components/TestingDebuggingArsenal').then(({ TestingDebuggingArsenal }) => {
      const root = ReactDOM.createRoot(content);
      root.render(React.createElement(TestingDebuggingArsenal));
    });
  } else if (currentTab === 'database') {
    // Mount React Database & Infrastructure Arsenal
    import('../components/DatabaseInfrastructureArsenal').then(({ DatabaseInfrastructureArsenal }) => {
      const root = ReactDOM.createRoot(content);
      root.render(React.createElement(DatabaseInfrastructureArsenal));
    });
  } else if (currentTab === 'build') {
    // Mount React Build Configuration Arsenal
    import('../components/BuildConfigurationArsenal').then(({ BuildConfigurationArsenal }) => {
      const root = ReactDOM.createRoot(content);
      root.render(React.createElement(BuildConfigurationArsenal));
    });
  } else if (currentTab === 'bunx') {
    // Mount React Bunx Demo
    import('../components/BunxDemo').then(({ BunxDemo }) => {
      const root = ReactDOM.createRoot(content);
      root.render(React.createElement(BunxDemo));
    });
  }
}

function startStatsUpdates() {
  setInterval(() => {
    const stats = performanceMonitor.getCurrentStats();

    const fpsEl = document.getElementById('fps');
    const memoryEl = document.getElementById('memory');

    if (fpsEl) fpsEl.textContent = stats.fps.toFixed(0);
    if (memoryEl && stats.usedJSHeapSize) {
      memoryEl.textContent = Math.round(stats.usedJSHeapSize / 1024 / 1024).toString();
    }
  }, 1000);
}

function exportMetrics() {
  // Check if we're in a browser environment
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    console.warn('Export metrics is only available in browser environments');
    return;
  }

  try {
    const metrics = getPrometheusMetrics();
    const blob = new Blob([metrics], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `arsenal-metrics-${Date.now()}.prom`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export metrics:', error);
  }
}

// Initialize lab (only in browser environment)
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  // If DOM is already loaded, initialize immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderLab();

      // Global functions for buttons (only available in browser)
      (window as any).switchTab = switchTab;
      (window as any).exportMetrics = exportMetrics;

      console.log('🎯 Arsenal Lab ready! Use bun run arsenal:ci for automated testing.');
    });
  } else {
    // DOM already loaded
    renderLab();

    // Global functions for buttons (only available in browser)
    (window as any).switchTab = switchTab;
    (window as any).exportMetrics = exportMetrics;

    console.log('🎯 Arsenal Lab ready! Use bun run arsenal:ci for automated testing.');
  }

  // Handle online/offline status (only in browser)
  window.addEventListener('online', () => {
    console.log('🌐 Back online - uploading cached metrics...');
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'sync',
        tag: 'metrics-upload'
      });
    }
  });

  window.addEventListener('offline', () => {
    console.log('📴 Gone offline - metrics will be cached and uploaded when back online.');
  });
} else {
  // Non-browser environment (e.g., Bun CLI)
  console.log('🧪 Arsenal Lab - Browser environment required for interactive features');
  console.log('Run: bun run arsenal:ci for automated testing');
}
