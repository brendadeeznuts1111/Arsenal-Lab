/**
 * Text Splitter for Long Messages
 *
 * Telegram has a hard limit of 4,096 UTF-8 code points per message.
 * This utility splits long messages at sentence boundaries and adds part numbers.
 */

const MAX_MESSAGE_LENGTH = 4096;
const PART_HEADER_LENGTH = 50; // Reserve space for "📄 Part 1/3\n\n"
const EFFECTIVE_MAX_LENGTH = MAX_MESSAGE_LENGTH - PART_HEADER_LENGTH;

/**
 * Split long message into parts
 */
export function splitLongMessage(text: string): string[] {
  if (text.length <= MAX_MESSAGE_LENGTH) {
    return [text];
  }

  const parts: string[] = [];
  let currentPart = '';

  // Split by sentences (period, exclamation, question mark followed by space or newline)
  const sentences = text.split(/([.!?]\s+|\n\n)/);

  for (const segment of sentences) {
    const potentialLength = currentPart.length + segment.length;

    if (potentialLength > EFFECTIVE_MAX_LENGTH && currentPart.length > 0) {
      // Current part is full, save it and start new part
      parts.push(currentPart.trim());
      currentPart = segment;
    } else {
      currentPart += segment;
    }
  }

  // Add remaining content
  if (currentPart.trim()) {
    parts.push(currentPart.trim());
  }

  // Add part numbers if multiple parts
  const totalParts = parts.length;
  if (totalParts > 1) {
    return parts.map((part, index) => {
      return `📄 **Part ${index + 1}/${totalParts}**\n\n${part}`;
    });
  }

  return parts;
}

/**
 * Split at word boundaries (fallback if sentence splitting fails)
 */
export function splitAtWordBoundary(text: string, maxLength: number = EFFECTIVE_MAX_LENGTH): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const parts: string[] = [];
  let currentPart = '';

  const words = text.split(/(\s+)/); // Keep whitespace

  for (const word of words) {
    const potentialLength = currentPart.length + word.length;

    if (potentialLength > maxLength && currentPart.length > 0) {
      parts.push(currentPart.trim());
      currentPart = word;
    } else {
      currentPart += word;
    }
  }

  if (currentPart.trim()) {
    parts.push(currentPart.trim());
  }

  return parts;
}

/**
 * Check if text needs splitting
 */
export function needsSplitting(text: string): boolean {
  return text.length > MAX_MESSAGE_LENGTH;
}

/**
 * Get number of parts needed
 */
export function getPartCount(text: string): number {
  if (!needsSplitting(text)) {
    return 1;
  }

  return splitLongMessage(text).length;
}

/**
 * Truncate text to fit in one message
 */
export function truncateMessage(text: string, suffix: string = '...'): string {
  if (text.length <= MAX_MESSAGE_LENGTH) {
    return text;
  }

  const truncateLength = MAX_MESSAGE_LENGTH - suffix.length;
  return text.substring(0, truncateLength) + suffix;
}
