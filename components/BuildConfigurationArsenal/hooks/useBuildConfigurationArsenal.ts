/* ----------  BUILD CONFIGURATION TYPES  ---------- */
export interface BuildConfiguration {
  // Core Options
  entrypoints: string[];
  outdir: string;
  root: string;

  // Output Configuration
  publicPath: string;
  naming: {
    entry: string;
    chunk: string;
    asset: string;
  };

  // Environment & Packages
  env: 'inline' | 'disable' | string; // string for prefix like "PUBLIC_*"
  packages: 'bundle' | 'external';
  external: string[];
  conditions: string[];

  // Code Transformation
  define: Record<string, string>;
  loader: Record<string, string>;
  banner: string;
  footer: string;
  drop: string[];

  // JSX Configuration
  jsx: {
    factory: string;
    fragment: string;
    importSource: string;
    runtime: 'automatic' | 'classic';
  };

  // Optimization
  sourcemap: 'none' | 'linked' | 'inline' | 'external';
  minify: {
    whitespace: boolean;
    syntax: boolean;
    identifiers: boolean;
  };

  // Output Format
  format: 'esm' | 'cjs' | 'iife';
  target: 'browser' | 'bun' | 'node';
  splitting: boolean;

  // Advanced Options
  bytecode: boolean;
  throw: boolean;

  // Dead Code Elimination Annotations
  ignoreDCEAnnotations: boolean;
  emitDCEAnnotations: boolean;

  // CLI-Specific Options (not in JS API)
  production?: boolean; // Sets NODE_ENV=production and enables minification
  watch?: boolean; // Watch mode for incremental rebuilds
  noClearScreen?: boolean; // Don't clear terminal when rebuilding
  reactFastRefresh?: boolean; // Enable React Fast Refresh transform
  compile?: boolean; // Generate standalone executable
  compileExecArgv?: string; // Prepend arguments to executable
}

export interface BuildOutput {
  success: boolean;
  outputs: Array<{
    kind: string;
    path: string;
    hash: string | null;
    size: string;
  }>;
  logs: Array<{
    level: string;
    message: string;
  }>;
}

/* ----------  PLAYGROUND STATE  ---------- */
import { useCallback, useState } from 'react';

export function useBuildConfigurationArsenal() {
  const [tab, setTab] = useState<'core' | 'environment' | 'jsx' | 'optimization' | 'output' | 'advanced' | 'cli'>('core');
  const [publicPath, setPublicPath] = useState('https://cdn.example.com/');
  const [config, setConfig] = useState<BuildConfiguration>({
    // Core Options
    entrypoints: ['./src/index.tsx'],
    outdir: './dist',
    root: '.',

    // Output Configuration
    publicPath: 'https://cdn.example.com/',
    naming: {
      entry: '[dir]/[name].[ext]',
      chunk: '[name]-[hash].[ext]',
      asset: '[name]-[hash].[ext]'
    },

    // Environment & Packages
    env: 'inline',
    packages: 'bundle',
    external: ['react', 'react-dom'],
    conditions: ['browser', 'default'],

    // Code Transformation
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'VERSION': JSON.stringify('1.3.0'),
      'DEBUG': 'false'
    },
    loader: {
      '.svg': 'file',
      '.png': 'dataurl',
      '.txt': 'text',
      '.css': 'css'
    },
    banner: '"use client";',
    footer: '// Built with Bun 🚀',
    drop: ['console.debug', 'debugger'],

    // JSX Configuration
    jsx: {
      factory: 'React.createElement',
      fragment: 'React.Fragment',
      importSource: 'react',
      runtime: 'automatic'
    },

    // Optimization
    sourcemap: 'linked',
    minify: {
      whitespace: true,
      syntax: true,
      identifiers: true
    },

    // Output Format
    format: 'esm',
    target: 'browser',
    splitting: true,

    // Advanced Options
    bytecode: false,
    throw: false,

    // Dead Code Elimination Annotations
    ignoreDCEAnnotations: false,
    emitDCEAnnotations: true,

    // CLI-Specific Options
    production: false,
    watch: false,
    noClearScreen: false,
    reactFastRefresh: false,
    compile: false,
    compileExecArgv: ''
  });

  const [buildOutput, setBuildOutput] = useState<BuildOutput | null>(null);

  // Configuration updaters
  const updateEntrypoints = useCallback((entrypoints: string[]) => {
    setConfig(prev => ({ ...prev, entrypoints }));
  }, []);

  const updateOutdir = useCallback((outdir: string) => {
    setConfig(prev => ({ ...prev, outdir }));
  }, []);

  const updateRoot = useCallback((root: string) => {
    setConfig(prev => ({ ...prev, root }));
  }, []);

  const updatePublicPath = useCallback((path: string) => {
    setPublicPath(path);
    setConfig(prev => ({ ...prev, publicPath: path }));
  }, []);

  const updateNaming = useCallback((type: keyof BuildConfiguration['naming'], pattern: string) => {
    setConfig(prev => ({
      ...prev,
      naming: { ...prev.naming, [type]: pattern }
    }));
  }, []);

  const updateEnv = useCallback((env: string) => {
    setConfig(prev => ({ ...prev, env: env as any }));
  }, []);

  const updatePackages = useCallback((packages: 'bundle' | 'external') => {
    setConfig(prev => ({ ...prev, packages }));
  }, []);

  const updateExternal = useCallback((external: string[]) => {
    setConfig(prev => ({ ...prev, external }));
  }, []);

  const updateConditions = useCallback((conditions: string[]) => {
    setConfig(prev => ({ ...prev, conditions }));
  }, []);

  const updateDefine = useCallback((key: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      define: { ...prev.define, [key]: value }
    }));
  }, []);

  const updateLoader = useCallback((extension: string, loader: string) => {
    setConfig(prev => ({
      ...prev,
      loader: { ...prev.loader, [extension]: loader }
    }));
  }, []);

  const updateBanner = useCallback((banner: string) => {
    setConfig(prev => ({ ...prev, banner }));
  }, []);

  const updateFooter = useCallback((footer: string) => {
    setConfig(prev => ({ ...prev, footer }));
  }, []);

  const updateDrop = useCallback((identifier: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      drop: enabled
        ? [...prev.drop, identifier]
        : prev.drop.filter(item => item !== identifier)
    }));
  }, []);

  const updateJsx = useCallback((key: keyof BuildConfiguration['jsx'], value: string) => {
    setConfig(prev => ({
      ...prev,
      jsx: { ...prev.jsx, [key]: value }
    }));
  }, []);

  const updateSourcemap = useCallback((sourcemap: BuildConfiguration['sourcemap']) => {
    setConfig(prev => ({ ...prev, sourcemap }));
  }, []);

  const updateMinify = useCallback((key: keyof BuildConfiguration['minify'], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      minify: { ...prev.minify, [key]: value }
    }));
  }, []);

  const updateFormat = useCallback((format: BuildConfiguration['format']) => {
    setConfig(prev => ({ ...prev, format }));
  }, []);

  const updateTarget = useCallback((target: BuildConfiguration['target']) => {
    setConfig(prev => ({ ...prev, target }));
  }, []);

  const updateSplitting = useCallback((splitting: boolean) => {
    setConfig(prev => ({ ...prev, splitting }));
  }, []);

  const updateBytecode = useCallback((bytecode: boolean) => {
    setConfig(prev => ({ ...prev, bytecode }));
  }, []);

  const updateThrow = useCallback((throw_: boolean) => {
    setConfig(prev => ({ ...prev, throw: throw_ }));
  }, []);

  const updateIgnoreDCEAnnotations = useCallback((ignoreDCEAnnotations: boolean) => {
    setConfig(prev => ({ ...prev, ignoreDCEAnnotations }));
  }, []);

  const updateEmitDCEAnnotations = useCallback((emitDCEAnnotations: boolean) => {
    setConfig(prev => ({ ...prev, emitDCEAnnotations }));
  }, []);

  const updateProduction = useCallback((production: boolean) => {
    setConfig(prev => ({ ...prev, production }));
  }, []);

  const updateWatch = useCallback((watch: boolean) => {
    setConfig(prev => ({ ...prev, watch }));
  }, []);

  const updateNoClearScreen = useCallback((noClearScreen: boolean) => {
    setConfig(prev => ({ ...prev, noClearScreen }));
  }, []);

  const updateReactFastRefresh = useCallback((reactFastRefresh: boolean) => {
    setConfig(prev => ({ ...prev, reactFastRefresh }));
  }, []);

  const updateCompile = useCallback((compile: boolean) => {
    setConfig(prev => ({ ...prev, compile }));
  }, []);

  const updateCompileExecArgv = useCallback((compileExecArgv: string) => {
    setConfig(prev => ({ ...prev, compileExecArgv }));
  }, []);

  // Code generation
  const generateBuildCode = useCallback(() => {
    return `import { build } from 'bun';

const result = await build({
  // Core Options
  entrypoints: ${JSON.stringify(config.entrypoints)},
  outdir: ${JSON.stringify(config.outdir)},
  root: ${JSON.stringify(config.root)},

  // Output Configuration
  publicPath: ${JSON.stringify(config.publicPath)},
  naming: ${JSON.stringify(config.naming, null, 2)},

  // Environment & Packages
  env: ${JSON.stringify(config.env)},
  packages: ${JSON.stringify(config.packages)},
  external: ${JSON.stringify(config.external)},
  conditions: ${JSON.stringify(config.conditions)},

  // Code Transformation
  define: ${JSON.stringify(config.define, null, 2)},
  loader: ${JSON.stringify(config.loader, null, 2)},
  banner: ${JSON.stringify(config.banner)},
  footer: ${JSON.stringify(config.footer)},
  drop: ${JSON.stringify(config.drop)},

  // JSX Configuration
  jsx: ${JSON.stringify(config.jsx, null, 2)},

  // Optimization
  sourcemap: ${JSON.stringify(config.sourcemap)},
  minify: ${JSON.stringify(config.minify, null, 2)},

  // Output Format
  format: ${JSON.stringify(config.format)},
  target: ${JSON.stringify(config.target)},
  splitting: ${config.splitting},

  // Advanced Options
  bytecode: ${config.bytecode},
  throw: ${config.throw},

  // Dead Code Elimination Annotations
  ignoreDCEAnnotations: ${config.ignoreDCEAnnotations},
  emitDCEAnnotations: ${config.emitDCEAnnotations}
});

console.log('Build ${config.splitting ? 'with' : 'without'} code splitting');
console.log('Target: ${config.target}');
console.log('Format: ${config.format}');
${config.publicPath ? `console.log('Public Path: ${config.publicPath}');` : ''}
${config.bytecode ? `console.log('Bytecode enabled for improved startup times');` : ''}`;
  }, [config]);

  const generateExampleInput = useCallback(() => {
    return `// src/index.tsx
import logo from './logo.svg';
import styles from './app.css';
import config from './config.txt';

console.log('App version:', process.env.VERSION);
console.log('Debug mode:', DEBUG);

// This will be removed if 'console.debug' is in drop[]
console.debug('Debug information');

// This will be removed if 'debugger' is in drop[]
debugger;

function App() {
  return (
    <div className={styles.container}>
      <img src={logo} alt="Logo" />
      <p>Configuration: {config}</p>
      {process.env.NODE_ENV === 'production' && <p>Production build</p>}
    </div>
  );
}

export default App;`;
  }, []);

  const simulateBuild = useCallback(() => {
    // Mock build output based on configuration
    const outputs = [
      {
        kind: 'entry-point',
        path: '/dist/index.js',
        hash: 'a1b2c3d4',
        size: '45.2 KB'
      }
    ];

    if (config.splitting) {
      outputs.push({
        kind: 'chunk',
        path: '/dist/chunk-1234.js',
        hash: 'e5f6g7h8',
        size: '12.7 KB'
      });
    }

    if (config.sourcemap !== 'none') {
      outputs.push({
        kind: 'sourcemap',
        path: '/dist/index.js.map',
        hash: 'i9j0k1l2',
        size: '89.1 KB'
      });
    }

    setBuildOutput({
      success: true,
      outputs,
      logs: [
        { level: 'info', message: 'Build completed successfully' },
        ...(config.drop.length > 0 ? [{ level: 'info', message: `Dropped: ${config.drop.join(', ')}` }] : []),
        ...(config.publicPath ? [{ level: 'info', message: `Public path: ${config.publicPath}` }] : [])
      ]
    });
  }, [config]);

  // CLI command generation
  const generateCliCommand = useCallback(() => {
    const args: string[] = [];

    // Entry points
    args.push(...config.entrypoints);

    // Output options
    if (config.outdir !== './dist') {
      args.push(`--outdir`, config.outdir);
    }

    if (config.root !== '.') {
      args.push(`--root`, config.root);
    }

    // Target and format
    if (config.target !== 'browser') {
      args.push(`--target`, config.target);
    }

    if (config.format !== 'esm') {
      args.push(`--format`, config.format);
    }

    // Code splitting
    if (!config.splitting) {
      args.push(`--no-splitting`);
    }

    // Environment
    if (config.env === 'inline') {
      args.push(`--env`, 'inline');
    } else if (config.env === 'disable') {
      args.push(`--env`, 'disable');
    } else if (typeof config.env === 'string' && config.env !== 'inline') {
      args.push(`--env`, config.env);
    }

    // Packages
    if (config.packages !== 'bundle') {
      args.push(`--packages`, config.packages);
    }

    // External packages
    if (config.external.length > 0) {
      args.push(`--external`, config.external.join(','));
    }

    // Conditions
    if (config.conditions.length > 0) {
      args.push(`--conditions`, config.conditions.join(','));
    }

    // Public path
    if (config.publicPath && config.publicPath !== 'https://cdn.example.com/') {
      args.push(`--public-path`, config.publicPath);
    }

    // Naming
    if (config.naming.entry !== '[dir]/[name].[ext]') {
      args.push(`--entry-naming`, config.naming.entry);
    }
    if (config.naming.chunk !== '[name]-[hash].[ext]') {
      args.push(`--chunk-naming`, config.naming.chunk);
    }
    if (config.naming.asset !== '[name]-[hash].[ext]') {
      args.push(`--asset-naming`, config.naming.asset);
    }

    // JSX
    if (config.jsx.factory !== 'React.createElement') {
      args.push(`--jsx-factory`, config.jsx.factory);
    }
    if (config.jsx.fragment !== 'React.Fragment') {
      args.push(`--jsx-fragment`, config.jsx.fragment);
    }
    if (config.jsx.importSource !== 'react') {
      args.push(`--jsx-import-source`, config.jsx.importSource);
    }
    if (config.jsx.runtime !== 'automatic') {
      args.push(`--jsx-runtime`, config.jsx.runtime);
    }

    // Source maps
    if (config.sourcemap !== 'none') {
      args.push(`--sourcemap`, config.sourcemap);
    }

    // Minification
    if (config.minify.whitespace || config.minify.syntax || config.minify.identifiers) {
      if (config.minify.whitespace) args.push(`--minify-whitespace`);
      if (config.minify.syntax) args.push(`--minify-syntax`);
      if (config.minify.identifiers) args.push(`--minify-identifiers`);
    }

    // Banner and footer
    if (config.banner) {
      args.push(`--banner`, `"${config.banner}"`);
    }
    if (config.footer) {
      args.push(`--footer`, `"${config.footer}"`);
    }

    // Drop
    if (config.drop.length > 0) {
      args.push(`--drop`, config.drop.join(','));
    }

    // Advanced options
    if (config.bytecode) {
      args.push(`--bytecode`);
    }
    if (config.throw) {
      args.push(`--throw`);
    }
    if (config.ignoreDCEAnnotations) {
      args.push(`--ignore-dce-annotations`);
    }
    if (!config.emitDCEAnnotations) {
      args.push(`--no-emit-dce-annotations`);
    }

    // CLI-specific options
    if (config.production) {
      args.push(`--production`);
    }
    if (config.watch) {
      args.push(`--watch`);
    }
    if (config.noClearScreen) {
      args.push(`--no-clear-screen`);
    }
    if (config.reactFastRefresh) {
      args.push(`--react-fast-refresh`);
    }
    if (config.compile) {
      args.push(`--compile`);
    }
    if (config.compileExecArgv) {
      args.push(`--compile-exec-argv`, config.compileExecArgv);
    }

    return `bun build ${args.join(' ')}`;
  }, [config]);

  return {
    tab,
    setTab,
    publicPath,
    config,
    setConfig,
    // Core updaters
    updateEntrypoints,
    updateOutdir,
    updateRoot,
    // Output updaters
    updatePublicPath,
    updateNaming,
    // Environment & Packages updaters
    updateEnv,
    updatePackages,
    updateExternal,
    updateConditions,
    // Code transformation updaters
    updateDefine,
    updateLoader,
    updateBanner,
    updateFooter,
    updateDrop,
    // JSX updaters
    updateJsx,
    // Optimization updaters
    updateSourcemap,
    updateMinify,
    // Output format updaters
    updateFormat,
    updateTarget,
    updateSplitting,
    // Advanced updaters
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
    // Utilities
    generateBuildCode,
    generateCliCommand,
    generateExampleInput,
    simulateBuild,
    buildOutput
  };
}
