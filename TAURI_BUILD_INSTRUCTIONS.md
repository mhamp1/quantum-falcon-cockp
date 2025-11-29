# Quantum Falcon — Tauri Desktop App Build Instructions

## 🚀 Quick Start

Your app is now configured as a **real desktop application** using Tauri!

### Development Mode

```bash
npm run tauri:dev
```

This will:
- Start the Vite dev server
- Open a native window with your app
- Enable hot reload

### Build Production Installers

```bash
# Build for current platform
npm run tauri:build

# Build for specific platforms
npm run tauri:build:win    # Windows .exe installer
npm run tauri:build:mac    # macOS .dmg
npm run tauri:build:linux   # Linux .AppImage
```

### Output Location

Built installers will be in:
```
src-tauri/target/release/bundle/
```

- **Windows**: `Quantum Falcon Setup.exe`
- **macOS**: `Quantum Falcon.dmg`
- **Linux**: `Quantum Falcon.AppImage`

## 🎨 Icon Setup

### Current Status

Icons are already configured in `src-tauri/icons/`. If you want to regenerate them from your falcon logo:

1. **Create a square version** of `public/falcon-head-official.png` (must be square, e.g., 1024x1024px)

2. **Generate all icon sizes**:
```bash
npm run tauri:icon public/falcon-head-official-square.png
```

This will automatically generate all required icon sizes for Windows, macOS, and Linux.

### Manual Icon Requirements

If generating manually, you need:
- `32x32.png` - Windows taskbar
- `128x128.png` - Standard icon
- `128x128@2x.png` - Retina display
- `icon.ico` - Windows executable icon
- `icon.icns` - macOS app bundle icon

## 📦 App Configuration

### Current Settings

- **App Name**: Quantum Falcon
- **Version**: 2025.1.0
- **Identifier**: com.quantumfalcon.app
- **Window Size**: 1400x900 (min: 1024x768)
- **Category**: Finance

### Customization

Edit `src-tauri/tauri.conf.json` to customize:
- Window size and behavior
- App metadata
- Bundle settings
- Security policies

## 🔧 Requirements

- **Node.js** 18+ (already installed)
- **Rust** (Tauri will prompt to install if missing)
- **Platform-specific build tools**:
  - **Windows**: Visual Studio Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `libwebkit2gtk-4.0-dev`, `build-essential`, `libssl-dev`, etc.

## 📱 Mobile App (Flutter)

For Android/iOS builds:

```bash
cd mobile_app
flutter build apk --release        # Android APK
flutter build appbundle --release  # Android App Bundle (Play Store)
flutter build ios --release        # iOS (requires macOS + Xcode)
```

## ✅ What's Configured

- ✅ Tauri v2.9.2 setup complete
- ✅ Window configuration (1400x900, resizable)
- ✅ Build scripts in package.json
- ✅ App metadata and branding
- ✅ Icon configuration
- ✅ Production build settings

## 🚢 Shipping Your App

1. **Build the installer**:
   ```bash
   npm run tauri:build
   ```

2. **Upload to your website**:
   - Windows: Upload `Quantum Falcon Setup.exe`
   - macOS: Upload `Quantum Falcon.dmg`
   - Linux: Upload `Quantum Falcon.AppImage`

3. **Users download and install**:
   - Double-click the installer
   - Follow installation prompts
   - App appears in Applications/Programs
   - Desktop shortcut created automatically

## 🎯 Next Steps

1. Test the dev build: `npm run tauri:dev`
2. Build production: `npm run tauri:build`
3. Test the installer on a clean machine
4. Upload to your distribution platform
5. **Ship it!** ⚡

---

**The Falcon is now a real app.** 🦅

