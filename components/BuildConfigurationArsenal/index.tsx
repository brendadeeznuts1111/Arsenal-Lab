/* ----------  UI: BUILD CONFIGURATION ARSENAL  ---------- */
import { useBuildConfigurationArsenal } from './hooks/useBuildConfigurationArsenal';

export function BuildConfigurationArsenal() {
  const {
    tab,
    setTab,
    config,
    updateEntrypoints,
    updateOutdir,
    updateRoot,
    updateNaming,
    updateEnv,
    updatePackages,
    updateExternal,
    updateConditions,
    updateDefine,
    updateLoader,
    updateBanner,
    updateFooter,
    updateDrop,
    updateJsx,
    updateSourcemap,
    updateMinify,
    updateFormat,
    updateTarget,
    updateSplitting,
    updateBytecode,
    updateThrow,
    generateBuildCode,
    simulateBuild,
    buildOutput
  } = useBuildConfigurationArsenal();

  const tabs = [
    { id: 'core', label: 'Core', icon: '🎯', color: 'blue' },
    { id: 'environment', label: 'Environment', icon: '🌍', color: 'green' },
    { id: 'jsx', label: 'JSX', icon: '⚛️', color: 'purple' },
    { id: 'optimization', label: 'Optimization', icon: '⚡', color: 'orange' },
    { id: 'output', label: 'Output', icon: '📦', color: 'red' },
    { id: 'advanced', label: 'Advanced', icon: '🔬', color: 'gray' }
  ];

  const loaderOptions = [
    { value: 'js', label: 'JavaScript' },
    { value: 'jsx', label: 'JSX' },
    { value: 'ts', label: 'TypeScript' },
    { value: 'tsx', label: 'TypeScript + JSX' },
    { value: 'json', label: 'JSON' },
    { value: 'toml', label: 'TOML' },
    { value: 'file', label: 'File (copy)' },
    { value: 'dataurl', label: 'Data URL (inline)' },
    { value: 'text', label: 'Text' },
    { value: 'css', label: 'CSS' },
    { value: 'napi', label: 'Node-API' },
    { value: 'wasm', label: 'WebAssembly' }
  ];

  const commonDropTargets = [
    'console.log',
    'console.debug',
    'console.info',
    'console.warn',
    'debugger',
    'alert',
    'confirm'
  ];

  return (
    <div className="absolute top-4 right-4 z-20 w-[500px] max-h-[95vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">🔧</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">Build Configuration</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bun Bundler v1.3</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
            Advanced
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
        {tabs.map(tabItem => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id as any)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center ${
              tab === tabItem.id
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{tabItem.icon}</span>
            <span>{tabItem.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Core Configuration */}
        {tab === 'core' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Core Build Options</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Essential configuration for entry points, output directories, and project structure.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entry Points
                </label>
                <div className="space-y-2">
                  {config.entrypoints.map((entry, index) => (
                    <input
                      key={index}
                      type="text"
                      value={entry}
                      onChange={(e) => {
                        const newEntrypoints = [...config.entrypoints];
                        newEntrypoints[index] = e.target.value;
                        updateEntrypoints(newEntrypoints);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                  ))}
                  <button
                    onClick={() => updateEntrypoints([...config.entrypoints, './src/new-entry.ts'])}
                    className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    + Add Entry Point
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Output Directory
                  </label>
                  <input
                    type="text"
                    value={config.outdir}
                    onChange={(e) => updateOutdir(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Root
                  </label>
                  <input
                    type="text"
                    value={config.root}
                    onChange={(e) => updateRoot(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Environment Configuration */}
        {tab === 'environment' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Environment & Packages</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Control environment variables and package handling during bundling.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Environment Variables
                </label>
                <select
                  value={config.env}
                  onChange={(e) => updateEnv(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="inline">Inline all variables</option>
                  <option value="disable">Disable injection</option>
                  <option value="PUBLIC_*">PUBLIC_* prefix only</option>
                  <option value="REACT_APP_*">REACT_APP_* prefix</option>
                  <option value="VITE_*">VITE_* prefix</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Package Handling
                </label>
                <select
                  value={config.packages}
                  onChange={(e) => updatePackages(e.target.value as 'bundle' | 'external')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="bundle">Bundle dependencies</option>
                  <option value="external">Mark all as external</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Conditions
                </label>
                <div className="flex flex-wrap gap-2">
                  {config.conditions.map(condition => (
                    <span
                      key={condition}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-sm"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add condition..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value && !config.conditions.includes(input.value)) {
                        updateConditions([...config.conditions, input.value]);
                        input.value = '';
                      }
                    }
                  }}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* JSX Configuration */}
        {tab === 'jsx' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">JSX Transform Configuration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fine-grained control over JSX compilation and runtime behavior.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Factory Function
                  </label>
                  <input
                    type="text"
                    value={config.jsx.factory}
                    onChange={(e) => updateJsx('factory', e.target.value)}
                    placeholder="React.createElement"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fragment Function
                  </label>
                  <input
                    type="text"
                    value={config.jsx.fragment}
                    onChange={(e) => updateJsx('fragment', e.target.value)}
                    placeholder="React.Fragment"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Import Source
                  </label>
                  <input
                    type="text"
                    value={config.jsx.importSource}
                    onChange={(e) => updateJsx('importSource', e.target.value)}
                    placeholder="react"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Runtime
                  </label>
                  <select
                    value={config.jsx.runtime}
                    onChange={(e) => updateJsx('runtime', e.target.value as 'automatic' | 'classic')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="classic">Classic</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">JSX Runtime Examples</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Automatic Runtime:</strong>
                  <pre className="text-xs mt-1 text-gray-600 dark:text-gray-400">
{`// Input
<div>Hello</div>

// Output
import { jsx as _jsx } from "react/jsx-runtime";
_jsx("div", { children: "Hello" })`}
                  </pre>
                </div>
                <div>
                  <strong>Classic Runtime:</strong>
                  <pre className="text-xs mt-1 text-gray-600 dark:text-gray-400">
{`// Input
<div>Hello</div>

// Output
React.createElement("div", null, "Hello")`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optimization Configuration */}
        {tab === 'optimization' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Optimization & Code Transformation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced code optimization, minification, and transformation options.
              </p>
            </div>

            {/* Minification Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Minification</h4>
              {Object.entries(config.minify).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateMinify(key as any, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {key} minification
                  </span>
                </label>
              ))}
            </div>

            {/* Source Maps */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Source Maps</h4>
              <select
                value={config.sourcemap}
                onChange={(e) => updateSourcemap(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="none">None</option>
                <option value="linked">Linked (.map file)</option>
                <option value="inline">Inline (embedded)</option>
                <option value="external">External</option>
              </select>
            </div>

            {/* Drop Statements */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Drop Statements</h4>
              <div className="grid grid-cols-2 gap-2">
                {commonDropTargets.map(target => (
                  <label key={target} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.drop.includes(target)}
                      onChange={(e) => updateDrop(target, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                      {target}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Banner & Footer */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Banner
                </label>
                <textarea
                  value={config.banner}
                  onChange={(e) => updateBanner(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder='"use client";'
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Footer
                </label>
                <textarea
                  value={config.footer}
                  onChange={(e) => updateFooter(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="// Built with Bun 🚀"
                />
              </div>
            </div>
          </div>
        )}

        {/* Output Configuration */}
        {tab === 'output' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Output Format & Naming</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Control bundle format, target environment, and file naming patterns.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Format */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Module Format
                </label>
                <select
                  value={config.format}
                  onChange={(e) => updateFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="esm">ES Modules (ESM)</option>
                  <option value="cjs">CommonJS (CJS)</option>
                  <option value="iife">IIFE (Browser)</option>
                </select>
              </div>

              {/* Target */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Target Environment
                </label>
                <select
                  value={config.target}
                  onChange={(e) => updateTarget(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="browser">Browser</option>
                  <option value="bun">Bun</option>
                  <option value="node">Node.js</option>
                </select>
              </div>
            </div>

            {/* Code Splitting */}
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={config.splitting}
                  onChange={(e) => updateSplitting(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Code Splitting
                  </span>
                  <p className="text-xs text-gray-500">
                    Split shared code into separate chunks for better caching
                  </p>
                </div>
              </label>
            </div>

            {/* File Naming */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">File Naming Patterns</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Entry Files</label>
                  <input
                    type="text"
                    value={config.naming.entry}
                    onChange={(e) => updateNaming('entry', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Chunks</label>
                  <input
                    type="text"
                    value={config.naming.chunk}
                    onChange={(e) => updateNaming('chunk', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Assets</label>
                  <input
                    type="text"
                    value={config.naming.asset}
                    onChange={(e) => updateNaming('asset', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">Available tokens: [name], [ext], [hash], [dir]</p>
            </div>
          </div>
        )}

        {/* Advanced Configuration */}
        {tab === 'advanced' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Advanced Options</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Experimental and advanced bundling features for power users.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Bytecode Generation</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Generate bytecode for improved startup performance (requires format: "cjs", target: "bun")
                  </p>
                </div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.bytecode}
                    onChange={(e) => updateBytecode(e.target.checked)}
                    className="rounded border-yellow-300"
                  />
                  <span className="text-sm font-medium">Enable</span>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200">Throw on Build Failure</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Reject promises on build failures instead of returning success: false
                  </p>
                </div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.throw}
                    onChange={(e) => updateThrow(e.target.checked)}
                    className="rounded border-red-300"
                  />
                  <span className="text-sm font-medium">Enable</span>
                </label>
              </div>
            </div>

            {/* External Packages */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                External Packages
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {config.external.map(pkg => (
                  <span
                    key={pkg}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm flex items-center gap-1"
                  >
                    {pkg}
                    <button
                      onClick={() => updateExternal(config.external.filter(p => p !== pkg))}
                      className="text-gray-500 hover:text-red-500 text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add external package..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    if (input.value && !config.external.includes(input.value)) {
                      updateExternal([...config.external, input.value]);
                      input.value = '';
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Build Actions */}
      <div className="mt-6 space-y-4">
        <button
          onClick={simulateBuild}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Simulate Build
        </button>

        {/* Build Output */}
        {buildOutput && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Build Output</h4>
            <div className="space-y-2 text-sm">
              {buildOutput.outputs.map((output, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      output.kind === 'entry-point' ? 'bg-green-500' :
                      output.kind === 'chunk' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}></span>
                    <code className="text-gray-700 dark:text-gray-300">{output.path}</code>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {output.size} • {output.hash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Code */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-green-300">Generated Build Configuration</h4>
            <button
              onClick={() => navigator.clipboard.writeText(generateBuildCode())}
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
            >
              Copy Code
            </button>
          </div>
          <pre className="text-green-300 text-xs overflow-x-auto">
            {generateBuildCode()}
          </pre>
        </div>
      </div>
    </div>
  );
}
