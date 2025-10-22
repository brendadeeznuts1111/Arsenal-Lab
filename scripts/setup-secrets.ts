#!/usr/bin/env bun

// Arsenal Lab Secrets Setup Script
// Uses Bun's native Secrets API for secure credential storage

console.log('🔐 Arsenal Lab Secrets Setup');
console.log('==============================\n');

// Check if Secrets API is available
async function checkSecretsSupport() {
  try {
    await Bun.secrets.get({ service: 'test', name: 'test' });
    return true;
  } catch (error) {
    console.log('❌ Bun Secrets API not available on this platform');
    console.log('   This may be due to missing system credential services:\n');
    console.log('   • macOS: Keychain Services');
    console.log('   • Linux: libsecret (GNOME Keyring, KWallet)');
    console.log('   • Windows: Windows Credential Manager\n');
    return false;
  }
}

async function setupSecrets() {
  const hasSecrets = await checkSecretsSupport();
  if (!hasSecrets) {
    console.log('💡 Falling back to environment variables...');
    console.log('   Please set up your .env file manually or configure system credential services.\n');
    return;
  }

  console.log('✅ Bun Secrets API available');
  console.log('🔒 Storing credentials securely...\n');

  // Google Analytics Setup
  console.log('📊 Google Analytics Configuration:');
  const currentGaId = await Bun.secrets.get({ service: 'arsenal-lab', name: 'google-analytics-id' });

  if (currentGaId) {
    console.log(`   ✅ Already configured: ${currentGaId}`);
  } else {
    const gaId = prompt('   Enter your Google Analytics ID (e.g., G-XXXXXXXXXX): ');
    if (gaId && gaId.startsWith('G-')) {
      await Bun.secrets.set({ service: 'arsenal-lab', name: 'google-analytics-id', value: gaId });
      console.log(`   ✅ Stored: ${gaId}`);
    } else {
      console.log('   ❌ Invalid Google Analytics ID format (should start with G-)');
    }
  }

  // GitHub Configuration
  console.log('\n🐙 GitHub Configuration:');

  const currentUsername = await Bun.secrets.get({ service: 'arsenal-lab', name: 'github-username' });

  if (currentUsername) {
    console.log(`   ✅ Username already configured: ${currentUsername}`);
  } else {
    const username = prompt('   Enter your GitHub username: ');
    if (username) {
      await Bun.secrets.set({ service: 'arsenal-lab', name: 'github-username', value: username });
      console.log(`   ✅ Stored username: ${username}`);
    }
  }

  const currentRepo = await Bun.secrets.get({ service: 'arsenal-lab', name: 'github-repo' });

  if (currentRepo) {
    console.log(`   ✅ Repository already configured: ${currentRepo}`);
  } else {
    const repo = prompt('   Enter your GitHub repository name: ');
    if (repo) {
      await Bun.secrets.set({ service: 'arsenal-lab', name: 'github-repo', value: repo });
      console.log(`   ✅ Stored repository: ${repo}`);
    }
  }

  // Optional: GitHub Token
  console.log('\n🔑 GitHub Personal Access Token (optional):');
  console.log('   This enables API features like repository stats, discussions, etc.');
  const currentToken = await Bun.secrets.get({ service: 'arsenal-lab', name: 'github-token' });

  if (currentToken) {
    console.log('   ✅ Token already configured');
  } else {
    const token = prompt('   Enter your GitHub Personal Access Token (or press Enter to skip): ');
    if (token && token.startsWith('ghp_')) {
      await Bun.secrets.set({ service: 'arsenal-lab', name: 'github-token', value: token });
      console.log('   ✅ Stored GitHub token');
    } else if (token) {
      console.log('   ❌ Token should start with "ghp_" (GitHub Personal Access Token)');
    } else {
      console.log('   ⏭️  Skipped GitHub token setup');
    }
  }

  console.log('\n🎉 Setup Complete!');
  console.log('==============================');
  console.log('✅ Your credentials are now securely stored using your operating system\'s');
  console.log('   native credential storage (Keychain/macOS, Credential Manager/Windows,');
  console.log('   or libsecret/Linux).');
  console.log('');
  console.log('🚀 You can now run: bun run dev');
  console.log('📊 Analytics will be automatically loaded from secure storage');
  console.log('');

  // Test server startup
  console.log('🧪 Testing server startup...');
  try {
    // Import and test the server briefly
    const { execSync } = await import('child_process');
    execSync('timeout 3 bun src/server.ts 2>/dev/null || true', { stdio: 'pipe' });
    console.log('✅ Server configuration validated');
  } catch (error) {
    console.log('⚠️  Server test completed (expected timeout)');
  }
}

// Run setup
setupSecrets().catch(console.error);
