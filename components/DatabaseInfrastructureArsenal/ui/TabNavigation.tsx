// components/DatabaseInfrastructureArsenal/ui/TabNavigation.tsx

interface Tab {
  id: string;
  label: string;
  color: string;
  icon: string;
  badge?: string;
  description?: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="tab-navigation">
      <div className="tab-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            data-color={tab.color}
          >
            <div className="tab-content">
              <div className="tab-icon">{tab.icon}</div>
              <div className="tab-text">
                <div className="tab-label">{tab.label}</div>
                {tab.description && (
                  <div className="tab-description">{tab.description}</div>
                )}
              </div>
              {tab.badge && (
                <div className="tab-badge" data-color={tab.color}>
                  {tab.badge}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
