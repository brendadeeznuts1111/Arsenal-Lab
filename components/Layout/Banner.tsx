// components/Layout/Banner.tsx
import { useEffect, useState } from 'react';
import './styles.css';

const bannerMessages = [
  {
    icon: '🏠',
    title: 'Arsenal Lab v1.3 Released!',
    description: 'Interactive Bun performance components now available',
    action: 'Star on GitHub!',
    href: 'https://github.com/brendadeeznuts1111/Arsenal-Lab'
  },
  {
    icon: '🚀',
    title: 'Zero-Copy postMessage',
    description: '500× faster worker communication in your components',
    action: 'Try Demo',
    href: '#performance'
  },
  {
    icon: '🗄️',
    title: 'Database Arsenal Complete',
    description: 'SQLite, Redis, WebSocket, S3 - All interactive!',
    action: 'Explore',
    href: '#database'
  },
  {
    icon: '⚡',
    title: '20× Faster Semver',
    description: 'Native Bun.semver implementation showcase',
    action: 'Benchmark',
    href: '#semver'
  },
  {
    icon: '📊',
    title: 'Analytics Integration',
    description: 'Track component usage and performance metrics',
    action: 'Learn More',
    href: 'https://github.com/brendadeeznuts1111/Arsenal-Lab/wiki/Analytics'
  }
];

export function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerMessages.length);
    }, 6000); // Slightly longer for your project
    return () => clearInterval(timer);
  }, []);

  const current = bannerMessages[currentIndex];

  const handleBannerClick = () => {
    if (current.href.startsWith('http')) {
      window.open(current.href, '_blank', 'noopener,noreferrer');
    } else {
      // Handle internal navigation
      document.querySelector(current.href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`arsenal-banner ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="banner-content" onClick={handleBannerClick} style={{ cursor: 'pointer' }}>
        <div className="banner-icon">{current.icon}</div>
        <div className="banner-text">
          <div className="banner-title">{current.title}</div>
          <div className="banner-description">{current.description}</div>
        </div>
        <div className="banner-action">
          {current.action}
        </div>
      </div>

      <div className="banner-controls">
        <div className="banner-dots">
          {bannerMessages.map((_, index) => (
            <button
              key={index}
              className={`banner-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>

        <button
          className="banner-close"
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          aria-label="Close banner"
        >
          ×
        </button>
      </div>
    </div>
  );
}
