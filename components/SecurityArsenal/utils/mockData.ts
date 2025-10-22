// components/SecurityArsenal/utils/mockData.ts
import type { AuditResult, Vulnerability } from '../hooks/useSecurityArsenal';

export const DEMO_VULNERABILITIES: Vulnerability[] = [
  {
    cve: 'CVE-2024-12345',
    severity: 'critical',
    package: 'example-vulnerable-package',
    version: '<=2.1.4',
    title: 'Remote Code Execution in authentication module',
    url: 'https://github.com/advisories/GHSA-example-critical',
    patched: 'v2.1.5'
  },
  {
    cve: 'CVE-2024-23456',
    severity: 'high',
    package: 'insecure-crypto-lib',
    version: '1.0.0 - 1.5.9',
    title: 'Cryptographic weakness in key generation',
    url: 'https://github.com/advisories/GHSA-example-high',
    patched: 'v1.6.0'
  },
  {
    cve: 'CVE-2024-34567',
    severity: 'high',
    package: 'path-traversal-module',
    version: '<3.2.0',
    title: 'Path traversal vulnerability allowing file access',
    url: 'https://github.com/advisories/GHSA-example-path',
    patched: 'v3.2.1'
  },
  {
    cve: 'CVE-2024-45678',
    severity: 'moderate',
    package: 'outdated-parser',
    version: '>=1.0.0 <2.4.1',
    title: 'Denial of service via malformed input',
    url: 'https://github.com/advisories/GHSA-example-moderate',
    patched: 'v2.4.1'
  },
  {
    cve: 'CVE-2024-56789',
    severity: 'moderate',
    package: 'xml-processor',
    version: '*',
    title: 'XML External Entity (XXE) injection',
    url: 'https://github.com/advisories/GHSA-example-xxe',
    patched: 'v4.0.0'
  },
  {
    cve: 'CVE-2024-67890',
    severity: 'low',
    package: 'deprecation-warning',
    version: '<5.1.0',
    title: 'Information disclosure in error messages',
    url: 'https://github.com/advisories/GHSA-example-low',
    patched: 'v5.1.2'
  },
  {
    cve: 'CVE-2024-78901',
    severity: 'low',
    package: 'logging-utility',
    version: '2.0.0 - 2.3.5',
    title: 'Sensitive data exposure in debug logs',
    url: 'https://github.com/advisories/GHSA-example-logging'
  }
];

export function generateDemoAuditResult(): AuditResult {
  const vulnerabilities = DEMO_VULNERABILITIES;

  const metadata = {
    total: vulnerabilities.length,
    critical: vulnerabilities.filter(v => v.severity === 'critical').length,
    high: vulnerabilities.filter(v => v.severity === 'high').length,
    moderate: vulnerabilities.filter(v => v.severity === 'moderate').length,
    low: vulnerabilities.filter(v => v.severity === 'low').length
  };

  return {
    vulnerabilities,
    metadata,
    timestamp: Date.now()
  };
}

export function isDemoMode(): boolean {
  // Check if we're in demo mode (no bun.lock file or explicitly requested)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('demo') === 'true';
  }
  return false;
}
