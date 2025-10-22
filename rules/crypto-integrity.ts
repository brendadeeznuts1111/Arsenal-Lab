#!/usr/bin/env bun
import type { InvariantRule } from './index.ts';

const rule: InvariantRule = {
  name: "cryptographic-integrity",
  description: "Security packages cannot use insecure hashing algorithms",
  severity: "critical",
  tags: ["security", "crypto", "hashing"],

  validate: (patchContent: string, packageName: string) => {
    // Check if this is a security-related package
    const securityKeywords = ["crypto", "auth", "jwt", "hash", "security", "tls", "ssl", "encrypt", "decrypt"];
    const isSecurityPackage = securityKeywords.some(keyword =>
      packageName.toLowerCase().includes(keyword)
    );

    if (!isSecurityPackage) return true; // Skip non-security packages

    // Check for insecure hashing algorithms
    const insecureAlgorithms = [
      "md5", "sha1", "crc32", "adler32",
      "rapidhash", "murmurhash", "fnv1", "fnv1a"
    ];

    const algorithmRegex = new RegExp(`\\b(${insecureAlgorithms.join('|')})\\b`, 'gi');
    const hasInsecureAlgorithm = algorithmRegex.test(patchContent);

    return !hasInsecureAlgorithm;
  }
};

export default rule;
