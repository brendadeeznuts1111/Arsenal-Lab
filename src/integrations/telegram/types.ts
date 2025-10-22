/**
 * TypeScript types for Telegram Bot API integration
 */

// Telegram Bot API types
export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  entities?: TelegramMessageEntity[];
}

export interface TelegramMessageEntity {
  type: 'bot_command' | 'mention' | 'hashtag' | 'url' | 'code' | 'pre';
  offset: number;
  length: number;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

// Bot command context
export interface BotContext {
  update: TelegramUpdate;
  message: TelegramMessage;
  user: TelegramUser;
  chat: TelegramChat;
  text: string;
  command?: string;
  args: string[];
}

// Command handler type
export type CommandHandler = (ctx: BotContext) => Promise<string | void>;

// Bot configuration
export interface BotConfig {
  token: string;
  channelId?: string;
  groupId?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  rateLimits?: RateLimitConfig;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  perUser?: boolean;
}

// Benchmark types
export interface BenchmarkRequest {
  type: 'crypto' | 'memory' | 'postmessage' | 'all';
  iterations?: number;
}

export interface BenchmarkResult {
  type: string;
  bunTime: number;
  nodeTime?: number;
  speedup?: number;
  memoryUsage?: number;
  details?: Record<string, unknown>;
}

// Stats types
export interface BotStats {
  totalUsers: number;
  activeUsers: number;
  commandsProcessed: number;
  uptime: number;
  version: string;
}

// Response types
export interface BotResponse {
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
  reply_markup?: {
    inline_keyboard?: Array<Array<{ text: string; callback_data: string }>>;
  };
}
