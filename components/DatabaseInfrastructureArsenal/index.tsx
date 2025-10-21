// components/DatabaseInfrastructureArsenal/index.tsx
import React, { useCallback, useMemo } from 'react';
import { useDatabaseInfrastructureArsenal } from './hooks/useDatabaseInfrastructureArsenal';
import './styles.css';
import { CodeBlock } from './ui/CodeBlock';
import { LiveRedisDemo } from './ui/LiveRedisDemo';
import { LiveSQLiteDemo } from './ui/LiveSQLiteDemo';
import { TabNavigation } from './ui/TabNavigation';

export function DatabaseInfrastructureArsenal() {
  const {
    tab,
    setTab,
    sqliteConfig,
    setSqliteConfig,
    redisBenchmarks,
    wsConfig,
    setWsConfig,
    s3Config,
    setS3Config,
    generateSQLiteCode,
    generateRedisCode,
    generateWebSocketCode,
    generateS3Code
  } = useDatabaseInfrastructureArsenal();

  const tabs = useMemo(() => [
    {
      id: 'sqlite' as const,
      label: 'SQLite',
      color: 'blue',
      icon: '🗄️',
      badge: 'v1.3',
      description: 'Enhanced serialization & type introspection'
    },
    {
      id: 'redis' as const,
      label: 'Redis',
      color: 'red',
      icon: '🔴',
      badge: '7.9× faster',
      description: 'First-class Redis/Valkey client'
    },
    {
      id: 'websocket' as const,
      label: 'WebSocket',
      color: 'green',
      icon: '🔄',
      badge: 'RFC 6455',
      description: 'Compression & protocol negotiation'
    },
    {
      id: 's3' as const,
      label: 'S3',
      color: 'orange',
      icon: '☁️',
      badge: 'Enhanced',
      description: 'Storage classes & virtual hosting'
    }
  ], []);

  const handleSQLiteConfigChange = useCallback((key: string, value: boolean) => {
    setSqliteConfig(prev => ({
      ...prev,
      deserializeOptions: {
        ...prev.deserializeOptions,
        [key]: value
      }
    }));
  }, [setSqliteConfig]);

  const handleWebSocketConfigChange = useCallback((updates: Partial<typeof wsConfig>) => {
    setWsConfig(prev => ({ ...prev, ...updates }));
  }, [setWsConfig]);

  const handleS3ConfigChange = useCallback((updates: Partial<typeof s3Config>) => {
    setS3Config(prev => ({ ...prev, ...updates }));
  }, [setS3Config]);

  return (
    <div className="database-arsenal">
      {/* Header */}
      <div className="arsenal-header">
        <div className="header-content">
          <div className="header-icon">
            <div className="icon-wrapper">
              <span className="icon">🗄️</span>
            </div>
          </div>
          <div className="header-text">
            <h1 className="title">Database & Infrastructure</h1>
            <p className="subtitle">Bun v1.3 Production Enhancements</p>
          </div>
        </div>
        <div className="header-badges">
          <div className="badge production">Production Ready</div>
          <div className="badge performance">7.9× Faster</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
      />

      {/* Tab Content */}
      <div className="tab-content">
        {tab === 'sqlite' && (
          <SQLiteTab
            config={sqliteConfig}
            onConfigChange={handleSQLiteConfigChange}
            onGenerateCode={generateSQLiteCode}
          />
        )}

        {tab === 'redis' && (
          <RedisTab
            benchmarks={redisBenchmarks}
            onGenerateCode={generateRedisCode}
          />
        )}

        {tab === 'websocket' && (
          <WebSocketTab
            config={wsConfig}
            onConfigChange={handleWebSocketConfigChange}
            onGenerateCode={generateWebSocketCode}
          />
        )}

        {tab === 's3' && (
          <S3Tab
            config={s3Config}
            onConfigChange={handleS3ConfigChange}
            onGenerateCode={generateS3Code}
          />
        )}
      </div>
    </div>
  );
}

// Polished SQLite Tab Component
const SQLiteTab = React.memo(({ config, onConfigChange, onGenerateCode }: any) => {
  const options = [
    {
      key: 'readonly',
      label: 'Read Only',
      description: 'Open database in read-only mode',
      enabled: config.deserializeOptions.readonly
    },
    {
      key: 'strict',
      label: 'Strict Mode',
      description: 'Enable strict type checking',
      enabled: config.deserializeOptions.strict
    },
    {
      key: 'safeIntegers',
      label: 'Safe Integers',
      description: 'Use BigInt for large integers',
      enabled: config.deserializeOptions.safeIntegers
    }
  ];

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>SQLite Enhancements</h2>
        <p>Advanced serialization, type introspection, and configuration options</p>
      </div>

      <div className="configuration-grid">
        <div className="config-section">
          <h3 className="section-title">
            <span className="icon">⚙️</span>
            Deserialization Options
          </h3>
          <div className="options-grid">
            {options.map((option) => (
              <div key={option.key} className="option-card">
                <label className="option-label">
                  <input
                    type="checkbox"
                    checked={option.enabled}
                    onChange={(e) => onConfigChange(option.key, e.target.checked)}
                    className="option-checkbox"
                  />
                  <div className="option-content">
                    <div className="option-title">{option.label}</div>
                    <div className="option-description">{option.description}</div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="config-section">
          <h3 className="section-title">
            <span className="icon">🔍</span>
            Type Introspection
          </h3>
          <div className="type-comparison">
            <div className="type-column">
              <div className="type-header">Declared Types</div>
              <div className="type-values">
                {config.columnTypes.declaredTypes.map((type: string, index: number) => (
                  <div key={index} className="type-value declared">
                    {type}
                  </div>
                ))}
              </div>
              <div className="type-caption">Schema definition</div>
            </div>
            <div className="type-column">
              <div className="type-header">Actual Types</div>
              <div className="type-values">
                {config.columnTypes.actualTypes.map((type: string, index: number) => (
                  <div key={index} className="type-value actual">
                    {type}
                  </div>
                ))}
              </div>
              <div className="type-caption">Storage class</div>
            </div>
          </div>
        </div>
      </div>

      <LiveSQLiteDemo />

      <CodeBlock
        code={onGenerateCode()}
        language="typescript"
        title="Production Code Example"
        onCopy={() => navigator.clipboard.writeText(onGenerateCode())}
      />
    </div>
  );
});

// Polished Redis Tab Component
const RedisTab = React.memo(({ benchmarks, onGenerateCode }: any) => {
  const features = [
    '66 supported commands',
    'Automatic reconnection',
    'Command timeout handling',
    'Message queuing',
    'Pub/Sub with duplicate connections'
  ];

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>Redis Client</h2>
        <p>First-class Redis/Valkey support with 7.9× better performance</p>
      </div>

      <div className="performance-section">
        <h3 className="section-title">
          <span className="icon">🚀</span>
          Performance Benchmarks
        </h3>
        <div className="benchmark-grid">
          {benchmarks.map((benchmark: any, index: number) => (
            <PerformanceMetric
              key={index}
              operation={benchmark.operation}
              bunTime={benchmark.bun}
              nodeTime={benchmark.ioredis}
              speedup={benchmark.speedup}
            />
          ))}
        </div>
      </div>

      <div className="features-section">
        <h3 className="section-title">
          <span className="icon">✅</span>
          Features
        </h3>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <span className="feature-icon">✓</span>
              <span className="feature-text">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <LiveRedisDemo />

      <CodeBlock
        code={onGenerateCode()}
        language="typescript"
        title="Redis Implementation Example"
        onCopy={() => navigator.clipboard.writeText(onGenerateCode())}
      />
    </div>
  );
});

// Polished WebSocket Tab Component
const WebSocketTab = React.memo(({ config, onConfigChange, onGenerateCode }: any) => {
  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>WebSocket RFC 6455</h2>
        <p>Enhanced protocol negotiation, compression, and custom headers</p>
      </div>

      <div className="configuration-grid">
        <div className="config-section">
          <h3 className="section-title">
            <span className="icon">🔄</span>
            Subprotocol Negotiation
          </h3>
          <div className="protocol-grid">
            {config.subprotocols.map((protocol: string) => (
              <button
                key={protocol}
                onClick={() => onConfigChange({ selectedProtocol: protocol })}
                className={`protocol-button ${
                  config.selectedProtocol === protocol ? 'active' : ''
                }`}
              >
                {protocol}
              </button>
            ))}
          </div>
          <div className="protocol-info">
            Selected: <code>{config.selectedProtocol}</code>
          </div>
        </div>

        <div className="config-section">
          <h3 className="section-title">
            <span className="icon">💨</span>
            Compression
          </h3>
          <div className="toggle-section">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={config.compression}
                onChange={(e) => onConfigChange({ compression: e.target.checked })}
                className="toggle-input"
              />
              <div className="toggle-content">
                <div className="toggle-title">permessage-deflate</div>
                <div className="toggle-description">
                  Reduces message sizes by 60-80% for repetitive data
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="headers-section">
        <h3 className="section-title">
          <span className="icon">📋</span>
          Custom Headers
        </h3>
        <div className="headers-grid">
          {Object.entries(config.customHeaders).map(([key, value]) => (
            <div key={key} className="header-item">
              <div className="header-key">{key}:</div>
              <div className="header-value">{value as string}</div>
            </div>
          ))}
        </div>
      </div>

      <CodeBlock
        code={onGenerateCode()}
        language="typescript"
        title="WebSocket Client Example"
        onCopy={() => navigator.clipboard.writeText(onGenerateCode())}
      />
    </div>
  );
});

// Polished S3 Tab Component
const S3Tab = React.memo(({ config, onConfigChange, onGenerateCode }: any) => {
  const storageClasses = [
    { value: 'STANDARD', label: 'Standard', description: 'General purpose' },
    { value: 'STANDARD_IA', label: 'Standard IA', description: 'Infrequent access' },
    { value: 'GLACIER', label: 'Glacier', description: 'Archive storage' },
    { value: 'DEEP_ARCHIVE', label: 'Deep Archive', description: 'Long-term archive' }
  ];

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>S3 Client Enhancements</h2>
        <p>List operations, storage classes, and virtual hosted-style URLs</p>
      </div>

      <div className="configuration-grid">
        <div className="config-section">
          <h3 className="section-title">
            <span className="icon">💾</span>
            Storage Classes
          </h3>
          <div className="storage-grid">
            {storageClasses.map((storage) => (
              <button
                key={storage.value}
                onClick={() => onConfigChange({ selectedStorageClass: storage.value })}
                className={`storage-button ${
                  config.selectedStorageClass === storage.value ? 'active' : ''
                }`}
              >
                <div className="storage-label">{storage.label}</div>
                <div className="storage-description">{storage.description}</div>
              </button>
            ))}
          </div>
          <div className="storage-info">
            Selected: <code>{config.selectedStorageClass}</code>
          </div>
        </div>

        <div className="config-section">
          <h3 className="section-title">
            <span className="icon">🌐</span>
            URL Style
          </h3>
          <div className="toggle-section">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={config.virtualHostedStyle}
                onChange={(e) => onConfigChange({ virtualHostedStyle: e.target.checked })}
                className="toggle-input"
              />
              <div className="toggle-content">
                <div className="toggle-title">Virtual Hosted-Style URLs</div>
                <div className="toggle-description">
                  {config.virtualHostedStyle
                    ? 'https://bucket.s3.region.amazonaws.com/key'
                    : 'https://s3.region.amazonaws.com/bucket/key'
                  }
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h3 className="section-title">
          <span className="icon">📜</span>
          ListObjectsV2 Support
        </h3>
        <div className="code-preview">
          <pre className="preview-code">
{`const objects = await s3.list({
  prefix: "uploads/",
  maxKeys: 100
});`}
          </pre>
        </div>
      </div>

      <CodeBlock
        code={onGenerateCode()}
        language="typescript"
        title="S3 Client Implementation"
        onCopy={() => navigator.clipboard.writeText(onGenerateCode())}
      />
    </div>
  );
});
