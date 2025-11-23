# GitHub Pages Deployment Guide

## Overview

This guide explains how to deploy the Quantum Falcon Cockpit to GitHub Pages. The deployment is configured to work with the React 19 + Solana wallet adapter compatibility fixes.

## Quick Start

### Automated Deployment (Recommended)

The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to the `main` branch.

**Setup Steps:**

1. Enable GitHub Pages in your repository settings:
   - Go to **Settings** → **Pages**
   - Under "Build and deployment":
     - Source: **GitHub Actions**
   - Click **Save**

2. Push changes to `main` branch or manually trigger the workflow:
   - Go to **Actions** tab
   - Select "Deploy to GitHub Pages"
   - Click "Run workflow"

3. Your site will be available at:
   ```
   https://mhamp1.github.io/quantum-falcon-cockp/
   ```

### Manual Deployment

If you prefer to deploy manually:

```bash
# Build for GitHub Pages
npm run build:gh-pages

# Deploy to gh-pages branch
npm run deploy
```

This will:
1. Build the app with the correct base path (`/quantum-falcon-cockp/`)
2. Create/update the `gh-pages` branch
3. Push the built files to GitHub

Then configure GitHub Pages to deploy from the `gh-pages` branch:
- Go to **Settings** → **Pages**
- Source: **Deploy from a branch**
- Branch: `gh-pages` / `/ (root)`
- Click **Save**

## Configuration Details

### Base Path

The application uses different base paths depending on the deployment target:

- **Vercel/Spark (root deployment)**: `/`
- **GitHub Pages (subpath deployment)**: `/quantum-falcon-cockp/`

This is configured in `vite.config.ts`:

```typescript
base: process.env.GITHUB_PAGES === 'true' ? '/quantum-falcon-cockp/' : '/'
```

### Build Scripts

Available npm scripts:

- `npm run build` - Standard build for Vercel/Spark (base: `/`)
- `npm run build:gh-pages` - Build for GitHub Pages (base: `/quantum-falcon-cockp/`)
- `npm run deploy` - Build and deploy to GitHub Pages

### React 19 Compatibility

**Important:** The Solana wallet adapter is temporarily disabled in production to prevent React 19 compatibility issues. This is a known issue as of November 2025.

**Status:**
- ✅ All UI features work perfectly
- ✅ Dashboard, quests, trading, analytics, etc. fully functional
- ⚠️ Wallet connection temporarily disabled in production
- ✅ Wallet features fully available in development mode (`npm run dev`)

**Why?** The `@solana/wallet-adapter-react` package ships with React 18 internally, causing chunk loading conflicts with React 19. This results in white screens and `createContext undefined` errors.

**Solution:** Once the Solana team releases a React 19 compatible version, you can remove the production guards in:
- `src/providers/WalletProvider.tsx`
- `src/hooks/useWallet.ts`

See inline comments in those files for details.

## Troubleshooting

### White Screen After Deployment

If you see a white screen:

1. **Check the base path**: Ensure `GITHUB_PAGES=true` was set during build
2. **Check browser console**: Look for 404 errors on asset files
3. **Verify GitHub Pages settings**: Ensure the correct source is selected
4. **Clear cache**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Asset Loading Issues

If assets fail to load:

```bash
# Rebuild with GitHub Pages flag
GITHUB_PAGES=true npm run build

# Or use the dedicated script
npm run build:gh-pages
```

### Deployment Fails

If `npm run deploy` fails:

1. Ensure you have write access to the repository
2. Check that `gh-pages` package is installed: `npm install --save-dev gh-pages`
3. Verify your git credentials are configured
4. Try cleaning dist and rebuilding:
   ```bash
   rm -rf dist
   npm run build:gh-pages
   npm run deploy
   ```

## Advanced Configuration

### Custom Domain

To use a custom domain:

1. Add a `CNAME` file to the `public/` directory with your domain:
   ```
   yourdomain.com
   ```

2. Configure DNS settings with your domain provider:
   - Add a CNAME record pointing to `mhamp1.github.io`

3. In GitHub Settings → Pages, add your custom domain

### Router Configuration

If you use React Router, ensure the basename is set:

```tsx
<BrowserRouter basename="/quantum-falcon-cockp">
  {/* Your routes */}
</BrowserRouter>
```

This is automatically handled via `import.meta.env.BASE_URL` in Vite.

## Production Checklist

Before deploying to production:

- [ ] All environment variables are set correctly
- [ ] Build completes without errors: `npm run build:gh-pages`
- [ ] Preview build locally: `npm run preview` (after building)
- [ ] Test all major features in preview
- [ ] Assets load correctly with base path
- [ ] No console errors related to missing chunks
- [ ] Performance is acceptable (check Lighthouse scores)

## Monitoring

After deployment:

1. **Check the Actions tab** for deployment status
2. **Test the live site** at https://mhamp1.github.io/quantum-falcon-cockp/
3. **Monitor browser console** for any runtime errors
4. **Check Analytics** (if configured) for traffic and errors

## Rollback

If you need to rollback:

### For Automated Deployments:
1. Revert the problematic commit
2. Push to `main` - this will trigger a new deployment

### For Manual Deployments:
```bash
# Checkout the previous working commit
git checkout <previous-commit-hash>

# Rebuild and deploy
npm run build:gh-pages
npm run deploy
```

## Support

For issues specific to this deployment setup:
- Check the [main README](./README.md) for general project info
- Review [deployment fixes documentation](./DEPLOYMENT_FIXES.md)
- Open an issue on GitHub

## Related Documentation

- [Main README](./README.md)
- [Deployment Fixes](./DEPLOYMENT_FIXES.md)
- [White Screen Fixes](./WHITE_SCREEN_ISSUES_RESOLVED.md)
- [Vite Documentation](https://vitejs.dev/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
