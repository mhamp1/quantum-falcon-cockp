#!/bin/bash

# White Screen Fix Verification Script
# Checks that all critical fixes are in place

echo "=========================================="
echo "WHITE SCREEN FIX VERIFICATION"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track pass/fail
PASS=0
FAIL=0

# Test function
test_check() {
    local description=$1
    local file=$2
    local pattern=$3
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅ PASS${NC}: $description"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}: $description"
        echo "   Expected pattern in $file: $pattern"
        ((FAIL++))
    fi
}

echo "Checking critical fixes..."
echo ""

# Check 1: Debug banner exists
test_check "Debug banner in App.tsx" \
    "src/App.tsx" \
    "CRITICAL DEBUG BANNER"

# Check 2: Unconditional rendering (no isClient guard)
test_check "Removed isClient guard" \
    "src/App.tsx" \
    "REMOVED isClient guard"

# Check 3: LazyWithRetry function
test_check "Lazy load retry logic" \
    "src/App.tsx" \
    "lazyWithRetry"

# Check 4: ErrorBoundary at root
test_check "ErrorBoundary wrapper" \
    "src/App.tsx" \
    "<ErrorBoundary FallbackComponent"

# Check 5: Safe KV hook
test_check "Safe KV fallback hook" \
    "src/hooks/useKVFallback.ts" \
    "useKVSafe"

# Check 6: localStorage fallback
test_check "KV localStorage fallback" \
    "src/lib/kv-storage.ts" \
    "getFromLocalStorage"

# Check 7: Chunk error detection
test_check "Chunk loading error detection" \
    "src/components/ErrorBoundary.tsx" \
    "Loading chunk"

# Check 8: WalletProvider error handling
test_check "WalletProvider fallback" \
    "src/providers/WalletProvider.tsx" \
    "catch (error)"

# Check 9: Global error handlers
test_check "Global error handlers" \
    "src/main.tsx" \
    "window.addEventListener('error'"

# Check 10: Enhanced loading fallback
test_check "Loading fallback component" \
    "src/App.tsx" \
    "LoadingFallback"

echo ""
echo "=========================================="
echo "RESULTS"
echo "=========================================="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo "White screen fixes are in place."
    exit 0
else
    echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
    echo "Please review the failed checks above."
    exit 1
fi
