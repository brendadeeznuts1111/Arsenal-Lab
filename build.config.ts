// build.config.ts - Bun-native build configuration for Arsenal Lab

import type { BuildConfig } from 'bun';

/**
 * Base build configuration shared across all targets
 */
const baseBuildConfig = {
  target: 'browser' as const,
  format: 'esm' as const,
  splitting: true, // Enable code splitting for shared chunks
  jsx: {
    runtime: 'automatic' as const,
    importSource: 'react',
  },
  loader: {
    '.svg': 'dataurl' as const,
    '.png': 'file' as const,
    '.jpg': 'file' as const,
    '.jpeg': 'file' as const,
    '.gif': 'file' as const,
    '.webp': 'file' as const,
    '.woff': 'file' as const,
    '.woff2': 'file' as const,
    '.ttf': 'file' as const,
    '.eot': 'file' as const,
  },
  external: [], // Bundle all dependencies by default
} satisfies Partial<BuildConfig>;

/**
 * Static HTML build (for GitHub Pages)
 * Pre-bundled with all assets hashed and optimized
 */
export const staticBuildConfig: BuildConfig = {
  ...baseBuildConfig,
  entrypoints: ['./src/lab.ts'],
  outdir: './dist/static',
  naming: {
    entry: '[dir]/[name].[hash].[ext]',
    chunk: '[dir]/[name].[hash].[ext]',
    asset: 'assets/[name].[hash].[ext]',
  },
  minify: {
    whitespace: true,
    syntax: true,
    identifiers: true,
  },
  sourcemap: 'linked',
  publicPath: '/',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'BUILD_TARGET': JSON.stringify('static'),
  },
};

/**
 * Development server build
 * Fast builds with inline sourcemaps for debugging
 */
export const devBuildConfig: BuildConfig = {
  ...baseBuildConfig,
  entrypoints: ['./src/lab.ts'],
  outdir: './dist/dev',
  naming: '[dir]/[name].[ext]',
  minify: false,
  sourcemap: 'inline',
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
    'BUILD_TARGET': JSON.stringify('dev'),
  },
};

/**
 * Production runtime build (for Bun server deployment)
 * Optimized with external sourcemaps for production monitoring
 */
export const productionBuildConfig: BuildConfig = {
  ...baseBuildConfig,
  entrypoints: ['./src/lab.ts', './src/server.ts', './src/cli.ts'],
  outdir: './dist/production',
  naming: {
    entry: '[dir]/[name].[hash].[ext]',
    chunk: 'chunks/[name].[hash].[ext]',
    asset: 'assets/[name].[hash].[ext]',
  },
  minify: {
    whitespace: true,
    syntax: true,
    identifiers: true,
  },
  sourcemap: 'external',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'BUILD_TARGET': JSON.stringify('production'),
  },
  drop: ['console', 'debugger'], // Remove console.log in production
};

/**
 * CLI executable build
 * Standalone executable with Bun runtime embedded
 */
export const cliBuildConfig: BuildConfig = {
  entrypoints: ['./src/cli.ts'],
  outdir: './dist/bin',
  target: 'bun',
  format: 'esm',
  minify: true,
  sourcemap: 'none',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'BUILD_TARGET': JSON.stringify('cli'),
  },
};

/**
 * Build configuration factory
 * Returns appropriate config based on environment
 */
export function getBuildConfig(env: 'static' | 'dev' | 'production' | 'cli'): BuildConfig {
  switch (env) {
    case 'static':
      return staticBuildConfig;
    case 'dev':
      return devBuildConfig;
    case 'production':
      return productionBuildConfig;
    case 'cli':
      return cliBuildConfig;
    default:
      throw new Error(`Unknown build environment: ${env}`);
  }
}

/**
 * Build options for arsenal-specific builds
 */
export function getArsenalBuildConfig(arsenalId: string): BuildConfig {
  return {
    ...baseBuildConfig,
    entrypoints: [`./components/${getArsenalDirectory(arsenalId)}/index.tsx`],
    outdir: `./dist/arsenals/${arsenalId}`,
    naming: {
      entry: '[name].[hash].js',
      chunk: 'chunks/[name].[hash].js',
      asset: 'assets/[name].[hash].[ext]',
    },
    minify: {
      whitespace: true,
      syntax: true,
      identifiers: false, // Keep names for debugging individual arsenals
    },
    sourcemap: 'linked',
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'BUILD_TARGET': JSON.stringify('arsenal'),
      'ARSENAL_ID': JSON.stringify(arsenalId),
    },
  };
}

/**
 * Maps arsenal ID to directory name
 */
function getArsenalDirectory(arsenalId: string): string {
  const dirMap: Record<string, string> = {
    'performance': 'PerformanceArsenal',
    'process-shell': 'ProcessShellArsenal',
    'testing': 'TestingArsenal',
    'testing-debugging': 'TestingDebuggingArsenal',
    'database-infra': 'DatabaseInfrastructureArsenal',
    'build-config': 'BuildConfigurationArsenal',
    'security': 'SecurityArsenal',
    'package-mgmt': 'PackageManagementArsenal',
    'bunx': 'BunxDemo',
  };

  return dirMap[arsenalId] || arsenalId;
}

/**
 * Export all configs
 */
export default {
  static: staticBuildConfig,
  dev: devBuildConfig,
  production: productionBuildConfig,
  cli: cliBuildConfig,
  getBuildConfig,
  getArsenalBuildConfig,
};
