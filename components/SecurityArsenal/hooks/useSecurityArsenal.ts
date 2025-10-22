// components/SecurityArsenal/hooks/useSecurityArsenal.ts
import { useState, useCallback, useEffect } from 'react';
import { generateDemoAuditResult, isDemoMode } from '../utils/mockData';
import { saveAuditResult, getLatestAuditResult, getAuditHistory, getAuditStats, clearAuditHistory } from '../utils/storage';

export interface Vulnerability {
  cve: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  package: string;
  version: string;
  title: string;
  url: string;
  patched?: string | undefined;
}

export interface AuditResult {
  vulnerabilities: Vulnerability[];
  metadata: {
    total: number;
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  timestamp: number;
}

export function useSecurityArsenal() {
  const [isScanning, setIsScanning] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'moderate' | 'high' | 'critical'>('all');
  const [prodOnly, setProdOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(isDemoMode());
  const [history, setHistory] = useState(getAuditHistory());
  const [stats, setStats] = useState(getAuditStats());

  // Load latest result on mount
  useEffect(() => {
    const latest = getLatestAuditResult();
    if (latest && !auditResult) {
      setAuditResult(latest.result);
    }
  }, []);

  // Update stats when audit result changes
  useEffect(() => {
    setStats(getAuditStats());
    setHistory(getAuditHistory());
  }, [auditResult]);

  const runAudit = useCallback(async () => {
    setIsScanning(true);
    setError(null);

    try {
      // Demo mode: use mock data
      if (demoMode) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        const demoResult = generateDemoAuditResult();
        setAuditResult(demoResult);
        saveAuditResult(demoResult, { prodOnly, auditLevel: filterSeverity });
        return;
      }

      // In browser, we need to call a backend endpoint
      const response = await fetch('/api/security/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prodOnly,
          auditLevel: filterSeverity !== 'all' ? filterSeverity : undefined
        })
      });

      if (!response.ok) {
        // If API fails, offer demo mode
        if (response.status === 404 || response.status === 500) {
          setError('Unable to run audit. No bun.lock found or audit failed. Try demo mode?');
          setIsScanning(false);
          return;
        }
        throw new Error(`Audit failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Parse audit results
      const vulnerabilities: Vulnerability[] = [];
      const metadata = {
        total: 0,
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0
      };

      // Extract vulnerabilities from npm audit format
      if (data.vulnerabilities) {
        for (const [pkg, vulnData] of Object.entries(data.vulnerabilities as any)) {
          const vuln = vulnData as any;
          if (vuln.via && Array.isArray(vuln.via)) {
            for (const via of vuln.via) {
              if (typeof via === 'object' && via.severity) {
                const vulnerability: Vulnerability = {
                  cve: via.cve || via.source || `VIA-${pkg}`,
                  severity: via.severity,
                  package: pkg,
                  version: vuln.range || 'unknown',
                  title: via.title || 'Vulnerability',
                  url: via.url || '',
                };
                if (vuln.fixAvailable) {
                  vulnerability.patched = 'Available';
                }
                vulnerabilities.push(vulnerability);
                metadata[via.severity as keyof typeof metadata]++;
                metadata.total++;
              }
            }
          }
        }
      }

      const result: AuditResult = {
        vulnerabilities,
        metadata,
        timestamp: Date.now()
      };

      setAuditResult(result);
      saveAuditResult(result, { prodOnly, auditLevel: filterSeverity });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Security audit failed:', err);
    } finally {
      setIsScanning(false);
    }
  }, [filterSeverity, prodOnly, demoMode]);

  const exportResults = useCallback(() => {
    if (!auditResult) return;

    const dataStr = JSON.stringify(auditResult, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-audit-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [auditResult]);

  const exportPrometheus = useCallback(() => {
    if (!auditResult) return;

    const metrics = [
      '# HELP security_vulnerabilities_total Total number of vulnerabilities',
      '# TYPE security_vulnerabilities_total gauge',
      `security_vulnerabilities_total{severity="low"} ${auditResult.metadata.low}`,
      `security_vulnerabilities_total{severity="moderate"} ${auditResult.metadata.moderate}`,
      `security_vulnerabilities_total{severity="high"} ${auditResult.metadata.high}`,
      `security_vulnerabilities_total{severity="critical"} ${auditResult.metadata.critical}`,
      `security_vulnerabilities_total{severity="all"} ${auditResult.metadata.total}`,
    ].join('\n');

    const blob = new Blob([metrics], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'security-metrics.prom';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [auditResult]);

  const filteredVulnerabilities = auditResult?.vulnerabilities.filter(v =>
    filterSeverity === 'all' || v.severity === filterSeverity
  ) || [];

  const toggleDemoMode = useCallback(() => {
    setDemoMode(prev => !prev);
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    clearAuditHistory();
    setHistory([]);
    setStats(getAuditStats());
  }, []);

  const loadHistoricalResult = useCallback((historyItem: any) => {
    setAuditResult(historyItem.result);
  }, []);

  return {
    isScanning,
    auditResult,
    filteredVulnerabilities,
    filterSeverity,
    setFilterSeverity,
    prodOnly,
    setProdOnly,
    error,
    demoMode,
    toggleDemoMode,
    history,
    stats,
    clearHistory,
    loadHistoricalResult,
    runAudit,
    exportResults,
    exportPrometheus
  };
}
