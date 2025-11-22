# LicenseAuthority Hub - Repository Setup Guide

**Complete setup instructions for establishing the LicenseAuthority repository as the central hub**

---

## 🎯 Purpose

This document explains how to set up the LicenseAuthority repository (https://github.com/mhamp1/LicenseAuthority) as the single source of truth for all Quantum Falcon license operations.

---

## 📁 Repository Structure

The LicenseAuthority repository should have this structure:

```
LicenseAuthority/
├── packages/
│   └── license-hub/              ← Copy from quantum-falcon-cockp
│       ├── src/
│       ├── package.json
│       ├── tsconfig.json
│       ├── README.md
│       └── .gitignore
├── .github/
│   └── workflows/
│       └── publish-license-hub.yml  ← Copy from quantum-falcon-cockp
├── README.md
└── .gitignore
```

---

## 🚀 Setup Steps

### Step 1: Create LicenseAuthority Repository

If the repository doesn't exist yet:

1. Go to https://github.com/mhamp1
2. Click "New repository"
3. Name: `LicenseAuthority`
4. Description: "Centralized license authority for Quantum Falcon ecosystem"
5. Visibility: **Private** (or Public if open source)
6. Initialize with README
7. Create repository

### Step 2: Copy License Hub Package

From the `quantum-falcon-cockp` repository:

```bash
# Clone both repositories
git clone https://github.com/mhamp1/quantum-falcon-cockp.git
git clone https://github.com/mhamp1/LicenseAuthority.git

# Copy the package
cp -r quantum-falcon-cockp/packages/license-hub LicenseAuthority/packages/

# Copy the workflow
mkdir -p LicenseAuthority/.github/workflows
cp quantum-falcon-cockp/.github/workflows/publish-license-hub.yml LicenseAuthority/.github/workflows/

# Copy documentation
cp quantum-falcon-cockp/packages/license-hub/README.md LicenseAuthority/
```

### Step 3: Update Repository README

Create or update `LicenseAuthority/README.md`:

```markdown
# LicenseAuthority

Centralized license authority for the Quantum Falcon ecosystem.

## 🎯 Single Source of Truth

This repository contains the `@quantumfalcon/license-hub` package - the authoritative source for:

- ✅ License validation logic
- ✅ Tier definitions (free/pro/elite/lifetime)
- ✅ Payment webhook handlers (Stripe & Paddle)
- ✅ License key generation and encryption
- ✅ Deep link activation schema

## 📦 Package

### Installation

```bash
npm install @quantumfalcon/license-hub
```

### Usage

```typescript
import { validateLicense, getTierFeatures } from '@quantumfalcon/license-hub'

// Validate license
const result = await validateLicense(licenseKey, apiEndpoint)

// Get tier features
const features = getTierFeatures('pro')
```

See [packages/license-hub/README.md](./packages/license-hub/README.md) for complete documentation.

## 🔄 Automated Publishing

When you push changes to `main`, GitHub Actions automatically:

1. Builds the package
2. Publishes to GitHub Packages
3. Creates a Git tag
4. Creates a GitHub Release

## 📝 Making Changes

1. Update code in `packages/license-hub/src/`
2. Update version in `packages/license-hub/package.json`
3. Commit and push to `main`
4. Automatic publish triggers!

## 🏷️ Versioning

We use semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes (e.g., 2025.2.0)
- **MINOR**: New features, backward compatible (e.g., 2025.1.1)
- **PATCH**: Bug fixes (e.g., 2025.1.0.1)

## 🔒 Security

- Never commit the `MASTER_KEY` to the repository
- Keep it in environment variables only
- Use different keys for development and production

## 📖 Documentation

- [Package README](./packages/license-hub/README.md) - API reference
- [Migration Guide](https://github.com/mhamp1/quantum-falcon-cockp/blob/main/MIGRATION_GUIDE_FOR_QUANTUM_FALCON.md)
- [Integration Reference](https://github.com/mhamp1/quantum-falcon-cockp/blob/main/QUICK_INTEGRATION_REFERENCE.md)

## 🎯 Consuming Repositories

These repositories consume this package:

- [quantum-falcon-cockp](https://github.com/mhamp1/quantum-falcon-cockp) - Cockpit web app
- quantum-falcon-desktop - Desktop application

To update in consuming repos:
```bash
npm install @quantumfalcon/license-hub@latest
```

## 📞 Support

- Issues: https://github.com/mhamp1/LicenseAuthority/issues
- Email: mhamp1trading@yahoo.com

---

**SYNC COMPLETE: All repos pull from LicenseAuthority Hub — never out of sync again — November 20, 2025**
```

### Step 4: Initialize Package

```bash
cd LicenseAuthority/packages/license-hub

# Install dependencies
npm install

# Build to verify everything works
npm run build

# Should output:
# ✅ Build success - dist/ folder created with:
#    - index.js (CommonJS)
#    - index.mjs (ESM)
#    - index.d.ts (TypeScript types)
```

### Step 5: Commit and Push

```bash
cd LicenseAuthority

git add .
git commit -m "feat: Add @quantumfalcon/license-hub centralized package"
git push origin main

# GitHub Actions will automatically:
# 1. Build the package
# 2. Publish to GitHub Packages
# 3. Create tag v2025.1.0
# 4. Create GitHub Release
```

### Step 6: Verify Publishing

1. Go to https://github.com/mhamp1/LicenseAuthority/actions
2. Check the "Publish License Hub Package" workflow
3. Verify it completed successfully
4. Check https://github.com/mhamp1/LicenseAuthority/packages
5. Confirm package is published

---

## 🔧 GitHub Packages Configuration

### Enable GitHub Packages

1. Go to repository Settings
2. Navigate to "Actions" → "General"
3. Under "Workflow permissions":
   - Select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"
4. Save changes

### Package Visibility

The package visibility inherits from the repository:
- **Private repo** → Private package (requires authentication)
- **Public repo** → Public package (no authentication needed)

---

## 🔐 Authentication Setup

### For Consuming Repositories

Add to `.npmrc` in Desktop and Cockpit repos:

```ini
@quantumfalcon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### Generate GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "NPM Package Access"
4. Scopes: Check `read:packages`
5. Generate token
6. Copy token and add to `.env`:

```bash
GITHUB_TOKEN=ghp_your_token_here
```

### For CI/CD (GitHub Actions)

GitHub Actions automatically has access via `GITHUB_TOKEN` secret. No additional setup needed!

---

## 📊 Monitoring & Maintenance

### Check Package Stats

```bash
# View package info
npm view @quantumfalcon/license-hub

# View all versions
npm view @quantumfalcon/license-hub versions

# View latest version
npm view @quantumfalcon/license-hub version
```

### Update Package Version

```bash
cd packages/license-hub

# For bug fixes
npm version patch    # 2025.1.0 → 2025.1.1

# For new features
npm version minor    # 2025.1.0 → 2025.2.0

# For breaking changes
npm version major    # 2025.1.0 → 2026.0.0

git push origin main --follow-tags
```

### Rollback if Needed

```bash
# In consuming repo
npm install @quantumfalcon/license-hub@2025.1.0

# Or in package.json
{
  "dependencies": {
    "@quantumfalcon/license-hub": "2025.1.0"
  }
}
```

---

## 🧪 Testing the Setup

### Test 1: Build Package

```bash
cd LicenseAuthority/packages/license-hub
npm install
npm run build

# Should succeed with no errors
```

### Test 2: Install in Test Project

```bash
mkdir test-project
cd test-project
npm init -y

# Create .npmrc
echo "@quantumfalcon:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# Install package
npm install @quantumfalcon/license-hub

# Test import
node -e "const { getTierFeatures } = require('@quantumfalcon/license-hub'); console.log(getTierFeatures('pro'))"
```

### Test 3: Verify Workflow

```bash
cd LicenseAuthority

# Make a small change
echo "// Updated $(date)" >> packages/license-hub/src/index.ts

# Update version
cd packages/license-hub
npm version patch
cd ../..

# Commit and push
git add .
git commit -m "test: Verify auto-publish workflow"
git push origin main

# Check GitHub Actions - should auto-publish
```

---

## ⚠️ Troubleshooting

### Issue: Package Not Found

**Error:** `404 Not Found - GET https://npm.pkg.github.com/@quantumfalcon/license-hub`

**Solutions:**
1. Check package is published: https://github.com/mhamp1/LicenseAuthority/packages
2. Verify `.npmrc` configuration
3. Check `GITHUB_TOKEN` has `read:packages` scope
4. Ensure token is not expired

### Issue: Workflow Fails to Publish

**Error:** `npm publish` fails with 403

**Solutions:**
1. Check workflow permissions in repo settings
2. Verify package name matches: `@quantumfalcon/license-hub`
3. Check `publishConfig` in package.json
4. Ensure version is incremented

### Issue: Build Fails

**Error:** TypeScript compilation errors

**Solutions:**
1. Run `npm install` in package directory
2. Check TypeScript version: `npm list typescript`
3. Clear build cache: `rm -rf dist node_modules && npm install`
4. Verify tsconfig.json settings

---

## 📋 Checklist

Use this checklist to verify setup:

- [ ] LicenseAuthority repository created
- [ ] Package copied to `packages/license-hub/`
- [ ] Workflow copied to `.github/workflows/publish-license-hub.yml`
- [ ] Repository README created
- [ ] GitHub Packages enabled in settings
- [ ] Workflow permissions set to "Read and write"
- [ ] Package builds successfully (`npm run build`)
- [ ] First push to main triggers workflow
- [ ] Workflow completes successfully
- [ ] Package appears in GitHub Packages
- [ ] Tag `v2025.1.0` created
- [ ] GitHub Release created
- [ ] Can install package in test project
- [ ] Desktop repo can install and use package
- [ ] Cockpit repo can install and use package

---

## 🎉 Success!

Once all steps are complete, you have:

✅ A centralized LicenseAuthority repository  
✅ Automated package publishing on every push  
✅ Single source of truth for all license logic  
✅ Desktop and Cockpit repos consuming the package  
✅ Zero-effort sync across all repositories  

**Your license system is now bulletproof and maintenance-free!**

---

## 📞 Next Actions

1. **Share with team:**
   - Send this guide to all developers
   - Schedule training session
   - Update team wiki

2. **Migrate Desktop repo:**
   - Follow MIGRATION_GUIDE_FOR_QUANTUM_FALCON.md
   - Test thoroughly
   - Deploy to production

3. **Migrate Cockpit repo:**
   - Follow MIGRATION_GUIDE_FOR_QUANTUM_FALCON.md
   - Test thoroughly
   - Deploy to production

4. **Monitor:**
   - Watch for issues
   - Check package download stats
   - Gather feedback from team

---

**SYNC COMPLETE: All repos now pull from LicenseAuthority Hub — never out of sync again — November 20, 2025**
