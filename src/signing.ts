#!/usr/bin/env bun
import { $ } from "bun";
import { existsSync } from "node:fs";
import { join } from "path";

export interface SigningConfig {
  keyPath?: string;
  certPath?: string;
  allowHTTPRegistry?: boolean;
  rekorURL?: string;
  fulcioURL?: string;
}

export class CosignWrapper {
  private config: SigningConfig;

  constructor(config: SigningConfig = {}) {
    this.config = {
      allowHTTPRegistry: false,
      rekorURL: "https://rekor.sigstore.dev",
      fulcioURL: "https://fulcio.sigstore.dev",
      ...config
    };
  }

  /**
   * Sign a patch file using cosign
   */
  async signPatch(patchFile: string, keyPath?: string): Promise<string> {
    const signatureFile = `${patchFile}.sig`;

    console.log(`🔐 Signing patch: ${patchFile}`);

    try {
      let cmd = `cosign sign-blob --yes --output-signature ${signatureFile}`;

      if (keyPath || this.config.keyPath) {
        cmd += ` --key-file ${keyPath || this.config.keyPath}`;
      }

      if (this.config.certPath) {
        cmd += ` --cert ${this.config.certPath}`;
      }

      if (this.config.allowHTTPRegistry) {
        cmd += ` --allow-http-registry`;
      }

      if (this.config.rekorURL) {
        cmd += ` --rekor-url ${this.config.rekorURL}`;
      }

      if (this.config.fulcioURL) {
        cmd += ` --fulcio-url ${this.config.fulcioURL}`;
      }

      cmd += ` ${patchFile}`;

      await $`${cmd}`;

      console.log(`✅ Patch signed: ${signatureFile}`);
      return signatureFile;

    } catch (error) {
      console.error(`❌ Failed to sign patch ${patchFile}:`, error);
      throw new Error(`Patch signing failed: ${error.message}`);
    }
  }

  /**
   * Verify a patch signature using cosign
   */
  async verifyPatch(patchFile: string, signatureFile?: string): Promise<boolean> {
    const sigFile = signatureFile || `${patchFile}.sig`;

    if (!existsSync(sigFile)) {
      console.error(`❌ Signature file not found: ${sigFile}`);
      return false;
    }

    console.log(`🔍 Verifying patch signature: ${patchFile}`);

    try {
      let cmd = `cosign verify-blob`;

      if (this.config.certPath) {
        cmd += ` --cert ${this.config.certPath}`;
      }

      if (this.config.rekorURL) {
        cmd += ` --rekor-url ${this.config.rekorURL}`;
      }

      cmd += ` --signature ${sigFile} ${patchFile}`;

      await $`${cmd}`;

      console.log(`✅ Patch signature verified: ${patchFile}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to verify patch ${patchFile}:`, error);
      return false;
    }
  }

  /**
   * Sign all patches in the patches directory
   */
  async signAllPatches(patchesDir: string = "patches"): Promise<string[]> {
    const signedFiles: string[] = [];

    // Find all patch files
    const patchFiles = await this.findPatchFiles(patchesDir);

    for (const patchFile of patchFiles) {
      try {
        const sigFile = await this.signPatch(patchFile);
        signedFiles.push(sigFile);
      } catch (error) {
        console.error(`Failed to sign ${patchFile}:`, error);
        // Continue with other patches
      }
    }

    return signedFiles;
  }

  /**
   * Verify all patches in the patches directory
   */
  async verifyAllPatches(patchesDir: string = "patches"): Promise<{ valid: string[], invalid: string[] }> {
    const valid: string[] = [];
    const invalid: string[] = [];

    const patchFiles = await this.findPatchFiles(patchesDir);

    for (const patchFile of patchFiles) {
      const isValid = await this.verifyPatch(patchFile);
      if (isValid) {
        valid.push(patchFile);
      } else {
        invalid.push(patchFile);
      }
    }

    return { valid, invalid };
  }

  /**
   * Find all patch files in a directory
   */
  private async findPatchFiles(dir: string): Promise<string[]> {
    try {
      const result = await $`find ${dir} -name "*.patch" -type f`;
      return result.stdout.trim().split('\n').filter(f => f.length > 0);
    } catch (error) {
      console.warn(`Warning: Could not find patch files in ${dir}:`, error);
      return [];
    }
  }

  /**
   * Generate a key pair for signing
   */
  async generateKeyPair(outputDir: string = "."): Promise<{ publicKey: string, privateKey: string }> {
    console.log("🔑 Generating cosign key pair...");

    try {
      await $`cosign generate-key-pair --output-directory ${outputDir}`;

      const publicKey = join(outputDir, "cosign.pub");
      const privateKey = join(outputDir, "cosign.key");

      console.log(`✅ Key pair generated:`);
      console.log(`   Public key: ${publicKey}`);
      console.log(`   Private key: ${privateKey}`);

      return { publicKey, privateKey };

    } catch (error) {
      console.error("❌ Failed to generate key pair:", error);
      throw new Error(`Key generation failed: ${error.message}`);
    }
  }

  /**
   * Check if cosign is available
   */
  async checkCosignInstallation(): Promise<boolean> {
    try {
      await $`cosign version`;
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Utility functions
export async function signPatchFile(patchFile: string, config?: SigningConfig): Promise<string> {
  const cosign = new CosignWrapper(config);
  return cosign.signPatch(patchFile);
}

export async function verifyPatchFile(patchFile: string, config?: SigningConfig): Promise<boolean> {
  const cosign = new CosignWrapper(config);
  return cosign.verifyPatch(patchFile);
}

export async function signAllPatches(config?: SigningConfig): Promise<string[]> {
  const cosign = new CosignWrapper(config);
  return cosign.signAllPatches();
}

export async function verifyAllPatches(config?: SigningConfig): Promise<{ valid: string[], invalid: string[] }> {
  const cosign = new CosignWrapper(config);
  return cosign.verifyAllPatches();
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const cosign = new CosignWrapper();

  // Check if cosign is installed
  const cosignAvailable = await cosign.checkCosignInstallation();
  if (!cosignAvailable) {
    console.error("❌ cosign is not installed. Please install it from https://github.com/sigstore/cosign");
    process.exit(1);
  }

  try {
    switch (command) {
      case "sign":
        if (args.length < 2) {
          console.error("Usage: bun run signing.ts sign <patch-file> [key-file]");
          process.exit(1);
        }
        await cosign.signPatch(args[1], args[2]);
        break;

      case "verify":
        if (args.length < 2) {
          console.error("Usage: bun run signing.ts verify <patch-file> [signature-file]");
          process.exit(1);
        }
        const isValid = await cosign.verifyPatch(args[1], args[2]);
        console.log(isValid ? "✅ Valid signature" : "❌ Invalid signature");
        break;

      case "sign-all":
        const signed = await cosign.signAllPatches(args[1]);
        console.log(`✅ Signed ${signed.length} patches`);
        break;

      case "verify-all":
        const result = await cosign.verifyAllPatches(args[1]);
        console.log(`✅ Valid: ${result.valid.length}`);
        console.log(`❌ Invalid: ${result.invalid.length}`);
        if (result.invalid.length > 0) {
          console.log("Invalid patches:", result.invalid);
          process.exit(1);
        }
        break;

      case "generate-key":
        await cosign.generateKeyPair(args[1]);
        break;

      default:
        console.log("🔐 Cosign Wrapper for Patch Signing");
        console.log("");
        console.log("Commands:");
        console.log("  sign <patch-file> [key-file]     Sign a patch file");
        console.log("  verify <patch-file> [sig-file]   Verify a patch signature");
        console.log("  sign-all [patches-dir]           Sign all patches");
        console.log("  verify-all [patches-dir]         Verify all patches");
        console.log("  generate-key [output-dir]        Generate key pair");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

if (import.meta.main) await main();
