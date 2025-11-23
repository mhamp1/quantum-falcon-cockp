#!/bin/bash
# Deployment Readiness Verification Script
# This script verifies that the build is ready for deployment to Vercel/Spark

# Note: Not using 'set -e' to allow script to run all checks even if some fail

echo "=========================================="
echo "🚀 DEPLOYMENT READINESS VERIFICATION"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass_count=0
fail_count=0

# Function to print results
check_pass() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    ((pass_count++))
}

check_fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    ((fail_count++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  WARN:${NC} $1"
}

# 1. Check if dist directory exists
echo "1️⃣  Checking build output..."
if [ -d "dist" ]; then
    check_pass "dist/ directory exists"
else
    check_fail "dist/ directory not found - run 'npm run build' first"
    exit 1
fi

# 2. Check if index.html exists
if [ -f "dist/index.html" ]; then
    check_pass "dist/index.html exists"
else
    check_fail "dist/index.html not found"
    exit 1
fi

# 3. Check if assets directory exists
if [ -d "dist/assets" ]; then
    check_pass "dist/assets/ directory exists"
else
    check_fail "dist/assets/ directory not found"
    exit 1
fi

# 4. Check for JavaScript bundles in assets
js_files=$(find dist/assets -name "*.js" 2>/dev/null | wc -l)
if [ "$js_files" -gt 0 ]; then
    check_pass "Found $js_files JavaScript bundle(s)"
else
    check_fail "No JavaScript bundles found in dist/assets"
fi

# 5. Check for CSS files in assets
css_files=$(find dist/assets -name "*.css" 2>/dev/null | wc -l)
if [ "$css_files" -gt 0 ]; then
    check_pass "Found $css_files CSS file(s)"
else
    check_fail "No CSS files found in dist/assets"
fi

# 6. Verify index.html uses absolute paths (not relative)
echo ""
echo "2️⃣  Checking asset paths in index.html..."
if grep -q 'src="/assets/' dist/index.html; then
    check_pass "Scripts use absolute paths (/assets/...)"
else
    if grep -q 'src="./assets/' dist/index.html || grep -q 'src="../assets/' dist/index.html; then
        check_fail "Scripts use relative paths - this will break on Vercel"
        echo "   Fix: Ensure vite.config.ts has 'base: \"/\"'"
    else
        check_warn "Could not verify script paths - check manually"
    fi
fi

if grep -q 'href="/assets/' dist/index.html; then
    check_pass "Stylesheets use absolute paths (/assets/...)"
else
    if grep -q 'href="./assets/' dist/index.html || grep -q 'href="../assets/' dist/index.html; then
        check_fail "Stylesheets use relative paths - this will break on Vercel"
    fi
fi

# 7. Check vite.config.ts for correct base path
echo ""
echo "3️⃣  Checking vite.config.ts..."
if [ -f "vite.config.ts" ]; then
    if grep -q "base: '/'," vite.config.ts || grep -q 'base: "/",' vite.config.ts; then
        check_pass "vite.config.ts has base: '/' (correct for Vercel)"
    else
        check_warn "base path may not be set correctly in vite.config.ts"
    fi
else
    check_fail "vite.config.ts not found"
fi

# 8. Check package.json for problematic homepage field
echo ""
echo "4️⃣  Checking package.json..."
if [ -f "package.json" ]; then
    if grep -q '"homepage"' package.json; then
        check_warn "package.json has 'homepage' field - this may cause issues on Vercel"
        echo "   Consider removing it or setting it to '.'"
    else
        check_pass "No 'homepage' field in package.json (good)"
    fi
else
    check_fail "package.json not found"
fi

# 9. Check vercel.json configuration
echo ""
echo "5️⃣  Checking vercel.json..."
if [ -f "vercel.json" ]; then
    check_pass "vercel.json exists"
    
    # Check for SPA rewrites
    if grep -q '"rewrites"' vercel.json && grep -q '"destination": "/index.html"' vercel.json; then
        check_pass "SPA rewrites configured (routes will work on refresh)"
    else
        check_warn "SPA rewrites may not be configured - check vercel.json"
    fi
    
    # Check output directory
    if grep -q '"outputDirectory": "dist"' vercel.json; then
        check_pass "outputDirectory set to 'dist'"
    else
        check_warn "outputDirectory may not be set correctly"
    fi
else
    check_warn "vercel.json not found - Vercel will use auto-detection"
fi

# 10. Check for critical files in dist
echo ""
echo "6️⃣  Checking critical files..."
critical_files=("index.html")
for file in "${critical_files[@]}"; do
    if [ -f "dist/$file" ]; then
        size=$(wc -c < "dist/$file")
        if [ "$size" -gt 100 ]; then
            check_pass "dist/$file exists and has content ($size bytes)"
        else
            check_warn "dist/$file is very small ($size bytes) - may be empty"
        fi
    else
        check_fail "dist/$file not found"
    fi
done

# 11. Simulate checking if dist/index.html references src files (shouldn't)
echo ""
echo "7️⃣  Checking for development artifacts..."
if grep -q '/src/' dist/index.html; then
    check_fail "index.html references /src/ files - build may have failed"
else
    check_pass "No references to /src/ files (good)"
fi

# 12. Check file sizes
echo ""
echo "8️⃣  Checking bundle sizes..."
total_js_size=$(find dist/assets -name "*.js" -exec wc -c {} + 2>/dev/null | tail -1 | awk '{print $1}')
if [ -n "$total_js_size" ] && [ "$total_js_size" -gt 0 ]; then
    total_js_mb=$((total_js_size / 1024 / 1024))
    check_pass "Total JS bundle size: ~${total_js_mb} MB"
    
    if [ "$total_js_mb" -gt 10 ]; then
        check_warn "JS bundles are large (>${total_js_mb}MB) - consider code splitting"
    fi
else
    check_warn "Could not calculate JS bundle size"
fi

# 13. Check for error boundaries in App.tsx
echo ""
echo "9️⃣  Checking for error handling..."
if [ -f "src/App.tsx" ]; then
    if grep -q "ErrorBoundary" src/App.tsx; then
        check_pass "ErrorBoundary found in App.tsx"
    else
        check_warn "ErrorBoundary not found - white screens may not be handled"
    fi
else
    check_warn "src/App.tsx not found"
fi

# 14. Check for proper React imports in main.tsx
if [ -f "src/main.tsx" ]; then
    if grep -q "createRoot" src/main.tsx; then
        check_pass "React 18+ createRoot found in main.tsx"
    else
        check_warn "Check React rendering method in main.tsx"
    fi
else
    check_warn "src/main.tsx not found"
fi

# Summary
echo ""
echo "=========================================="
echo "📊 VERIFICATION SUMMARY"
echo "=========================================="
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "🚀 Your build is ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "  1. Deploy to Vercel: git push (if using Vercel GitHub integration)"
    echo "  2. Or use Vercel CLI: vercel --prod"
    echo "  3. Or deploy to Surge: surge dist your-domain.surge.sh --single"
    echo ""
    exit 0
else
    echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
    echo ""
    echo "Please fix the issues above before deploying."
    echo "Common fixes:"
    echo "  - Run 'npm run build' if build output is missing"
    echo "  - Check vite.config.ts has base: '/'"
    echo "  - Remove 'homepage' field from package.json"
    echo ""
    exit 1
fi
