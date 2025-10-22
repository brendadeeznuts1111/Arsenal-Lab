// components/index.ts - Main component exports for bun:performance-arsenal

// Core Performance Arsenal
export { PerformanceArsenal } from './PerformanceArsenal';

// Process & Shell Arsenal
export { ProcessShellArsenal } from './ProcessShellArsenal';

// Testing Arsenal
export { TestingArsenal } from './TestingArsenal';

// Testing & Debugging Arsenal
export { TestingDebuggingArsenal } from './TestingDebuggingArsenal';

// Database & Infrastructure Arsenal
export { DatabaseInfrastructureArsenal } from './DatabaseInfrastructureArsenal';

// Build Configuration Arsenal
export { BuildConfigurationArsenal } from './BuildConfigurationArsenal';

// Package Management Arsenal
export { PackageManagementArsenal } from './PackageManagementArsenal';

// Layout Components
export { Banner } from './Layout/Banner';
export { CommunityShowcase } from './Layout/CommunityShowcase';
export { EnhancedBanner } from './Layout/EnhancedBanner';
export { Footer } from './Layout/Footer';
export { ProductionReadyBanner } from './Layout/ProductionReadyBanner';
export { VersionBanner } from './Layout/VersionBanner';

// Live Demo Components
export { LiveTestingDemo } from './TestingDebuggingArsenal/ui/LiveTestingDemo';

// Re-export hooks for advanced usage
export { useBuildConfigurationArsenal } from './BuildConfigurationArsenal/hooks/useBuildConfigurationArsenal';
export { usePerformanceMonitor } from './Layout/hooks/usePerformanceMonitor';
export { usePackageManagementArsenal } from './PackageManagementArsenal';
export { usePerformanceArsenal } from './PerformanceArsenal/hooks/usePerformanceArsenal';
export { useTestingDebuggingArsenal } from './TestingDebuggingArsenal/hooks/useTestingDebuggingArsenal';

// Type exports for TypeScript users
export type {
    // Performance types
    PerformanceMetrics,
    PerformanceStats
} from './PerformanceArsenal/utils/performanceObserver';

export type {
    // Database types
    RedisBenchmark
} from './DatabaseInfrastructureArsenal/hooks/useDatabaseInfrastructureArsenal';

export type {
    // Build Configuration types
    BuildConfiguration,
    BuildOutput
} from './BuildConfigurationArsenal/hooks/useBuildConfigurationArsenal';

// Version information
export const VERSION = '1.3.0';
export const BUN_VERSION_REQUIRED = '>=1.3.0';

// Utility functions
export { copyToClipboard } from './PerformanceArsenal/utils/copyToClipboard';
export { getHardwareInfo } from './PerformanceArsenal/utils/hardware';

// Analytics (opt-in)
export { getAnalyticsTracker, useAnalytics } from './PerformanceArsenal/utils/analytics';

