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
  const [tab, setTab] = useState<'core' | 'environment' | 'jsx' | 'optimization' | 'output' | 'advanced'>('core');
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
    throw: false
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
  throw: ${config.throw}
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
    // Utilities
    generateBuildCode,
    generateExampleInput,
    simulateBuild,
    buildOutput
  };
}
