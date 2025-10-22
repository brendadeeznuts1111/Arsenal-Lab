// components/SecurityArsenal/ui/SeverityFilter.tsx

interface SeverityFilterProps {
  selected: 'all' | 'low' | 'moderate' | 'high' | 'critical';
  onChange: (severity: 'all' | 'low' | 'moderate' | 'high' | 'critical') => void;
  counts?: {
    all: number;
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
}

export function SeverityFilter({ selected, onChange, counts }: SeverityFilterProps) {
  const options = [
    { value: 'all' as const, label: 'All', icon: '📊' },
    { value: 'low' as const, label: 'Low', icon: 'ℹ️' },
    { value: 'moderate' as const, label: 'Moderate', icon: '⚠️' },
    { value: 'high' as const, label: 'High', icon: '🔶' },
    { value: 'critical' as const, label: 'Critical', icon: '🔴' }
  ];

  return (
    <div className="severity-filter">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`severity-option ${selected === option.value ? 'active' : ''}`}
        >
          <span className="severity-icon">{option.icon}</span>
          <span className="severity-label">{option.label}</span>
          {counts && (
            <span className="severity-count">
              {counts[option.value]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
