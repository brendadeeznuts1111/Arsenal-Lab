#!/usr/bin/env bun
import type { InvariantRule } from './index.ts';

const rule: InvariantRule = {
  name: "no-eval-usage",
  description: "Patches cannot introduce eval() or Function() constructors",
  severity: "critical",
  tags: ["security", "code-execution", "eval"],

  validate: (patchContent: string, packageName: string) => {
    // Check for dangerous code execution patterns
    const dangerousPatterns = [
      /\beval\s*\(/,
      /\bnew\s+Function\s*\(/,
      /Function\s*\(\s*["'`]/,
      /\bsetTimeout\s*\(\s*["'`]/,
      /\bsetInterval\s*\(\s*["'`]/
    ];

    return !dangerousPatterns.some(pattern => pattern.test(patchContent));
  }
};

export default rule;
