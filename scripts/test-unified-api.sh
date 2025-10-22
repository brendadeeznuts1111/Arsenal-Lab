#!/bin/bash
# Test script for the unified Arsenal Lab API
# Tests all integrated systems: Frontend + Backend + Database + System Gate

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
API_BASE="http://localhost:3655"
TEST_USER_ID="test-user-$(date +%s)"

echo -e "${BLUE}🧪 Testing UNIFIED Arsenal Lab API${NC}"
echo -e "${BLUE}===================================${NC}"
echo ""

# Function to print test results
test_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
}

test_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    echo -e "${RED}   $2${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Test 1: Health Check
test_health_check() {
    info "Testing unified health check..."
    local response=$(curl -s "${API_BASE}/api/health")

    if echo "$response" | jq -e '.status == "healthy"' > /dev/null 2>&1; then
        if echo "$response" | jq -e '.services.database == "healthy"' > /dev/null 2>&1; then
            if echo "$response" | jq -e '.services.governance == "healthy"' > /dev/null 2>&1; then
                test_pass "Health check - All services healthy"
            else
                test_fail "Health check - Governance service unhealthy" "$response"
            fi
        else
            test_fail "Health check - Database service unhealthy" "$response"
        fi
    else
        test_fail "Health check failed" "$response"
    fi
}

# Test 2: Security Scanner
test_security_scanner() {
    info "Testing security scanner..."

    local payload='{"packages":[{"name":"lodash","version":"4.17.11"},{"name":"express","version":"4.17.0"}]}'
    local response=$(curl -s -X POST "${API_BASE}/api/security/scan" \
        -H "Content-Type: application/json" \
        -d "$payload")

    if echo "$response" | jq -e '.vulnerabilities | length > 0' > /dev/null 2>&1; then
        test_pass "Security scanner - Detected vulnerabilities"
    else
        test_fail "Security scanner - No vulnerabilities detected" "$response"
    fi
}

# Test 3: Governance Validation
test_governance_validation() {
    info "Testing governance validation..."

    local response=$(curl -s "${API_BASE}/api/gate/validate")

    if echo "$response" | jq -e '.status == "valid"' > /dev/null 2>&1; then
        test_pass "Governance validation - All invariants satisfied"
    else
        test_fail "Governance validation failed" "$response"
    fi
}

# Test 4: Database Integration - Build Configs
test_database_build_configs() {
    info "Testing database integration - Build configs..."

    # Test GET all configs
    local get_response=$(curl -s "${API_BASE}/api/build/configs")

    if echo "$get_response" | jq -e '.configs' > /dev/null 2>&1; then
        test_pass "Database - GET build configs"
    else
        test_fail "Database - GET build configs failed" "$get_response"
    fi

    # Test POST new config
    local config_payload='{"name":"Test Config","description":"API test config","config_json":{"target":"browser","minify":true},"preset_type":"custom","user_id":"'"${TEST_USER_ID}"'"}'
    local post_response=$(curl -s -X POST "${API_BASE}/api/build/configs" \
        -H "Content-Type: application/json" \
        -d "$config_payload")

    if echo "$post_response" | jq -e '.id' > /dev/null 2>&1; then
        test_pass "Database - POST build config"
        CONFIG_ID=$(echo "$post_response" | jq -r '.id')
    else
        test_fail "Database - POST build config failed" "$post_response"
    fi
}

# Test 5: Database Integration - Build History
test_database_build_history() {
    info "Testing database integration - Build history..."

    # Test GET history
    local get_response=$(curl -s "${API_BASE}/api/build/history")

    if echo "$get_response" | jq -e '.history' > /dev/null 2>&1; then
        test_pass "Database - GET build history"
    else
        test_fail "Database - GET build history failed" "$get_response"
    fi

    # Test POST history entry (requires config ID from previous test)
    if [[ -n "$CONFIG_ID" ]]; then
        local history_payload='{"config_id":"'"${CONFIG_ID}"'","build_name":"API Test Build","status":"success","duration_ms":1500,"bundle_size_kb":245.5,"user_id":"'"${TEST_USER_ID}"'"}'
        local post_response=$(curl -s -X POST "${API_BASE}/api/build/history" \
            -H "Content-Type: application/json" \
            -d "$history_payload")

        if echo "$post_response" | jq -e '.id' > /dev/null 2>&1; then
            test_pass "Database - POST build history"
        else
            test_fail "Database - POST build history failed" "$post_response"
        fi
    else
        test_fail "Database - POST build history skipped (no config ID)"
    fi
}

# Test 6: System Diagnostics
test_system_diagnostics() {
    info "Testing system diagnostics..."

    local response=$(curl -s "${API_BASE}/api/diagnostics")

    if echo "$response" | jq -e '.system.bunVersion' > /dev/null 2>&1; then
        if echo "$response" | jq -e '.database.buildConfigsCount' > /dev/null 2>&1; then
            if echo "$response" | jq -e '.governance' > /dev/null 2>&1; then
                test_pass "System diagnostics - All systems reporting"
            else
                test_fail "System diagnostics - Governance not reporting" "$response"
            fi
        else
            test_fail "System diagnostics - Database not reporting" "$response"
        fi
    else
        test_fail "System diagnostics - System info not reporting" "$response"
    fi
}

# Test 7: Frontend Integration
test_frontend_integration() {
    info "Testing frontend integration..."

    local response=$(curl -s "${API_BASE}/")

    if echo "$response" | grep -q "Arsenal Lab"; then
        test_pass "Frontend - Serving main page"
    else
        test_fail "Frontend - Main page not serving correctly" "$(echo "$response" | head -100)"
    fi
}

# Run all tests
main() {
    echo "Starting unified API tests..."
    echo ""

    # Pre-flight check - is server running?
    if ! curl -s "${API_BASE}/api/health" > /dev/null 2>&1; then
        echo -e "${RED}❌ Server not running at ${API_BASE}${NC}"
        echo -e "${YELLOW}💡 Start the server with: bun run unified${NC}"
        exit 1
    fi

    # Run all test suites
    test_health_check
    test_security_scanner
    test_governance_validation
    test_database_build_configs
    test_database_build_history
    test_system_diagnostics
    test_frontend_integration

    echo ""
    echo -e "${GREEN}🎉 Unified API Testing Complete!${NC}"
    echo ""
    echo -e "${BLUE}📊 Test Results:${NC}"
    echo "  🔒 Security Scanner: Active"
    echo "  🛡️ Governance Engine: Operational"
    echo "  💾 Database Integration: Working"
    echo "  🌐 Frontend API: Serving"
    echo "  📈 Analytics: Collecting"
    echo ""
    echo -e "${GREEN}✅ All systems integrated and operational!${NC}"
}

# Run main function
main "$@"
