/**
 * Chat Helper Utilities
 *
 * Handles forum/topic support, silent notifications, and chat info.
 */

export interface SendMessageOptions {
  chatId: number;
  text: string;
  threadId?: number;
  silent?: boolean;
  parseMode?: 'HTML' | 'MarkdownV2' | 'Markdown';
  replyMarkup?: any;
  disableWebPagePreview?: boolean;
}

/**
 * Send message with full option support
 */
export async function sendMessage(
  token: string,
  options: SendMessageOptions
): Promise<void> {
  const {
    chatId,
    text,
    threadId,
    silent = false,
    parseMode = 'HTML',
    replyMarkup,
    disableWebPagePreview = false,
  } = options;

  const payload: any = {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
    disable_notification: silent,
    disable_web_page_preview: disableWebPagePreview,
  };

  // CRITICAL: Include message_thread_id for forum chats
  if (threadId) {
    payload.message_thread_id = threadId;
  }

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

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
 * Get chat information
 */
export async function getChat(token: string, chatId: number): Promise<any> {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/getChat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get chat: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.result;
}

/**
 * Check if a chat is a forum (has topics enabled)
 */
export async function isForum(token: string, chatId: number): Promise<boolean> {
  try {
    const chat = await getChat(token, chatId);
    return chat?.is_forum === true;
  } catch {
    return false;
  }
}

/**
 * Check if chat is a supergroup
 */
export async function isSupergroup(token: string, chatId: number): Promise<boolean> {
  try {
    const chat = await getChat(token, chatId);
    return chat?.type === 'supergroup';
  } catch {
    return false;
  }
}

/**
 * Check if chat is a channel
 */
export async function isChannel(token: string, chatId: number): Promise<boolean> {
  try {
    const chat = await getChat(token, chatId);
    return chat?.type === 'channel';
  } catch {
    return false;
  }
}

/**
 * Get chat member count
 */
export async function getChatMemberCount(token: string, chatId: number): Promise<number> {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/getChatMemberCount`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId }),
    }
  );

  if (!response.ok) {
    return 0;
  }

  const data = await response.json();
  return data.result || 0;
}

/**
 * Extract thread ID from message (if in a forum)
 */
export function getThreadId(message: any): number | undefined {
  return message.message_thread_id || message.reply_to_message?.message_thread_id;
}

/**
 * Check if message is from a forum chat
 */
export function isFromForum(message: any): boolean {
  return message.chat?.is_forum === true || !!message.message_thread_id;
}
