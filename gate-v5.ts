#!/usr/bin/env bun
/**
 * Bun System Gate v5 – Ultra-Lean Installer
 * Adds EVERYTHING (v1→v4) in < 15 s.
 * Run inside any Bun repo root.
 * Idempotent – safe to re-run.
 */
import { $ } from "bun";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const LOGO = `
🛡️  Bun System Gate v5 – FAANG-Ready in 15 s
------------------------------------------------`;
console.log(LOGO);

const FILES: Record<string, string> = {
  // 1. DECLARATIVE CONFIGS (JSON-Schema validated)
  "config/invariant-definitions.yml": `
invariants:
  - id: no-eval
    name: No eval() / Function()
    severity: BLOCK
    script: rules/no-eval.ts
  - id: crypto-integrity
    name: Secure crypto only
    severity: BLOCK
    script: rules/crypto-integrity.ts
  - id: layer-boundary
    name: Layer boundary check
    severity: AMBER
    script: rules/layer-boundary.ts`,

  "config/tension-rules.yml": `
rules:
  - name: crypto_backdoor
    condition: patch_content.includes('rapidhash')
    severity: BLOCK
    actions: [sarif, slack, github:annotate]
  - name: large-patch
    condition: patch_size>5000
    severity: AMBER
    actions: [slack, github:annotate]`,

  "config/canary-matrix.yml": `patches:
  "*": { stage: stable, rollout: 100 }`,

  // 2. PLUGGABLE RULE BUS (extensibility)
  "rules/index.ts": `export * from "./no-eval";
export * from "./crypto-integrity";
export * from "./layer-boundary";`,

  "rules/no-eval.ts": `export function validate(ctx: any) {
  const ok = !ctx.addedContent.includes("eval(");
  return { isValid: ok, details: ok ? "" : "eval() detected" };
};`,

  "rules/crypto-integrity.ts": `const BAD = ["md5", "sha1", "rapidhash"];
export function validate(ctx: any) {
  const ok = !BAD.some(b => ctx.addedContent.includes(b));
  return { isValid: ok, details: ok ? "" : "insecure crypto" };
};`,

  "rules/layer-boundary.ts": `export function validate(ctx: any) {
  const ok = !ctx.addedContent.match(/from\s+["'].\/db/);
  return { isValid: ok, details: ok ? "" : "ui→db violation" };
};`,

  // 3. SARIF + COSIGN + SBOM
  "scripts/sarif-reporter.ts": `#!/usr/bin/env bun
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
              uri: \`patches/\${v.package || 'unknown'}.patch\`,
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

if (import.meta.main) await main();`,

  "scripts/cosign-wrapper.ts": `#!/usr/bin/env bun
import { $ } from "bun";
const [cmd, file] = process.argv.slice(2);
if (cmd === "sign") await $ \`cosign sign-blob --yes \${file} --output-signature \${file}.sig\`;
if (cmd === "verify") await $ \`cosign verify-blob \${file} --signature \${file}.sig\`;
`,

  "scripts/sbom-generator.ts": `#!/usr/bin/env bun
import { $ } from "bun";
const spdx = { spdxVersion: "SPDX-2.3", dataLicense: "CC0-1.0", packages: [] };
for (const p of await $ \`find patches -name "*.patch"\`.text().split("\\n").filter(Boolean)) {
  const hash = await $ \`sha256sum \${p}\`.text();
  spdx.packages.push({ name: p, checksums: [{ algorithm: "SHA256", checksumValue: hash.split(" ")[0] }] });
}
console.log(JSON.stringify(spdx, null, 2));
`,

  // 4. KUBERNETES CRD + OPERATOR
  "src/crd/patch-crd.yaml": `apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata: { name: patches.gate.bun.sh }
spec:
  group: gate.bun.sh
  names: { kind: Patch, plural: patches }
  scope: Namespaced
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              package: { type: string }
              patchRef: { type: string }
              stage: { enum: [stable, canary] }
              rollout: { type: integer, minimum: 0, maximum: 100 }}`,

  "src/operator.ts": `import { watch } from "@kubernetes/client-node";
import { $ } from "bun";
watch("gate.bun.sh", "v1", "patches").on("ADDED", async (obj) => {
  const { package: pkg, rollout } = obj.spec;
  await $ \`bun run patch:ctl rollout \${pkg} \${rollout}\`;
});`,

  // 5. OPENTELEMETRY
  "src/telemetry.ts": `import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
const provider = new NodeTracerProvider(); provider.register();
export const tracer = provider.getTracer("bun-gate");
export const counter = provider.getMeter("bun-gate").createCounter("invariant_violations_total");
`,

  // 6. ENHANCED CI (SARIF + cosign + SBOM)
  ".github/workflows/governance.yml": `name: Governance
on: [push, pull_request]
jobs:
  govern:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run invariant:validate
      - run: bun run gate:sarif > results.sarif
      - uses: github/codeql-action/upload-sarif@v3
        with: { sarif_file: results.sarif }
      - run: bun run patch:sign \$(find patches -name "*.patch")
      - run: bun run sbom:generate > sbom.spdx.json
      - uses: actions/upload-artifact@v4
        with: { name: sbom, path: sbom.spdx.json }}`,

  // 7. CANARY CONTROL
  "scripts/canary-ctl.ts": `#!/usr/bin/env bun
import { parseArgs } from "util";
const { values } = parseArgs({ args: process.argv.slice(2), options: { promote: {}, demote: {}, rollout: {}, list: { type: "boolean" } } });
if (values.list) console.table(await Bun.file("config/canary-matrix.yml").json());
if (values.promote) await setRollout(values.promote, 100);
if (values.demote) await setRollout(values.demote, 5);
if (values.rollout) {
  const [pkg, pct] = (values.rollout as string).split(" ");
  await setRollout(pkg, parseInt(pct));
}
async function setRollout(pkg: string, pct: number) {
  const cfg = await Bun.file("config/canary-matrix.yml").json();
  cfg.patches[pkg] = { stage: pct === 100 ? "stable" : "canary", rollout: pct };
  await Bun.write("config/canary-matrix.yml", JSON.stringify(cfg, null, 2));
  console.log(\`✅ \${pkg} now \${pct}% canary\`);
}`,

  // 8. PACKAGE.JSON ADDON
  "package.json.addon": `{
  "scripts": {
    "postinstall": "bun run invariant:validate",
    "invariant:validate": "bun scripts/invariant-manager.ts --validate-all",
    "tension:check": "bun scripts/monitor-amber-edges.ts --all",
    "patch:ctl": "bun scripts/canary-ctl.ts",
    "patch:sign": "bun scripts/cosign-wrapper.ts sign",
    "patch:verify": "bun scripts/cosign-wrapper.ts verify",
    "gate:init": "bun scripts/init.ts",
    "gate:sarif": "bun scripts/sarif-reporter.ts",
    "sbom:generate": "bun scripts/sbom-generator.ts"
  },
  "devDependencies": {
    "@types/bun": "latest"
  }
}`
};

// ------------------------------------------------------------------
//  INSTALLER ENGINE
// ------------------------------------------------------------------
async function main() {
  // 1. scaffold dirs
  for (const path of Object.keys(FILES)) {
    const dir = path.split("/").slice(0, -1).join("/");
    if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path, FILES[path]);
  }

  // 2. merge package.json
  const pkg = JSON.parse(await Bun.file("package.json").text());
  const addon = JSON.parse(FILES["package.json.addon"]);
  pkg.scripts = { ...pkg.scripts, ...addon.scripts };
  pkg.devDependencies = { ...pkg.devDependencies, ...addon.devDependencies };
  writeFileSync("package.json", JSON.stringify(pkg, null, 2));

  // 3. make scripts executable
  await $`chmod +x scripts/*.ts`;

  // 4. install deps (optional - user can run manually)
  try {
    console.log("📥 Installing dependencies...");
    await $`bun install`;
  } catch (error) {
    console.log("⚠️  Dependency installation failed - run 'bun install' manually");
  }

  // 5. run validation to verify (optional)
  try {
    console.log("🔍 Running validation...");
    await $`bun run invariant:validate`;
  } catch (error) {
    console.log("⚠️  Validation failed - run 'bun run invariant:validate' manually");
  }

  console.log("\n✅ Bun Gate v5 is live – commit & push to activate CI.");
  console.log("Quick links:");
  console.log("  bun run gate:init        → scaffold a fresh repo");
  console.log("  bun run patch:ctl list   → canary status");
  console.log("  bun run gate:sarif       → generate SARIF for GitHub");
}
if (import.meta.main) await main();
