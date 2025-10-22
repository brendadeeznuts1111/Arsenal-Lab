/**
 * Security Notification Monitor
 *
 * Monitors security vulnerabilities and sends prioritized notifications
 */

import type { NotificationManager } from './manager';
import type { SecurityNotification, SecuritySeverity, AuditResult, Vulnerability } from './types';

export class SecurityMonitor {
  private notificationManager: NotificationManager;
  private knownVulnerabilities: Set<string> = new Set();
  private lastAuditTimestamp: number = 0;
  private severityThresholds: Record<SecuritySeverity, boolean> = {
    info: false,
    low: false,
    moderate: true,
    high: true,
    critical: true
  };

  constructor(notificationManager: NotificationManager) {
    this.notificationManager = notificationManager;
  }

  /**
   * Process security audit results and send notifications for new vulnerabilities
   */
  async processAuditResults(auditResult: AuditResult): Promise<void> {
    const newVulnerabilities = auditResult.vulnerabilities.filter(vuln =>
      !this.knownVulnerabilities.has(vuln.cve || `${vuln.package}-${vuln.version}`)
    );

    if (newVulnerabilities.length === 0) {
      return;
    }

    // Group vulnerabilities by severity for batch processing
    const bySeverity = this.groupBySeverity(newVulnerabilities);

    // Send notifications for each severity level
    for (const [severity, vulnerabilities] of Object.entries(bySeverity)) {
      if (this.severityThresholds[severity as SecuritySeverity]) {
        await this.sendSeverityBatch(severity as SecuritySeverity, vulnerabilities, auditResult);
      }
    }

    // Mark vulnerabilities as known
    newVulnerabilities.forEach(vuln => {
      this.knownVulnerabilities.add(vuln.cve || `${vuln.package}-${vuln.version}`);
    });

    this.lastAuditTimestamp = auditResult.timestamp;
  }

  /**
   * Send notification for a critical security vulnerability immediately
   */
  async sendCriticalAlert(vulnerability: Vulnerability): Promise<void> {
    const notification = this.createSecurityNotification(vulnerability, 'critical');
    await this.notificationManager.send(notification);
  }

  /**
   * Send notification for exploit availability
   */
  async sendExploitAlert(vulnerability: Vulnerability): Promise<void> {
    const notification: SecurityNotification = {
      id: `exploit-${vulnerability.cve || crypto.randomUUID()}`,
      timestamp: Date.now(),
      topic: 'security',
      priority: 'critical',
      title: `🚨 EXPLOIT AVAILABLE: ${vulnerability.title}`,
      message: `An exploit is now available for ${vulnerability.cve || vulnerability.package}. Immediate action required.`,
      severity: vulnerability.severity,
      cve: vulnerability.cve,
      package: vulnerability.package,
      affectedVersions: vulnerability.version,
      patchedVersion: vulnerability.patched,
      advisoryUrl: vulnerability.url,
      exploitAvailable: true,
      metadata: {
        source: 'security-monitor',
        correlationId: `exploit-${vulnerability.cve}`,
        tags: ['exploit', 'urgent', 'security']
      }
    };

    await this.notificationManager.send(notification);
  }

  /**
   * Monitor for dependency updates that fix vulnerabilities
   */
  async checkForPatches(currentAudit: AuditResult, previousAudit: AuditResult): Promise<void> {
    const previouslyVulnerable = new Set(
      previousAudit.vulnerabilities.map(v => v.cve || `${v.package}-${v.version}`)
    );

    const stillVulnerable = currentAudit.vulnerabilities.map(v => v.cve || `${v.package}-${v.version}`);

    const fixedVulnerabilities = previousAudit.vulnerabilities.filter(vuln => {
      const key = vuln.cve || `${vuln.package}-${vuln.version}`;
      return previouslyVulnerable.has(key) && !stillVulnerable.includes(key);
    });

    for (const fixed of fixedVulnerabilities) {
      await this.sendPatchNotification(fixed);
    }
  }

  /**
   * Send notification about available patches
   */
  private async sendPatchNotification(vulnerability: Vulnerability): Promise<void> {
    const notification: SecurityNotification = {
      id: `patch-${vulnerability.cve || crypto.randomUUID()}`,
      timestamp: Date.now(),
      topic: 'security',
      priority: 'medium',
      title: `✅ Security Patch Available: ${vulnerability.package}`,
      message: `A security patch is now available for ${vulnerability.cve || vulnerability.package}. Update to ${vulnerability.patched} to resolve this vulnerability.`,
      severity: vulnerability.severity,
      cve: vulnerability.cve,
      package: vulnerability.package,
      affectedVersions: vulnerability.version,
      patchedVersion: vulnerability.patched,
      advisoryUrl: vulnerability.url,
      metadata: {
        source: 'security-monitor',
        correlationId: `patch-${vulnerability.cve}`,
        tags: ['patch', 'update', 'security']
      }
    };

    await this.notificationManager.send(notification);
  }

  /**
   * Send batch notification for vulnerabilities of same severity
   */
  private async sendSeverityBatch(severity: SecuritySeverity, vulnerabilities: Vulnerability[], auditResult: AuditResult): Promise<void> {
    const count = vulnerabilities.length;
    const priority = this.getPriorityForSeverity(severity);

    let title: string;
    let message: string;

    if (count === 1) {
      const vuln = vulnerabilities[0];
      title = `${this.getSeverityEmoji(severity)} New ${severity.toUpperCase()} Vulnerability: ${vuln.package}`;
      message = `A new ${severity} severity vulnerability has been detected in ${vuln.package}.`;
      if (vuln.cve) {
        message += ` CVE: ${vuln.cve}`;
      }
    } else {
      title = `${this.getSeverityEmoji(severity)} ${count} New ${severity.toUpperCase()} Vulnerabilities Detected`;
      message = `${count} new ${severity} severity vulnerabilities have been detected across ${this.getUniquePackages(vulnerabilities).length} packages.`;
    }

    // Add summary details
    message += '\n\n📊 Summary:';
    const packages = this.getUniquePackages(vulnerabilities);
    if (packages.length <= 5) {
      message += `\n• Packages: ${packages.join(', ')}`;
    } else {
      message += `\n• Packages: ${packages.slice(0, 3).join(', ')} +${packages.length - 3} more`;
    }

    const cves = vulnerabilities.filter(v => v.cve).map(v => v.cve);
    if (cves.length > 0 && cves.length <= 5) {
      message += `\n• CVEs: ${cves.join(', ')}`;
    } else if (cves.length > 5) {
      message += `\n• CVEs: ${cves.slice(0, 3).join(', ')} +${cves.length - 3} more`;
    }

    const notification: SecurityNotification = {
      id: `security-batch-${severity}-${Date.now()}`,
      timestamp: auditResult.timestamp,
      topic: 'security',
      priority,
      title,
      message,
      severity,
      data: {
        vulnerabilityCount: count,
        packages: packages,
        cves: cves,
        auditTimestamp: auditResult.timestamp
      },
      metadata: {
        source: 'security-monitor',
        correlationId: `audit-${auditResult.timestamp}`,
        tags: ['batch', 'audit', severity]
      }
    };

    await this.notificationManager.send(notification);

    // Send individual notifications for high/critical vulnerabilities
    if (severity === 'high' || severity === 'critical') {
      for (const vuln of vulnerabilities) {
        await this.sendIndividualVulnerabilityNotification(vuln);
      }
    }
  }

  /**
   * Send individual notification for a specific vulnerability
   */
  private async sendIndividualVulnerabilityNotification(vulnerability: Vulnerability): Promise<void> {
    const notification = this.createSecurityNotification(vulnerability);
    await this.notificationManager.send(notification);
  }

  /**
   * Create security notification from vulnerability data
   */
  private createSecurityNotification(vulnerability: Vulnerability, overridePriority?: 'critical'): SecurityNotification {
    const priority = overridePriority || this.getPriorityForSeverity(vulnerability.severity);

    return {
      id: `vuln-${vulnerability.cve || crypto.randomUUID()}`,
      timestamp: Date.now(),
      topic: 'security',
      priority,
      title: `${this.getSeverityEmoji(vulnerability.severity)} ${vulnerability.severity.toUpperCase()}: ${vulnerability.package}`,
      message: vulnerability.title,
      severity: vulnerability.severity,
      cve: vulnerability.cve,
      package: vulnerability.package,
      affectedVersions: vulnerability.version,
      patchedVersion: vulnerability.patched,
      advisoryUrl: vulnerability.url,
      metadata: {
        source: 'security-monitor',
        correlationId: vulnerability.cve || `pkg-${vulnerability.package}`,
        tags: ['vulnerability', vulnerability.severity]
      }
    };
  }

  /**
   * Group vulnerabilities by severity
   */
  private groupBySeverity(vulnerabilities: Vulnerability[]): Record<SecuritySeverity, Vulnerability[]> {
    const groups: Record<SecuritySeverity, Vulnerability[]> = {
      info: [],
      low: [],
      moderate: [],
      high: [],
      critical: []
    };

    vulnerabilities.forEach(vuln => {
      groups[vuln.severity].push(vuln);
    });

    return groups;
  }

  /**
   * Get unique package names from vulnerabilities
   */
  private getUniquePackages(vulnerabilities: Vulnerability[]): string[] {
    return [...new Set(vulnerabilities.map(v => v.package))];
  }

  /**
   * Get priority level for severity
   */
  private getPriorityForSeverity(severity: SecuritySeverity): 'low' | 'medium' | 'high' | 'critical' {
    const mapping: Record<SecuritySeverity, 'low' | 'medium' | 'high' | 'critical'> = {
      info: 'low',
      low: 'low',
      moderate: 'medium',
      high: 'high',
      critical: 'critical'
    };
    return mapping[severity];
  }

  /**
   * Get emoji for severity level
   */
  private getSeverityEmoji(severity: SecuritySeverity): string {
    const emojis: Record<SecuritySeverity, string> = {
      info: 'ℹ️',
      low: '🟢',
      moderate: '🟡',
      high: '🟠',
      critical: '🔴'
    };
    return emojis[severity];
  }

  /**
   * Configure which severity levels should trigger notifications
   */
  setSeverityThresholds(thresholds: Record<SecuritySeverity, boolean>): void {
    this.severityThresholds = { ...thresholds };
  }

  /**
   * Get current severity thresholds
   */
  getSeverityThresholds(): Record<SecuritySeverity, boolean> {
    return { ...this.severityThresholds };
  }

  /**
   * Clear known vulnerabilities (useful for testing or reset)
   */
  clearKnownVulnerabilities(): void {
    this.knownVulnerabilities.clear();
  }

  /**
   * Get statistics about known vulnerabilities
   */
  getStats(): {
    knownVulnerabilities: number;
    lastAuditTimestamp: number;
    severityThresholds: Record<SecuritySeverity, boolean>;
  } {
    return {
      knownVulnerabilities: this.knownVulnerabilities.size,
      lastAuditTimestamp: this.lastAuditTimestamp,
      severityThresholds: { ...this.severityThresholds }
    };
  }
}
