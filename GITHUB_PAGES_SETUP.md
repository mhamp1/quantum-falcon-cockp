# GitHub Pages Setup Guide

## Quick Fix for "Resource not accessible by integration" Error

The GitHub Actions workflow cannot automatically enable GitHub Pages due to permission restrictions. You need to enable it manually.

## ✅ Enable GitHub Pages (2 minutes)

### Step 1: Go to Repository Settings
1. Navigate to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)

### Step 2: Configure Pages Source
1. Under **Source**, select: **"GitHub Actions"**
2. Click **Save**

### Step 3: Verify
- The workflow will now run successfully
- Your site will be available at: `https://[your-username].github.io/[repo-name]/`

## 🔧 Alternative: Skip Pages Setup

If you don't need GitHub Pages, you can:

1. **Disable the workflow** by renaming it:
   ```bash
   mv .github/workflows/deploy-pages.yml .github/workflows/deploy-pages.yml.disabled
   ```

2. **Or comment out the Pages step** in the workflow file

## 📝 Current Workflow Status

The workflow is configured with `continue-on-error: true` on the Pages setup step, so:
- ✅ The workflow will **not fail** if Pages isn't enabled
- ✅ The build will still complete
- ⚠️ Deployment will only work **after** you enable Pages manually

## 🚀 After Enabling Pages

Once Pages is enabled:
1. Push any commit to `main` branch
2. The workflow will automatically:
   - Build your app
   - Deploy to GitHub Pages
   - Make it live at your Pages URL

## 💡 Why This Happens

GitHub Actions workflows don't have admin permissions by default. Enabling Pages requires repository admin access, which must be done manually through the web interface.

---

**Need help?** The workflow will continue to work for building, but deployment requires manual Pages setup.

