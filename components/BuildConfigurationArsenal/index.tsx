/* ----------  UI: BUILD CONFIGURATION ARSENAL  ---------- */
import { useState } from 'react';
import { useBackendIntegration, type BuildConfiguration, type BuildHistory } from './hooks/useBackendIntegration';
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
    updateIgnoreDCEAnnotations,
    updateEmitDCEAnnotations,
    // CLI-specific updaters
    updateProduction,
    updateWatch,
    updateNoClearScreen,
    updateReactFastRefresh,
    updateCompile,
    updateCompileExecArgv,
    generateBuildCode,
    generateCliCommand,
    simulateBuild,
    buildOutput
  } = useBuildConfigurationArsenal();

  // Backend integration
  const backend = useBackendIntegration();
  const [savedConfigs, setSavedConfigs] = useState<BuildConfiguration[]>([]);
  const [buildHistory, setBuildHistory] = useState<BuildHistory[]>([]);
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Load saved configurations
  const loadSavedConfigs = async () => {
    try {
      const configs = await backend.loadConfigurations();
      setSavedConfigs(configs);
    } catch (error) {
      console.error('Failed to load configurations:', error);
    }
  };

  // Save current configuration
  const saveCurrentConfig = async () => {
    if (!configName.trim()) return;

    try {
      const id = await backend.saveConfiguration(config, {
        name: configName,
        description: configDescription,
        presetType: 'custom',
        isPublic,
        isTemplate: false,
      });

      await loadSavedConfigs();
      setConfigName('');
      setConfigDescription('');
      setIsPublic(false);
      alert(`Configuration saved with ID: ${id}`);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration');
    }
  };

  // Execute build with backend
  const executeBuildWithBackend = async () => {
    try {
      const buildId = await backend.executeBuild('current-session', {
        build_name: `Build ${new Date().toLocaleString()}`,
        input_files: config.entrypoints,
        user_id: 'demo-user',
      });

      alert(`Build started with ID: ${buildId}`);
      // In a real app, you'd poll for status updates
    } catch (error) {
      console.error('Failed to execute build:', error);
      alert('Failed to execute build');
    }
  };

  // Load build history
  const loadBuildHistory = async () => {
    try {
      const history = await backend.getBuildHistory(undefined, 'demo-user');
      setBuildHistory(history);
    } catch (error) {
      console.error('Failed to load build history:', error);
    }
  };

  // Explicitly ignore unused variables
  void updateDefine;
  void updateLoader;
  void _loaderOptions;

  const tabs = [
    { id: 'core', label: 'Core', icon: '🎯', color: 'blue' },
    { id: 'environment', label: 'Environment', icon: '🌍', color: 'green' },
    { id: 'jsx', label: 'JSX', icon: '⚛️', color: 'purple' },
    { id: 'optimization', label: 'Optimization', icon: '⚡', color: 'orange' },
    { id: 'output', label: 'Output', icon: '📦', color: 'red' },
    { id: 'advanced', label: 'Advanced', icon: '🔬', color: 'gray' },
    { id: 'cli', label: 'CLI', icon: '💻', color: 'teal' },
    { id: 'cloud', label: 'Cloud', icon: '☁️', color: 'cyan' }
  ];

  const _loaderOptions = [
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

              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div>
                  <h4 className="font-medium text-purple-800 dark:text-purple-200">Ignore DCE Annotations</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Skip dead code elimination annotations like @__PURE__ and package.json sideEffects
                  </p>
                </div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.ignoreDCEAnnotations}
                    onChange={(e) => updateIgnoreDCEAnnotations(e.target.checked)}
                    className="rounded border-purple-300"
                  />
                  <span className="text-sm font-medium">Ignore</span>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Emit DCE Annotations</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Force emit @__PURE__ annotations even when minify.whitespace is enabled
                  </p>
                </div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.emitDCEAnnotations}
                    onChange={(e) => updateEmitDCEAnnotations(e.target.checked)}
                    className="rounded border-green-300"
                  />
                  <span className="text-sm font-medium">Emit</span>
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

        {/* CLI Configuration */}
        {tab === 'cli' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">CLI Command Generation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate equivalent CLI commands for your build configuration. CLI-only options available here.
              </p>
            </div>

            <div className="space-y-4">
              {/* Production Mode */}
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Production Mode</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Sets NODE_ENV=production and enables all minification options
                  </p>
                </div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.production || false}
                    onChange={(e) => updateProduction(e.target.checked)}
                    className="rounded border-green-300"
                  />
                  <span className="text-sm font-medium">Enable</span>
                </label>
              </div>

              {/* Watch Mode */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">Watch Mode</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Rebuild automatically when files change
                  </p>
                </div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.watch || false}
                    onChange={(e) => updateWatch(e.target.checked)}
                    className="rounded border-blue-300"
                  />
                  <span className="text-sm font-medium">Enable</span>
                </label>
              </div>

              {/* No Clear Screen */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">No Clear Screen</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Don't clear terminal when rebuilding in watch mode
                  </p>
                </div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.noClearScreen || false}
                    onChange={(e) => updateNoClearScreen(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Disable</span>
                </label>
              </div>

              {/* React Fast Refresh */}
              <div className="flex items-center justify-between p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                <div>
                  <h4 className="font-medium text-cyan-800 dark:text-cyan-200">React Fast Refresh</h4>
                  <p className="text-sm text-cyan-700 dark:text-cyan-300">
                    Enable React Fast Refresh transform for development
                  </p>
                </div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.reactFastRefresh || false}
                    onChange={(e) => updateReactFastRefresh(e.target.checked)}
                    className="rounded border-cyan-300"
                  />
                  <span className="text-sm font-medium">Enable</span>
                </label>
              </div>

              {/* Compile to Executable */}
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div>
                  <h4 className="font-medium text-purple-800 dark:text-purple-200">Compile to Executable</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Generate standalone Bun executable containing the bundle
                  </p>
                </div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.compile || false}
                    onChange={(e) => updateCompile(e.target.checked)}
                    className="rounded border-purple-300"
                  />
                  <span className="text-sm font-medium">Enable</span>
                </label>
              </div>

              {/* Compile Exec Argv */}
              {(config.compile || false) && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Executable Arguments
                  </label>
                  <input
                    type="text"
                    value={config.compileExecArgv || ''}
                    onChange={(e) => updateCompileExecArgv(e.target.value)}
                    placeholder="--max-old-space-size=4096"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Prepend arguments to the standalone executable's execArgv
                  </p>
                </div>
              )}
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

        {/* Generated CLI Command */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-blue-300">Generated CLI Command</h4>
            <button
              onClick={() => navigator.clipboard.writeText(generateCliCommand())}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
            >
              Copy Command
            </button>
          </div>
          <pre className="text-blue-300 text-xs overflow-x-auto font-mono">
            {generateCliCommand()}
          </pre>
        </div>

        {/* Cloud Backend Integration */}
        {tab === 'cloud' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cloud Backend Integration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Save configurations, execute builds remotely, and manage build history with cloud storage.
              </p>
            </div>

            <div className="space-y-4">
              {/* Save Configuration */}
              <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4">
                <h4 className="font-medium text-cyan-800 dark:text-cyan-200 mb-2">💾 Save Configuration</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Configuration name"
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-cyan-300 dark:border-cyan-600 rounded-md text-sm"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={configDescription}
                    onChange={(e) => setConfigDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-cyan-300 dark:border-cyan-600 rounded-md text-sm resize-none"
                    rows={2}
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-cyan-300"
                    />
                    <span className="text-sm text-cyan-700 dark:text-cyan-300">Make public</span>
                  </label>
                  <button
                    onClick={saveCurrentConfig}
                    disabled={!configName.trim() || backend.loading}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {backend.loading ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </div>

              {/* Load Configurations */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-indigo-800 dark:text-indigo-200">📂 Saved Configurations</h4>
                  <button
                    onClick={loadSavedConfigs}
                    disabled={backend.loading}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded"
                  >
                    Refresh
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {savedConfigs.length === 0 ? (
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">No saved configurations</p>
                  ) : (
                    savedConfigs.map((cfg) => (
                      <div key={cfg.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded text-xs">
                        <div>
                          <div className="font-medium">{cfg.name}</div>
                          <div className="text-gray-500">{cfg.preset_type}</div>
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-800">Load</button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Build Execution */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">🚀 Execute Build</h4>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  Run build remotely with cloud storage and monitoring.
                </p>
                <button
                  onClick={executeBuildWithBackend}
                  disabled={backend.loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {backend.loading ? 'Executing...' : 'Execute Remote Build'}
                </button>
              </div>

              {/* Build History */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200">📊 Build History</h4>
                  <button
                    onClick={loadBuildHistory}
                    disabled={backend.loading}
                    className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded"
                  >
                    Refresh
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {buildHistory.length === 0 ? (
                    <p className="text-sm text-purple-600 dark:text-purple-400">No build history</p>
                  ) : (
                    buildHistory.slice(0, 5).map((build) => (
                      <div key={build.id} className="bg-white dark:bg-gray-800 p-2 rounded text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{build.build_name}</span>
                          <span className={`px-2 py-1 rounded ${
                            build.status === 'success' ? 'bg-green-100 text-green-800' :
                            build.status === 'failed' ? 'bg-red-100 text-red-800' :
                            build.status === 'building' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {build.status}
                          </span>
                        </div>
                        <div className="text-gray-500">
                          {build.duration_ms ? `${Math.round(build.duration_ms)}ms` : 'Running...'}
                          {build.bundle_size_kb && ` • ${build.bundle_size_kb} KB`}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Backend Status */}
              <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">🔗 Backend Status</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600">✅ Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage:</span>
                    <span className="text-blue-600">NuFire + S3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database:</span>
                    <span className="text-purple-600">SQLite</span>
                  </div>
                </div>
                {backend.error && (
                  <div className="mt-2 text-red-600 text-xs">
                    Error: {backend.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
