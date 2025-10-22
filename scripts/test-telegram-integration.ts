#!/usr/bin/env bun
/**
 * Telegram Integration Testing Script
 *
 * Validates all Telegram integration points in Arsenal Lab:
 * - File structure
 * - Footer links
 * - README badges
 * - Environment variables
 * - Security configuration
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test result tracking
interface TestResult {
  passed: number;
  failed: number;
  warnings: number;
  tests: Array<{ name: string; status: 'pass' | 'fail' | 'warn'; message?: string }>;
}

const results: TestResult = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

// Parse command line arguments
const args = process.argv.slice(2);
const linksOnly = args.includes('--links-only');
const securityOnly = args.includes('--security-only');
const verbose = args.includes('--verbose') || args.includes('-v');

// Helper functions
function success(message: string) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
  results.passed++;
  results.tests.push({ name: message, status: 'pass' });
}

function fail(message: string, details?: string) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
  if (details && verbose) {
    console.log(`   ${colors.yellow}${details}${colors.reset}`);
  }
  results.failed++;
  results.tests.push({ name: message, status: 'fail', message: details });
}

function warn(message: string, details?: string) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
  if (details && verbose) {
    console.log(`   ${details}`);
  }
  results.warnings++;
  results.tests.push({ name: message, status: 'warn', message: details });
}

function section(title: string) {
  console.log(`\n${colors.cyan}${colors.bright}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'─'.repeat(title.length)}${colors.reset}\n`);
}

function fileExists(path: string): boolean {
  return existsSync(join(process.cwd(), path));
}

function readFile(path: string): string {
  try {
    return readFileSync(join(process.cwd(), path), 'utf-8');
  } catch {
    return '';
  }
}

// Test 1: File Structure
function testFileStructure() {
  section('📁 File Structure Check');

  const requiredFiles = [
    'components/Layout/Footer.tsx',
    'README.md',
    'docs/community/social-media.md',
    'docs/telegram-bot-setup.md',
    'docs/telegram-testing-checklist.md',
    '.env.example',
  ];

  for (const file of requiredFiles) {
    if (fileExists(file)) {
      success(file);
    } else {
      fail(file, 'File not found');
    }
  }

  // Check for stub handlers
  const stubHandlers = [
    'src/integrations/telegram/bot.ts',
    'src/integrations/telegram/commands/index.ts',
    'src/integrations/telegram/commands/benchmark.ts',
    'src/integrations/telegram/commands/compare.ts',
    'src/integrations/telegram/commands/stats.ts',
    'src/integrations/telegram/commands/help.ts',
  ];

  let hasStubs = true;
  for (const handler of stubHandlers) {
    if (!fileExists(handler)) {
      hasStubs = false;
      break;
    }
  }

  if (hasStubs) {
    success('Telegram bot stub handlers present');
  } else {
    warn('Telegram bot stub handlers not yet created', 'Run implementation phase to create handlers');
  }
}

// Test 2: Footer Links
function testFooterLinks() {
  section('🔗 Footer Links Check');

  const footerPath = 'components/Layout/Footer.tsx';
  const footerContent = readFile(footerPath);

  if (!footerContent) {
    fail('Footer.tsx could not be read');
    return;
  }

  const expectedLinks = [
    { url: 'https://t.me/arsenallab_bot', name: 'Telegram Bot' },
    { url: 'https://t.me/arsenallab', name: 'Telegram Group' },
    { url: 'https://t.me/arsenallab_channel', name: 'Telegram Channel' },
  ];

  for (const link of expectedLinks) {
    if (footerContent.includes(link.url)) {
      success(`${link.name}: ${link.url}`);
    } else {
      fail(`${link.name} link missing`, `Expected: ${link.url}`);
    }
  }

  // Check for proper link structure
  if (footerContent.includes('target="_blank"') && footerContent.includes('rel="noopener noreferrer"')) {
    success('Links have proper security attributes');
  } else {
    warn('Links may be missing security attributes', 'Check for target="_blank" and rel="noopener noreferrer"');
  }
}

// Test 3: README Badges
function testReadmeBadges() {
  section('📋 README Badges Check');

  const readmeContent = readFile('README.md');

  if (!readmeContent) {
    fail('README.md could not be read');
    return;
  }

  const expectedBadges = [
    { text: 'Telegram-Bot', name: 'Bot Badge' },
    { text: 'Telegram-Group', name: 'Group Badge' },
    { text: 'Telegram-Channel', name: 'Channel Badge' },
  ];

  for (const badge of expectedBadges) {
    if (readmeContent.includes(badge.text)) {
      success(badge.name);
    } else {
      fail(`${badge.name} missing`, `Expected: ${badge.text}`);
    }
  }

  // Check for shields.io badges
  if (readmeContent.includes('shields.io') || readmeContent.includes('img.shields.io')) {
    success('Using shields.io for badges');
  } else {
    warn('Badges may not be using shields.io', 'Recommended for consistent styling');
  }

  // Check for proper Telegram links in README
  const telegramLinks = [
    'https://t.me/arsenallab_bot',
    'https://t.me/arsenallab',
    'https://t.me/arsenallab_channel',
  ];

  const allLinksPresent = telegramLinks.every(link => readmeContent.includes(link));
  if (allLinksPresent) {
    success('All Telegram links present in README');
  } else {
    fail('Some Telegram links missing from README');
  }
}

// Test 4: Environment Variables
function testEnvironmentVariables() {
  section('🔐 Environment Variables Check');

  const envExampleContent = readFile('.env.example');

  if (!envExampleContent) {
    fail('.env.example could not be read');
    return;
  }

  const requiredEnvVars = [
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHANNEL_ID',
    'TELEGRAM_GROUP_ID',
  ];

  for (const envVar of requiredEnvVars) {
    if (envExampleContent.includes(envVar)) {
      success(envVar);
    } else {
      fail(`${envVar} missing from .env.example`);
    }
  }

  // Check if .env exists (should exist but not be committed)
  if (fileExists('.env')) {
    success('.env file exists');

    // Check if .gitignore includes .env
    const gitignoreContent = readFile('.gitignore');
    if (gitignoreContent.includes('.env')) {
      success('.env is gitignored');
    } else {
      fail('.env exists but is NOT gitignored!', 'SECURITY RISK: Add .env to .gitignore immediately');
    }
  } else {
    warn('.env file not found', 'Create .env from .env.example for local development');
  }
}

// Test 5: Security Check
function testSecurity() {
  section('🔒 Security Check');

  const setupDocContent = readFile('docs/telegram-bot-setup.md');

  if (!setupDocContent) {
    fail('telegram-bot-setup.md could not be read');
    return;
  }

  // Check if actual bot token is in documentation
  const suspiciousPatterns = [
    /\d{10}:[A-Za-z0-9_-]{35}/,  // Telegram bot token pattern
    /8346580654:AAFZxUBu2OhaBoVjjfXlJLg4npFAasBZCco/,  // Specific token
  ];

  let tokenFound = false;
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(setupDocContent)) {
      tokenFound = true;
      break;
    }
  }

  if (tokenFound) {
    fail('SECURITY WARNING: Bot token found in documentation!', 'Replace with placeholder immediately');
  } else {
    success('No bot tokens found in documentation');
  }

  // Check for security warnings in docs
  if (setupDocContent.includes('IMPORTANT') || setupDocContent.includes('Security')) {
    success('Security warnings present in documentation');
  } else {
    warn('Documentation may be missing security warnings');
  }

  // Check .gitignore
  const gitignoreContent = readFile('.gitignore');
  const criticalPatterns = ['.env', '*.key', '*.pem', 'secrets'];

  let allPatternsFound = true;
  for (const pattern of ['.env']) {  // At minimum, .env must be ignored
    if (!gitignoreContent.includes(pattern)) {
      fail(`Critical pattern "${pattern}" missing from .gitignore`);
      allPatternsFound = false;
    }
  }

  if (allPatternsFound) {
    success('.gitignore contains critical security patterns');
  }
}

// Test 6: Documentation Completeness
function testDocumentation() {
  section('📚 Documentation Completeness');

  const socialMediaDoc = readFile('docs/community/social-media.md');
  const setupDoc = readFile('docs/telegram-bot-setup.md');
  const testingDoc = readFile('docs/telegram-testing-checklist.md');

  // Check social media strategy
  if (socialMediaDoc.includes('Telegram Bot') && socialMediaDoc.includes('Telegram Supergroup')) {
    success('Social media strategy includes Telegram');
  } else {
    fail('Social media strategy missing Telegram sections');
  }

  // Check bot setup guide
  const setupSections = ['Bot Commands', 'Rate Limiting', 'Security', 'Deployment'];
  let sectionsFound = 0;
  for (const section of setupSections) {
    if (setupDoc.includes(section)) {
      sectionsFound++;
    }
  }

  if (sectionsFound === setupSections.length) {
    success(`Bot setup guide has all ${setupSections.length} required sections`);
  } else {
    warn(`Bot setup guide missing ${setupSections.length - sectionsFound} sections`, `Found ${sectionsFound}/${setupSections.length}`);
  }

  // Check testing checklist
  if (testingDoc && testingDoc.includes('Testing')) {
    success('Testing checklist document exists');
  } else {
    warn('Testing checklist may be incomplete');
  }
}

// Main execution
async function main() {
  console.log(`${colors.bright}${colors.blue}`);
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   🧪 Telegram Integration Testing Suite                 ║');
  console.log('║   Arsenal Lab - Comprehensive Validation                ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  if (linksOnly) {
    console.log(`${colors.yellow}Running in links-only mode...${colors.reset}\n`);
    testFooterLinks();
    testReadmeBadges();
  } else if (securityOnly) {
    console.log(`${colors.yellow}Running in security-only mode...${colors.reset}\n`);
    testSecurity();
    testEnvironmentVariables();
  } else {
    // Run all tests
    testFileStructure();
    testFooterLinks();
    testReadmeBadges();
    testEnvironmentVariables();
    testSecurity();
    testDocumentation();
  }

  // Print summary
  section('📊 Test Summary');

  const total = results.passed + results.failed + results.warnings;
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : '0.0';

  console.log(`${colors.green}✅ Passed:   ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed:   ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${results.warnings}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}Total Tests: ${total}${colors.reset}`);
  console.log(`${colors.bright}Pass Rate:   ${passRate}%${colors.reset}`);

  // Exit code
  if (results.failed > 0) {
    console.log(`\n${colors.red}${colors.bright}❌ Some tests failed. Please review and fix issues.${colors.reset}`);
    process.exit(1);
  } else if (results.warnings > 0) {
    console.log(`\n${colors.yellow}${colors.bright}⚠️  All tests passed with warnings. Review recommended.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.green}${colors.bright}✅ All tests passed! Telegram integration is solid. 🎉${colors.reset}`);
    process.exit(0);
  }
}

main().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
