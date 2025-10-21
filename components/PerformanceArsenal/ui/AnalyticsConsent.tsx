// components/PerformanceArsenal/ui/AnalyticsConsent.tsx
import React from 'react';

interface AnalyticsConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function AnalyticsConsent({ onAccept, onDecline }: AnalyticsConsentProps) {
  return (
    <div className="analytics-consent">
      <div className="consent-content">
        <div className="consent-header">
          <span className="consent-icon">📊</span>
          <h3>Analytics Consent</h3>
        </div>

        <div className="consent-body">
          <p>
            Help us improve Bun's performance by sharing anonymous benchmark data.
            We collect performance metrics, benchmark results, and hardware information
            to better understand real-world usage patterns.
          </p>

          <div className="consent-details">
            <h4>What we collect:</h4>
            <ul>
              <li>Benchmark execution times and results</li>
              <li>Hardware specifications (CPU cores, memory)</li>
              <li>Performance metrics (FPS, memory usage)</li>
              <li>Anonymous usage patterns</li>
            </ul>

            <h4>What we don't collect:</h4>
            <ul>
              <li>Personal information or identifiers</li>
              <li>Content of files or data being processed</li>
              <li>Network requests or browsing history</li>
              <li>Location or IP address information</li>
            </ul>
          </div>

          <div className="consent-note">
            <p>
              <strong>Data is processed anonymously and cannot be used to identify you.</strong>
              You can change your consent preference at any time.
            </p>
          </div>
        </div>

        <div className="consent-actions">
          <button
            onClick={onDecline}
            className="consent-button decline"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="consent-button accept"
          >
            Accept Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
