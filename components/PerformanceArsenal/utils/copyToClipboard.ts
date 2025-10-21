// components/PerformanceArsenal/utils/copyToClipboard.ts
export async function copyToClipboard(text: string): Promise<void> {
  // Check if we're in a browser environment
  const isBrowser = typeof navigator !== 'undefined' && typeof document !== 'undefined' && typeof window !== 'undefined';

  if (!isBrowser) {
    console.warn('Clipboard not available in this environment');
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      // Use the Clipboard API when available
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw new Error('Failed to copy to clipboard');
  }
}
