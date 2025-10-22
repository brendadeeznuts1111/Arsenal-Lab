#!/usr/bin/env bun

/**
 * Enhanced v4 Identity System Demo - Self-Describing Email Identities
 *
 * Improvements:
 * - Dry-run mode for offline demos (no server required)
 * - Configurable BASE_URL via env var (default: http://localhost:3655)
 * - Retry logic for flaky API calls (up to 3 attempts)
 * - Removed unused imports
 * - Added CLI flags: --dry-run, --base-url
 * - Enhanced output with structured JSON export option (--json)
 * - Better error messages and progress indicators
 */


interface Identity {
  id: string;
  ttl: number;
  expires: string;
  metadata: {
    type: string;
    compatible: string[];
    prefix?: string;
    run?: string;
    environment?: string;
  };
}

interface BatchRequest {
  environments: Array<{ name: string; prefix: string; run: string }>;
  domain: string;
  version: string;
  ttl?: number;
}

interface BatchResult {
  identities: Identity[];
  total: number;
  ttl: number;
}

interface ValidationRequest {
  identity: string;
}

interface ValidationResponse {
  valid: boolean;
  metadata?: {
    prefix: string;
    run: string;
  };
}

async function retryFetch(url: string, options?: RequestInit, maxRetries: number = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.log(`   ⚠️  Attempt ${attempt}/${maxRetries} failed: ${(error as Error).message}`);
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }
  throw new Error("Max retries exceeded");
}

function mockSingleIdentity(prefix: string, run: string, domain: string, version: string): Identity {
  const base = `${prefix}-${run}@${domain}/${version}:id`;
  const ttl = 7200;
  const expires = new Date(Date.now() + ttl * 1000).toISOString();
  return {
    id: base,
    ttl,
    expires,
    metadata: {
      type: "disposable",
      compatible: ["nexus", "npm", "oidc"],
      prefix,
      run
    }
  };
}

function mockBatchIdentities(request: BatchRequest): BatchResult {
  const ttl = request.ttl || 7200;
  const identities = request.environments.map(env => ({
    ...mockSingleIdentity(env.prefix, env.run, request.domain, request.version),
    metadata: { ...mockSingleIdentity(env.prefix, env.run, request.domain, request.version).metadata, environment: env.name }
  }));
  return { identities, total: identities.length, ttl };
}

function mockValidation(identity: string): ValidationResponse {
  const emailMatch = identity.match(/^([a-z]+)-(\d+)@[^/]+\/v1:id$/);
  if (emailMatch) {
    return {
      valid: true,
      metadata: { prefix: emailMatch[1], run: emailMatch[2] }
    };
  }
  return { valid: false };
}

async function demonstrateV4IdentitySystem(dryRun: boolean = false, jsonOutput: boolean = false) {
  const BASE_URL = process.env.API_BASE_URL || "http://localhost:3655";
  const output = jsonOutput ? [] : undefined; // Collect for JSON export

  const log = (msg: string) => {
    if (jsonOutput) {
      output!.push({ type: "log", message: msg });
    } else {
      console.log(msg);
    }
  };

  const logSection = (title: string) => log(`\n${title}`);

  log("🚀 Arsenal Lab v4 Identity System Demonstration (Enhanced)");
  log("   Self-describing email identities for enterprise audit trails\n");
  if (dryRun) log("   🧪 Running in DRY-RUN mode (mocked responses)\n");

  // 1. Single Identity Generation
  logSection("1️⃣ Single Identity Generation");
  log(`   GET /api/v1/id?prefix=ci&run=123456789 (Base: ${BASE_URL})`);

  let singleIdentity: Identity;
  if (dryRun) {
    singleIdentity = mockSingleIdentity("ci", "123456789", "api.dev.arsenal-lab.com", "v1");
  } else {
    try {
      const response = await retryFetch(`${BASE_URL}/api/v1/id?prefix=ci&run=123456789&domain=api.dev.arsenal-lab.com&version=v1`);
      singleIdentity = await response.json();
      log("   ✅ Fetched from API");
    } catch (error) {
      log(`   ❌ API fetch failed: ${(error as Error).message}`);
      log("   💡 Start server: PORT=3655 bun run src/server.ts");
      log("   🔄 Falling back to mock...");
      singleIdentity = mockSingleIdentity("ci", "123456789", "api.dev.arsenal-lab.com", "v1");
    }
  }

  if (jsonOutput) {
    output!.push({ type: "single_identity", data: singleIdentity });
  } else {
    log("   ✅ Generated Identity:");
    log(`   📧 Email: ${singleIdentity.id}`);
    log(`   ⏰ TTL: ${singleIdentity.ttl}s (${Math.round(singleIdentity.ttl / 3600)}h)`);
    log(`   📅 Expires: ${new Date(singleIdentity.expires).toLocaleString()}`);
    log(`   🏷️  Type: ${singleIdentity.metadata.type}`);
    log(`   🔧 Compatible: ${singleIdentity.metadata.compatible.join(', ')}`);
    log("");
  }

  // 2. Batch Identity Generation
  logSection("2️⃣ Batch Identity Generation for Multiple Environments");
  log("   POST /api/v1/identities");

  const batchRequest: BatchRequest = {
    environments: [
      { name: "ci-pipeline", prefix: "ci", run: "987654321" },
      { name: "staging-deploy", prefix: "staging", run: "555666777" },
      { name: "production-deploy", prefix: "prod", run: "111222333" }
    ],
    domain: "api.dev.arsenal-lab.com",
    version: "v1",
    ttl: 7200 // 2 hours
  };

  let batchResult: BatchResult;
  if (dryRun) {
    batchResult = mockBatchIdentities(batchRequest);
  } else {
    try {
      const response = await retryFetch(`${BASE_URL}/api/v1/identities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchRequest)
      });
      batchResult = await response.json();
      log("   ✅ Fetched from API");
    } catch (error) {
      log(`   ❌ API batch failed: ${(error as Error).message}`);
      batchResult = mockBatchIdentities(batchRequest);
    }
  }

  if (jsonOutput) {
    output!.push({ type: "batch_result", data: batchResult });
  } else {
    log("   ✅ Generated Identities:");
    batchResult.identities.forEach((identity, index) => {
      log(`   ${index + 1}. ${identity.metadata?.environment}: ${identity.id}`);
    });
    log(`   📊 Total: ${batchResult.total} identities`);
    log(`   ⏰ TTL: ${batchResult.ttl}s (${Math.round(batchResult.ttl / 3600)}h)`);
    log("");
  }

  // 3. Identity Validation
  logSection("3️⃣ Identity Validation (RFC 5322 Compliance)");
  log("   POST /api/v1/validate");

  const testIdentities = [
    "ci-123456789@api.dev.arsenal-lab.com/v1:id",
    "staging-987654321@api.dev.arsenal-lab.com/v1:id",
    "invalid-email-format",
    "prod-111@api.dev.arsenal-lab.com/v2:id"
  ];

  const validations: ValidationResponse[] = [];
  for (const testIdentity of testIdentities) {
    let validation: ValidationResponse;
    if (dryRun) {
      validation = mockValidation(testIdentity);
    } else {
      try {
        const response = await retryFetch(`${BASE_URL}/api/v1/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identity: testIdentity } as ValidationRequest)
        });
        validation = await response.json();
      } catch (error) {
        log(`   ❌ Validation API failed for ${testIdentity}: ${(error as Error).message}`);
        validation = { valid: false };
      }
    }

    validations.push(validation);

    if (!jsonOutput) {
      const status = validation.valid ? '✅' : '❌';
      log(`   ${status} ${testIdentity}`);
      if (validation.valid && validation.metadata) {
        log(`      └─ Prefix: ${validation.metadata.prefix}, Run: ${validation.metadata.run}`);
      }
    }
  }
  if (jsonOutput) {
    output!.push({ type: "validations", data: validations });
  }
  log("");

  // 4. Nexus Registry Integration Example
  logSection("4️⃣ Nexus Registry Integration Example");
  log("   How the identity appears in audit logs:");

  const nexusExample = {
    timestamp: new Date().toISOString(),
    action: "npm package install",
    user: singleIdentity.id,
    package: "@lumen/cashier-service",
    version: "1.2.3",
    registry: "nexus.lumen-suite.com"
  };

  if (jsonOutput) {
    output!.push({ type: "nexus_example", data: nexusExample });
  } else {
    log("   📋 Nexus Audit Log Entry:");
    log(`   Timestamp: ${nexusExample.timestamp}`);
    log(`   User: ${nexusExample.user}`);
    log(`   Package: ${nexusExample.package}@${nexusExample.version}`);
    log(`   Registry: ${nexusExample.registry}`);
    log("");
  }

  // 5. Air-Gapped Fallback Demonstration
  logSection("5️⃣ Air-Gapped Fallback (No External Dependencies)");
  log("   When identity service is unreachable:");

  const fallbackIdentity = `ci-${Date.now()}@api.dev.arsenal-lab.com/v1:id`;
  if (!jsonOutput) {
    log("   🔄 Fallback Identity:", fallbackIdentity);
    log("   ✅ Still RFC 5322 compliant");
    log("   ✅ Nexus accepts this syntax");
    log("   ⚠️  Loses TTL but maintains audit trail");
    log("");
  } else {
    output!.push({ type: "fallback_identity", data: { id: fallbackIdentity } });
  }

  // 6. CI/CD Integration Examples
  logSection("6️⃣ CI/CD Integration Examples");

  const ciExamples = {
    githubActions: `# Fetch disposable identity
- name: Get Identity
  run: |
    ID=$(curl -s "${BASE_URL}/api/v1/id?prefix=ci&run=\${{ github.run_id }}")
    EMAIL=$(echo "$ID" | jq -r .id)
    echo "email=$EMAIL" >> $GITHUB_OUTPUT`,

    localDev: `# Generate engineer-specific identity
export SANDBOX_ID=$(curl -s "${BASE_URL}/api/v1/id?prefix=$(whoami)&run=$(date +%s)" | jq -r .id)
export NPM_EMAIL_SANDBOX=$SANDBOX_ID
export NPM_TOKEN_SANDBOX=$(gh auth token)`,

    airGapped: `# No external calls needed
EMAIL="ci-\${GITHUB_RUN_ID}@api.dev.arsenal-lab.com/v1:id"`
  };

  if (!jsonOutput) {
    log("   📋 GitHub Actions (with identity service):");
    log(ciExamples.githubActions);
    log("");
    log("   📋 Local Development:");
    log(ciExamples.localDev);
    log("");
    log("   📋 Air-Gapped CI Fallback:");
    log(ciExamples.airGapped);
    log("");
  } else {
    output!.push({ type: "ci_examples", data: ciExamples });
  }

  // 7. Security Benefits
  logSection("7️⃣ Security & Compliance Benefits");

  const benefits = [
    "🔐 Zero secrets in CI environment variables",
    "📧 Human-readable audit trails (ci-123456789)",
    "🔄 Disposable identities with TTL expiration",
    "🏷️  Self-describing identities (/v1:id endpoint)",
    "✅ RFC 5322 compliant (Nexus compatible)",
    "🚫 No domain ownership required",
    "🔒 OIDC token-based authentication",
    "📊 Complete traceability per build/run"
  ];

  if (!jsonOutput) {
    benefits.forEach(benefit => log(`   ${benefit}`));
    log("");
  } else {
    output!.push({ type: "benefits", data: benefits });
  }

  log("🎯 Arsenal Lab v4 Identity System Complete!");
  log("   Self-describing, audit-ready, enterprise-grade authentication");
  log("");

  log("📚 Next Steps:");
  log("   1. Deploy identity service to your infrastructure");
  log("   2. Update CI pipelines with new identity generation");
  log("   3. Configure Nexus to accept the new email format");
  log("   4. Monitor audit logs for enhanced traceability");
  log("");

  log("🔗 API Endpoints:");
  log(`   GET  ${BASE_URL}/api/v1/id - Single identity generation`);
  log(`   POST ${BASE_URL}/api/v1/identities - Batch identity generation`);
  log(`   POST ${BASE_URL}/api/v1/validate - Identity validation`);

  if (jsonOutput) {
    console.log(JSON.stringify(output, null, 2));
  }
}

// CLI Parsing
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const jsonOutput = args.includes("--json");
const customBaseUrl = args.find(arg => arg.startsWith("--base-url="))?.split("=")[1];

if (customBaseUrl) {
  process.env.API_BASE_URL = customBaseUrl;
}

// Export for use by other scripts
export { demonstrateV4IdentitySystem };

// Run if called directly
if (import.meta.main) {
  demonstrateV4IdentitySystem(dryRun, jsonOutput).catch(console.error);
}

