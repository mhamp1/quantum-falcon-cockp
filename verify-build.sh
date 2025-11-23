#!/bin/bash

# Build Verification Script for Quantum Falcon Cockpit
# Checks for common build issues before deployment

set -e

echo "🔍 Quantum Falcon Cockpit - Build Verification"
echo "=============================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ node_modules not found${NC}"
    echo "   Run: npm install"
    exit 1
fi
echo -e "${GREEN}✅ node_modules exists${NC}"

# Check critical dependencies
echo ""
echo "Checking critical dependencies..."

CRITICAL_DEPS=(
    "react"
    "react-dom"
    "@solana/wallet-adapter-react"
    "@solana/wallet-adapter-react-ui"
    "@solana/web3.js"
    "canvas-confetti"
    "framer-motion"
)

MISSING_DEPS=()

for dep in "${CRITICAL_DEPS[@]}"; do
    if [ ! -d "node_modules/$dep" ]; then
        MISSING_DEPS+=("$dep")
        echo -e "${RED}❌ Missing: $dep${NC}"
    else
        echo -e "${GREEN}✅ Found: $dep${NC}"
    fi
done

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Missing critical dependencies!${NC}"
    echo "   Run: npm install"
    exit 1
fi

# Check vite.config.ts exists
echo ""
if [ ! -f "vite.config.ts" ]; then
    echo -e "${RED}❌ vite.config.ts not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ vite.config.ts exists${NC}"

# Check index.html exists
if [ ! -f "index.html" ]; then
    echo -e "${RED}❌ index.html not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ index.html exists${NC}"

# Check src/main.tsx exists
if [ ! -f "src/main.tsx" ]; then
    echo -e "${RED}❌ src/main.tsx not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ src/main.tsx exists${NC}"

# Check src/App.tsx exists
if [ ! -f "src/App.tsx" ]; then
    echo -e "${RED}❌ src/App.tsx not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ src/App.tsx exists${NC}"

# Verify vite.config.ts has proper chunking
echo ""
echo "Verifying vite.config.ts chunking strategy..."
if grep -q "vendor-react" vite.config.ts && grep -q "vendor-solana" vite.config.ts; then
    echo -e "${GREEN}✅ Proper chunk splitting configured${NC}"
else
    echo -e "${YELLOW}⚠️  Chunk splitting may not be optimal${NC}"
    echo "   Check vite.config.ts manualChunks configuration"
fi

# Check for TypeScript errors (non-blocking)
echo ""
echo "Running TypeScript check..."
if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
    echo -e "${YELLOW}⚠️  TypeScript errors found (non-blocking)${NC}"
    echo "   Run: npx tsc --noEmit to see details"
else
    echo -e "${GREEN}✅ No TypeScript errors${NC}"
fi

# Check dist folder (if build already ran)
echo ""
if [ -d "dist" ]; then
    echo "Analyzing existing build..."
    
    # Check for vendor chunks
    if ls dist/assets/vendor-react-*.js 1> /dev/null 2>&1; then
        echo -e "${GREEN}✅ vendor-react chunk exists${NC}"
    else
        echo -e "${YELLOW}⚠️  vendor-react chunk not found${NC}"
    fi
    
    if ls dist/assets/vendor-solana-*.js 1> /dev/null 2>&1; then
        echo -e "${GREEN}✅ vendor-solana chunk exists${NC}"
    else
        echo -e "${YELLOW}⚠️  vendor-solana chunk not found${NC}"
    fi
    
    if ls dist/assets/vendor-ui-*.js 1> /dev/null 2>&1; then
        echo -e "${GREEN}✅ vendor-ui chunk exists${NC}"
    else
        echo -e "${YELLOW}⚠️  vendor-ui chunk not found${NC}"
    fi
    
    # Check index.html exists
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✅ dist/index.html exists${NC}"
    else
        echo -e "${RED}❌ dist/index.html missing${NC}"
        exit 1
    fi
    
    # Check for source maps (should be hidden, not in assets/)
    if ls dist/assets/*.map 1> /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Source maps exposed in assets/${NC}"
        echo "   Consider using 'sourcemap: hidden' in vite.config.ts"
    else
        echo -e "${GREEN}✅ Source maps properly hidden${NC}"
    fi
else
    echo -e "${YELLOW}ℹ️  dist folder not found (build hasn't run yet)${NC}"
fi

# Final summary
echo ""
echo "=============================================="
echo -e "${GREEN}✅ Build verification complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run: npm run build"
echo "  2. Run: npm run preview"
echo "  3. Test in browser"
echo ""
echo "Common issues to watch for:"
echo "  - 'J4 is undefined' → Check vendor-solana chunk"
echo "  - MIME type errors → Check optimizeDeps in vite.config.ts"
echo "  - White screen → Check browser console for errors"
echo ""
