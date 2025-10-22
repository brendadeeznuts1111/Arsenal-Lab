#!/usr/bin/env bun
// SARIF reporter for GitHub Security tab integration
export function toSarif(violations: any[]): any {
  return {
    version: "2.1.0",
    $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0-rtm.5.json",
    runs: [{
      tool: {
        driver: {
          name: "Bun System Gate",
          version: "5.0.0",
          informationUri: "https://github.com/bun-system-gate",
          rules: violations.map(v => ({
            id: v.invariantId || v.invariant,
            name: v.invariant || v.invariantId,
            shortDescription: { text: v.description }
          }))
        }
      },
      results: violations.map(v => ({
        ruleId: v.invariantId || v.invariant,
        level: v.severity === "BLOCK" || v.severity === "critical" || v.severity === "high" ? "error" : "warning",
        message: { text: v.description },
        locations: [{
          physicalLocation: {
            artifactLocation: {
              uri: `patches/${v.package || 'unknown'}.patch`,
              uriBaseId: "PATCH_ROOT"
            }
          }
        }],
        properties: {
          severity: v.severity,
          invariant: v.invariantId || v.invariant,
          package: v.package || "unknown"
        }
      }))
    }]
  };
}

// CLI interface
async function main() {
  // Generate sample SARIF report for testing
  const sampleViolations = [
    {
      invariantId: "crypto-integrity",
      severity: "BLOCK",
      description: "Security packages cannot use insecure hashing",
      package: "react@18.2.0"
    }
  ];

  console.log(JSON.stringify(toSarif(sampleViolations), null, 2));
}

if (import.meta.main) await main();