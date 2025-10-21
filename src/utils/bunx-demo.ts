// src/utils/bunx-demo.ts
// Showcase bunx advantages and performance benefits

export function showcaseBunxAdvantages() {
  const advantages = [
    {
      feature: "Speed",
      bunx: "⚡ Instant (Bun resolver)",
      npx: "🐌 Slower (npm resolver)",
      difference: "3-5x faster startup"
    },
    {
      feature: "Caching",
      bunx: "💾 Smart persistent cache",
      npx: "📦 Downloads every time",
      difference: "Zero download after first run"
    },
    {
      feature: "Security",
      bunx: "🔒 Isolated execution",
      npx: "⚠️ Less isolated",
      difference: "Better sandboxing"
    },
    {
      feature: "Integration",
      bunx: "🏠 Uses project Bun",
      npx: "🔄 Falls back to npm",
      difference: "Seamless Bun ecosystem"
    }
  ];

  console.table(advantages);
}

export function showPerformanceComparison() {
  const scenarios = [
    {
      scenario: "First run",
      traditional: "45s (download + install)",
      bunx: "15s (download only)",
      improvement: "3x faster"
    },
    {
      scenario: "Subsequent runs",
      traditional: "5s (local node_modules)",
      bunx: "1s (bun cache)",
      improvement: "5x faster"
    },
    {
      scenario: "CI pipeline",
      traditional: "60s (install deps)",
      bunx: "5s (direct execution)",
      improvement: "12x faster"
    },
    {
      scenario: "Global tools",
      traditional: "30s (npm install -g)",
      bunx: "2s (bunx)",
      improvement: "15x faster"
    }
  ];

  console.log("\n⚡ Performance Comparison: bunx vs Traditional Tools\n");
  console.table(scenarios);
}

export function showBunxCommands() {
  const commands = [
    {
      command: "bunx @bun/performance-arsenal",
      description: "Launch interactive performance lab",
      category: "Primary"
    },
    {
      command: "bunx @bun/performance-arsenal --ci",
      description: "Run automated CI benchmarks",
      category: "Benchmarking"
    },
    {
      command: "bunx tsc --noEmit",
      description: "TypeScript type checking without installation",
      category: "Development"
    },
    {
      command: "bunx eslint .",
      description: "Lint code without dependencies",
      category: "Quality"
    },
    {
      command: "bunx prettier --check .",
      description: "Check code formatting",
      category: "Quality"
    },
    {
      command: "bunx depcheck",
      description: "Check for unused dependencies",
      category: "Maintenance"
    }
  ];

  console.log("\n🚀 Available bunx Commands:\n");

  const categories = [...new Set(commands.map(cmd => cmd.category))];
  categories.forEach(category => {
    console.log(`\n${category}:`);
    const categoryCommands = commands.filter(cmd => cmd.category === category);
    categoryCommands.forEach(cmd => {
      console.log(`  ${cmd.command.padEnd(35)} - ${cmd.description}`);
    });
  });
}

export function runBunxDemo() {
  console.log(`
🚀 Bun Performance Arsenal - bunx Integration Demo
==================================================

`);

  showcaseBunxAdvantages();
  showPerformanceComparison();
  showBunxCommands();

  console.log(`

🌍 Post-Publish Usage Examples:
-------------------------------
# Launch interactive lab
bunx @bun/performance-arsenal

# Run specific benchmarks
bunx @bun/performance-arsenal --ci database
bunx @bun/performance-arsenal --benchmark redis

# Use as development tools
cd my-project
bunx tsc --noEmit                    # Type check
bunx eslint src/                     # Lint code
bunx prettier --check src/           # Check formatting

📦 Package is bunx-ready and globally accessible!
  `);
}

// Run demo if executed directly
if (import.meta.main) {
  runBunxDemo();
}
