// src/lab-v2.ts - Registry-based Arsenal Lab
// FAANG-grade performance testing suite with modular architecture

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Footer } from '../components/Layout/Footer';
import { getPerformanceMonitor } from '../components/PerformanceArsenal/utils/performanceObserver';
import { getPrometheusMetrics } from './metrics/arsenal';
import { getAllArsenals, type ArsenalId, isValidArsenalId } from './config/arsenal-registry';
import { loadArsenalComponent, preloadArsenals } from './core/arsenal-loader';
import type { ArsenalComponent } from './types/arsenal';

// Lab state
let currentTab: ArsenalId = 'performance';
let performanceMonitor = getPerformanceMonitor();
let arsenals: ArsenalComponent[] = [];
let currentRoot: ReactDOM.Root | null = null;

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

// Initialize arsenal registry
async function initializeArsenals() {
  try {
    arsenals = await getAllArsenals();
    console.log(`✅ Loaded ${arsenals.length} arsenals`);

    // Preload critical arsenals
    await preloadArsenals(['performance', 'testing']);
  } catch (error) {
    console.error('❌ Failed to load arsenals:', error);
  }
}

// Lab UI
async function renderLab() {
  const app = document.getElementById('app');
  if (!app) return;

  // Ensure arsenals are loaded
  if (arsenals.length === 0) {
    await initializeArsenals();
  }

  // Generate tab buttons from registry
  const tabButtons = arsenals
    .map(arsenal => {
      const { id, name, icon } = arsenal.manifest;
      const isActive = currentTab === id;

      return `
        <button
          onclick="switchTab('${id}')"
          class="${isActive ? 'active' : ''}"
          data-arsenal="${id}"
        >
          ${icon} ${name}
        </button>
      `;
    })
    .join('\n');

  app.innerHTML = `
    <div class="arsenal-lab">
      <header class="lab-header">
        <div class="lab-title">
          <h1>🚀 Arsenal Lab</h1>
          <p>FAANG-grade performance testing suite</p>
        </div>
        <div class="lab-controls">
          ${tabButtons}
          <button onclick="exportMetrics()">
            📊 Export Metrics
          </button>
        </div>
      </header>

      <main class="lab-content">
        <div id="tab-content"></div>
      </main>

      <div id="footer-container"></div>

      <style>
        /* Footer Styles */
        .lab-footer {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95));
          color: white;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0 0 1rem 1rem;
        }
        /* ... rest of styles ... */
      </style>
    </div>
  `;

  await renderTabContent();

  // Mount React Footer component
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    const footerRoot = ReactDOM.createRoot(footerContainer);
    footerRoot.render(React.createElement(Footer));
  }

  startStatsUpdates();
}

function switchTab(tab: string) {
  if (!isValidArsenalId(tab)) {
    console.error(`Invalid arsenal ID: ${tab}`);
    return;
  }

  currentTab = tab as ArsenalId;
  renderLab();
}

async function renderTabContent() {
  const content = document.getElementById('tab-content');
  if (!content) return;

  // Show loading state
  content.innerHTML = '<div class="loading">Loading arsenal...</div>';

  try {
    // Load the component using the registry
    const component = await loadArsenalComponent(currentTab);

    // Dispose previous root if it exists
    if (currentRoot) {
      currentRoot.unmount();
    }

    // Create new root and render
    currentRoot = ReactDOM.createRoot(content);
    currentRoot.render(React.createElement(component));
  } catch (error) {
    console.error(`Failed to load arsenal ${currentTab}:`, error);
    content.innerHTML = `
      <div class="error-state">
        <h3>❌ Failed to load ${currentTab}</h3>
        <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="location.reload()">Reload Page</button>
      </div>
    `;
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      await renderLab();

      // Global functions for buttons
      (window as any).switchTab = switchTab;
      (window as any).exportMetrics = exportMetrics;

      console.log('🎯 Arsenal Lab v2.0.0 ready! Registry-based modular architecture.');
    });
  } else {
    // DOM already loaded
    renderLab().then(() => {
      (window as any).switchTab = switchTab;
      (window as any).exportMetrics = exportMetrics;

      console.log('🎯 Arsenal Lab v2.0.0 ready! Registry-based modular architecture.');
    });
  }

  // Handle online/offline status
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
  console.log('🧪 Arsenal Lab v2.0.0 - Browser environment required for interactive features');
  console.log('Run: bun run arsenal:ci for automated testing');
}
