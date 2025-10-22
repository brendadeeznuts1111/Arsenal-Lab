// src/lab.ts
// Arsenal Lab - FAANG-grade performance testing suite
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Footer } from '../components/Layout/Footer';
import { getPerformanceMonitor } from '../components/PerformanceArsenal/utils/performanceObserver';
import { getPrometheusMetrics } from './metrics/arsenal';

// Debug logging for browser execution
console.log('🔧 Arsenal Lab script loaded, React available:', typeof React, typeof ReactDOM);

// Lab state
type TabType = 'performance' | 'process' | 'testing' | 'debugging' | 'database' | 'build' | 'bunx' | 'security' | 'package' | 'dashboard' | 'stats' | 'api';
let currentTab: TabType = 'performance';
let performanceMonitor = getPerformanceMonitor();

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
          <button onclick="switchTab('security')" class="${currentTab === 'security' ? 'active' : ''}">
            🔒 Security
          </button>
          <button onclick="switchTab('package')" class="${currentTab === 'package' ? 'active' : ''}">
            📦 Package Mgmt
          </button>
          <button onclick="switchTab('bunx')" class="${currentTab === 'bunx' ? 'active' : ''}">
            🚀 bunx Demo
          </button>
          <button onclick="switchTab('dashboard')" class="${currentTab === 'dashboard' ? 'active' : ''}">
            📊 Dashboard
          </button>
          <button onclick="switchTab('api')" class="${currentTab === 'api' ? 'active' : ''}">
            🚀 API Toolkit
          </button>
          <button onclick="switchTab('stats')" class="${currentTab === 'stats' ? 'active' : ''}">
            📈 Stats
          </button>
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

        .lab-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .lab-stats span {
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .lab-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .lab-links a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .lab-links a:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .link-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        .lab-meta {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .version {
          color: white;
          font-weight: 600;
        }

        .separator {
          color: rgba(255, 255, 255, 0.5);
        }

        .powered-by a {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: color 0.2s;
        }

        .powered-by a:hover {
          color: white;
        }

        .copyright {
          color: rgba(255, 255, 255, 0.7);
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .lab-links {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .lab-stats {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }

          .lab-meta {
            flex-direction: column;
            gap: 0.25rem;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .lab-links a {
            font-size: 0.75rem;
            padding: 0.375rem;
          }

          .link-icon {
            font-size: 0.875rem;
          }
        }
      </style>
    </div>
  `;

  renderTabContent();

  // Mount React Footer component
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    const footerRoot = ReactDOM.createRoot(footerContainer);
    footerRoot.render(React.createElement(Footer));
  }

  startStatsUpdates();
}

function switchTab(tab: TabType) {
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
  } else if (currentTab === 'security') {
    // Mount React Security Arsenal
    import('../components/SecurityArsenal').then(({ SecurityArsenal }) => {
      const root = ReactDOM.createRoot(content);
      root.render(React.createElement(SecurityArsenal));
    });
  } else if (currentTab === 'package') {
    // Mount React Package Management Arsenal
    import('../components/PackageManagementArsenal').then(({ PackageManagementArsenal }) => {
      const root = ReactDOM.createRoot(content);
      root.render(React.createElement(PackageManagementArsenal));
    });
  } else if (currentTab === 'bunx') {
    // Mount React Bunx Demo
    import('../components').then(({ BunxDemo }) => {
      const root = ReactDOM.createRoot(content);
      root.render(React.createElement(BunxDemo));
    });
  } else if (currentTab === 'dashboard') {
    // Mount React Dashboard Arsenal with dynamic import
    console.log('🔧 Dashboard tab clicked, checking React availability...');
    console.log('React on window:', (window as any).React);
    console.log('ReactDOM on window:', (window as any).ReactDOM);

    import('../dashboard-modules/index.tsx').then((module) => {
      console.log('✅ DashboardArsenal module loaded:', module);
      try {
        const DashboardArsenal = module.DashboardArsenal;
        console.log('🔧 DashboardArsenal component:', DashboardArsenal);

        const root = ReactDOM.createRoot(content);
        root.render(React.createElement(DashboardArsenal));
        console.log('🎉 DashboardArsenal rendered successfully');
      } catch (renderError) {
        console.error('❌ Failed to render DashboardArsenal:', renderError);
        const errorMessage = renderError instanceof Error ? renderError.message : String(renderError);
        content.innerHTML = `
          <div style="text-align:center;padding:2rem 1rem;">
            <h2 style="color:#58a6ff;margin-bottom:1rem;">📊 Dashboard Arsenal</h2>
            <p style="color:#8b949e;margin-bottom:2rem;">Enterprise dashboard modules for monitoring, analytics, and administrative controls with real-time metrics.</p>
            <div style="background:#161b22;padding:2rem;border-radius:.5rem;border:1px solid #30363d;max-width:600px;margin:0 auto;">
              <h3 style="color:#ef4444;margin-bottom:1rem;">⚠️ Render Error</h3>
              <p style="color:#8b949e;margin-bottom:1.5rem;">Component loaded but failed to render.</p>
              <div style="background:#0d1117;padding:1rem;border-radius:.375rem;border:1px solid #30363d;">
                <p style="color:#f85149;font-size:.875rem;">Render Error: ${errorMessage}</p>
              </div>
            </div>
          </div>
        `;
      }
    }).catch(error => {
      console.error('Failed to load DashboardArsenal module:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      // Fallback to static content
      content.innerHTML = `
        <div style="text-align:center;padding:2rem 1rem;">
          <h2 style="color:#58a6ff;margin-bottom:1rem;">📊 Dashboard Arsenal</h2>
          <p style="color:#8b949e;margin-bottom:2rem;">Enterprise dashboard modules for monitoring, analytics, and administrative controls with real-time metrics.</p>
          <div style="background:#161b22;padding:2rem;border-radius:.5rem;border:1px solid #30363d;max-width:600px;margin:0 auto;">
            <h3 style="color:#ef4444;margin-bottom:1rem;">⚠️ Module Load Error</h3>
            <p style="color:#8b949e;margin-bottom:1.5rem;">Failed to load the dashboard module.</p>
            <div style="background:#0d1117;padding:1rem;border-radius:.375rem;border:1px solid #30363d;">
              <p style="color:#f85149;font-size:.875rem;">Import Error: ${errorMessage}</p>
              <p style="color:#79c0ff;font-size:.875rem;margin-top:.5rem;">Check network connectivity and module availability.</p>
            </div>
            <div style="margin-top:1rem;padding:1rem;background:#1f2937;border-radius:.375rem;border:1px solid #374151;">
              <h4 style="color:#f97316;margin-bottom:.5rem;">📊 Dashboard Features:</h4>
              <ul style="text-align:left;color:#9ca3af;font-size:.875rem;margin:0;padding-left:1.5rem;">
                <li>Real-time system metrics monitoring</li>
                <li>Performance analytics dashboard</li>
                <li>User activity tracking</li>
                <li>System administration controls</li>
                <li>Alert management system</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    });
  } else if (currentTab === 'api') {
    // Mount React API Arsenal
    import('../components').then(({ APIArsenal }) => {
      const root = ReactDOM.createRoot(content);
      root.render(React.createElement(APIArsenal));
    });
  } else if (currentTab === 'stats') {
    // Mount React Stats Arsenal
    import('../components').then(({ StatsArsenal }) => {
      const root = ReactDOM.createRoot(content);
      root.render(React.createElement(StatsArsenal));
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
  // Make React globally available immediately for dynamic imports
  (window as any).React = React;
  (window as any).ReactDOM = ReactDOM;

  // If DOM is already loaded, initialize immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderLab();

      // Global functions for buttons (only available in browser)
      (window as any).switchTab = switchTab;
      (window as any).exportMetrics = exportMetrics;

      console.log('🎯 Arsenal Lab v1.4.0 ready! Use bun run arsenal:ci for automated testing.');
    });
  } else {
    // DOM already loaded - initialize immediately
    renderLab();

    // Global functions for buttons (only available in browser)
    (window as any).switchTab = switchTab;
    (window as any).exportMetrics = exportMetrics;

    console.log('🎯 Arsenal Lab v1.4.0 ready! Use bun run arsenal:ci for automated testing.');
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
  console.log('🧪 Arsenal Lab v1.4.0 - Browser environment required for interactive features');
  console.log('Run: bun run arsenal:ci for automated testing');
}
