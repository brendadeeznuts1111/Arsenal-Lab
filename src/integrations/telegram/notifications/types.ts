/**
 * Notification System Types
 *
 * Comprehensive notification system for the Arsenal Lab Telegram bot
 * Supports channels, topics, security alerts, and performance monitoring
 */

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export type NotificationChannel = 'telegram' | 'email' | 'webhook' | 'slack' | 'discord';

export type NotificationTopic =
  | 'security'
  | 'performance'
  | 'system'
  | 'build'
  | 'deployment'
  | 'monitoring'
  | 'maintenance'
  | 'emergency'
  | 'betting'
  | 'financial';

export type SecuritySeverity = 'info' | 'low' | 'moderate' | 'high' | 'critical';

export interface NotificationRecipient {
  id: string;
  channel: NotificationChannel;
  channelId?: string; // Telegram chat ID, email address, webhook URL, etc.
  topics: NotificationTopic[];
  priorityThreshold: NotificationPriority;
  enabled: boolean;
  filters?: NotificationFilter[];
}

export interface NotificationFilter {
  type: 'severity' | 'package' | 'cve' | 'metric' | 'threshold';
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'regex';
  value: string | number;
}

export interface BaseNotification {
  id: string;
  timestamp: number;
  topic: NotificationTopic;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  metadata?: {
    source?: string;
    correlationId?: string;
    tags?: string[];
    expiresAt?: number;
  };
}

export interface SecurityNotification extends BaseNotification {
  topic: 'security';
  severity: SecuritySeverity;
  cve?: string;
  package?: string;
  affectedVersions?: string;
  patchedVersion?: string;
  advisoryUrl?: string;
  exploitAvailable?: boolean;
}

export interface PerformanceNotification extends BaseNotification {
  topic: 'performance';
  metric: string;
  value: number;
  threshold: number;
  unit?: string;
  trend?: 'improving' | 'degrading' | 'stable';
  baseline?: number;
}

export interface SystemNotification extends BaseNotification {
  topic: 'system';
  component: string;
  status: 'up' | 'down' | 'degraded' | 'maintenance';
  description: string;
  affectedServices?: string[];
}

export interface BuildNotification extends BaseNotification {
  topic: 'build';
  project: string;
  status: 'started' | 'success' | 'failed' | 'cancelled';
  buildId: string;
  duration?: number;
  commitHash?: string;
  branch?: string;
}

export interface DeploymentNotification extends BaseNotification {
  topic: 'deployment';
  environment: string;
  status: 'started' | 'success' | 'failed' | 'rollback';
  version: string;
  rollbackVersion?: string;
  affectedServices?: string[];
}

export interface BettingNotification extends BaseNotification {
  topic: 'betting';
  wagerId: string;
  agentId: string;
  customerId: string;
  wagerType: string;
  amount: number;
  potentialPayout: number;
  ticketWriter: string;
  sport?: string;
  event?: string;
  anomalyType?: 'large_bet' | 'unusual_pattern' | 'volume_spike' | 'risk_alert';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface FinancialNotification extends BaseNotification {
  topic: 'financial';
  transactionType: 'wager' | 'payout' | 'deposit' | 'withdrawal' | 'adjustment';
  amount: number;
  accountId: string;
  agentId?: string;
  netPosition?: number;
  dailyVolume?: number;
  threshold?: number;
  alertType?: 'profit_threshold' | 'loss_threshold' | 'volume_spike' | 'cash_flow_alert';
}

export type Notification =
  | SecurityNotification
  | PerformanceNotification
  | SystemNotification
  | BuildNotification
  | DeploymentNotification
  | BettingNotification
  | FinancialNotification;

export interface NotificationConfig {
  channels: {
    telegram?: {
      botToken: string;
      channelId?: string;
      groupId?: string;
      topicSupport?: boolean;
    };
    email?: {
      smtpHost: string;
      smtpPort: number;
      username: string;
      password: string;
      from: string;
    };
    webhook?: {
      urls: string[];
      headers?: Record<string, string>;
    };
  };
  topics: Record<NotificationTopic, {
    enabled: boolean;
    defaultPriority: NotificationPriority;
    rateLimit?: {
      maxPerHour: number;
      maxPerDay: number;
    };
  }>;
  recipients: NotificationRecipient[];
  settings: {
    deduplicationWindow: number; // milliseconds
    maxRetries: number;
    retryDelay: number;
    batchSize: number;
  };
}

export interface NotificationResult {
  success: boolean;
  notificationId: string;
  channel: NotificationChannel;
  recipientId: string;
  error?: string;
  retryCount?: number;
  sentAt?: number;
}

export interface NotificationStats {
  totalSent: number;
  totalFailed: number;
  byTopic: Record<NotificationTopic, number>;
  byPriority: Record<NotificationPriority, number>;
  byChannel: Record<NotificationChannel, number>;
  recentErrors: Array<{
    timestamp: number;
    error: string;
    notificationId: string;
  }>;
}
