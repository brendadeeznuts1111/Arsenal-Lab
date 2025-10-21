// components/TestingArsenal/ui/CIDemo.tsx
import React from 'react';
import { CodeBlock } from '../../PerformanceArsenal/ui/CodeBlock';

interface CIDemoProps {
  onRunTest: (name: string, code: string) => void;
}

export function CIDemo({ onRunTest }: CIDemoProps) {
  const githubActionsYml = `name: 🚀 Performance Tests
on:
  pull_request:
    paths: ["components/**", "src/**"]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run arsenal:ci --output-dir ./coverage
      - uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: |
            coverage/junit-bench.xml
            coverage/metrics.prom`;

  const stricterCiTest = `import { test, expect } from "bun:test";

// This test will fail in CI if accidentally focused
test.only("focused test", () => {
  expect(1 + 1).toBe(2);
});

// This will fail in CI without --update-snapshots
test("snapshot test", () => {
  expect({ data: "test" }).toMatchSnapshot();
});`;

  const failingTestExample = `import { test, expect } from "bun:test";

test.failing("known bug - division by zero", () => {
  expect(divide(10, 0)).toBe(Infinity);
});

function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
}

// This test currently fails but is expected to fail
// Remove .failing when the bug is fixed`;

  const runCiSimulation = () => {
    onRunTest('CI Simulation', stricterCiTest);
  };

  const runFailingTestDemo = () => {
    onRunTest('Failing Test Demo', failingTestExample);
  };

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h3>CI/CD Integration</h3>
        <p>Bun 1.3 introduces stricter CI mode with better error reporting, JUnit export, and protections against accidental test commits.</p>
      </div>

      <div className="ci-features">
        <div className="ci-feature-grid">
          <div className="ci-feature">
            <h4>🚫 Stricter CI Mode</h4>
            <ul>
              <li>Blocks <code>test.only()</code> in CI</li>
              <li>Requires <code>--update-snapshots</code> for new snapshots</li>
              <li>Prevents accidental focused tests in PRs</li>
            </ul>
          </div>

          <div className="ci-feature">
            <h4>📊 JUnit Export</h4>
            <ul>
              <li>Native JUnit XML output</li>
              <li>Compatible with all CI systems</li>
              <li>Detailed test failure reports</li>
            </ul>
          </div>

          <div className="ci-feature">
            <h4>📈 Prometheus Metrics</h4>
            <ul>
              <li>Performance metrics export</li>
              <li>Test execution statistics</li>
              <li>CI dashboard integration</li>
            </ul>
          </div>

          <div className="ci-feature">
            <h4>🎯 Expected Failures</h4>
            <ul>
              <li><code>test.failing()</code> for known bugs</li>
              <li>TDD-friendly development</li>
              <li>Tracks expected vs actual failures</li>
            </ul>
          </div>
        </div>

        <div className="ci-demo-controls">
          <button onClick={runCiSimulation} className="ci-demo-btn danger">
            🚫 Test CI Mode
          </button>
          <button onClick={runFailingTestDemo} className="ci-demo-btn warning">
            🎯 Test Failing
          </button>
        </div>
      </div>

      <div className="ci-examples">
        <div className="example-section">
          <h4>GitHub Actions Workflow</h4>
          <CodeBlock
            code={githubActionsYml}
            language="yaml"
            onCopy={() => {}}
          />
        </div>

        <div className="example-section">
          <h4>Stricter CI Mode</h4>
          <CodeBlock
            code={stricterCiTest}
            language="javascript"
            onCopy={() => {}}
          />
          <div className="ci-note">
            <strong>⚠️ CI Behavior:</strong> These tests will fail in CI environments to prevent accidental commits.
          </div>
        </div>

        <div className="example-section">
          <h4>Expected Failures</h4>
          <CodeBlock
            code={failingTestExample}
            language="javascript"
            onCopy={() => {}}
          />
          <div className="ci-note">
            <strong>💡 TDD Pattern:</strong> Write failing tests first, then implement features. Remove <code>.failing</code> when fixed.
          </div>
        </div>
      </div>

      <div className="ci-commands">
        <h4>💻 CLI Commands</h4>
        <div className="command-grid">
          <div className="command-item">
            <code>bun run arsenal:ci</code>
            <span>Run CI test suite with JUnit export</span>
          </div>
          <div className="command-item">
            <code>bun test --only</code>
            <span>Run only focused tests</span>
          </div>
          <div className="command-item">
            <code>bun test --update-snapshots</code>
            <span>Update snapshot files</span>
          </div>
          <div className="command-item">
            <code>CI=false bun test</code>
            <span>Disable strict CI mode</span>
          </div>
        </div>
      </div>

      <div className="ci-best-practices">
        <h4>🚀 CI Best Practices</h4>
        <div className="practices-list">
          <div className="practice-item">
            <span className="practice-icon">🔒</span>
            <div>
              <strong>Use strict CI mode</strong>
              <p>Prevents accidental test.only() or new snapshots in PRs</p>
            </div>
          </div>
          <div className="practice-item">
            <span className="practice-icon">📊</span>
            <div>
              <strong>Export metrics</strong>
              <p>Use JUnit and Prometheus exports for CI dashboards</p>
            </div>
          </div>
          <div className="practice-item">
            <span className="practice-icon">🎯</span>
            <div>
              <strong>TDD with failing tests</strong>
              <p>Use test.failing() for planned features and known bugs</p>
            </div>
          </div>
          <div className="practice-item">
            <span className="practice-icon">⚡</span>
            <div>
              <strong>Concurrent testing</strong>
              <p>Use test.concurrent for I/O-bound test suites</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
