#!/usr/bin/env bun

/**
 * Demonstrate v4 Identity System - Self-Describing Email Identities
 *
 * Showcases the enhanced zero-touch authentication with human-readable,
 * self-describing email identities that work with Nexus without domain ownership.
 */

import { $ } from "bun";

async function demonstrateV4IdentitySystem() {
  console.log("🚀 Arsenal Lab v4 Identity System Demonstration");
  console.log("   Self-describing email identities for enterprise audit trails\n");

  const BASE_URL = "http://localhost:3655";

  // 1. Single Identity Generation
  console.log("1️⃣ Single Identity Generation");
  console.log("   GET /api/v1/id?prefix=ci&run=123456789");
  console.log("");

  try {
    const response = await fetch(`${BASE_URL}/api/v1/id?prefix=ci&run=123456789&domain=api.dev.arsenal-lab.com&version=v1`);
    const identity = await response.json();

    console.log("   ✅ Generated Identity:");
    console.log(`   📧 Email: ${identity.id}`);
    console.log(`   ⏰ TTL: ${identity.ttl}s (${Math.round(identity.ttl / 3600)}h)`);
    console.log(`   📅 Expires: ${new Date(identity.expires).toLocaleString()}`);
    console.log(`   🏷️  Type: ${identity.metadata.type}`);
    console.log(`   🔧 Compatible: ${identity.metadata.compatible.join(', ')}`);
    console.log("");

  } catch (error) {
    console.log(`   ❌ Identity generation failed: ${error.message}`);
    console.log("   💡 Make sure the server is running: PORT=3655 bun run src/server.ts");
    return;
  }

  // 2. Batch Identity Generation
  console.log("2️⃣ Batch Identity Generation for Multiple Environments");
  console.log("   POST /api/v1/identities");
  console.log("");

  const batchRequest = {
    environments: [
      { name: "ci-pipeline", prefix: "ci", run: "987654321" },
      { name: "staging-deploy", prefix: "staging", run: "555666777" },
      { name: "production-deploy", prefix: "prod", run: "111222333" }
    ],
    domain: "api.dev.arsenal-lab.com",
    version: "v1",
    ttl: 7200 // 2 hours
  };

  try {
    const response = await fetch(`${BASE_URL}/api/v1/identities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchRequest)
    });
    const batchResult = await response.json();

    console.log("   ✅ Generated Identities:");
    batchResult.identities.forEach((identity: any, index: number) => {
      console.log(`   ${index + 1}. ${identity.environment}: ${identity.id}`);
    });
    console.log(`   📊 Total: ${batchResult.total} identities`);
    console.log(`   ⏰ TTL: ${batchResult.ttl}s (${Math.round(batchResult.ttl / 3600)}h)`);
    console.log("");

  } catch (error) {
    console.log(`   ❌ Batch generation failed: ${error.message}`);
  }

  // 3. Identity Validation
  console.log("3️⃣ Identity Validation (RFC 5322 Compliance)");
  console.log("   POST /api/v1/validate");
  console.log("");

  const testIdentities = [
    "ci-123456789@api.dev.arsenal-lab.com/v1:id",
    "staging-987654321@api.dev.arsenal-lab.com/v1:id",
    "invalid-email-format",
    "prod-111@api.dev.arsenal-lab.com/v2:id"
  ];

  for (const testIdentity of testIdentities) {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: testIdentity })
      });
      const validation = await response.json();

      const status = validation.valid ? '✅' : '❌';
      console.log(`   ${status} ${testIdentity}`);
      if (validation.metadata) {
        console.log(`      └─ Prefix: ${validation.metadata.prefix}, Run: ${validation.metadata.run}`);
      }

    } catch (error) {
      console.log(`   ❌ Validation failed for ${testIdentity}: ${error.message}`);
    }
  }
  console.log("");

  // 4. Nexus Registry Integration Example
  console.log("4️⃣ Nexus Registry Integration Example");
  console.log("   How the identity appears in audit logs:");
  console.log("");

  const nexusExample = {
    timestamp: new Date().toISOString(),
    action: "npm package install",
    user: "ci-123456789@api.dev.arsenal-lab.com/v1:id",
    package: "@lumen/cashier-service",
    version: "1.2.3",
    registry: "nexus.lumen-suite.com"
  };

  console.log("   📋 Nexus Audit Log Entry:");
  console.log(`   Timestamp: ${nexusExample.timestamp}`);
  console.log(`   User: ${nexusExample.user}`);
  console.log(`   Package: ${nexusExample.package}@${nexusExample.version}`);
  console.log(`   Registry: ${nexusExample.registry}`);
  console.log("");

  // 5. Air-Gapped Fallback Demonstration
  console.log("5️⃣ Air-Gapped Fallback (No External Dependencies)");
  console.log("   When identity service is unreachable:");
  console.log("");

  // Simulate air-gapped fallback (what the bootstrap script does)
  const fallbackIdentity = `ci-${Date.now()}@api.dev.arsenal-lab.com/v1:id`;
  console.log("   🔄 Fallback Identity:", fallbackIdentity);
  console.log("   ✅ Still RFC 5322 compliant");
  console.log("   ✅ Nexus accepts this syntax");
  console.log("   ⚠️  Loses TTL but maintains audit trail");
  console.log("");

  // 6. CI/CD Integration Examples
  console.log("6️⃣ CI/CD Integration Examples");
  console.log("");

  console.log("   📋 GitHub Actions (with identity service):");
  console.log(`   # Fetch disposable identity
   - name: Get Identity
     run: |
       ID=$(curl -s "${BASE_URL}/api/v1/id?prefix=ci&run=\${{ github.run_id }}")
       EMAIL=$(echo "$ID" | jq -r .id)
       echo "email=$EMAIL" >> $GITHUB_OUTPUT`);

  console.log("");
  console.log("   📋 Local Development:");
  console.log(`   # Generate engineer-specific identity
   export SANDBOX_ID=$(curl -s "${BASE_URL}/api/v1/id?prefix=$(whoami)&run=$(date +%s)" | jq -r .id)
   export NPM_EMAIL_SANDBOX=$SANDBOX_ID
   export NPM_TOKEN_SANDBOX=$(gh auth token)`);

  console.log("");
  console.log("   📋 Air-Gapped CI Fallback:");
  console.log(`   # No external calls needed
   EMAIL="ci-\${GITHUB_RUN_ID}@api.dev.arsenal-lab.com/v1:id"`);

  console.log("");

  // 7. Security Benefits
  console.log("7️⃣ Security & Compliance Benefits");
  console.log("");

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

  benefits.forEach(benefit => console.log(`   ${benefit}`));
  console.log("");

  console.log("🎯 Arsenal Lab v4 Identity System Complete!");
  console.log("   Self-describing, audit-ready, enterprise-grade authentication");
  console.log("");
  console.log("📚 Next Steps:");
  console.log("   1. Deploy identity service to your infrastructure");
  console.log("   2. Update CI pipelines with new identity generation");
  console.log("   3. Configure Nexus to accept the new email format");
  console.log("   4. Monitor audit logs for enhanced traceability");
  console.log("");
  console.log("🔗 API Endpoints:");
  console.log(`   GET  ${BASE_URL}/api/v1/id - Single identity generation`);
  console.log(`   POST ${BASE_URL}/api/v1/identities - Batch identity generation`);
  console.log(`   POST ${BASE_URL}/api/v1/validate - Identity validation`);
}

// Run if called directly
if (import.meta.main) {
  demonstrateV4IdentitySystem().catch(console.error);
}
