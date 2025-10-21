
interface BunxDemoProps {
  className?: string;
}

export function BunxDemo({ className = '' }: BunxDemoProps) {
  const commands = [
    {
      cmd: 'bunx @bun/performance-arsenal',
      desc: 'Launch interactive lab',
      icon: '🚀'
    },
    {
      cmd: 'bunx @bun/performance-arsenal --ci',
      desc: 'Run CI benchmarks',
      icon: '📊'
    },
    {
      cmd: 'bunx tsc --noEmit',
      desc: 'Type check without installation',
      icon: '🔍'
    },
    {
      cmd: 'bunx eslint .',
      desc: 'Lint without dependencies',
      icon: '🧹'
    },
    {
      cmd: 'bunx prettier --check .',
      desc: 'Check formatting',
      icon: '💅'
    }
  ];

  const handleCopy = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      // You could add a toast notification here
      console.log(`Copied: ${command}`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className={`bunx-demo ${className}`}>
      <div className="demo-header">
        <h3 className="demo-title">
          <span className="demo-icon">🚀</span>
          bunx Commands Ready
        </h3>
        <p className="demo-subtitle">
          Zero-install package execution - Instant access to development tools
        </p>
      </div>

      <div className="commands-grid">
        {commands.map((command, index) => (
          <div key={index} className="command-card">
            <div className="command-header">
              <span className="command-icon">{command.icon}</span>
              <div className="command-description">{command.desc}</div>
            </div>
            <code className="command-code">{command.cmd}</code>
            <button
              onClick={() => handleCopy(command.cmd)}
              className="copy-btn"
              title="Copy to clipboard"
            >
              📋 Copy
            </button>
          </div>
        ))}
      </div>

      <div className="performance-comparison">
        <h4 className="comparison-title">⚡ Performance Benefits</h4>
        <div className="comparison-table">
          <div className="comparison-row">
            <div className="scenario">First run</div>
            <div className="traditional">45s (download + install)</div>
            <div className="bunx">15s (download only)</div>
            <div className="improvement">3x faster</div>
          </div>
          <div className="comparison-row">
            <div className="scenario">Subsequent runs</div>
            <div className="traditional">5s (local node_modules)</div>
            <div className="bunx">1s (bun cache)</div>
            <div className="improvement">5x faster</div>
          </div>
          <div className="comparison-row">
            <div className="scenario">CI pipeline</div>
            <div className="traditional">60s (install deps)</div>
            <div className="bunx">5s (direct execution)</div>
            <div className="improvement">12x faster</div>
          </div>
        </div>
      </div>

      <div className="usage-examples">
        <h4 className="examples-title">📖 Usage Examples</h4>
        <div className="examples-grid">
          <div className="example-item">
            <code>bunx @bun/performance-arsenal --ci database</code>
            <div className="example-desc">Run database benchmarks</div>
          </div>
          <div className="example-item">
            <code>bunx @bun/performance-arsenal --benchmark redis</code>
            <div className="example-desc">Test Redis performance</div>
          </div>
          <div className="example-item">
            <code>cd my-project && bunx tsc --noEmit</code>
            <div className="example-desc">Type check without installing TypeScript</div>
          </div>
        </div>
      </div>

      <style>{`
        .bunx-demo {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px) saturate(180%);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .demo-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .demo-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .demo-subtitle {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }

        .commands-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .command-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(229, 231, 235, 0.5);
          transition: all 0.2s ease;
        }

        .command-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .command-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .command-icon {
          font-size: 1.25rem;
        }

        .command-description {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .command-code {
          display: block;
          background: #f8fafc;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          margin-bottom: 0.75rem;
          word-break: break-all;
        }

        .copy-btn {
          width: 100%;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .copy-btn:hover {
          background: #2563eb;
        }

        .performance-comparison {
          margin-bottom: 2rem;
        }

        .comparison-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .comparison-table {
          background: white;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .comparison-row {
          display: grid;
          grid-template-columns: 2fr 2fr 2fr 1fr;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f3f4f6;
          align-items: center;
        }

        .comparison-row:last-child {
          border-bottom: none;
        }

        .scenario {
          font-weight: 500;
          color: #1f2937;
        }

        .traditional {
          color: #dc2626;
          font-size: 0.875rem;
        }

        .bunx {
          color: #059669;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .improvement {
          color: #7c3aed;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .usage-examples {
          margin-bottom: 1rem;
        }

        .examples-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .examples-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .example-item {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }

        .example-item code {
          display: block;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          color: #1f2937;
          margin-bottom: 0.25rem;
          word-break: break-all;
        }

        .example-desc {
          font-size: 0.75rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .bunx-demo {
            padding: 1rem;
          }

          .commands-grid {
            grid-template-columns: 1fr;
          }

          .comparison-row {
            grid-template-columns: 1fr;
            gap: 0.25rem;
          }

          .comparison-row > div {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
