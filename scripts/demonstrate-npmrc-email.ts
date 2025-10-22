#!/usr/bin/env bun

/**
 * Demonstrate Bun v1.3.1 :email in .npmrc Feature
 *
 * Showcases the email authentication support for private registries:
 * https://bun.com/blog/bun-v1.3.1#email-in-npmrc
 */

import { $ } from "bun";
import { join } from "path";

async function demonstrateNpmrcEmail() {
  console.log("📧 Bun v1.3.1 :email in .npmrc Demonstration\n");

  // Create example .npmrc configurations
  console.log("1️⃣ Creating example .npmrc configurations for private registries:");

  const examples = {
    "sonatype-nexus": {
      description: "Sonatype Nexus Repository",
      npmrc: `# Sonatype Nexus with email authentication
# This now works with Bun v1.3.1!
registry=https://nexus.example.com/repository/npm-all/
//nexus.example.com/:email=developer@example.com
//nexus.example.com/:username=myuser
//nexus.example.com/:_password=bXlwYXNzd29yZA==
`,
      features: [
        "Email field supported",
        "Username/password authentication",
        "Base64 encoded password"
      ]
    },

    "jfrog-artifactory": {
      description: "JFrog Artifactory",
      npmrc: `# JFrog Artifactory with email
registry=https://artifactory.example.com/artifactory/api/npm/npm/
//artifactory.example.com/:email=team@example.com
//artifactory.example.com/:username=service-account
//artifactory.example.com/:_authToken=dG9rZW4xMjM=
`,
      features: [
        "Email authentication",
        "Token-based auth",
        "Scoped registry support"
      ]
    },

    "github-packages": {
      description: "GitHub Packages",
      npmrc: `# GitHub Packages with email
registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:email=github-user@example.com
//npm.pkg.github.com/:username=github-user
//npm.pkg.github.com/:_authToken=github_pat_token
`,
      features: [
        "GitHub PAT authentication",
        "Email required by GitHub",
        "Personal access tokens"
      ]
    },

    "scoped-registries": {
      description: "Multiple scoped registries",
      npmrc: `# Multiple registries with email support
registry=https://registry.npmjs.org/

# Company internal packages
@mycompany:registry=https://nexus.company.com/repository/npm-private/
//nexus.company.com/:email=employee@company.com
//nexus.company.com/:username=employee
//nexus.company.com/:_authToken=internal_token

# Public packages from npm
//registry.npmjs.org/:email=developer@example.com
//registry.npmjs.org/:username=developer
//registry.npmjs.org/:_authToken=npm_token
`,
      features: [
        "Multiple scoped registries",
        "Different auth per registry",
        "Mixed auth methods"
      ]
    }
  };

  // Create demonstration directory
  const demoDir = "npmrc-demo";
  await $`rm -rf ${demoDir}`.quiet();
  await $`mkdir -p ${demoDir}`.quiet();

  for (const [name, config] of Object.entries(examples)) {
    console.log(`\n📝 ${config.description}:`);
    console.log(`   ${"─".repeat(config.description.length + 2)}`);

    const npmrcPath = join(demoDir, `${name}.npmrc`);
    await Bun.write(npmrcPath, config.npmrc);

    console.log("   📄 Configuration features:");
    config.features.forEach(feature => console.log(`   • ✅ ${feature}`));

    console.log("   📋 Example .npmrc content:");
    console.log("   " + config.npmrc.split('\n').map(line =>
      line.startsWith('#') ? `   ${line}` : `   ${line}`
    ).join('\n   '));
  }

  console.log("\n2️⃣ Testing email field parsing (simulated):");

  // Simulate parsing .npmrc files
  for (const [name] of Object.entries(examples)) {
    const npmrcPath = join(demoDir, `${name}.npmrc`);
    const content = await Bun.file(npmrcPath).text();

    console.log(`\n🔍 Parsing ${name}.npmrc:`);

    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    const config: Record<string, string> = {};

    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        config[key] = value;
      }
    });

    // Check for email fields
    const emailKeys = Object.keys(config).filter(key => key.includes(':email'));
    if (emailKeys.length > 0) {
      console.log("   ✅ Email fields found:");
      emailKeys.forEach(key => {
        const email = config[key];
        console.log(`   • ${key} → ${email}`);
      });
    } else {
      console.log("   ⚠️ No email fields found in this configuration");
    }

    // Check for other auth fields
    const authKeys = Object.keys(config).filter(key =>
      key.includes(':username') ||
      key.includes(':_password') ||
      key.includes(':_authToken')
    );

    if (authKeys.length > 0) {
      console.log("   🔐 Authentication fields:");
      authKeys.forEach(key => {
        const value = config[key];
        const masked = key.includes(':_password') || key.includes(':_authToken')
          ? value.substring(0, 8) + '...'
          : value;
        console.log(`   • ${key} → ${masked}`);
      });
    }
  }

  console.log("\n3️⃣ Usage examples with Bun v1.3.1:");

  const usageExamples = [
    {
      command: "bun install",
      description: "Reads .npmrc and forwards email for authentication",
      benefit: "Seamless private registry access"
    },
    {
      command: "bun add @mycompany/internal-package",
      description: "Uses scoped registry config with email auth",
      benefit: "Automatic registry selection"
    },
    {
      command: "bun pm ls",
      description: "Lists packages from authenticated registries",
      benefit: "Shows all accessible packages"
    },
    {
      command: "bun pm publish",
      description: "Publishes to authenticated registry",
      benefit: "Maintains authentication context"
    }
  ];

  usageExamples.forEach((example, index) => {
    console.log(`\n${index + 1}. ${example.command}`);
    console.log(`   📝 ${example.description}`);
    console.log(`   🎯 ${example.benefit}`);
  });

  console.log("\n4️⃣ Enterprise benefits:");

  const benefits = [
    "🔐 Enhanced Security: Email-based authentication for private registries",
    "🏢 Enterprise Ready: Compatible with Sonatype Nexus, JFrog Artifactory",
    "🔄 Seamless Integration: No changes needed to existing .npmrc files",
    "📦 Monorepo Support: Different auth per scoped registry",
    "🚀 Developer Experience: Automatic authentication without manual setup"
  ];

  benefits.forEach(benefit => console.log(`   ${benefit}`));

  // Cleanup
  await $`rm -rf ${demoDir}`.quiet();

  console.log("\n🎯 Summary:");
  console.log("   ✅ Bun v1.3.1 supports :email field in .npmrc");
  console.log("   ✅ Works with private registries requiring email auth");
  console.log("   ✅ Compatible with existing .npmrc configurations");
  console.log("   ✅ Enables seamless enterprise package management");

  console.log("\n🔗 Reference: https://bun.com/blog/bun-v1.3.1#email-in-npmrc");
}

// Run if called directly
if (import.meta.main) {
  demonstrateNpmrcEmail().catch(console.error);
}
