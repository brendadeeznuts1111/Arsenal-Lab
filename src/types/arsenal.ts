// src/types/arsenal.ts - Arsenal type definitions

export interface ArsenalManifest {
  /** Unique identifier for the arsenal */
  id: string;

  /** Display name */
  name: string;

  /** Short description */
  description: string;

  /** Icon emoji or path */
  icon: string;

  /** Color theme for UI */
  color: string;

  /** Version following semver */
  version: string;

  /** Complexity level */
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';

  /** Category for grouping */
  category: 'performance' | 'testing' | 'database' | 'build' | 'security' | 'management' | 'demo';

  /** Tags for search and filtering */
  tags: string[];

  /** Build configuration */
  build: {
    /** Entry point file (relative to arsenal directory) */
    entryPoint: string;

    /** NPM dependencies required */
    dependencies: string[];

    /** Static assets to bundle */
    assets: string[];

    /** Files to preload for better performance */
    preload?: string[];

    /** External dependencies (not bundled) */
    external?: string[];
  };

  /** Performance characteristics */
  performance: {
    /** Estimated load time */
    estimatedLoadTime: 'instant' | 'fast' | 'moderate' | 'slow';

    /** Bundle size category */
    bundleSize: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge';

    /** Memory usage during operation */
    memoryUsage: 'low' | 'moderate' | 'high' | 'very-high';

    /** CPU intensity */
    cpuIntensity: 'low' | 'moderate' | 'high' | 'very-high';
  };

  /** Enterprise features support */
  enterprise?: {
    /** Team collaboration features */
    supportsTeams?: boolean;

    /** Audit logging capability */
    auditLogging?: boolean;

    /** Role-based access control */
    roleBasedAccess?: boolean;

    /** API integration support */
    apiIntegration?: boolean;
  };

  /** Enabled state */
  enabled: boolean;

  /** Sort order for display */
  order?: number;
}

export interface ArsenalComponent {
  /** Arsenal manifest */
  manifest: ArsenalManifest;

  /** Lazy-loaded React component */
  component: () => Promise<{ [key: string]: React.ComponentType<any> }>;

  /** Optional provider/context */
  provider?: React.ComponentType<any>;

  /** Lazy-loaded sub-components */
  lazyComponents?: Record<string, React.LazyExoticComponent<any>>;

  /** Preload function for critical resources */
  preload?: () => Promise<any[]>;
}

export interface ArsenalRegistry {
  /** Map of arsenal ID to component */
  [arsenalId: string]: ArsenalComponent;
}

export type ArsenalId = string;
