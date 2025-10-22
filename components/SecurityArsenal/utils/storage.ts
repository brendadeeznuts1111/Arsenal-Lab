// components/SecurityArsenal/utils/storage.ts
import type { AuditResult } from '../hooks/useSecurityArsenal';

const STORAGE_KEY = 'arsenal-security-history';
const MAX_HISTORY_ITEMS = 50;

export interface AuditHistoryItem {
  id: string;
  result: AuditResult;
  config: {
    prodOnly: boolean;
    auditLevel: string;
  };
}

export function saveAuditResult(result: AuditResult, config: { prodOnly: boolean; auditLevel: string }): void {
  try {
    const history = getAuditHistory();
    const newItem: AuditHistoryItem = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      result,
      config
    };

    // Add to beginning of array (most recent first)
    history.unshift(newItem);

    // Limit history size
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Failed to save audit result to history:', error);
  }
}

export function getAuditHistory(): AuditHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load audit history:', error);
    return [];
  }
}

export function getLatestAuditResult(): AuditHistoryItem | null {
  const history = getAuditHistory();
  return history.length > 0 && history[0] !== undefined ? history[0] : null;
}

export function clearAuditHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear audit history:', error);
  }
}

export function getAuditStats() {
  const history = getAuditHistory();

  if (history.length === 0) {
    return {
      totalScans: 0,
      avgVulnerabilities: 0,
      criticalTrend: 0,
      lastScan: null
    };
  }

  const totalVulnerabilities = history.reduce((sum, item) => sum + item.result.metadata.total, 0);
  const avgVulnerabilities = totalVulnerabilities / history.length;

  // Calculate critical vulnerability trend (last 5 scans)
  const recentScans = history.slice(0, 5);
  const criticalCounts = recentScans.map(item => item.result.metadata.critical);
  const firstCritical = criticalCounts[0];
  const lastCritical = criticalCounts[criticalCounts.length - 1];
  const criticalTrend = criticalCounts.length > 1 && firstCritical !== undefined && lastCritical !== undefined
    ? ((firstCritical - lastCritical) / criticalCounts.length)
    : 0;

  const firstHistoryItem = history[0];

  return {
    totalScans: history.length,
    avgVulnerabilities: Math.round(avgVulnerabilities * 10) / 10,
    criticalTrend: Math.round(criticalTrend * 100) / 100,
    lastScan: firstHistoryItem !== undefined ? firstHistoryItem.result.timestamp : null
  };
}
