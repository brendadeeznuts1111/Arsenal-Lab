#!/usr/bin/env bun
import type { InvariantRule } from './index.ts';

const rule: InvariantRule = {
  name: "no-process-env",
  description: "Patches cannot introduce new process.env access",
  severity: "high",
  tags: ["security", "environment"],

  validate: (patchContent: string, packageName: string) => {
    // Check for process.env usage in patch content
    const processEnvRegex = /\bprocess\.env\.[A-Z_][A-Z0-9_]*/g;
    const matches = patchContent.match(processEnvRegex);

    if (!matches) return true;

    // Allow process.env usage in test files or config files
    const allowedPatterns = [
      /\.test\./,
      /\.spec\./,
      /config\./,
      /env\./,
      /environment\./
    ];

    const isAllowedFile = allowedPatterns.some(pattern =>
      packageName.toLowerCase().match(pattern)
    );

    // If it's an allowed file, permit process.env usage
    return isAllowedFile;
  }
};

export default rule;
