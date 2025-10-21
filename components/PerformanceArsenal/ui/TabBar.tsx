// components/PerformanceArsenal/ui/TabBar.tsx
import React from 'react';

interface Tab {
  id: string;
  label: string;
  color: string;
  icon: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''} tab-${tab.color}`}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
