#!/usr/bin/env bun
import { writeFileSync } from "node:fs";
import type { InvariantViolation } from "./invariant-manager.ts";

interface SarifLog {
  version: string;
  $schema?: string;
  runs: SarifRun[];
}

interface SarifRun {
  tool: {
    driver: {
      name: string;
      version?: string;
      informationUri?: string;
      rules: SarifRule[];
    };
  };
  results: SarifResult[];
}

interface SarifRule {
  id: string;
  name: string;
  shortDescription: {
    text: string;
  };
  helpUri?: string;
  properties?: {
    tags?: string[];
  };
}

interface SarifResult {
  ruleId: string;
  ruleIndex?: number;
  level: "error" | "warning" | "note" | "none";
  message: {
    text: string;
  };
  locations?: SarifLocation[];
  properties?: {
    severity: "low" | "moderate" | "high" | "critical";
    invariant: string;
    package: string;
  };
}

interface SarifLocation {
  physicalLocation: {
    artifactLocation: {
      uri: string;
      uriBaseId?: string;
    };
    region?: {
      startLine?: number;
      startColumn?: number;
      endLine?: number;
      endColumn?: number;
    };
  };
}

const RULES: SarifRule[] = [
  {
    id: "no-direct-process-env",
    name: "No Direct Process Environment Access",
    shortDescription: {
      text: "Patches cannot introduce new process.env access"
    },
    properties: {
      tags: ["security", "environment"]
    }
  },
  {
    id: "cryptographic-integrity",
    name: "Cryptographic Integrity",
    shortDescription: {
      text: "Security packages cannot use insecure hashing algorithms"
    },
    properties: {
      tags: ["security", "crypto"]
    }
  },
  {
    id: "dependency-boundary",
    name: "Dependency Boundary",
    shortDescription: {
      text: "Patches cannot introduce cross-layer dependencies"
    },
    properties: {
      tags: ["architecture", "dependencies"]
    }
  },
  {
    id: "no-eval-usage",
    name: "No Eval Usage",
    shortDescription: {
      text: "Patches cannot introduce eval() or Function() constructors"
    },
    properties: {
      tags: ["security", "code-execution"]
    }
  },
  {
    id: "no-global-mutation",
    name: "No Global Mutation",
    shortDescription: {
      text: "Patches cannot modify global objects"
    },
    properties: {
      tags: ["security", "globals"]
    }
  },
  {
    id: "logging-consistency",
    name: "Logging Consistency",
    shortDescription: {
      text: "Patches must use consistent logging patterns"
    },
    properties: {
      tags: ["logging", "consistency"]
    }
  }
];

function mapSeverityToLevel(severity: string): "error" | "warning" | "note" | "none" {
  switch (severity) {
    case "critical":
    case "high":
      return "error";
    case "moderate":
    case "low":
      return "warning";
    default:
      return "note";
  }
}

export function violationsToSarif(violations: InvariantViolation[], packageName?: string): SarifLog {
  const results: SarifResult[] = violations.map(violation => ({
    ruleId: violation.invariant,
    level: mapSeverityToLevel(violation.severity),
    message: {
      text: violation.description
    },
    locations: [{
      physicalLocation: {
        artifactLocation: {
          uri: `patches/${packageName || 'unknown'}.patch`,
          uriBaseId: "PATCH_ROOT"
        }
      }
    }],
    properties: {
      severity: violation.severity as any,
      invariant: violation.invariant,
      package: packageName || "unknown"
    }
  }));

  return {
    version: "2.1.0",
    $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
    runs: [{
      tool: {
        driver: {
          name: "Bun System Gate",
          version: "3.0.0",
          informationUri: "https://github.com/bun-system-gate",
          rules: RULES
        }
      },
      results
    }]
  };
}

export function writeSarifReport(violations: InvariantViolation[], outputPath: string = "patch-governance.sarif", packageName?: string): void {
  const sarif = violationsToSarif(violations, packageName);
  writeFileSync(outputPath, JSON.stringify(sarif, null, 2));
  console.log(`📄 SARIF report written to: ${outputPath}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("🔍 SARIF Reporter for Patch Governance");
    console.log("");
    console.log("Usage:");
    console.log("  bun run sarif-reporter.ts <violations-json> [output-path] [package-name]");
    console.log("");
    console.log("Examples:");
    console.log("  bun run sarif-reporter.ts violations.json");
    console.log("  bun run sarif-reporter.ts violations.json report.sarif react");
    console.log("");
    console.log("The SARIF report will be uploaded to GitHub Security tab.");
    return;
  }

  const [violationsPath, outputPath = "patch-governance.sarif", packageName] = args;

  try {
    // In a real implementation, this would read from a file or accept violations as input
    // For demo purposes, we'll create a sample
    const sampleViolations: InvariantViolation[] = [
      {
        invariant: "cryptographic-integrity",
        description: "Security packages cannot use insecure hashing",
        severity: "critical"
      }
    ];

    writeSarifReport(sampleViolations, outputPath, packageName);
    console.log("✅ SARIF report generated successfully");
  } catch (error) {
    console.error("❌ Failed to generate SARIF report:", error);
    process.exit(1);
  }
}

if (import.meta.main) await main();
