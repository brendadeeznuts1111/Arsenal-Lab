// components/Layout/Footer.tsx
import { useEffect, useState } from 'react';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';
import './styles.css';

export function Footer() {
  const { fps, memoryUsage, analyticsEnabled, toggleAnalytics } = usePerformanceMonitor();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="arsenal-footer">
      <div className="footer-section">
        <div className="performance-metrics">
          <div className="metric">
            <span className="metric-label">FPS</span>
            <span className="metric-value">{fps}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Memory</span>
            <span className="metric-value">{memoryUsage} MB</span>
          </div>
          <div className="metric">
            <span className="metric-label">Time</span>
            <span className="metric-value">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="analytics-toggle">
          <button
            onClick={toggleAnalytics}
            className={`analytics-button ${analyticsEnabled ? 'enabled' : 'disabled'}`}
          >
            <span className="analytics-dot"></span>
            Analytics {analyticsEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="footer-section">
        <div className="footer-links">
          {/* 🏠 YOUR REPOSITORY */}
          <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab" target="_blank" rel="noopener noreferrer">
            <span className="link-icon">🏠</span>
            Arsenal Lab
          </a>

          {/* 🐛 YOUR ISSUES */}
          <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab/issues" target="_blank" rel="noopener noreferrer">
            <span className="link-icon">🐛</span>
            Issues
          </a>

          {/* 🤖 TELEGRAM BOT */}
          <a href="https://t.me/arsenallab_bot" target="_blank" rel="noopener noreferrer">
            <span className="link-icon">🤖</span>
            Telegram Bot
          </a>

          {/* 📡 TELEGRAM SUPERGROUP */}
          <a href="https://t.me/arsenallab" target="_blank" rel="noopener noreferrer">
            <span className="link-icon">📡</span>
            Telegram Group
          </a>

          {/* 📢 TELEGRAM CHANNEL */}
          <a href="https://t.me/arsenallab_channel" target="_blank" rel="noopener noreferrer">
            <span className="link-icon">📢</span>
            Telegram Channel
          </a>

          {/* 🔧 YOUR API REFERENCE */}
          <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab/blob/main/docs/api.md" target="_blank" rel="noopener noreferrer">
            <span className="link-icon">🔧</span>
            API Reference
          </a>

          {/* ⚡ YOUR PERFORMANCE GUIDE */}
          <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab/blob/main/docs/performance.md" target="_blank" rel="noopener noreferrer">
            <span className="link-icon">⚡</span>
            Performance Guide
          </a>

          {/* 📋 YOUR MIGRATION GUIDE */}
          <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab/blob/main/docs/migration.md" target="_blank" rel="noopener noreferrer">
            <span className="link-icon">📋</span>
            Migration Guide
          </a>

          {/* 🤝 YOUR CONTRIBUTING GUIDE */}
          <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab#-contributing" target="_blank" rel="noopener noreferrer">
            <span className="link-icon">🤝</span>
            Contributing
          </a>
        </div>

        <div className="footer-meta">
          <span className="version">Arsenal Lab v1.3.0</span>
          <span className="separator">•</span>
          <span className="copyright">© 2024 brendadeeznuts1111</span>
        </div>
      </div>

      <div className="footer-section">
        <div className="shortcuts">
          <div className="shortcut-group">
            <span className="shortcut-label">Quick Links</span>
            <div className="shortcut-list">
              <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab#-installation" target="_blank">Installation Guide</a>
              <br />
              <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab#-contributing" target="_blank">Contributing Guide</a>
              <br />
              <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab#-arsenal-collection" target="_blank">Arsenal Collection</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
