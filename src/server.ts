// src/server.ts - HTTP Server for Arsenal Lab
import { serve } from "bun";
import { getPatchAnalytics } from "./debug/patch-analytics.js";

const PORT = parseInt(Bun.env.PORT || "3655");

console.log(`🚀 Starting Arsenal Lab server on port ${PORT}...`);
console.log(`🌐 Open http://localhost:${PORT} in your browser`);

// Initialize secrets on server start
async function initializeSecrets() {
  try {
    // Try to get Google Analytics ID from secrets
    let gaId: string | null = null;
    try {
      gaId = await Bun.secrets.get({ service: 'arsenal-lab', name: 'google-analytics-id' });
    } catch {
      // Secrets API may not be available
    }

    // If not found in secrets, try environment variables as fallback
    if (!gaId) {
      gaId = Bun.env.GOOGLE_ANALYTICS_ID || null;
      if (gaId && gaId !== 'G-XXXXXXXXXX') {
        // Store in secrets for future use
        try {
          await Bun.secrets.set({ service: 'arsenal-lab', name: 'google-analytics-id', value: gaId });
          console.log('✅ Google Analytics ID stored in secure secrets');
        } catch {
          // Ignore if secrets API is not available
        }
      }
    }

    // Get GitHub credentials
    let githubUsername: string | null = null;
    let githubRepo: string | null = null;

    try {
      githubUsername = await Bun.secrets.get({ service: 'arsenal-lab', name: 'github-username' }) || Bun.env.GITHUB_USERNAME || null;
      githubRepo = await Bun.secrets.get({ service: 'arsenal-lab', name: 'github-repo' }) || Bun.env.GITHUB_REPO || null;
    } catch {
      githubUsername = Bun.env.GITHUB_USERNAME || null;
      githubRepo = Bun.env.GITHUB_REPO || null;
    }

    return { gaId, githubUsername, githubRepo };
  } catch (error: any) {
    console.warn('⚠️  Secrets API not available, falling back to environment variables:', error?.message || 'Unknown error');
    return {
      gaId: Bun.env.GOOGLE_ANALYTICS_ID || null,
      githubUsername: Bun.env.GITHUB_USERNAME || null,
      githubRepo: Bun.env.GITHUB_REPO || null
    };
  }
}

// Cache secrets for performance
let cachedSecrets: any = null;

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Initialize secrets on first request
    if (!cachedSecrets) {
      cachedSecrets = await initializeSecrets();
    }

    // Serve index.html for root path with dynamic secrets injection
    if (url.pathname === "/") {
      try {
        const html = await Bun.file("index.html").text();

        // Inject secrets into HTML
        const gaId = cachedSecrets.gaId || 'G-XXXXXXXXXX';
        const injectedHtml = html
          .replace(/id=G-XXXXXXXXXX/g, `id=${gaId}`)
          .replace(/'G-XXXXXXXXXX'/g, `'${gaId}'`)
          .replace(/brendadeeznuts1111/g, cachedSecrets.githubUsername || 'brendadeeznuts1111')
          .replace(/Arsenal-Lab/g, cachedSecrets.githubRepo || 'Arsenal-Lab');

        return new Response(injectedHtml, {
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

    // API endpoint for security audit
    if (url.pathname === "/api/security/audit" && req.method === "POST") {
      try {
        const body = await req.json() as { prodOnly?: boolean; auditLevel?: string };
        const { prodOnly, auditLevel } = body;

        // Build audit command
        const auditArgs = ['audit', '--json'];
        if (auditLevel && auditLevel !== 'low') {
          auditArgs.push(`--audit-level=${auditLevel}`);
        }
        if (prodOnly) {
          auditArgs.push('--prod');
        }

        // Run bun audit
        const proc = Bun.spawn(['bun', ...auditArgs], {
          stdout: 'pipe',
          stderr: 'pipe',
        });

        const output = await new Response(proc.stdout).text();
        const exitCode = await proc.exited;

        // Parse audit output
        let auditData;
        try {
          auditData = JSON.parse(output);
        } catch (parseError) {
          return new Response(JSON.stringify({
            error: 'Failed to parse audit output',
            details: output
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify(auditData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Audit-Exit-Code': exitCode.toString()
          }
        });
      } catch (error: any) {
        console.error('Security audit error:', error);
        return new Response(JSON.stringify({
          error: 'Security audit failed',
          message: error?.message || 'Unknown error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
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

    // Patch analytics endpoint
    if (url.pathname === "/__debug/patches") {
      try {
        const analytics = await getPatchAnalytics();
        return new Response(JSON.stringify(analytics, null, 2), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: "Failed to generate patch analytics",
          message: error.message
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🎯 Arsenal Lab is ready!`);
console.log(`📊 Run: bun run arsenal:ci for performance benchmarks`);
console.log(`📦 Run: bun publish when ready to release`);
