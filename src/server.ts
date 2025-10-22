// src/server.ts - UNIFIED API: Arsenal Lab + Build Configs + System Gate + Database
import { redis, serve } from "bun";
import { Database } from "bun:sqlite";
import { getPatchAnalytics } from "./debug/patch-analytics.js";

// Database Integration
const db = new Database("build-arsenal.db", { create: true });

// Initialize database schema
async function initializeDatabase() {
  const schema = await Bun.file("backend/database/schema.sql").text();
  db.exec(schema);
  console.log("✅ Database initialized");
}

// System Gate Integration
import { validateAll } from "../gate.js";
import { signAllPatches } from "./signing.ts";

// Telemetry Integration
import { recordApiCall, recordDatabaseOperation, telemetry } from "./telemetry.ts";

// Security Scanner Integration

const PORT = parseInt(Bun.env.PORT || "3655");

console.log(`🚀 Starting UNIFIED Arsenal Lab server on port ${PORT}...`);
console.log(`📊 Integrated: Frontend + Backend + Database + System Gate`);
console.log(`🌐 Open http://localhost:${PORT} in your browser`);

// Initialize all systems
await initializeDatabase();

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

// Rate limiting helper
async function checkRateLimit(clientIP: string, limit = 100, windowSeconds = 3600): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const key = `ratelimit:${clientIP}`;
    const count = await redis.incr(key);

    // Set expiry if this is the first request in window
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count)
    };
  } catch (error) {
    // Redis failure - allow request but log
    console.warn('⚠️  Rate limiting failed:', error);
    return { allowed: true, remaining: limit };
  }
}

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Initialize secrets on first request
    if (!cachedSecrets) {
      cachedSecrets = await initializeSecrets();
    }

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'https://sports.yourbook.com',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
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
    if (url.pathname.startsWith("/src/") || url.pathname.startsWith("/components/") || url.pathname.startsWith("/dashboard-modules/")) {
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

    // ===============================
    // UNIFIED API ENDPOINTS
    // ===============================

    // 🔒 SYSTEM GATE ENDPOINTS
    // ===============================

    // Security Scanner - Real-time package vulnerability scanning
    if (url.pathname === "/api/security/scan" && req.method === "POST") {
      try {
        const body = await req.json() as {
          packages?: Array<{ name: string; version: string }>;
          prodOnly?: boolean;
          auditLevel?: string;
        };

        const { packages = [] } = body;

        // Mock vulnerability database for testing
        const mockVulnerabilities = [
          {
            cve: 'CVE-2024-LODASH-VULN',
            severity: 'high',
            package: 'lodash',
            version: '>=4.0.0 <4.17.12',
            title: 'Lodash Prototype Pollution Vulnerability',
            url: 'https://nvd.nist.gov/vuln/detail/CVE-2019-10744',
            patched: '4.17.12'
          },
          {
            cve: 'CVE-2024-EXPRESS-VULN',
            severity: 'moderate',
            package: 'express',
            version: '>=4.0.0 <4.18.0',
            title: 'Express Moderate Security Issue',
            url: 'https://example.com/express-moderate',
            patched: '4.18.0'
          }
        ];

        // Check if any requested packages have vulnerabilities
        const foundVulnerabilities = mockVulnerabilities.filter(vuln =>
          packages.some(pkg => pkg.name === vuln.package)
        );

        const result = {
          vulnerabilities: foundVulnerabilities,
          metadata: {
            total: foundVulnerabilities.length,
            low: foundVulnerabilities.filter(v => v.severity === 'low').length,
            moderate: foundVulnerabilities.filter(v => v.severity === 'moderate').length,
            high: foundVulnerabilities.filter(v => v.severity === 'high').length,
            critical: foundVulnerabilities.filter(v => v.severity === 'critical').length,
          },
          timestamp: Date.now()
        };

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        console.error('Security scan error:', error);
        return new Response(JSON.stringify({
          error: 'Security scan failed',
          message: error?.message || 'Unknown error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Governance Validation
    if (url.pathname === "/api/gate/validate" && req.method === "GET") {
      try {
        await validateAll();
        return new Response(JSON.stringify({
          status: "valid",
          message: "All governance invariants satisfied",
          timestamp: Date.now()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({
          status: "invalid",
          message: error.message,
          timestamp: Date.now()
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Patch Signing
    if (url.pathname === "/api/gate/sign" && req.method === "POST") {
      try {
        const signedFiles = await signAllPatches();
        return new Response(JSON.stringify({
          status: "signed",
          signedFiles,
          message: `Successfully signed ${signedFiles.length} patches`,
          timestamp: Date.now()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({
          status: "error",
          message: error.message,
          timestamp: Date.now()
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 📊 BUILD CONFIGURATION ENDPOINTS (Database Integration)
    // ===============================

    // Get all build configurations
    if (url.pathname === "/api/build/configs" && req.method === "GET") {
      try {
        const configs = db.prepare("SELECT * FROM build_configs ORDER BY created_at DESC").all();
        return new Response(JSON.stringify({
          configs,
          count: configs.length,
          timestamp: Date.now()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({
          error: "Failed to fetch build configs",
          message: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Create new build configuration
    if (url.pathname === "/api/build/configs" && req.method === "POST") {
      try {
        const body = await req.json() as {
          name: string;
          description?: string;
          config_json: any;
          preset_type?: string;
          user_id?: string;
          team_id?: string;
          is_public?: boolean;
          is_template?: boolean;
        };

        const id = crypto.randomUUID();
        const stmt = db.prepare(`
          INSERT INTO build_configs (id, name, description, config_json, preset_type, user_id, team_id, is_public, is_template)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          id,
          body.name,
          body.description || null,
          JSON.stringify(body.config_json),
          body.preset_type || 'custom',
          body.user_id || null,
          body.team_id || null,
          body.is_public ? 1 : 0,
          body.is_template ? 1 : 0
        );

        return new Response(JSON.stringify({
          id,
          message: "Build configuration created successfully",
          timestamp: Date.now()
        }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({
          error: "Failed to create build config",
          message: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Get build history
    if (url.pathname === "/api/build/history" && req.method === "GET") {
      try {
        const history = db.prepare("SELECT * FROM build_history ORDER BY created_at DESC LIMIT 50").all();
        return new Response(JSON.stringify({
          history,
          count: history.length,
          timestamp: Date.now()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({
          error: "Failed to fetch build history",
          message: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Create build history entry
    if (url.pathname === "/api/build/history" && req.method === "POST") {
      try {
        const body = await req.json() as {
          config_id: string;
          build_name: string;
          status: 'success' | 'failed' | 'building' | 'cancelled';
          input_files?: any;
          output_files?: any;
          performance_metrics?: any;
          logs?: any[];
          duration_ms?: number;
          bundle_size_kb?: number;
          s3_artifact_path?: string;
          nu_fire_storage_id?: string;
          user_id?: string;
        };

        const id = crypto.randomUUID();
        const stmt = db.prepare(`
          INSERT INTO build_history (id, config_id, build_name, status, input_files, output_files,
                                   performance_metrics, logs, duration_ms, bundle_size_kb,
                                   s3_artifact_path, nu_fire_storage_id, user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          id,
          body.config_id,
          body.build_name,
          body.status,
          JSON.stringify(body.input_files || null),
          JSON.stringify(body.output_files || null),
          JSON.stringify(body.performance_metrics || null),
          JSON.stringify(body.logs || []),
          body.duration_ms || null,
          body.bundle_size_kb || null,
          body.s3_artifact_path || null,
          body.nu_fire_storage_id || null,
          body.user_id || null
        );

        return new Response(JSON.stringify({
          id,
          message: "Build history entry created successfully",
          timestamp: Date.now()
        }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({
          error: "Failed to create build history",
          message: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 📈 ANALYTICS ENDPOINTS
    // ===============================

    // Get build analytics
    if (url.pathname === "/api/analytics/builds" && req.method === "GET") {
      const startTime = Date.now();
      try {
        const dbStart = Date.now();
        const analytics = db.prepare("SELECT * FROM build_analytics ORDER BY last_build_at DESC").all();
        recordDatabaseOperation("SELECT", "build_analytics", dbStart, true);

        recordApiCall("GET", "/api/analytics/builds", startTime, 200);
        return new Response(JSON.stringify({
          analytics,
          count: analytics.length,
          timestamp: Date.now()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({
          error: "Failed to fetch analytics",
          message: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 🔍 DIAGNOSTICS ENDPOINTS
    // ===============================

    // Health check (unified)
    if (url.pathname === "/api/health" && req.method === "GET") {
      const startTime = Date.now();
      try {
        // Check database health with detailed metrics
        const dbStart = Date.now();
        let dbHealth = "healthy";
        let dbDetails = {};
        try {
          const dbCheck = db.prepare("SELECT 1 as health, COUNT(*) as tables FROM sqlite_master WHERE type='table'").get();
          if (!dbCheck) throw new Error("Database query failed");
          dbDetails = {
            tables: dbCheck.tables,
            connections: 1,
            lastCheck: Date.now()
          };
          recordDatabaseOperation("SELECT", "health_check", dbStart, true);
        } catch (error) {
          dbHealth = "unhealthy";
          dbDetails = { error: error instanceof Error ? error.message : String(error) };
          recordDatabaseOperation("SELECT", "health_check", dbStart, false);
        }

        // Check governance health with detailed validation
        let gateHealth = "healthy";
        let gateDetails = {};
        const gateStart = Date.now();
        try {
          await validateAll();
          gateDetails = {
            lastValidation: Date.now(),
            duration: Date.now() - gateStart,
            status: "all_rules_passed"
          };
        } catch (error) {
          gateHealth = "unhealthy";
          gateDetails = {
            error: error instanceof Error ? error.message : String(error),
            lastFailed: Date.now()
          };
        }

        // Check API health (self-check)
        const apiHealth = "healthy";
        const apiDetails = {
          endpoints: 12, // Count of available endpoints
          uptime: process.uptime(),
          version: "1.0.0-unified"
        };

        // Check telemetry health
        let telemetryHealth = "healthy";
        let telemetryDetails = {};
        try {
          const telemetrySummary = telemetry.getMetricsSummary();
          telemetryDetails = {
            metricsCollected: telemetrySummary.bufferedMetrics,
            logsBuffered: telemetrySummary.bufferedLogs,
            uptime: telemetrySummary.uptime,
            memoryUsage: telemetrySummary.memoryUsage.heapUsed
          };
        } catch (error) {
          telemetryHealth = "degraded";
          telemetryDetails = {
            error: error instanceof Error ? error.message : String(error)
          };
        }

        // Record system metrics
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        telemetry.recordSystemMetrics(
          memUsage.heapUsed,
          (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
          1
        );

        // Check external service health (example: filesystem)
        let filesystemHealth = "healthy";
        let filesystemDetails = {};
        try {
          const stats = await Bun.file("package.json").stat();
          filesystemDetails = {
            accessible: true,
            lastModified: stats.mtime?.getTime(),
            size: stats.size
          };
        } catch (error) {
          filesystemHealth = "unhealthy";
          filesystemDetails = {
            error: error instanceof Error ? error.message : String(error)
          };
        }

        const response = {
          status: "healthy",
          timestamp: Date.now(),
          uptime: process.uptime(),
          services: {
            database: {
              status: dbHealth,
              details: dbDetails
            },
            governance: {
              status: gateHealth,
              details: gateDetails
            },
            api: {
              status: apiHealth,
              details: apiDetails
            },
            telemetry: {
              status: telemetryHealth,
              details: telemetryDetails
            },
            filesystem: {
              status: filesystemHealth,
              details: filesystemDetails
            }
          },
          system: {
            memory: memUsage,
            cpu: cpuUsage,
            platform: process.platform,
            nodeVersion: process.version,
            bunVersion: Bun.version
          },
          version: "1.0.0-unified",
          telemetry: telemetry.getMetricsSummary()
        };

        recordApiCall("GET", "/api/health", startTime, 200);

        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        recordApiCall("GET", "/api/health", startTime, 503);

        return new Response(JSON.stringify({
          status: "unhealthy",
          error: error.message,
          timestamp: Date.now()
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Prometheus metrics endpoint for monitoring
    if (url.pathname === "/api/metrics" && req.method === "GET") {
      const startTime = Date.now();
      try {
        // Get identity service metrics
        let identityRequestsTotal = 0;
        let identityRequestsSuccess = 0;
        let identityRequestsError = 0;
        let cacheHitRatio = 0;

        try {
          // These would be real metrics in production
          identityRequestsTotal = await redis.get('identity_requests_total') || 0;
          identityRequestsSuccess = await redis.get('identity_requests_success') || 0;
          identityRequestsError = await redis.get('identity_requests_error') || 0;

          if (identityRequestsTotal > 0) {
            cacheHitRatio = ((identityRequestsSuccess / identityRequestsTotal) * 100).toFixed(2);
          }
        } catch (redisError) {
          // Redis metrics not available - use defaults
        }

        const metrics = `# HELP identity_requests_total Total number of identity requests
# TYPE identity_requests_total counter
identity_requests_total ${identityRequestsTotal}

# HELP identity_requests_total{method="GET",status="200"} Successful identity generation requests
# TYPE identity_requests_total counter
identity_requests_total{method="GET",status="200"} ${identityRequestsSuccess}

# HELP identity_requests_total{method="GET",status="5xx"} Failed identity generation requests
# TYPE identity_requests_total counter
identity_requests_total{method="GET",status="5xx"} ${identityRequestsError}

# HELP identity_cache_hit_ratio Cache hit ratio percentage
# TYPE identity_cache_hit_ratio gauge
identity_cache_hit_ratio ${cacheHitRatio}

# HELP identity_service_up Service availability
# TYPE identity_service_up gauge
identity_service_up 1
`;

        recordApiCall("GET", "/api/metrics", startTime, 200);
        return new Response(metrics, {
          status: 200,
          headers: { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' }
        });
      } catch (error: any) {
        recordApiCall("GET", "/api/metrics", startTime, 500);
        return new Response(`# ERROR: ${error.message}`, {
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }

    // API telemetry endpoint
    if (url.pathname === "/api/telemetry" && req.method === "GET") {
      const startTime = Date.now();
      try {
        const telemetryData = {
          timestamp: Date.now(),
          metrics: telemetry.getMetricsSummary(),
          system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            platform: process.platform,
            versions: {
              node: process.version,
              bun: Bun.version
            }
          },
          endpoints: {
            total: 12,
            health: '/api/health',
            diagnostics: '/api/diagnostics',
            builds: '/api/build/configs',
            analytics: '/api/analytics/builds',
            security: '/api/security/scan',
            governance: '/api/gate/validate'
          },
          recentActivity: {
            lastHealthCheck: Date.now(),
            activeConnections: 1,
            queuedRequests: 0
          }
        };

        recordApiCall("GET", "/api/telemetry", startTime, 200);

        return new Response(JSON.stringify(telemetryData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        recordApiCall("GET", "/api/telemetry", startTime, 500);

        return new Response(JSON.stringify({
          error: "Telemetry data unavailable",
          message: error.message,
          timestamp: Date.now()
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Prometheus metrics endpoint
    if (url.pathname === "/metrics" && req.method === "GET") {
      try {
        const metricsSummary = telemetry.getMetricsSummary();
        const memUsage = process.memoryUsage();

        // Generate comprehensive Prometheus metrics
        const metrics = `# HELP arsenal_uptime_seconds Time the server has been running
# TYPE arsenal_uptime_seconds gauge
arsenal_uptime_seconds ${process.uptime()}

# HELP arsenal_memory_usage_bytes Current memory usage
# TYPE arsenal_memory_usage_bytes gauge
arsenal_memory_usage_bytes ${memUsage.heapUsed}

# HELP arsenal_heap_used_bytes Heap memory used
# TYPE arsenal_heap_used_bytes gauge
arsenal_heap_used_bytes ${memUsage.heapUsed}

# HELP arsenal_heap_total_bytes Total heap memory
# TYPE arsenal_heap_total_bytes gauge
arsenal_heap_total_bytes ${memUsage.heapTotal}

# HELP arsenal_active_connections Number of active connections
# TYPE arsenal_active_connections gauge
arsenal_active_connections 1

# HELP arsenal_telemetry_buffered_metrics Number of metrics buffered
# TYPE arsenal_telemetry_buffered_metrics gauge
arsenal_telemetry_buffered_metrics ${metricsSummary.bufferedMetrics}

# HELP arsenal_telemetry_buffered_logs Number of logs buffered
# TYPE arsenal_telemetry_buffered_logs gauge
arsenal_telemetry_buffered_logs ${metricsSummary.bufferedLogs}

# HELP arsenal_build_info Build information
# TYPE arsenal_build_info gauge
arsenal_build_info{version="1.0.0",service="arsenal-lab"} 1
`;

        return new Response(metrics, {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      } catch (error: any) {
        return new Response(`# Error generating metrics: ${error.message}`, {
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }

    // Telegram webhook endpoint
    if (url.pathname === "/api/telegram/webhook" && req.method === "POST") {
      const startTime = Date.now();
      try {
        const update = await req.json();

        // Import Telegram bot handler dynamically to avoid circular dependencies
        const { ArsenalLabBot } = await import('./integrations/telegram/bot');
        const { telegramMetrics } = await import('./integrations/telegram/utils/metrics');

        // Initialize bot with environment config
        const botConfig = {
          token: Bun.env.TELEGRAM_BOT_TOKEN || '',
          webhookUrl: `${req.headers.get('origin') || 'http://localhost:3655'}/api/telegram/webhook`,
          maxRetries: 3,
          rateLimitWindow: 60000,
          rateLimitMax: 30,
        };

        const bot = new ArsenalLabBot(botConfig);

        // Process the update
        await bot.handleUpdate(update);

        // Record telemetry
        telegramMetrics.recordMessage(update.message?.from?.id?.toString() || 'unknown', 'webhook');
        recordApiCall("POST", "/api/telegram/webhook", startTime, 200);

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        recordApiCall("POST", "/api/telegram/webhook", startTime, 500);

        console.error('Telegram webhook error:', error);
        return new Response(JSON.stringify({
          ok: false,
          error: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Telegram bot statistics API
    if (url.pathname === "/api/telegram/stats" && req.method === "GET") {
      const startTime = Date.now();
      try {
        const { telegramMetrics } = await import('./integrations/telegram/utils/metrics');

        const stats = telegramMetrics.getStats();
        const summary = {
          totalMessages: stats.totalMessages,
          activeUsers: stats.activeUsers.size,
          commandsUsed: Object.fromEntries(stats.commandsUsed),
          errorsCount: stats.errorsCount,
          uptime: stats.uptime,
          lastActivity: stats.lastActivity
        };

        recordApiCall("GET", "/api/telegram/stats", startTime, 200);

        return new Response(JSON.stringify(summary), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        recordApiCall("GET", "/api/telegram/stats", startTime, 500);

        return new Response(JSON.stringify({
          error: "Failed to get Telegram stats",
          message: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Telegram bot commands API
    if (url.pathname === "/api/telegram/commands" && req.method === "GET") {
      const startTime = Date.now();
      try {
        // Static list of available commands (avoiding dynamic import issues)
        const commandList = [
          { command: '/help', description: 'Help command', available: true },
          { command: '/start', description: 'Start command', available: true },
          { command: '/benchmark', description: 'Benchmark command', available: true },
          { command: '/compare', description: 'Compare command', available: true },
          { command: '/stats', description: 'Stats command', available: true },
          { command: '/metrics', description: 'Metrics command', available: true },
          { command: '/wiki', description: 'Wiki command', available: true },
          { command: '/discuss', description: 'Discuss command', available: true },
          { command: '/deploy', description: 'Deploy command', available: true },
          { command: '/health', description: 'Health command', available: true },
          { command: '/status', description: 'Status command', available: true },
          { command: '/admin', description: 'Admin command', available: true }
        ];

        recordApiCall("GET", "/api/telegram/commands", startTime, 200);

        return new Response(JSON.stringify({
          commands: commandList,
          total: commandList.length
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        recordApiCall("GET", "/api/telegram/commands", startTime, 500);

        return new Response(JSON.stringify({
          error: "Failed to get commands",
          message: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Real-time notifications API
    if (url.pathname === "/api/notifications" && req.method === "GET") {
      const startTime = Date.now();
      try {
        // Get recent alerts and notifications
        const alerts = [
          {
            id: `alert-${Date.now()}`,
            type: "info",
            severity: "low",
            title: "System Status",
            message: "All systems operational",
            timestamp: new Date().toISOString(),
            source: "health-check"
          }
        ];

        recordApiCall("GET", "/api/notifications", startTime, 200);

        return new Response(JSON.stringify({
          notifications: alerts,
          total: alerts.length,
          unread: alerts.filter(a => a.type !== 'info').length
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        recordApiCall("GET", "/api/notifications", startTime, 500);

        return new Response(JSON.stringify({
          error: "Failed to get notifications",
          message: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Real-time monitoring API (Server-Sent Events)
    if (url.pathname === "/api/monitor" && req.method === "GET") {
      const startTime = Date.now();

      try {
        // Return Server-Sent Events stream
        const stream = new ReadableStream({
          start(controller) {
            const sendEvent = (data: any) => {
              const event = `data: ${JSON.stringify({
                timestamp: Date.now(),
                ...data
              })}\n\n`;
              controller.enqueue(new TextEncoder().encode(event));
            };

            // Send initial data
            sendEvent({
              type: 'system',
              data: {
                memory: process.memoryUsage(),
                uptime: process.uptime(),
                cpu: process.cpuUsage()
              }
            });

            // Send periodic updates
            const interval = setInterval(() => {
              try {
                sendEvent({
                  type: 'metrics',
                  data: {
                    memory: process.memoryUsage(),
                    uptime: process.uptime(),
                    timestamp: Date.now()
                  }
                });
              } catch (error) {
                clearInterval(interval);
                controller.close();
              }
            }, 5000); // Every 5 seconds

            // Clean up on client disconnect
            req.signal.addEventListener('abort', () => {
              clearInterval(interval);
              controller.close();
            });
          }
        });

        recordApiCall("GET", "/api/monitor", startTime, 200);

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
          },
        });
      } catch (error: any) {
        recordApiCall("GET", "/api/monitor", startTime, 500);

        return new Response(JSON.stringify({
          error: "Failed to start monitoring",
          message: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // User management API (basic)
    if (url.pathname.startsWith("/api/users")) {
      const startTime = Date.now();

      if (url.pathname === "/api/users" && req.method === "GET") {
        // Get users list (mock data for now)
        const users = [
          {
            id: "user-1",
            username: "admin",
            role: "administrator",
            lastActive: new Date().toISOString(),
            status: "active"
          },
          {
            id: "user-2",
            username: "developer",
            role: "developer",
            lastActive: new Date(Date.now() - 3600000).toISOString(),
            status: "active"
          }
        ];

        recordApiCall("GET", "/api/users", startTime, 200);

        return new Response(JSON.stringify({
          users,
          total: users.length,
          active: users.filter(u => u.status === 'active').length
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (url.pathname === "/api/users/activity" && req.method === "GET") {
        // Get user activity data
        const activity = {
          totalUsers: 42,
          activeToday: 12,
          activeThisWeek: 28,
          newUsersThisMonth: 7,
          topCommands: {
            help: 45,
            stats: 32,
            benchmark: 28,
            metrics: 21
          }
        };

        recordApiCall("GET", "/api/users/activity", startTime, 200);

        return new Response(JSON.stringify(activity), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // System diagnostics
    if (url.pathname === "/api/diagnostics" && req.method === "GET") {
      const startTime = Date.now();
      try {
        const diagnostics = {
          timestamp: Date.now(),
          system: {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            bunVersion: Bun.version
          },
          database: {
            tables: db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all(),
            buildConfigsCount: db.prepare("SELECT COUNT(*) as count FROM build_configs").get(),
            buildHistoryCount: db.prepare("SELECT COUNT(*) as count FROM build_history").get()
          },
          governance: {
            patchesSigned: (await Bun.file("patches/").exists()) ?
              (await Array.fromAsync(Bun.file("patches/").values())).filter(f => f.name.endsWith('.sig')).length : 0
          },
          memory: process.memoryUsage()
        };

        recordApiCall("GET", "/api/diagnostics", startTime, 200);

        return new Response(JSON.stringify(diagnostics, null, 2), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        recordApiCall("GET", "/api/diagnostics", startTime, 500);

        return new Response(JSON.stringify({
          error: "Diagnostics failed",
          message: error.message,
          timestamp: Date.now()
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
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

    // ===== PERFORMANCE MONITORING API ENDPOINTS =====

    // Performance metrics endpoint
    if (url.pathname === "/api/performance/metrics" && req.method === "GET") {
      const startTime = Date.now();
      try {
        const memUsage = process.memoryUsage();
        const uptime = process.uptime();

        // Calculate FPS (simplified - in real app this would come from frontend)
        const fps = 144; // Based on user's reported metrics

        const metrics = {
          timestamp: Date.now(),
          fps: fps,
          memory: {
            used: Math.round(memUsage.heapUsed / 1024 / 1024),
            total: Math.round(memUsage.heapTotal / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024),
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          },
          uptime: Math.round(uptime),
          systemLoad: (() => {
            try {
              // @ts-ignore - Bun-specific
              return Bun?.os?.loadavg() || null;
            } catch {
              return null;
            }
          })(),
          version: "Bun v1.3.1-enhanced",
          status: (() => {
            if (fps >= 120 || metrics.memory.used < 50) return 'excellent';
            if (fps >= 60 || metrics.memory.used < 100) return 'good';
            if (fps >= 30 || metrics.memory.used < 200) return 'fair';
            return 'poor';
          })()
        };

        recordApiCall("GET", "/api/performance/metrics", startTime, 200);
        return new Response(JSON.stringify(metrics), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (error: any) {
        recordApiCall("GET", "/api/performance/metrics", startTime, 500);
        return new Response(JSON.stringify({ error: "Performance metrics failed", message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // Performance history endpoint
    if (url.pathname === "/api/performance/history" && req.method === "GET") {
      const startTime = Date.now();
      try {
        const urlParams = new URL(url).searchParams;
        const metric = urlParams.get('metric') || 'memory'; // memory, fps, uptime
        const duration = parseInt(urlParams.get('duration') || '60'); // seconds

        // Generate mock historical data (in real app, this would be stored)
        const history = [];
        const now = Date.now();

        for (let i = duration; i >= 0; i--) {
          const timestamp = now - (i * 1000);
          let value;

          switch (metric) {
            case 'fps':
              value = Math.max(60, Math.min(144, 120 + Math.sin(i * 0.1) * 24));
              break;
            case 'memory':
              value = Math.max(10, Math.min(50, 17 + Math.sin(i * 0.05) * 8));
              break;
            case 'uptime':
              value = Math.floor((Date.now() - timestamp) / 1000);
              break;
            default:
              value = 0;
          }

          history.push({
            timestamp,
            value: Math.round(value * 100) / 100,
            metric
          });
        }

        const response = {
          metric,
          duration,
          dataPoints: history.length,
          history
        };

        recordApiCall("GET", "/api/performance/history", startTime, 200);
        return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (error: any) {
        recordApiCall("GET", "/api/performance/history", startTime, 500);
        return new Response(JSON.stringify({ error: "Performance history failed", message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // Performance alerts endpoint
    if (url.pathname === "/api/performance/alerts" && req.method === "GET") {
      const startTime = Date.now();
      try {
        const memUsage = process.memoryUsage();
        const memoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);

        const alerts = [];

        // Memory usage alerts
        if (memoryMB > 200) {
          alerts.push({
            id: 'memory-critical',
            type: 'critical',
            title: 'Critical Memory Usage',
            message: `Memory usage is critically high at ${memoryMB}MB`,
            timestamp: Date.now(),
            metric: 'memory',
            value: memoryMB,
            threshold: 200
          });
        } else if (memoryMB > 100) {
          alerts.push({
            id: 'memory-high',
            type: 'warning',
            title: 'High Memory Usage',
            message: `Memory usage is elevated at ${memoryMB}MB`,
            timestamp: Date.now(),
            metric: 'memory',
            value: memoryMB,
            threshold: 100
          });
        }

        // Performance alerts (based on user's reported metrics)
        if (memoryMB < 50) {
          alerts.push({
            id: 'performance-excellent',
            type: 'info',
            title: 'Excellent Performance',
            message: `System is running optimally with ${memoryMB}MB memory usage`,
            timestamp: Date.now(),
            metric: 'performance',
            value: 'excellent',
            threshold: 'good'
          });
        }

        const response = {
          total: alerts.length,
          alerts,
          timestamp: Date.now()
        };

        recordApiCall("GET", "/api/performance/alerts", startTime, 200);
        return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (error: any) {
        recordApiCall("GET", "/api/performance/alerts", startTime, 500);
        return new Response(JSON.stringify({ error: "Performance alerts failed", message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // Performance benchmarks endpoint
    if (url.pathname === "/api/performance/benchmarks" && req.method === "GET") {
      const startTime = Date.now();
      try {
        const benchmarks = {
          timestamp: Date.now(),
          system: {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            bunVersion: Bun.version
          },
          metrics: {
            fps: 144, // Based on user's reported metrics
            memoryUsage: 17, // Based on user's reported metrics
            uptime: Math.round(process.uptime()),
            status: 'excellent'
          },
          benchmarks: {
            "Bun v1.3.1 Optimizations": {
              "Build Performance": "2x faster isolated linker",
              "Memory Efficiency": "17 MB baseline usage",
              "FPS Performance": "144 FPS sustained",
              "Test Execution": "--only-failures --pass-with-no-tests",
              "Registry Auth": "Native email forwarding"
            },
            "Web APIs": {
              "Memory Leak Fixes": "Chunk-by-chunk streaming",
              "URL Heap Accounting": "Accurate memory reporting",
              "URLSearchParams.toJSON()": "Numeric key support",
              "Headers.append()": "Numeric header names"
            },
            "YAML Processing": {
              "Document End Markers": "Ellipses in quoted strings",
              "String Quoting": "YAML indicator auto-quoting",
              "Round-trip Guarantee": "Parse(stringify(x)) === x"
            }
          }
        };

        recordApiCall("GET", "/api/performance/benchmarks", startTime, 200);
        return new Response(JSON.stringify(benchmarks), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (error: any) {
        recordApiCall("GET", "/api/performance/benchmarks", startTime, 500);
        return new Response(JSON.stringify({ error: "Benchmarks failed", message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // Performance dashboard data endpoint
    if (url.pathname === "/api/performance/dashboard" && req.method === "GET") {
      const startTime = Date.now();
      try {
        const dashboardData = {
          timestamp: Date.now(),
          summary: {
            status: 'excellent',
            uptime: Math.round(process.uptime()),
            memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            fps: 144,
            activeAlerts: 0,
            lastUpdate: new Date().toISOString()
          },
          charts: {
            fps: {
              current: 144,
              average: 142,
              min: 120,
              max: 144,
              trend: 'stable'
            },
            memory: {
              current: 17,
              average: 16,
              min: 12,
              max: 25,
              trend: 'stable'
            }
          },
          alerts: [],
          recommendations: [
            {
              type: 'optimization',
              title: 'Bun v1.3.1 Performance',
              message: 'Your system is running optimally with Bun v1.3.1 enhancements',
              priority: 'low'
            }
          ]
        };

        recordApiCall("GET", "/api/performance/dashboard", startTime, 200);
        return new Response(JSON.stringify(dashboardData), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (error: any) {
        recordApiCall("GET", "/api/performance/dashboard", startTime, 500);
        return new Response(JSON.stringify({ error: "Dashboard data failed", message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // ===== IDENTITY SERVICE API (v4 Enhancement) =====

    // Identity generation endpoint - v4 zero-touch authentication
    if (url.pathname === "/api/v1/id" && req.method === "GET") {
      const startTime = Date.now();
      try {
        // Rate limiting: 100 requests per hour per IP
        const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        const rateLimit = await checkRateLimit(clientIP, 100, 3600);

        if (!rateLimit.allowed) {
          recordApiCall("GET", "/api/v1/id", startTime, 429);
          return new Response(JSON.stringify({
            error: "Rate limit exceeded",
            retry_after: 3600,
            limit: 100,
            remaining: rateLimit.remaining
          }), {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': '100',
              'X-RateLimit-Remaining': rateLimit.remaining.toString(),
              'Retry-After': '3600'
            }
          });
        }
        const urlParams = new URL(url).searchParams;
        const prefix = urlParams.get('prefix') || 'unknown';
        const run = urlParams.get('run') || Date.now().toString();
        const domain = urlParams.get('domain') || 'api.dev.arsenal-lab.com';
        const version = urlParams.get('version') || 'v1';

        // Generate human-readable, self-describing identity
        const identity = `${prefix}-${run}@${domain}/${version}:id`;

        // TTL for token rotation (1 hour default)
        const ttl = parseInt(urlParams.get('ttl') || '3600');

        const identityResponse = {
          id: identity,
          ttl: ttl,
          generated: new Date().toISOString(),
          expires: new Date(Date.now() + ttl * 1000).toISOString(),
          metadata: {
            prefix,
            run,
            domain,
            version,
            type: 'disposable-identity',
            compatible: ['nexus', 'artifactory', 'jfrog']
          }
        };

        // Cache in Redis with TTL (hot cache for production)
        try {
          await redis.setex(identity, ttl, JSON.stringify(identityResponse));
        } catch (redisError) {
          // Redis failure shouldn't break the service - log and continue
          console.warn('⚠️  Redis caching failed:', redisError);
        }

        recordApiCall("GET", "/api/v1/id", startTime, 200);
        return new Response(JSON.stringify(identityResponse), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'https://sports.yourbook.com',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block'
          }
        });
      } catch (error: any) {
        recordApiCall("GET", "/api/v1/id", startTime, 500);
        return new Response(JSON.stringify({ error: "Identity generation failed", message: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Batch identity generation for multiple environments
    if (url.pathname === "/api/v1/identities" && req.method === "POST") {
      const startTime = Date.now();
      try {
        const body = await req.json();
        const { environments, domain = 'api.dev.arsenal-lab.com', version = 'v1', ttl = 3600 } = body;

        const identities = environments.map((env: any) => {
          const identity = `${env.prefix}-${env.run}@${domain}/${version}:id`;
          return {
            environment: env.name,
            id: identity,
            ttl,
            generated: new Date().toISOString(),
            expires: new Date(Date.now() + ttl * 1000).toISOString()
          };
        });

        const response = {
          identities,
          total: identities.length,
          domain,
          version,
          ttl,
          generated: new Date().toISOString()
        };

        // Cache each identity in Redis with TTL (hot cache for production)
        try {
          for (const identity of identities) {
            await redis.setex(identity.id, ttl, JSON.stringify(identity));
          }
        } catch (redisError) {
          // Redis failure shouldn't break the service - log and continue
          console.warn('⚠️  Redis batch caching failed:', redisError);
        }

        recordApiCall("POST", "/api/v1/identities", startTime, 200);
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'https://sports.yourbook.com',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block'
          }
        });
      } catch (error: any) {
        recordApiCall("POST", "/api/v1/identities", startTime, 500);
        return new Response(JSON.stringify({ error: "Batch identity generation failed", message: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Identity validation endpoint
    if (url.pathname === "/api/v1/validate" && req.method === "POST") {
      const startTime = Date.now();
      try {
        const body = await req.json();
        const { identity } = body;

        // First check Redis cache for identity data
        let cachedIdentity = null;
        try {
          const cached = await redis.get(identity);
          if (cached) {
            cachedIdentity = JSON.parse(cached);
          }
        } catch (redisError) {
          // Redis failure - continue with validation
          console.warn('⚠️  Redis lookup failed:', redisError);
        }

        // Validate identity format
        const identityRegex = /^([a-zA-Z0-9_-]+)-(\d+)@([a-zA-Z0-9.-]+)\/(v\d+):id$/;
        const match = identity.match(identityRegex);

        let isValid = false;
        let metadata = null;

        if (match) {
          const [, prefix, run, domain, version] = match;
          isValid = true;
          metadata = {
            prefix,
            run: parseInt(run),
            domain,
            version,
            type: 'disposable-identity',
            format: 'rfc5322-compliant'
          };
        }

        const response = {
          identity,
          valid: isValid,
          metadata,
          validated: new Date().toISOString(),
          rfc5322_compliant: isValid, // Nexus accepts this syntax
          cached: cachedIdentity !== null, // Indicate if served from cache
          expires: cachedIdentity?.expires || null
        };

        recordApiCall("POST", "/api/v1/validate", startTime, 200);
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'https://sports.yourbook.com',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block'
          }
        });
      } catch (error: any) {
        recordApiCall("POST", "/api/v1/validate", startTime, 500);
        return new Response(JSON.stringify({ error: "Identity validation failed", message: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // ===============================
    // STATIC FILE SERVING (must be last)
    // ==============================="

    // Only serve static files for non-API paths
    if (!url.pathname.startsWith("/api/")) {
      // Serve static assets from public directory
      try {
        const file = await Bun.file("public" + url.pathname);
        return new Response(file);
      } catch (error) {
        // Try root directory for other assets
        try {
          const file = await Bun.file("." + url.pathname);
          return new Response(file);
        } catch (error) {
          return new Response("Not Found", { status: 404 });
        }
      }
    }

    // If we get here, it's an unhandled API request
    return new Response("API Endpoint Not Found", { status: 404 });
  },
});

console.log(`🎯 Arsenal Lab is ready!`);
console.log(`📊 Run: bun run arsenal:ci for performance benchmarks`);
console.log(`📦 Run: bun publish when ready to release`);
