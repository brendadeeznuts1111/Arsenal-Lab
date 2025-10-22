#!/usr/bin/env bun

// Arsenal Lab Secrets Management Script
// View, update, and manage securely stored credentials

const SERVICE = 'arsenal-lab';
const SECRETS = [
  { key: 'google-analytics-id', name: 'Google Analytics ID', description: 'GA4 Measurement ID (G-XXXXXXXXXX)' },
  { key: 'github-username', name: 'GitHub Username', description: 'Your GitHub username' },
  { key: 'github-repo', name: 'GitHub Repository', description: 'Repository name' },
  { key: 'github-token', name: 'GitHub Token', description: 'Personal Access Token (optional)' }
];

console.log('🔐 Arsenal Lab Secrets Manager');
console.log('==============================\n');

async function checkSecretsSupport() {
  try {
    await Bun.secrets.get({ service: SERVICE, name: 'test' });
    return true;
  } catch (error) {
    console.log('❌ Bun Secrets API not available');
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

async function listSecrets() {
  console.log('📋 Current Stored Secrets:');
  console.log('---------------------------');

  for (const secret of SECRETS) {
    try {
      const value = await Bun.secrets.get({ service: SERVICE, name: secret.key });
      if (value) {
        // Mask sensitive values
        const maskedValue = secret.key.includes('token') || secret.key.includes('key')
          ? `${value.substring(0, 8)}****`
          : value;
        console.log(`✅ ${secret.name}: ${maskedValue}`);
      } else {
        console.log(`❌ ${secret.name}: Not set`);
      }
    } catch (error) {
      console.log(`❌ ${secret.name}: Error accessing`);
    }
  }
  console.log('');
}

async function setSecret(key: string, name: string) {
  const currentValue = await Bun.secrets.get({ service: SERVICE, name: key });
  const maskedCurrent = currentValue
    ? (key.includes('token') ? `${currentValue.substring(0, 8)}****` : currentValue)
    : 'Not set';

  console.log(`🔧 Configure ${name}`);
  console.log(`   Current: ${maskedCurrent}`);

  const newValue = prompt(`   Enter new ${name.toLowerCase()}: `);
  if (newValue && newValue.trim()) {
    await Bun.secrets.set({ service: SERVICE, name: key, value: newValue.trim() });
    console.log(`✅ Updated ${name}\n`);
  } else {
    console.log('⏭️  Cancelled\n');
  }
}

async function deleteSecret(key: string, name: string) {
  const confirm = prompt(`❌ Delete ${name}? This cannot be undone. Type 'yes' to confirm: `);
  if (confirm === 'yes') {
    const deleted = await Bun.secrets.delete({ service: SERVICE, name: key });
    if (deleted) {
      console.log(`✅ Deleted ${name}\n`);
    } else {
      console.log(`❌ ${name} was not found\n`);
    }
  } else {
    console.log('⏭️  Cancelled\n');
  }
}

async function showMenu() {
  console.log('Choose an action:');
  console.log('1. 📋 List all secrets');
  console.log('2. 📊 Configure Google Analytics ID');
  console.log('3. 🐙 Configure GitHub Username');
  console.log('4. 📁 Configure GitHub Repository');
  console.log('5. 🔑 Configure GitHub Token');
  console.log('6. 🗑️  Delete a secret');
  console.log('7. 🚪 Exit');
  console.log('');

  const choice = prompt('Enter your choice (1-7): ');

  switch (choice) {
    case '1':
      console.log('');
      await listSecrets();
      break;
    case '2':
      console.log('');
      await setSecret('google-analytics-id', 'Google Analytics ID');
      break;
    case '3':
      console.log('');
      await setSecret('github-username', 'GitHub Username');
      break;
    case '4':
      console.log('');
      await setSecret('github-repo', 'GitHub Repository');
      break;
    case '5':
      console.log('');
      await setSecret('github-token', 'GitHub Token');
      break;
    case '6':
      console.log('');
      console.log('Which secret to delete?');
      SECRETS.forEach((secret, index) => {
        console.log(`${index + 1}. ${secret.name}`);
      });
      const deleteChoice = prompt('Enter number: ');
      const secretIndex = parseInt(deleteChoice) - 1;
      if (secretIndex >= 0 && secretIndex < SECRETS.length) {
        const secret = SECRETS[secretIndex]!;
        await deleteSecret(secret.key, secret.name);
      } else {
        console.log('❌ Invalid choice\n');
      }
      break;
    case '7':
      console.log('👋 Goodbye!');
      return false;
    default:
      console.log('❌ Invalid choice\n');
  }
  return true;
}

async function main() {
  const hasSecrets = await checkSecretsSupport();
  if (!hasSecrets) {
    console.log('💡 To use secrets management, ensure your system has:');
    console.log('   • macOS: Keychain Services');
    console.log('   • Linux: libsecret service (GNOME Keyring, KWallet)');
    console.log('   • Windows: Windows Credential Manager');
    console.log('');
    process.exit(1);
  }

  console.log('✅ Connected to secure credential storage\n');

  let continueMenu = true;
  while (continueMenu) {
    continueMenu = await showMenu();
  }
}

// Run the management interface
main().catch(console.error);
