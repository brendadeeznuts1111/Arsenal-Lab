#!/usr/bin/env bun
import type { InvariantRule } from './index.ts';

const rule: InvariantRule = {
  name: "no-global-mutation",
  description: "Patches cannot modify global objects",
  severity: "high",
  tags: ["security", "globals", "mutation"],

  validate: (patchContent: string, packageName: string) => {
    // Check for global object modifications
    const globalObjects = [
      "global", "globalThis", "window", "document", "navigator",
      "localStorage", "sessionStorage", "indexedDB"
    ];

    // Allow modifications in test files or config files
    const allowedPatterns = [
      /\.test\./,
      /\.spec\./,
      /config\./,
      /setup\./,
      /globals\./
    ];

    const isAllowedFile = allowedPatterns.some(pattern =>
      packageName.toLowerCase().match(pattern)
    );

    if (isAllowedFile) return true;

    // Check for global object property assignments
    for (const globalObj of globalObjects) {
      const assignmentRegex = new RegExp(`${globalObj}\\s*\\[\\s*["'\`]\\w+["'\`]\\s*\\]\\s*=`, 'g');
      if (assignmentRegex.test(patchContent)) {
        return false;
      }

      // Check for property definitions
      const propertyRegex = new RegExp(`${globalObj}\\.\\w+\\s*=`, 'g');
      if (propertyRegex.test(patchContent)) {
        return false;
      }
    }

    return true;
  }
};

export default rule;
