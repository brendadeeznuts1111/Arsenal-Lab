/**
 * Betting Monitor
 *
 * Monitors betting/wagering activity for anomalies, patterns, and risk alerts
 * Integrates with Fantasy402 betting platform API
 */

import { BettingAPIClient, convertBetTickerToWagerData } from './betting-api-client';
import type { NotificationManager } from './manager';
import type { BettingNotification, FinancialNotification } from './types';

interface WagerData {
  WagerNumber: number;
  AgentID: string;
  CustomerID: string;
  Login: string;
  WagerType: string;
  AmountWagered: number;
  InsertDateTime: string;
  ToWinAmount: number;
  TicketWriter: string;
  VolumeAmount: number;
  ShortDesc: string;
  VIP: string;
  AgentLogin: string;
}

interface BettingConfig {
  thresholds: {
    largeBetAmount: number;        // $ threshold for large bet alerts
    volumeSpikeMultiplier: number; // Multiplier for volume spike detection
    unusualPatternThreshold: number; // Threshold for pattern detection
    riskAlertThreshold: number;    // Risk score threshold
  };
  monitoring: {
    enabled: boolean;
    checkInterval: number;         // How often to analyze (ms)
    maxHistorySize: number;        // Max wagers to keep in memory
    agentRiskTracking: boolean;    // Track agent risk patterns
    customerRiskTracking: boolean; // Track customer risk patterns
  };
}

export class BettingMonitor {
  private notificationManager: NotificationManager;
  private config: BettingConfig;
  private apiClient: BettingAPIClient;
  private wagerHistory: WagerData[] = [];
  private agentStats: Map<string, { totalVolume: number; wagerCount: number; lastActivity: number }> = new Map();
  private customerStats: Map<string, { totalVolume: number; wagerCount: number; lastActivity: number }> = new Map();
  private hourlyVolume: Map<string, number> = new Map(); // hour -> volume
  private lastAnalysis: number = 0;
  private monitoredWagerNumbers: Set<number> = new Set();

  constructor(notificationManager: NotificationManager, config: BettingConfig, apiClient: BettingAPIClient) {
    this.notificationManager = notificationManager;
    this.config = config;
    this.apiClient = apiClient;
  }

  /**
   * Add wager numbers to monitor
   */
  addWagerNumbers(wagerNumbers: number[]): void {
    wagerNumbers.forEach(num => this.monitoredWagerNumbers.add(num));
  }

  /**
   * Remove wager numbers from monitoring
   */
  removeWagerNumbers(wagerNumbers: number[]): void {
    wagerNumbers.forEach(num => this.monitoredWagerNumbers.delete(num));
  }

  /**
   * Poll monitored wagers for updates
   */
  async pollMonitoredWagers(): Promise<void> {
    if (this.monitoredWagerNumbers.size === 0) return;

    const wagerNumbers = Array.from(this.monitoredWagerNumbers);
    const betData = await this.apiClient.monitorWagers(wagerNumbers);

    const wagers: WagerData[] = [];
    for (const [wagerNumber, betTicker] of betData) {
      if (betTicker) {
        wagers.push(convertBetTickerToWagerData(betTicker));
      }
    }

    if (wagers.length > 0) {
      await this.processWagers(wagers);
    }
  }

  /**
   * Process new wager data
   */
  async processWagers(wagers: WagerData[]): Promise<void> {
    // Add to history
    this.wagerHistory.push(...wagers);

    // Limit history size
    if (this.wagerHistory.length > this.config.monitoring.maxHistorySize) {
      this.wagerHistory = this.wagerHistory.slice(-this.config.monitoring.maxHistorySize);
    }

    // Update statistics
    this.updateStats(wagers);

    // Analyze for anomalies if enough time has passed
    const now = Date.now();
    if (now - this.lastAnalysis > this.config.monitoring.checkInterval) {
      await this.analyzeAnomalies();
      this.lastAnalysis = now;
    }

    // Check individual wagers for immediate alerts
    for (const wager of wagers) {
      await this.checkIndividualWager(wager);
    }
  }

  /**
   * Check individual wager for immediate alerts
   */
  private async checkIndividualWager(wager: WagerData): Promise<void> {
    // Large bet alert
    if (wager.AmountWagered >= this.config.thresholds.largeBetAmount) {
      const riskLevel = this.calculateRiskLevel(wager);

      const notification: BettingNotification = {
        id: `large-bet-${wager.WagerNumber}`,
        timestamp: Date.now(),
        topic: 'betting',
        priority: riskLevel === 'critical' ? 'high' : riskLevel === 'high' ? 'medium' : 'low',
        title: `💰 Large Bet Alert: $${wager.AmountWagered.toLocaleString()}`,
        message: `Large wager detected from customer ${wager.CustomerID} (${wager.Login}) for $${wager.AmountWagered.toLocaleString()}.`,
        wagerId: wager.WagerNumber.toString(),
        agentId: wager.AgentID,
        customerId: wager.CustomerID,
        wagerType: wager.WagerType,
        amount: wager.AmountWagered,
        potentialPayout: wager.ToWinAmount,
        ticketWriter: wager.TicketWriter,
        anomalyType: 'large_bet',
        riskLevel,
        data: {
          wager,
          vip: wager.VIP.trim() === '1',
          volumeAmount: wager.VolumeAmount
        },
        metadata: {
          source: 'betting-monitor',
          correlationId: `wager-${wager.WagerNumber}`,
          tags: ['betting', 'large-bet', riskLevel]
        }
      };

      await this.notificationManager.send(notification);
    }
  }

  /**
   * Analyze wager patterns for anomalies
   */
  private async analyzeAnomalies(): Promise<void> {
    if (!this.config.monitoring.enabled) return;

    // Check for volume spikes
    await this.checkVolumeSpikes();

    // Check for unusual patterns by agent
    if (this.config.monitoring.agentRiskTracking) {
      await this.checkAgentPatterns();
    }

    // Check for unusual patterns by customer
    if (this.config.monitoring.customerRiskTracking) {
      await this.checkCustomerPatterns();
    }

    // Check for potential money laundering patterns
    await this.checkMoneyLaunderingPatterns();
  }

  /**
   * Check for volume spikes
   */
  private async checkVolumeSpikes(): Promise<void> {
    const recentWagers = this.wagerHistory.filter(w =>
      Date.now() - new Date(w.InsertDateTime).getTime() < 3600000 // Last hour
    );

    const currentHourVolume = recentWagers.reduce((sum, w) => sum + w.AmountWagered, 0);
    const avgHourlyVolume = this.calculateAverageHourlyVolume();

    if (currentHourVolume > avgHourlyVolume * this.config.thresholds.volumeSpikeMultiplier) {
      const notification: FinancialNotification = {
        id: `volume-spike-${Date.now()}`,
        timestamp: Date.now(),
        topic: 'financial',
        priority: 'high',
        title: `📈 Volume Spike Detected`,
        message: `Hourly betting volume surged to $${currentHourVolume.toLocaleString()} (${Math.round(currentHourVolume / avgHourlyVolume * 100)}% above average).`,
        transactionType: 'wager',
        amount: currentHourVolume,
        accountId: 'system',
        dailyVolume: currentHourVolume,
        alertType: 'volume_spike',
        data: {
          recentWagers: recentWagers.length,
          avgVolume: avgHourlyVolume,
          spikeRatio: currentHourVolume / avgHourlyVolume
        },
        metadata: {
          source: 'betting-monitor',
          correlationId: `volume-spike-${Date.now()}`,
          tags: ['betting', 'volume-spike', 'financial']
        }
      };

      await this.notificationManager.send(notification);
    }
  }

  /**
   * Check for unusual agent patterns
   */
  private async checkAgentPatterns(): Promise<void> {
    for (const [agentId, stats] of this.agentStats) {
      const recentActivity = this.getAgentRecentActivity(agentId, 3600000); // Last hour

      if (recentActivity.length > 10) { // High volume agent
        const avgWagerSize = recentActivity.reduce((sum, w) => sum + w.AmountWagered, 0) / recentActivity.length;
        const largeWagers = recentActivity.filter(w => w.AmountWagered > avgWagerSize * 3);

        if (largeWagers.length >= 3) {
          const notification: BettingNotification = {
            id: `agent-pattern-${agentId}-${Date.now()}`,
            timestamp: Date.now(),
            topic: 'betting',
            priority: 'medium',
            title: `📊 Unusual Agent Pattern: ${agentId}`,
            message: `Agent ${agentId} showing unusual betting pattern with ${largeWagers.length} large wagers in the last hour.`,
            wagerId: largeWagers[0].WagerNumber.toString(),
            agentId,
            customerId: 'multiple',
            wagerType: 'multiple',
            amount: largeWagers.reduce((sum, w) => sum + w.AmountWagered, 0),
            potentialPayout: largeWagers.reduce((sum, w) => sum + w.ToWinAmount, 0),
            ticketWriter: 'multiple',
            anomalyType: 'unusual_pattern',
            riskLevel: 'medium',
            data: {
              agentStats: stats,
              largeWagers: largeWagers.length,
              avgWagerSize
            },
            metadata: {
              source: 'betting-monitor',
              correlationId: `agent-pattern-${agentId}`,
              tags: ['betting', 'agent-pattern', 'risk']
            }
          };

          await this.notificationManager.send(notification);
        }
      }
    }
  }

  /**
   * Check for unusual customer patterns
   */
  private async checkCustomerPatterns(): Promise<void> {
    for (const [customerId, stats] of this.customerStats) {
      const recentActivity = this.getCustomerRecentActivity(customerId, 3600000);

      if (recentActivity.length > 5) {
        const totalAmount = recentActivity.reduce((sum, w) => sum + w.AmountWagered, 0);

        // Check for rapid successive bets (potential automation)
        const timeGaps = [];
        for (let i = 1; i < recentActivity.length; i++) {
          const gap = new Date(recentActivity[i].InsertDateTime).getTime() -
                     new Date(recentActivity[i-1].InsertDateTime).getTime();
          timeGaps.push(gap);
        }

        const avgGap = timeGaps.reduce((sum, gap) => sum + gap, 0) / timeGaps.length;
        const rapidBets = timeGaps.filter(gap => gap < 30000).length; // Bets within 30 seconds

        if (rapidBets >= 3) {
          const notification: BettingNotification = {
            id: `customer-pattern-${customerId}-${Date.now()}`,
            timestamp: Date.now(),
            topic: 'betting',
            priority: 'high',
            title: `🚨 Suspicious Customer Activity: ${customerId}`,
            message: `Customer ${customerId} showing automated betting patterns with ${rapidBets} rapid successive bets.`,
            wagerId: recentActivity[0].WagerNumber.toString(),
            agentId: recentActivity[0].AgentID,
            customerId,
            wagerType: 'multiple',
            amount: totalAmount,
            potentialPayout: recentActivity.reduce((sum, w) => sum + w.ToWinAmount, 0),
            ticketWriter: recentActivity[0].TicketWriter,
            anomalyType: 'unusual_pattern',
            riskLevel: 'high',
            data: {
              customerStats: stats,
              rapidBets,
              avgTimeGap: avgGap
            },
            metadata: {
              source: 'betting-monitor',
              correlationId: `customer-pattern-${customerId}`,
              tags: ['betting', 'customer-pattern', 'suspicious', 'automation']
            }
          };

          await this.notificationManager.send(notification);
        }
      }
    }
  }

  /**
   * Check for potential money laundering patterns
   */
  private async checkMoneyLaunderingPatterns(): Promise<void> {
    // Look for structured transactions (similar amounts at similar times)
    const recentWagers = this.wagerHistory.filter(w =>
      Date.now() - new Date(w.InsertDateTime).getTime() < 86400000 // Last 24 hours
    );

    const amountGroups = new Map<number, WagerData[]>();
    for (const wager of recentWagers) {
      if (!amountGroups.has(wager.AmountWagered)) {
        amountGroups.set(wager.AmountWagered, []);
      }
      amountGroups.get(wager.AmountWagered)!.push(wager);
    }

    for (const [amount, wagers] of amountGroups) {
      if (wagers.length >= 5 && amount >= 9000) { // Multiple same amounts over $9k
        const notification: FinancialNotification = {
          id: `structuring-alert-${amount}-${Date.now()}`,
          timestamp: Date.now(),
          topic: 'financial',
          priority: 'critical',
          title: `🚨 Potential Money Laundering: Structured Transactions`,
          message: `Detected ${wagers.length} transactions of exactly $${amount.toLocaleString()} in the last 24 hours.`,
          transactionType: 'wager',
          amount: amount * wagers.length,
          accountId: 'multiple',
          alertType: 'cash_flow_alert',
          data: {
            transactionCount: wagers.length,
            uniqueCustomers: new Set(wagers.map(w => w.CustomerID)).size,
            uniqueAgents: new Set(wagers.map(w => w.AgentID)).size
          },
          metadata: {
            source: 'betting-monitor',
            correlationId: `structuring-${amount}`,
            tags: ['betting', 'money-laundering', 'structuring', 'critical']
          }
        };

        await this.notificationManager.send(notification);
      }
    }
  }

  /**
   * Update internal statistics
   */
  private updateStats(wagers: WagerData[]): void {
    for (const wager of wagers) {
      // Agent stats
      if (!this.agentStats.has(wager.AgentID)) {
        this.agentStats.set(wager.AgentID, { totalVolume: 0, wagerCount: 0, lastActivity: 0 });
      }
      const agentStat = this.agentStats.get(wager.AgentID)!;
      agentStat.totalVolume += wager.AmountWagered;
      agentStat.wagerCount++;
      agentStat.lastActivity = Date.now();

      // Customer stats
      if (!this.customerStats.has(wager.CustomerID)) {
        this.customerStats.set(wager.CustomerID, { totalVolume: 0, wagerCount: 0, lastActivity: 0 });
      }
      const customerStat = this.customerStats.get(wager.CustomerID)!;
      customerStat.totalVolume += wager.AmountWagered;
      customerStat.wagerCount++;
      customerStat.lastActivity = Date.now();

      // Hourly volume
      const hour = new Date(wager.InsertDateTime).getHours().toString();
      this.hourlyVolume.set(hour, (this.hourlyVolume.get(hour) || 0) + wager.AmountWagered);
    }
  }

  /**
   * Calculate risk level for a wager
   */
  private calculateRiskLevel(wager: WagerData): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0;

    // Amount-based risk
    if (wager.AmountWagered >= 100000) riskScore += 3;
    else if (wager.AmountWagered >= 50000) riskScore += 2;
    else if (wager.AmountWagered >= 10000) riskScore += 1;

    // Payout ratio risk (high payout potential)
    const payoutRatio = wager.ToWinAmount / wager.AmountWagered;
    if (payoutRatio >= 10) riskScore += 2;
    else if (payoutRatio >= 5) riskScore += 1;

    // VIP status reduces risk
    if (wager.VIP.trim() === '1') riskScore -= 1;

    // Agent history risk
    const agentStats = this.agentStats.get(wager.AgentID);
    if (agentStats && agentStats.wagerCount > 100) {
      riskScore -= 1; // Established agents are lower risk
    }

    if (riskScore >= 4) return 'critical';
    if (riskScore >= 3) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * Get recent activity for an agent
   */
  private getAgentRecentActivity(agentId: string, timeWindow: number): WagerData[] {
    const cutoff = Date.now() - timeWindow;
    return this.wagerHistory.filter(w =>
      w.AgentID === agentId &&
      new Date(w.InsertDateTime).getTime() > cutoff
    );
  }

  /**
   * Get recent activity for a customer
   */
  private getCustomerRecentActivity(customerId: string, timeWindow: number): WagerData[] {
    const cutoff = Date.now() - timeWindow;
    return this.wagerHistory.filter(w =>
      w.CustomerID === customerId &&
      new Date(w.InsertDateTime).getTime() > cutoff
    );
  }

  /**
   * Calculate average hourly volume
   */
  private calculateAverageHourlyVolume(): number {
    const volumes = Array.from(this.hourlyVolume.values());
    if (volumes.length === 0) return 0;
    return volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
  }

  /**
   * Get monitoring statistics
   */
  getStats(): {
    totalWagers: number;
    uniqueAgents: number;
    uniqueCustomers: number;
    totalVolume: number;
    avgWagerSize: number;
    agentCount: number;
    customerCount: number;
  } {
    const totalVolume = this.wagerHistory.reduce((sum, w) => sum + w.AmountWagered, 0);
    const avgWagerSize = this.wagerHistory.length > 0 ? totalVolume / this.wagerHistory.length : 0;

    return {
      totalWagers: this.wagerHistory.length,
      uniqueAgents: new Set(this.wagerHistory.map(w => w.AgentID)).size,
      uniqueCustomers: new Set(this.wagerHistory.map(w => w.CustomerID)).size,
      totalVolume,
      avgWagerSize,
      agentCount: this.agentStats.size,
      customerCount: this.customerStats.size
    };
  }

  /**
   * Clear old data (for memory management)
   */
  clearOldData(olderThan: number): void {
    const cutoff = Date.now() - olderThan;
    this.wagerHistory = this.wagerHistory.filter(w =>
      new Date(w.InsertDateTime).getTime() > cutoff
    );

    // Clean up agent and customer stats for inactive accounts
    for (const [agentId, stats] of this.agentStats) {
      if (stats.lastActivity < cutoff) {
        this.agentStats.delete(agentId);
      }
    }

    for (const [customerId, stats] of this.customerStats) {
      if (stats.lastActivity < cutoff) {
        this.customerStats.delete(customerId);
      }
    }
  }
}
