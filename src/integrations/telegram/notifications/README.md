# Arsenal Lab Notification System

A comprehensive notification system for the @arsenallab_bot that integrates with channels, topics, and provides intelligent sorting of security information and loss data.

## Features

### 🔔 Multi-Channel Notifications
- **Telegram**: Direct bot messages with topic support
- **Webhooks**: HTTP webhook delivery for external integrations
- **Extensible**: Easy to add email, Slack, Discord channels

### 📊 Intelligent Topic Management
- **Security**: CVE alerts, vulnerability patches, exploit notifications
- **Performance**: Metric thresholds, trend analysis, loss data alerts
- **System**: Health monitoring, component status, emergency alerts
- **Build/Deploy**: CI/CD status, deployment tracking
- **Maintenance**: Scheduled maintenance windows

### 🎯 Smart Prioritization & Deduplication
- Priority levels: `low`, `medium`, `high`, `critical`
- Configurable deduplication windows
- Rate limiting and cooldown periods
- Batch notifications with smart grouping

### 🔧 User Subscription Management
- Subscribe/unsubscribe to specific topics
- Custom priority thresholds per user
- Channel-specific routing (main channel, security channel, groups)
- Advanced filtering with regex support

## Quick Start

```typescript
import { initializeNotificationSystem } from './notifications';

// Initialize with your configuration
const { notificationManager, bettingMonitor, integration } = await initializeNotificationSystem({
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    channelId: '@yourchannel',
    groupId: '-1001234567890' // Optional group with topic support
  },
  webhooks: {
    urls: ['https://your-monitoring-service.com/webhook']
  },
  betting: {
    thresholds: {
      largeBetAmount: 10000,
      volumeSpikeMultiplier: 2.0
    },
    monitoring: {
      enabled: true,
      checkInterval: 300000 // 5 minutes
    }
  }
});

// Start monitoring
await integration.start();

// Add wager numbers to monitor
bettingMonitor.addWagerNumbers([725385092, 725385120]);

// Send a test notification
await notificationManager.send({
  id: 'test-1',
  timestamp: Date.now(),
  topic: 'betting',
  priority: 'high',
  title: 'Large Bet Alert',
  message: 'Large wager detected: $25,000',
  data: { wagerId: '725385092', amount: 25000 }
});
```

## Bot Commands

### Subscribe to Notifications
```
/notify subscribe security performance high
/notify subscribe betting financial medium
/notify subscribe monitoring medium channel:topic:12345
```

### Manage Subscriptions
```
/notify list                    # View current subscriptions
/notify unsubscribe security    # Unsubscribe from security alerts
/notify unsubscribe all         # Unsubscribe from everything
```

### Betting Monitoring
```
/notify bet monitor 725385092 725385120 # Add wagers to monitor
/notify bet remove 725385092            # Remove wager from monitoring
/notify bet stats                       # View betting statistics
/notify bet poll                        # Poll wager updates manually
```

### Advanced Configuration
```
/notify config priority critical          # Only get critical notifications
/notify config channel topic:12345       # Route to specific topic
/notify config filter add severity gte high  # Only high+ severity
```

### Testing
```
/notify test                    # Send test notification
/notify topics                  # List all available topics
```

## Topics & Categories

### Security 🔒
- **Critical**: Zero-day exploits, active attacks
- **High**: Remote code execution, privilege escalation
- **Moderate**: Information disclosure, DoS
- **Low**: Best practice violations

### Performance ⚡
- **Response Time**: API latency thresholds
- **Error Rates**: Application error monitoring
- **Resource Usage**: CPU, memory, disk alerts
- **Trend Analysis**: Performance degradation detection

### System 🖥️
- **Component Health**: Service up/down status
- **Infrastructure**: Server, network monitoring
- **Capacity**: Resource utilization alerts

### Development 💻
- **Build Status**: CI/CD pipeline results
- **Deployments**: Release status and rollbacks
- **Code Quality**: Test failures, coverage drops

### Betting 🎯
- **Large Bets**: Wagers exceeding threshold amounts ($10k+)
- **Volume Spikes**: Unusual betting volume increases (2x normal)
- **Pattern Anomalies**: Suspicious betting behavior patterns
- **Risk Alerts**: High-risk wager detection

### Financial 💰
- **Profit/Loss**: Financial position tracking and alerts
- **Cash Flow**: Deposit/withdrawal monitoring
- **Structured Transactions**: Potential money laundering detection
- **Volume Alerts**: Financial transaction volume spikes

## Configuration

### Environment Variables
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_ID=@your_channel
TELEGRAM_GROUP_ID=-1001234567890
```

### Advanced Configuration
```typescript
const config = {
  channels: {
    telegram: {
      botToken: 'token',
      channelId: '@security',    // Security alerts
      groupId: '-1001234567890' // General notifications with topics
    }
  },
  topics: {
    security: {
      enabled: true,
      defaultPriority: 'high',
      rateLimit: { maxPerHour: 10 }
    }
  }
};
```

## Integration Examples

### Fantasy Bridge Monitoring
```typescript
// Monitor bridge performance
performanceMonitor.recordMetric('bridge_response_time', 150, 'ms');
performanceMonitor.recordMetric('bridge_error_rate', 0.02, 'percent');

// Bridge health checks
if (!bridgeHealthy) {
  await notificationManager.send({
    id: 'bridge-down',
    topic: 'emergency',
    priority: 'critical',
    title: '🚨 Fantasy Bridge Down',
    message: 'Bridge service unresponsive'
  });
}
```

### Security Scanning
```typescript
// Process audit results
await securityMonitor.processAuditResults(auditData);

// Send exploit alerts
if (vulnerability.exploitAvailable) {
  await securityMonitor.sendExploitAlert(vulnerability);
}
```

### Performance Thresholds
```typescript
// Configure performance alerts
performanceMonitor.recordMetric('api_response_time', responseTime, 'ms');
// Automatically alerts if > 300ms (configurable threshold)
```

## Architecture

### Core Components
- **NotificationManager**: Central dispatch system
- **SecurityMonitor**: Vulnerability tracking and alerts
- **PerformanceMonitor**: Metric analysis and thresholds
- **ChannelManager**: Topic-to-channel routing
- **Integration**: Bridge to existing monitoring systems

### Data Flow
1. **Source** → Integration layer polls/monitors systems
2. **Analysis** → Security/Performance monitors process data
3. **Routing** → Channel manager determines delivery channels
4. **Delivery** → Notification manager sends via configured channels
5. **Receipt** → Users receive notifications based on subscriptions

### Deduplication & Batching
- 5-minute deduplication windows for similar events
- Configurable batch sizes and timing
- Rate limiting per topic/channel
- Smart coalescing of related alerts

## Monitoring & Metrics

The system provides comprehensive metrics:

```typescript
const stats = notificationManager.getStats();
// {
//   totalSent: 1250,
//   totalFailed: 3,
//   byTopic: { security: 45, performance: 234, ... },
//   byChannel: { telegram: 1200, webhook: 50 },
//   recentErrors: [...]
// }
```

## Security Features

- **Input Validation**: All notifications validated before sending
- **Rate Limiting**: Prevents notification spam
- **Access Control**: Subscription management with user permissions
- **Audit Trail**: Complete logging of all notifications sent
- **Encryption**: Sensitive data encrypted in transit

## Troubleshooting

### Common Issues

**Notifications not sending:**
- Check bot token and channel permissions
- Verify webhook URLs are accessible
- Check rate limits and cooldowns

**Duplicate notifications:**
- Adjust deduplication windows in config
- Review subscription filters

**Missing notifications:**
- Check user subscriptions with `/notify list`
- Verify topic enablement in configuration

### Debug Commands
```
/notify test              # Send test notification
/status                   # Check system health
/metrics                  # View notification metrics
```

## Contributing

The notification system is designed to be extensible. To add new:

**Channels**: Implement `NotificationChannelHandler` interface
**Topics**: Add to `NotificationTopic` type and configure routing
**Integrations**: Create new integration classes following the pattern

---

**Built for @arsenallab_bot** - Enterprise-grade notification system with Bun.js performance 🏆
