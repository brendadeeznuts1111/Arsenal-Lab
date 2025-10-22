// components/BunxDemo/index.tsx
import React, { useState } from 'react';
import './styles.css';

interface Command {
  id: string;
  name: string;
  description: string;
  example: string;
  icon: string;
}

const bunxCommands: Command[] = [
  {
    id: 'create-react-app',
    name: 'create-react-app',
    description: 'Create a new React application without installing create-react-app',
    example: 'bunx create-react-app my-app',
    icon: '⚛️'
  },
  {
    id: 'vite',
    name: 'create-vite',
    description: 'Scaffold a Vite project instantly',
    example: 'bunx create-vite my-vite-app',
    icon: '⚡'
  },
  {
    id: 'typescript',
    name: 'typescript',
    description: 'Run TypeScript compiler without global installation',
    example: 'bunx tsc --init',
    icon: '📘'
  },
  {
    id: 'prettier',
    name: 'prettier',
    description: 'Format code without installing prettier globally',
    example: 'bunx prettier --write .',
    icon: '✨'
  },
  {
    id: 'eslint',
    name: 'eslint',
    description: 'Lint JavaScript/TypeScript code',
    example: 'bunx eslint --init',
    icon: '🔍'
  },
  {
    id: 'serve',
    name: 'serve',
    description: 'Serve static files instantly',
    example: 'bunx serve ./dist',
    icon: '🌐'
  }
];

export function BunxDemo() {
  const [selectedCommand, setSelectedCommand] = useState<Command>(bunxCommands[0]);
  const [customCommand, setCustomCommand] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bunx-demo">
      <div className="bunx-header">
        <div className="header-content">
          <div className="header-icon">
            <span>🚀</span>
          </div>
          <div>
            <h2>bunx Package Runner</h2>
            <p>Execute npm packages without installation</p>
          </div>
        </div>
        <div className="bunx-badge">
          <span className="badge-icon">⚡</span>
          <span>Zero Installation</span>
        </div>
      </div>

      <div className="bunx-content">
        <div className="bunx-section">
          <h3>What is bunx?</h3>
          <p>
            bunx is Bun's equivalent to npx. It allows you to execute packages from the npm registry
            without installing them globally. Perfect for one-off commands and scaffolding tools.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <h4>Lightning Fast</h4>
              <p>Dramatically faster than npx</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💾</span>
              <h4>Smart Caching</h4>
              <p>Cached packages load instantly</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔒</span>
              <h4>Secure</h4>
              <p>Verified package execution</p>
            </div>
          </div>
        </div>

        <div className="bunx-section">
          <h3>Popular Commands</h3>
          <div className="commands-grid">
            {bunxCommands.map(cmd => (
              <button
                key={cmd.id}
                className={`command-card ${selectedCommand.id === cmd.id ? 'active' : ''}`}
                onClick={() => setSelectedCommand(cmd)}
              >
                <span className="command-icon">{cmd.icon}</span>
                <div className="command-info">
                  <h4>{cmd.name}</h4>
                  <p>{cmd.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bunx-section">
          <h3>Selected Command</h3>
          <div className="command-demo">
            <div className="demo-header">
              <span className="demo-icon">{selectedCommand.icon}</span>
              <div>
                <h4>{selectedCommand.name}</h4>
                <p>{selectedCommand.description}</p>
              </div>
            </div>

            <div className="code-block">
              <div className="code-header">
                <span>Terminal</span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(selectedCommand.example, selectedCommand.id)}
                >
                  {copiedId === selectedCommand.id ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <pre><code>{selectedCommand.example}</code></pre>
            </div>

            <div className="comparison-grid">
              <div className="comparison-card">
                <h5>With npx (Node.js)</h5>
                <pre><code>npx {selectedCommand.name}</code></pre>
                <p className="timing">~2-5 seconds</p>
              </div>
              <div className="comparison-card bunx">
                <h5>With bunx (Bun)</h5>
                <pre><code>bunx {selectedCommand.name}</code></pre>
                <p className="timing">~100-500ms ⚡</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bunx-section">
          <h3>Try Your Own Command</h3>
          <div className="custom-command">
            <input
              type="text"
              placeholder="e.g., bunx cowsay Hello Bun!"
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              className="custom-input"
            />
            <button
              className="execute-button"
              onClick={() => customCommand && copyToClipboard(customCommand, 'custom')}
              disabled={!customCommand}
            >
              {copiedId === 'custom' ? '✓ Copied!' : '📋 Copy Command'}
            </button>
          </div>
          <p className="hint">
            💡 Tip: Any npm package can be executed with bunx. Try popular tools like cowsay, figlet, or http-server!
          </p>
        </div>

        <div className="bunx-section">
          <h3>Key Differences from npx</h3>
          <table className="differences-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>bunx</th>
                <th>npx</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Speed</td>
                <td className="highlight">⚡ 10-20x faster</td>
                <td>Slower</td>
              </tr>
              <tr>
                <td>Cache</td>
                <td className="highlight">Global cache shared</td>
                <td>Separate cache</td>
              </tr>
              <tr>
                <td>Installation</td>
                <td className="highlight">Instant from cache</td>
                <td>Downloads each time</td>
              </tr>
              <tr>
                <td>Compatibility</td>
                <td className="highlight">npm registry compatible</td>
                <td>npm registry</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bunx-section tips">
          <h3>Pro Tips</h3>
          <ul className="tips-list">
            <li>
              <span className="tip-icon">💡</span>
              <div>
                <strong>Use for scaffolding:</strong> Create projects without global tools
                <code>bunx create-next-app@latest</code>
              </div>
            </li>
            <li>
              <span className="tip-icon">💡</span>
              <div>
                <strong>Run one-off scripts:</strong> Execute packages temporarily
                <code>bunx cowsay "Bun is fast!"</code>
              </div>
            </li>
            <li>
              <span className="tip-icon">💡</span>
              <div>
                <strong>Try before you install:</strong> Test tools before adding to package.json
                <code>bunx prettier --check .</code>
              </div>
            </li>
            <li>
              <span className="tip-icon">💡</span>
              <div>
                <strong>Version pinning:</strong> Use specific package versions
                <code>bunx typescript@5.0.0 --init</code>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="bunx-footer">
        <div className="footer-content">
          <p>
            <strong>Ready to try bunx?</strong> Install Bun and start using bunx commands instantly.
          </p>
          <a
            href="https://bun.sh/docs/cli/bunx"
            target="_blank"
            rel="noopener noreferrer"
            className="docs-link"
          >
            📚 Read the bunx Documentation →
          </a>
        </div>
      </div>
    </div>
  );
}
