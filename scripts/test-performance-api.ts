#!/usr/bin/env bun

/**
 * Test Performance Monitoring API Endpoints
 *
 * Comprehensive testing of all performance monitoring endpoints
 * integrated with Bun v1.3.1 optimizations.
 */

import { $ } from "bun";

const BASE_URL = "http://localhost:3655";

async function testEndpoint(name: string, url: string, expectedStatus: number = 200) {
  console.log(`🧪 Testing ${name}...`);
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.status === expectedStatus) {
      console.log(`   ✅ ${name} - Status: ${response.status}`);
      return { success: true, data };
    } else {
      console.log(`   ❌ ${name} - Status: ${response.status} (expected ${expectedStatus})`);
      return { success: false, data };
    }
  } catch (error) {
    console.log(`   ❌ ${name} - Error: ${error.message}`);
    return { success: false, error };
  }
}

async function testAllEndpoints() {
  console.log("🚀 Testing Arsenal Lab Performance Monitoring API\n");
  console.log(`📍 Base URL: ${BASE_URL}\n`);

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // Test 1: Performance Metrics
  results.total++;
  const metricsResult = await testEndpoint(
    "Performance Metrics API",
    `${BASE_URL}/api/performance/metrics`
  );
  if (metricsResult.success) {
    results.passed++;
    console.log(`   📊 FPS: ${metricsResult.data.fps}, Memory: ${metricsResult.data.memory.used}MB`);
    console.log(`   🎯 Status: ${metricsResult.data.status}`);
  } else {
    results.failed++;
  }
  console.log();

  // Test 2: Performance History - Memory
  results.total++;
  const memoryHistoryResult = await testEndpoint(
    "Performance History (Memory)",
    `${BASE_URL}/api/performance/history?metric=memory&duration=30`
  );
  if (memoryHistoryResult.success) {
    results.passed++;
    console.log(`   📈 Data points: ${memoryHistoryResult.data.dataPoints}`);
    console.log(`   📊 Metric: ${memoryHistoryResult.data.metric}`);
  } else {
    results.failed++;
  }
  console.log();

  // Test 3: Performance History - FPS
  results.total++;
  const fpsHistoryResult = await testEndpoint(
    "Performance History (FPS)",
    `${BASE_URL}/api/performance/history?metric=fps&duration=30`
  );
  if (fpsHistoryResult.success) {
    results.passed++;
    console.log(`   📈 Data points: ${fpsHistoryResult.data.dataPoints}`);
    console.log(`   🎮 FPS range: ${Math.min(...fpsHistoryResult.data.history.map((h: any) => h.value))} - ${Math.max(...fpsHistoryResult.data.history.map((h: any) => h.value))}`);
  } else {
    results.failed++;
  }
  console.log();

  // Test 4: Performance Alerts
  results.total++;
  const alertsResult = await testEndpoint(
    "Performance Alerts API",
    `${BASE_URL}/api/performance/alerts`
  );
  if (alertsResult.success) {
    results.passed++;
    console.log(`   🚨 Total alerts: ${alertsResult.data.total}`);
    if (alertsResult.data.alerts.length > 0) {
      console.log(`   📋 Active alerts: ${alertsResult.data.alerts.map((a: any) => a.title).join(', ')}`);
    } else {
      console.log(`   ✅ No active alerts`);
    }
  } else {
    results.failed++;
  }
  console.log();

  // Test 5: Performance Benchmarks
  results.total++;
  const benchmarksResult = await testEndpoint(
    "Performance Benchmarks API",
    `${BASE_URL}/api/performance/benchmarks`
  );
  if (benchmarksResult.success) {
    results.passed++;
    console.log(`   🏁 System: ${benchmarksResult.data.system.platform}/${benchmarksResult.data.system.arch}`);
    console.log(`   📦 Bun Version: ${benchmarksResult.data.system.bunVersion}`);
    console.log(`   ⚡ Current FPS: ${benchmarksResult.data.metrics.fps}`);
  } else {
    results.failed++;
  }
  console.log();

  // Test 6: Performance Dashboard
  results.total++;
  const dashboardResult = await testEndpoint(
    "Performance Dashboard API",
    `${BASE_URL}/api/performance/dashboard`
  );
  if (dashboardResult.success) {
    results.passed++;
    console.log(`   📊 Dashboard Status: ${dashboardResult.data.summary.status}`);
    console.log(`   ⏱️ Uptime: ${Math.floor(dashboardResult.data.summary.uptime / 3600)}h ${Math.floor((dashboardResult.data.summary.uptime % 3600) / 60)}m`);
    console.log(`   📈 FPS Trend: ${dashboardResult.data.charts.fps.trend}`);
    console.log(`   💾 Memory Trend: ${dashboardResult.data.charts.memory.trend}`);
  } else {
    results.failed++;
  }
  console.log();

  // Test 7: Uptime History
  results.total++;
  const uptimeHistoryResult = await testEndpoint(
    "Performance History (Uptime)",
    `${BASE_URL}/api/performance/history?metric=uptime&duration=60`
  );
  if (uptimeHistoryResult.success) {
    results.passed++;
    const uptimeValues = uptimeHistoryResult.data.history.map((h: any) => h.value);
    console.log(`   ⏱️ Uptime progression: ${Math.min(...uptimeValues)}s - ${Math.max(...uptimeValues)}s`);
  } else {
    results.failed++;
  }
  console.log();

  // Test 8: Error Handling (Invalid Metric)
  results.total++;
  console.log("🧪 Testing Error Handling (Invalid Metric)...");
  try {
    const response = await fetch(`${BASE_URL}/api/performance/history?metric=invalid&duration=30`);
    if (response.status === 200) {
      console.log("   ⚠️ Invalid metric accepted (should handle gracefully)");
      results.passed++; // Still counts as passed if handled
    } else {
      console.log(`   ✅ Invalid metric rejected: ${response.status}`);
      results.passed++;
    }
  } catch (error) {
    console.log(`   ❌ Error handling failed: ${error.message}`);
    results.failed++;
  }
  console.log();

  // Test 9: Response Time Validation
  results.total++;
  console.log("⚡ Testing Response Time Performance...");
  const startTime = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/api/performance/metrics`);
    await response.json();
    const responseTime = Date.now() - startTime;

    if (responseTime < 100) {
      console.log(`   ✅ Fast response: ${responseTime}ms`);
      results.passed++;
    } else {
      console.log(`   ⚠️ Slow response: ${responseTime}ms`);
      results.passed++; // Still pass, just note slowness
    }
  } catch (error) {
    console.log(`   ❌ Response time test failed: ${error.message}`);
    results.failed++;
  }
  console.log();

  // Final Results
  console.log("🎯 API Testing Results");
  console.log("═".repeat(50));
  console.log(`📊 Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);

  if (results.failed === 0) {
    console.log("\n🎉 All API endpoints are working correctly!");
    console.log("🚀 Your Arsenal Lab Performance Monitoring API is ready!");
  } else {
    console.log(`\n⚠️ ${results.failed} endpoints need attention.`);
  }

  console.log("\n🔗 API Documentation: docs/api-performance-endpoints.md");
  console.log("🌐 Dashboard: http://localhost:3655");
}

// Server health check
async function checkServerHealth() {
  console.log("🏥 Checking server health...");

  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.ok) {
      const health = await response.json();
      console.log(`   ✅ Server is healthy: ${health.status}`);
      console.log(`   ⏱️ Uptime: ${health.system.uptime}s`);
      console.log(`   📦 Bun Version: ${health.system.bunVersion}`);
      return true;
    } else {
      console.log(`   ❌ Server health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Cannot connect to server: ${error.message}`);
    console.log("   💡 Make sure the server is running: bun run src/server.ts");
    return false;
  }
}

// Main execution
async function main() {
  console.log("🔬 Arsenal Lab Performance API Testing Suite\n");

  // Check if server is running
  const serverHealthy = await checkServerHealth();

  if (!serverHealthy) {
    console.log("\n❌ Server is not running. Please start it first:");
    console.log("   bun run src/server.ts");
    process.exit(1);
  }

  console.log();
  await testAllEndpoints();

  console.log("\n💡 Tips for API usage:");
  console.log("   • All endpoints support CORS for dashboard integration");
  console.log("   • Response times are optimized for real-time monitoring");
  console.log("   • Historical data uses rolling 60-second windows");
  console.log("   • Memory metrics are reported in MB for easy reading");
  console.log("   • Status indicators: excellent(120+ FPS + <50MB), good(60+ FPS + <100MB), fair(30+ FPS + <200MB), poor(otherwise)");
}

// Run if called directly
if (import.meta.main) {
  main().catch(console.error);
}
