# Telegram Bot API Engineering Checklist (Enhanced)

Production-grade engineering guide for Arsenal Lab's Telegram bot integration.

Everything is taken directly from the official docs or from large-scale bot operators who have reverse-engineered the soft-limits.

---

## 1. Message Payload – Hard Limits You Cannot Override

| Field | Max | Penalty if you exceed |
| :--- | :--- | :--- |
| **Text Length** | 4,096 UTF-8 code points | API returns `400 MESSAGE_TOO_LONG` |
| **Caption** (photo, doc, etc.) | 1,024 chars | same error |
| **Formatting Entities** (Markdown/HTML) | nested depth ≤ 5 | silently dropped |
| **Link Text** (HTML) | 512 chars | link is rendered as plain text |
| **`pre` / `code` Block Size** | 64 KB | message is rejected |

**Action:** Split anything > 4k chars into numbered "Part 1/3" messages and send them with 350ms gaps (see rate limits).

---

## 2. Rate Limits – Per-Method, Per-Chat, Per-Bot (Critical)

| Method | Global | Same Private Chat | Same Group/Topic | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **`sendMessage`** | 30 msg/s | 1 msg/s | 20 msg/min | Documented (1 msg every 3 seconds) |
| **`editMessage`** | 20 edits/min per message | – | – | Undocumented, observed, applies to a single message_id |
| **`answerCallbackQuery`** | 20/min/query_id | – | – | 200ms minimum delay per query_id |
| **`getChatMember(s)`** | ~150/min observed | – | – | Use 200ms backoff |
| **`getChatMembersCount`** | ~100-150/min | – | – | Batch with 300ms pauses |

### Action Items for Arsenal Bot

#### Leaky Bucket Implementation
Queue outgoing messages; drain the queue with **350ms spacing** when the target is a group (safely respects 1 msg/3s limit).

```typescript
// src/integrations/telegram/utils/message-queue.ts
export class MessageQueue {
  private queue: Array<{ chatId: number; text: string; options?: any }> = [];
  private processing = false;
  private lastSent = new Map<number, number>();

  async send(chatId: number, text: string, options?: any): Promise<void> {
    this.queue.push({ chatId, text, options });

    if (!this.processing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const message = this.queue.shift()!;
      const now = Date.now();
      const lastSent = this.lastSent.get(message.chatId) || 0;
      const timeSinceLastSent = now - lastSent;

      // Enforce 350ms minimum spacing per chat
      if (timeSinceLastSent < 350) {
        await this.sleep(350 - timeSinceLastSent);
      }

      try {
        await this.sendMessageDirect(message.chatId, message.text, message.options);
        this.lastSent.set(message.chatId, Date.now());
      } catch (error) {
        if (this.isRateLimitError(error)) {
          // Re-queue with exponential backoff
          this.queue.unshift(message);
          await this.sleep(1000); // Start with 1s backoff
        } else {
          console.error('Failed to send message:', error);
        }
      }
    }

    this.processing = false;
  }

  private async sendMessageDirect(chatId: number, text: string, options?: any): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, ...options }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
  }

  private isRateLimitError(error: any): boolean {
    return error.message?.includes('429') || error.message?.includes('Too Many Requests');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

#### Text Splitter
For `/benchmark` results, auto-split >4k chars results at the sentence boundary and number the parts.

```typescript
// src/integrations/telegram/utils/text-splitter.ts
const MAX_MESSAGE_LENGTH = 4096;
const PART_HEADER_LENGTH = 50; // Reserve space for "Part 1/3\n\n"

export function splitLongMessage(text: string): string[] {
  if (text.length <= MAX_MESSAGE_LENGTH) {
    return [text];
  }

  const parts: string[] = [];
  let currentPart = '';

  // Split by sentences (period, exclamation, question mark followed by space or newline)
  const sentences = text.split(/([.!?]\s+|\n)/);

  for (const sentence of sentences) {
    const potentialLength = currentPart.length + sentence.length + PART_HEADER_LENGTH;

    if (potentialLength > MAX_MESSAGE_LENGTH && currentPart.length > 0) {
      parts.push(currentPart.trim());
      currentPart = sentence;
    } else {
      currentPart += sentence;
    }
  }

  if (currentPart.trim()) {
    parts.push(currentPart.trim());
  }

  // Add part numbers
  const totalParts = parts.length;
  return parts.map((part, index) => {
    if (totalParts > 1) {
      return `📄 **Part ${index + 1}/${totalParts}**\n\n${part}`;
    }
    return part;
  });
}
```

#### Anti-Spam Guard
If a single user triggers >5 benchmark requests in 60s, reply with a single "Please wait" message and **drop the rest** of their queue.

```typescript
// Enhanced rate limiter in src/integrations/telegram/utils/rate-limiter.ts
export class AntiSpamGuard {
  private requestCounts = new Map<number, number[]>();
  private warnedUsers = new Set<number>();

  shouldBlock(userId: number, maxRequests: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userRequests = this.requestCounts.get(userId) || [];

    // Filter recent requests
    const recentRequests = userRequests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      if (!this.warnedUsers.has(userId)) {
        this.warnedUsers.add(userId);
        // Will send warning message once
        setTimeout(() => this.warnedUsers.delete(userId), windowMs);
      }
      return true; // Block this request
    }

    recentRequests.push(now);
    this.requestCounts.set(userId, recentRequests);
    return false;
  }

  wasWarned(userId: number): boolean {
    return this.warnedUsers.has(userId);
  }
}
```

---

## 3. Formatting – Markdown vs HTML & Modern Entities

### Formatting Strategies

- **MarkdownV2 Default:** It's fine, but requires **escaping everything**: `_ * [ ] ( ) ~ \` # @ > ! | - = { } .`
- **HTML Advantage:** It lets you hide ugly URLs: `<a href="https://example.com">Arsenal Lab</a>` instead of the full link.
- **Telegram Style:** Telegram strips unknown tags; no colors, no `<br>` – use `\n`.

### Modern Entities

Use modern formatting entities for better UX:

- **Spoiler:** Use `<span class="tg-spoiler">...</span>` (HTML) or `||...||` (MarkdownV2).
- **Blockquote:** Use `<blockquote expandable>...</blockquote>` (HTML) or `>...` (MarkdownV2).

### Implementation

```typescript
// src/integrations/telegram/utils/formatter-enhanced.ts
export enum FormatMode {
  Markdown = 'Markdown',
  MarkdownV2 = 'MarkdownV2',
  HTML = 'HTML',
}

export class MessageFormatter {
  private mode: FormatMode;

  constructor(mode: FormatMode = FormatMode.HTML) {
    this.mode = mode;
  }

  /**
   * Format benchmark results with proper escaping
   */
  formatBenchmarkResult(result: BenchmarkResult): string {
    if (this.mode === FormatMode.HTML) {
      return this.formatBenchmarkHTML(result);
    }
    return this.formatBenchmarkMarkdown(result);
  }

  private formatBenchmarkHTML(result: BenchmarkResult): string {
    const { type, bunTime, nodeTime, speedup } = result;

    let html = `🔐 <b>${this.capitalize(type)} Benchmark Results</b>\n\n`;
    html += `━━━━━━━━━━━━━━━━━━━━\n`;
    html += `⚡ Bun: <code>${bunTime.toFixed(2)}ms</code>\n`;

    if (nodeTime) {
      html += `🟢 Node.js: <code>${nodeTime.toFixed(2)}ms</code>\n\n`;
      html += `📊 <b>Speedup</b>: ${speedup?.toFixed(2)}× faster\n`;
    }

    html += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    html += `📈 <a href="https://brendadeeznuts1111.github.io/Arsenal-Lab/">Try it yourself</a>\n`;
    html += `💬 <a href="https://t.me/arsenallab">Join discussion</a>`;

    return html;
  }

  private formatBenchmarkMarkdown(result: BenchmarkResult): string {
    const { type, bunTime, nodeTime, speedup } = result;

    let md = `🔐 *${this.escapeMarkdownV2(this.capitalize(type))} Benchmark Results*\n\n`;
    md += `━━━━━━━━━━━━━━━━━━━━\n`;
    md += `⚡ Bun: \`${bunTime.toFixed(2)}ms\`\n`;

    if (nodeTime) {
      md += `🟢 Node\\.js: \`${nodeTime.toFixed(2)}ms\`\n\n`;
      md += `📊 *Speedup*: ${speedup?.toFixed(2)}× faster\n`;
    }

    md += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    md += `📈 [Try it yourself](https://brendadeeznuts1111\\.github\\.io/Arsenal\\-Lab/)\n`;
    md += `💬 [Join discussion](https://t\\.me/arsenallab)`;

    return md;
  }

  /**
   * Format error with spoiler for stack trace (HTML mode)
   */
  formatErrorWithStackTrace(error: string, stackTrace?: string): string {
    let message = `❌ <b>Error</b>\n\n${this.escapeHTML(error)}\n`;

    if (stackTrace && this.mode === FormatMode.HTML) {
      message += `\n<span class="tg-spoiler">${this.escapeHTML(stackTrace)}</span>`;
    }

    return message;
  }

  /**
   * Format long content with expandable blockquote
   */
  formatExpandableSection(title: string, content: string): string {
    if (this.mode === FormatMode.HTML) {
      return `<b>${title}</b>\n<blockquote expandable>${this.escapeHTML(content)}</blockquote>`;
    }
    return `*${this.escapeMarkdownV2(title)}*\n>${this.escapeMarkdownV2(content)}`;
  }

  private escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private escapeMarkdownV2(text: string): string {
    // Escape all special characters for MarkdownV2
    return text.replace(/([_*\[\]()~`>#@!|{}.+=\-\\])/g, '\\$1');
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
```

---

## 4. Group / Supergroup / Topic Pitfalls

| Feature | Pitfall | Mitigation (Action) |
| :--- | :--- | :--- |
| **Group Privacy** | If the bot is *not* admin, it will **not** see ordinary messages when privacy mode is on. | Ensure commands mention the bot: `/compare@arsenallab_bot`. |
| **Topics (Forums)** | Requires `message_thread_id` in every `sendMessage` call; otherwise, the message lands in "General". | **Mandatory check:** include `message_thread_id` when `chat.is_forum == true`. |
| **Channels** | Bot can only post if added as admin with "Post messages" right. | No rate limit per channel, but global 30 msg/s still applies. |
| **Silent Messages** | For bulk/status updates, use `disable_notification: true` to avoid spamming user devices. | Use for any non-critical update or background process completion. |

### Implementation

```typescript
// src/integrations/telegram/utils/chat-helper.ts
export interface SendMessageOptions {
  chatId: number;
  text: string;
  threadId?: number;
  silent?: boolean;
  parseMode?: 'HTML' | 'MarkdownV2';
  replyMarkup?: any;
}

export async function sendMessage(options: SendMessageOptions): Promise<void> {
  const {
    chatId,
    text,
    threadId,
    silent = false,
    parseMode = 'HTML',
    replyMarkup,
  } = options;

  const payload: any = {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
    disable_notification: silent,
  };

  // CRITICAL: Include message_thread_id for forum chats
  if (threadId) {
    payload.message_thread_id = threadId;
  }

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Telegram API error: ${JSON.stringify(error)}`);
  }
}

/**
 * Check if a chat is a forum (has topics enabled)
 */
export async function isForum(chatId: number): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const response = await fetch(
    `https://api.telegram.org/bot${token}/getChat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId }),
    }
  );

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.result?.is_forum === true;
}
```

---

## 5. File & Photo Messages

- **Photo Max:** 10 MB, 1280 × 1280 px recommended resolution.
- **Document Max:** 50 MB.
- **Graphing Recommendation:** Pre-generate ≤10 MB **PNG** benchmark graphs and send them as a **photo** (looks better in chat than as a file/document).

### Implementation

```typescript
// src/integrations/telegram/utils/media-sender.ts
export async function sendBenchmarkGraph(
  chatId: number,
  graphData: BenchmarkResult[],
  threadId?: number
): Promise<void> {
  // Generate graph as PNG (implementation depends on charting library)
  const imageBuffer = await generateBenchmarkGraph(graphData);

  // Ensure image is under 10 MB
  if (imageBuffer.length > 10 * 1024 * 1024) {
    throw new Error('Graph exceeds 10 MB limit');
  }

  const formData = new FormData();
  formData.append('chat_id', chatId.toString());
  formData.append('photo', new Blob([imageBuffer]), 'benchmark.png');
  formData.append('caption', 'Arsenal Lab Benchmark Results');

  if (threadId) {
    formData.append('message_thread_id', threadId.toString());
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: formData,
  });
}
```

---

## 6. Quick "Ready for Review" Checklist

- [ ] **Rate Limit:** Every `sendMessage` call to a group/channel is wrapped in a **350ms leaky-bucket**.
- [ ] **Text Splitting:** Text splitter utility respects sentence boundaries and produces `Part 1/3` headings.
- [ ] **Input Sanitization:** MarkdownV2 or HTML chosen consistently; **no raw user input** reaches the text without being escaped.
- [ ] **Topics:** `message_thread_id` is included when `chat.is_forum == true`.
- [ ] **Permissions:** Bot added to the test supergroup **as admin** to verify both privacy-mode and admin-command behavior.
- [ ] **Error Handling:** **Exponential backoff** (start 1s, ×2, cap 30s) on any **`429`** (Rate Limit) or **`502`** (Bad Gateway) response.
- [ ] **UX:** All non-critical bulk/status replies use **`disable_notification: true`**.

---

## 7. Error Handling & Retry Strategy

### Exponential Backoff Implementation

```typescript
// src/integrations/telegram/utils/retry.ts
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {
    maxRetries: 5,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  }
): Promise<T> {
  let lastError: Error | null = null;
  let delay = config.initialDelayMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Check if we've exhausted retries
      if (attempt === config.maxRetries) {
        break;
      }

      // Wait before retrying
      console.log(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`);
      await sleep(delay);

      // Increase delay with backoff
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
    }
  }

  throw lastError || new Error('All retries exhausted');
}

function isRetryableError(error: any): boolean {
  const message = error.message?.toLowerCase() || '';
  const errorCode = error.code || error.status;

  // Retry on rate limits and server errors
  return (
    errorCode === 429 || // Rate limit
    errorCode === 502 || // Bad Gateway
    errorCode === 503 || // Service Unavailable
    errorCode === 504 || // Gateway Timeout
    message.includes('rate limit') ||
    message.includes('too many requests')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

---

## 8. Production Deployment Checklist

### Before Going Live

- [ ] **Message Queue:** Leaky bucket implementation tested with >100 messages
- [ ] **Rate Limits:** Verified 350ms spacing in production logs
- [ ] **Text Splitting:** Tested with messages >8k chars
- [ ] **Anti-Spam:** Tested with rapid-fire requests from same user
- [ ] **Error Recovery:** Tested 429 and 502 error handling
- [ ] **Topic Support:** Verified `message_thread_id` in forum chats
- [ ] **Silent Mode:** Non-critical messages use `disable_notification: true`
- [ ] **Formatting:** All user input properly escaped (HTML or MarkdownV2)
- [ ] **Monitoring:** Logging for rate limit hits, retry attempts, error rates

### Monitoring Metrics

```typescript
// src/integrations/telegram/utils/metrics.ts
export const telegramMetrics = {
  messagesSent: 0,
  messagesQueued: 0,
  rateLimitHits: 0,
  retryAttempts: 0,
  errors: new Map<string, number>(),

  recordMessageSent() {
    this.messagesSent++;
  },

  recordQueued() {
    this.messagesQueued++;
  },

  recordRateLimit() {
    this.rateLimitHits++;
  },

  recordRetry() {
    this.retryAttempts++;
  },

  recordError(type: string) {
    this.errors.set(type, (this.errors.get(type) || 0) + 1);
  },

  getReport() {
    return {
      sent: this.messagesSent,
      queued: this.messagesQueued,
      rateLimits: this.rateLimitHits,
      retries: this.retryAttempts,
      errors: Object.fromEntries(this.errors),
      queueHealth: this.messagesQueued / Math.max(this.messagesSent, 1),
    };
  },
};
```

---

## Resources

- **Official API Docs:** https://core.telegram.org/bots/api
- **Rate Limit Info:** https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this
- **MarkdownV2 Spec:** https://core.telegram.org/bots/api#markdownv2-style
- **HTML Formatting:** https://core.telegram.org/bots/api#html-style

---

**Engineered for production at scale.** ⚡🤖
