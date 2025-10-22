#!/usr/bin/env bun
import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { join, relative } from "path";
import { createHash } from "crypto";

interface SPDXDocument {
  spdxVersion: string;
  dataLicense: string;
  SPDXID: string;
  documentName: string;
  documentNamespace: string;
  creationInfo: {
    created: string;
    creators: string[];
  };
  packages: SPDXPackage[];
}

interface SPDXPackage {
  SPDXID: string;
  name: string;
  versionInfo?: string;
  downloadLocation: string;
  filesAnalyzed: boolean;
  copyrightText: string;
  licenseConcluded: string;
  licenseDeclared: string;
  checksums: SPDXChecksum[];
  externalRefs?: SPDXExternalRef[];
}

interface SPDXChecksum {
  algorithm: string;
  checksumValue: string;
}

interface SPDXExternalRef {
  referenceCategory: string;
  referenceType: string;
  referenceLocator: string;
}

class SBOMGenerator {
  private documentName: string;
  private namespace: string;

  constructor(documentName = "bun-system-gate-patches", namespace = "https://bun.sh/patches") {
    this.documentName = documentName;
    this.namespace = namespace;
  }

  /**
   * Generate SPDX SBOM for patches
   */
  async generateSBOM(patchesDir: string, outputPath: string): Promise<void> {
    console.log(`📦 Generating SPDX SBOM for patches in: ${patchesDir}`);

    const packages = await this.scanPatches(patchesDir);

    const document: SPDXDocument = {
      spdxVersion: "SPDX-2.3",
      dataLicense: "CC0-1.0",
      SPDXID: "SPDXRef-DOCUMENT",
      documentName: this.documentName,
      documentNamespace: `${this.namespace}/${Date.now()}`,
      creationInfo: {
        created: new Date().toISOString(),
        creators: ["Tool: bun-system-gate-3.0.0", "Organization: Bun Team"]
      },
      packages
    };

    writeFileSync(outputPath, JSON.stringify(document, null, 2));
    console.log(`✅ SPDX SBOM generated: ${outputPath}`);
    console.log(`📊 Included ${packages.length} packages`);
  }

  /**
   * Scan patches directory and create SPDX packages
   */
  private async scanPatches(patchesDir: string): Promise<SPDXPackage[]> {
    const packages: SPDXPackage[] = [];

    if (!Bun.file) {
      throw new Error("This tool requires Bun runtime");
    }

    try {
      await this.scanDirectory(patchesDir, packages);
    } catch (error) {
      console.warn(`Warning: Could not scan patches directory: ${error.message}`);
    }

    return packages;
  }

  /**
   * Recursively scan directory for patch files
   */
  private async scanDirectory(dirPath: string, packages: SPDXPackage[]): Promise<void> {
    const entries = readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath, packages);
      } else if (entry.name.endsWith('.patch')) {
        const pkg = await this.createSPDXPackage(fullPath);
        packages.push(pkg);
      }
    }
  }

  /**
   * Create SPDX package from patch file
   */
  private async createSPDXPackage(patchPath: string): Promise<SPDXPackage> {
    const fileName = patchPath.split('/').pop() || 'unknown.patch';
    const packageName = fileName.replace('.patch', '');
    const [name, version] = packageName.split('@');

    // Calculate checksums
    const content = readFileSync(patchPath);
    const sha256 = createHash('sha256').update(content).digest('hex');
    const sha1 = createHash('sha1').update(content).digest('hex');

    // Extract package info from patch content
    const patchContent = content.toString();
    const packageInfo = this.extractPackageInfo(patchContent, name, version);

    return {
      SPDXID: `SPDXRef-Package-${packageName.replace(/[@\/]/g, '-')}`,
      name: packageName,
      versionInfo: version || "latest",
      downloadLocation: "NOASSERTION",
      filesAnalyzed: true,
      copyrightText: "NOASSERTION",
      licenseConcluded: "NOASSERTION",
      licenseDeclared: "NOASSERTION",
      checksums: [
        {
          algorithm: "SHA256",
          checksumValue: sha256
        },
        {
          algorithm: "SHA1",
          checksumValue: sha1
        }
      ],
      externalRefs: [
        {
          referenceCategory: "PACKAGE-MANAGER",
          referenceType: "purl",
          referenceLocator: `pkg:npm/${name}${version ? `@${version}` : ''}`
        },
        {
          referenceCategory: "SECURITY",
          referenceType: "url",
          referenceLocator: `https://github.com/bun-system-gate/security/${packageName}`
        }
      ]
    };
  }

  /**
   * Extract package information from patch content
   */
  private extractPackageInfo(patchContent: string, name: string, version?: string): any {
    // Extract metadata from patch headers
    const lines = patchContent.split('\n');
    const metadata: any = {};

    for (const line of lines.slice(0, 10)) {
      if (line.includes('# Category:')) {
        metadata.category = line.replace('# Category:', '').trim();
      }
      if (line.includes('# Created:')) {
        metadata.created = line.replace('# Created:', '').trim();
      }
      if (line.includes('# Description:')) {
        metadata.description = line.replace('# Description:', '').trim();
      }
    }

    return metadata;
  }

  /**
   * Validate SBOM document
   */
  validateSBOM(document: SPDXDocument): boolean {
    // Basic validation
    if (!document.packages || document.packages.length === 0) {
      console.error("❌ SBOM validation failed: No packages found");
      return false;
    }

    for (const pkg of document.packages) {
      if (!pkg.name || !pkg.checksums || pkg.checksums.length === 0) {
        console.error(`❌ SBOM validation failed: Invalid package ${pkg.name || 'unknown'}`);
        return false;
      }
    }

    console.log("✅ SBOM validation passed");
    return true;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("📦 SPDX SBOM Generator for Bun System Gate");
    console.log("");
    console.log("Usage:");
    console.log("  bun run sbom-generator.ts <patches-dir> [output-path]");
    console.log("");
    console.log("Examples:");
    console.log("  bun run sbom-generator.ts patches/ sbom.spdx.json");
    console.log("  bun run sbom-generator.ts . sbom.json");
    console.log("");
    console.log("Generates SPDX 2.3 format SBOM for patch files.");
    return;
  }

  const [patchesDir, outputPath = "sbom.spdx.json"] = args;

  try {
    const generator = new SBOMGenerator();
    await generator.generateSBOM(patchesDir, outputPath);

    // Validate the generated SBOM
    const sbomContent = readFileSync(outputPath, "utf-8");
    const sbom = JSON.parse(sbomContent);

    if (generator.validateSBOM(sbom)) {
      console.log("🎉 SBOM generation and validation completed successfully!");
    } else {
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ SBOM generation failed:", error);
    process.exit(1);
  }
}

if (import.meta.main) await main();
