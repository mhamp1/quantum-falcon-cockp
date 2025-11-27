#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Quantum Falcon Mobile — Build Script
# v2025.1.0 | November 27, 2025
# ═══════════════════════════════════════════════════════════════

set -e

echo "🦅 Quantum Falcon Mobile Build Script"
echo "======================================"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Clean
echo -e "${CYAN}[1/7] Cleaning build artifacts...${NC}"
flutter clean

# Step 2: Get dependencies
echo -e "${CYAN}[2/7] Getting dependencies...${NC}"
flutter pub get

# Step 3: Generate icons
echo -e "${CYAN}[3/7] Generating app icons...${NC}"
flutter pub run flutter_launcher_icons || echo "Skipping icons (assets may not exist yet)"

# Step 4: Generate splash screen
echo -e "${CYAN}[4/7] Generating native splash screen...${NC}"
flutter pub run flutter_native_splash:create || echo "Skipping splash (assets may not exist yet)"

# Step 5: Build runner (code generation)
echo -e "${CYAN}[5/7] Running code generation...${NC}"
flutter pub run build_runner build --delete-conflicting-outputs || echo "No generated files needed"

# Step 6: Analyze
echo -e "${CYAN}[6/7] Analyzing code...${NC}"
flutter analyze || echo "Analysis warnings (non-blocking)"

# Step 7: Build
echo -e "${CYAN}[7/7] Building release APKs...${NC}"
echo ""

case "$1" in
  "apk")
    echo -e "${YELLOW}Building split APKs (optimized size)...${NC}"
    flutter build apk --release --split-per-abi
    echo ""
    echo -e "${GREEN}✅ APKs built successfully!${NC}"
    echo "📦 Output: build/app/outputs/flutter-apk/"
    ls -lh build/app/outputs/flutter-apk/*.apk 2>/dev/null || true
    ;;
  "appbundle")
    echo -e "${YELLOW}Building App Bundle for Play Store...${NC}"
    flutter build appbundle --release
    echo ""
    echo -e "${GREEN}✅ App Bundle built successfully!${NC}"
    echo "📦 Output: build/app/outputs/bundle/release/"
    ;;
  "ios")
    echo -e "${YELLOW}Building iOS release...${NC}"
    flutter build ios --release
    echo ""
    echo -e "${GREEN}✅ iOS build ready!${NC}"
    ;;
  "analyze-size")
    echo -e "${YELLOW}Building with size analysis...${NC}"
    flutter build apk --analyze-size
    ;;
  "profile")
    echo -e "${YELLOW}Running in profile mode...${NC}"
    flutter run --profile
    ;;
  *)
    echo -e "${YELLOW}Building debug APK...${NC}"
    flutter build apk --debug
    echo ""
    echo -e "${GREEN}✅ Debug APK built!${NC}"
    echo ""
    echo "Usage: ./build.sh [apk|appbundle|ios|analyze-size|profile]"
    ;;
esac

echo ""
echo -e "${GREEN}🦅 Build complete!${NC}"

