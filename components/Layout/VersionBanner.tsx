import React from 'react';
import './version-banner.css';

export function VersionBanner() {
  return (
    <div className="version-banner">
      <div className="banner-content">
        <div className="grade-badge">
          <span className="grade-icon">🏆</span>
          A+ Grade
        </div>
        <div className="review-info">
          <span className="review-source">Comprehensive Technical Review</span>
          <span className="review-date">October 2025</span>
        </div>
        <div className="key-metrics">
          <div className="metric">
            <span className="metric-value">1036</span>
            <span className="metric-label">TypeScript Files</span>
          </div>
          <div className="metric">
            <span className="metric-value">500×</span>
            <span className="metric-label">Performance Gain</span>
          </div>
          <div className="metric">
            <span className="metric-value">A+</span>
            <span className="metric-label">Overall Grade</span>
          </div>
        </div>
      </div>
    </div>
  );
}
