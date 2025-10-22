#!/usr/bin/env bun
import type { InvariantRule } from './index.ts';

const rule: InvariantRule = {
  name: "logging-consistency",
  description: "Patches must use consistent logging patterns",
  severity: "moderate",
  tags: ["logging", "consistency", "observability"],

  validate: (patchContent: string, packageName: string) => {
    // Check for inconsistent logging patterns
    const allowedLoggers = [
      "console.log", "console.warn", "console.error", "console.info",
      "logger.log", "logger.warn", "logger.error", "logger.info",
      "log.info", "log.warn", "log.error"
    ];

    // Check for console.log/debug usage (should use proper logging)
    const consoleLogRegex = /\bconsole\.(log|debug|trace)\s*\(/g;
    const hasInconsistentLogging = consoleLogRegex.test(patchContent);

    if (hasInconsistentLogging) {
      // Allow in test files or if proper logging is also present
      const properLoggingRegex = /\b(logger|log)\.(info|warn|error)\s*\(/g;
      const hasProperLogging = properLoggingRegex.test(patchContent);

      const allowedPatterns = [
        /\.test\./,
        /\.spec\./,
        /debug\./,
        /console\./  // Allow if explicitly about console
      ];

      const isAllowedFile = allowedPatterns.some(pattern =>
        packageName.toLowerCase().match(pattern)
      );

      // Allow if it's an allowed file OR if proper logging is also present
      return isAllowedFile || hasProperLogging;
    }

    return true;
  }
};

export default rule;
