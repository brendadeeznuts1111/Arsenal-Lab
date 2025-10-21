// components/Layout/EnhancedBanner.tsx
import { useEffect, useState } from 'react';
import './styles.css';

export function EnhancedBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [gitHubStars, setGitHubStars] = useState('⭐');

  // Fetch real GitHub stars (optional enhancement)
  useEffect(() => {
    // You could fetch real stars here:
    // fetch('https://api.github.com/repos/brendadeeznuts1111/Arsenal-Lab')
    //   .then(res => res.json())
    //   .then(data => setGitHubStars(`⭐ ${data.stargazers_count}`));
  }, []);

  const projectHighlights = [
    {
      icon: '🏆',
      title: 'Featured Project',
      description: 'Arsenal Lab showcased in Bun community',
      action: 'View Feature',
      href: 'https://github.com/brendadeeznuts1111/Arsenal-Lab#featured'
    },
    {
      icon: '📈',
      title: 'Growing Collection',
      description: '4 complete arsenals with 20+ interactive demos',
      action: 'Browse All',
      href: '#arsenals'
    },
    {
      icon: '🎯',
      title: 'Educational Focus',
      description: 'Making Bun performance features accessible',
      action: 'Learn More',
      href: 'https://github.com/brendadeeznuts1111/Arsenal-Lab#education'
    },
    {
      icon: '🔧',
      title: 'Open Source',
      description: 'MIT licensed - Use in your projects!',
      action: 'Use Now',
      href: 'https://github.com/brendadeeznuts1111/Arsenal-Lab/blob/main/LICENSE'
    }
  ];

  return (
    <div className={`enhanced-banner ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="banner-stats">
        <div className="stat-item">
          <span className="stat-number">4</span>
          <span className="stat-label">Arsenals</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">20+</span>
          <span className="stat-label">Demos</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">20×</span>
          <span className="stat-label">Faster</span>
        </div>
      </div>

      <div className="banner-content">
        {/* Rotating highlights */}
        {projectHighlights.map((highlight, index) => (
          <div
            key={index}
            className={`highlight ${index === currentIndex ? 'active' : ''}`}
            onClick={() => window.open(highlight.href, '_blank')}
          >
            <div className="highlight-icon">{highlight.icon}</div>
            <div className="highlight-text">
              <div className="highlight-title">{highlight.title}</div>
              <div className="highlight-desc">{highlight.description}</div>
            </div>
            <div className="highlight-action">{highlight.action}</div>
          </div>
        ))}
      </div>

      <div className="banner-footer">
        <div className="project-links">
          <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab" target="_blank">
            {gitHubStars}
          </a>
          <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab/fork" target="_blank">
            🍴 Fork
          </a>
          <a href="https://github.com/brendadeeznuts1111/Arsenal-Lab/issues" target="_blank">
            💬 Discuss
          </a>
        </div>

        <button
          className="banner-close"
          onClick={() => setIsVisible(false)}
          aria-label="Close banner"
        >
          ×
        </button>
      </div>
    </div>
  );
}
