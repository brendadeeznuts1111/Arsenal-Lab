#!/usr/bin/env bun

import { serve } from "bun";

// Parse CLI arguments
const args = process.argv.slice(2);
const command = args[0];

console.log(`
🚀 Bun Performance Arsenal v1.3.0
================================

📊 Interactive performance lab for Bun v1.3 features:
• Database & Infrastructure Arsenal 🗄️
• Performance Benchmarks ⚡
• Redis Client (7.9× faster) 🔴
• WebSocket RFC 6455 🔄
• SQLite v1.3 Enhancements 💾
• S3 Client Improvements ☁️

🎯 Usage:
  bunx @bun/performance-arsenal           # Launch interactive lab
  bunx @bun/performance-arsenal --ci      # Run CI benchmarks
  bunx @bun/performance-arsenal --help    # Show this help

📚 Docs: https://bun.com/docs/performance-arsenal
`);

if (command === '--help' || command === '-h') {
  console.log(`
📋 Available Commands:

  --ci, --benchmark    Run automated performance benchmarks
  --help, -h          Show this help message
  --version, -v       Show version information

📊 Benchmark Categories:
  database           SQLite & database performance
  redis             Redis client benchmarks
  websocket         WebSocket performance
  s3                S3 client benchmarks
  all               Run all benchmarks

Examples:
  bunx @bun/performance-arsenal --ci database
  bunx @bun/performance-arsenal --benchmark redis
  `);
  process.exit(0);
}

if (command === '--version' || command === '-v') {
  console.log('Bun Performance Arsenal v1.3.0');
  process.exit(0);
}

// CI/Benchmark mode
if (command === '--ci' || command === '--benchmark') {
  const category = args[1] || 'all';
  console.log(`🏃 Running ${category} benchmarks...\n`);

  // Import and run the CI benchmarks
  import('./cli/arsenal-ci.ts').then(async (module) => {
    if (module.runArsenalCI) {
      await module.runArsenalCI({ verbose: true });
    } else {
      console.log('❌ Benchmark module not found. Make sure arsenal-ci.ts exists.');
    }
  }).catch((error) => {
    console.error('❌ Failed to load benchmarks:', error.message);
    process.exit(1);
  });
}

// Default: Launch interactive lab
console.log('Starting interactive development server...\n');

// Launch the HTTP server directly
serve({
  port: 3655,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve index.html for root path
    if (url.pathname === "/") {
      try {
        const html = await Bun.file("index.html").text();
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      } catch (error) {
        return new Response("Not Found", { status: 404 });
      }
    }

    // Serve TypeScript/JavaScript files
    if (url.pathname.startsWith("/src/") || url.pathname.startsWith("/components/")) {
      try {
        const filePath = "." + url.pathname;

        // Use Bun's build API to transpile TypeScript/TSX to JavaScript
        if (url.pathname.endsWith(".ts") || url.pathname.endsWith(".tsx")) {
          const result = await Bun.build({
            entrypoints: [filePath],
            target: "browser",
            minify: false,
            sourcemap: "inline",
          });

          if (result.outputs.length > 0) {
            const output = result.outputs[0];
            return new Response(await output?.text() || '', {
              headers: { "Content-Type": "application/javascript" },
            });
          }
        }

        // For other files (CSS, JS), serve directly
        const file = await Bun.file(filePath);
        const content = await file.text();

        // Determine content type based on file extension
        let contentType = "application/javascript";
        if (url.pathname.endsWith(".css")) {
          contentType = "text/css";
        }

        return new Response(content, {
          headers: { "Content-Type": contentType },
        });
      } catch (error) {
        console.error(`Error serving ${url.pathname}:`, error);
        return new Response("File Not Found", { status: 404 });
      }
    }

    // Serve static assets from public directory
    if (url.pathname.startsWith("/")) {
      try {
        const file = await Bun.file("public" + url.pathname);
        return new Response(file);
      } catch (error) {
        // Try root directory for other assets
        try {
          const file = await Bun.file("." + url.pathname);
          return new Response(file);
        } catch (error) {
          return new Response("Asset Not Found", { status: 404 });
        }
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log('🎯 Arsenal Lab ready!');
console.log(`🌐 Open http://localhost:3655 in your browser`);
console.log(`📊 Run: bun run arsenal:ci for automated testing`);
console.log(`📦 Run: bun publish when ready to release`);
