# Deployment Guide for Quantum Falcon Cockpit

**Last Updated:** November 23, 2025  
**Status:** Production Ready ✅

This guide provides step-by-step instructions for deploying the Quantum Falcon Cockpit to various hosting platforms, with a focus on Vercel (primary) and Surge (alternative).

---

## 📋 Table of Contents

1. [Pre-Deployment Verification](#pre-deployment-verification)
2. [Vercel Deployment](#vercel-deployment)
3. [Surge Deployment](#surge-deployment)
4. [Troubleshooting](#troubleshooting)
5. [Performance Optimization](#performance-optimization)

---

## 🔍 Pre-Deployment Verification

Before deploying to any platform, ensure your local build is production-ready:

### Step 1: Clean Build Test

```bash
# Clean all artifacts
rm -rf dist node_modules/.vite

# Reinstall dependencies (fresh)
npm install --legacy-peer-deps

# Build for production
npm run build
```

**Expected Output:**
- ✅ `dist/index.html` created
- ✅ `dist/assets/` directory with hashed files
- ✅ No TypeScript errors
- ✅ Build completes in ~20-30 seconds

### Step 2: Local Preview Test

```bash
# Start preview server
npm run preview
```

**Test Checklist:**
- [ ] Open `http://localhost:4173`
- [ ] Homepage loads without white screen
- [ ] Navigate to `/dashboard`, `/quests`, `/settings`
- [ ] Refresh on any route (should not 404)
- [ ] Check browser console for errors (should be clean)
- [ ] Test offline mode (disconnect network)
- [ ] Test on mobile viewport (browser DevTools)

### Step 3: Verify Asset Paths

```bash
# Check index.html has absolute paths
cat dist/index.html
```

**Expected:**
```html
<script type="module" crossorigin src="/assets/index-[hash].js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-[hash].css">
```

**⚠️ Red Flags:**
- Relative paths like `./assets/` or `../assets/` ❌
- Missing `/assets/` directory ❌
- References to `/src/` files ❌

---

## 🚀 Vercel Deployment

### Method 1: GitHub Integration (Recommended)

1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration

2. **Configure Project Settings:**
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install --legacy-peer-deps`

3. **Set Environment Variables:**
   - Go to Settings → Environment Variables
   - Add all `VITE_*` variables from your `.env` file
   - **Scope:** All (Production, Preview, Development)
   
   Example variables:
   ```
   VITE_FIREBASE_API_KEY=your_key_here
   VITE_LICENSE_API_ENDPOINT=https://your-api.com
   VITE_ENABLE_ANALYTICS=true
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Vercel provides a deployment URL

### Method 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (first time - interactive setup)
vercel

# Deploy to production
vercel --prod
```

### Vercel Configuration (`vercel.json`)

The repository includes an optimized `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**Key Features:**
- ✅ SPA routing with rewrites
- ✅ Aggressive asset caching (1 year)
- ✅ Security headers (XSS, clickjacking protection)
- ✅ Legacy peer deps support

---

## 🌐 Surge Deployment

Surge is a simple static hosting alternative to Vercel.

### Step 1: Install Surge CLI

```bash
npm install -g surge
```

### Step 2: Build and Deploy

```bash
# Build the project
npm run build

# Deploy with SPA support
surge dist your-domain.surge.sh --single
```

**Important:** The `--single` flag is critical for SPA routing. It ensures all routes serve `index.html`.

### Step 3: Custom Domain (Optional)

```bash
# Deploy to custom domain
surge dist your-custom-domain.com --single
```

### Surge-Specific Configuration

For Surge, ensure `vite.config.ts` uses root base path:

```typescript
export default defineConfig({
  base: '/',  // Correct for Surge
  // ... rest of config
});
```

**⚠️ If deploying to a subdirectory on Surge:**
```typescript
base: '/your-subdirectory/',  // e.g., '/quantum-falcon/'
```

Then rebuild:
```bash
npm run build
surge dist your-domain.surge.sh/your-subdirectory --single
```

---

## 🔧 Troubleshooting

### Issue 1: White Screen on Deployed Site

**Symptoms:**
- Local preview works fine
- Deployed site shows blank white screen
- No errors in Network tab, but nothing renders

**Solutions:**

1. **Check Asset Paths:**
   ```bash
   # Inspect deployed index.html
   curl https://your-app.vercel.app/ | grep "assets"
   ```
   
   **Expected:** `/assets/index-[hash].js`  
   **Problem:** `./assets/` or relative paths

2. **Verify Base Path:**
   - Open `vite.config.ts`
   - Ensure `base: '/'` (not `base: './'`)
   - Rebuild and redeploy

3. **Clear Vercel Cache:**
   - Vercel Dashboard → Deployments
   - Click "Redeploy" → Check "Clear cache and reinstall"

4. **Check Browser Console:**
   - Open deployed site
   - F12 → Console
   - Look for 404 errors or CORS issues

### Issue 2: Routes Return 404 on Refresh

**Symptoms:**
- Homepage loads fine
- Navigate to `/dashboard` works
- Refresh on `/dashboard` returns 404

**Solutions:**

1. **Verify Rewrites in `vercel.json`:**
   ```json
   "rewrites": [
     {
       "source": "/(.*)",
       "destination": "/index.html"
     }
   ]
   ```

2. **For Surge, use `--single` flag:**
   ```bash
   surge dist your-domain.surge.sh --single
   ```

### Issue 3: Assets Load but App Still White

**Symptoms:**
- Network tab shows all assets loaded (200 OK)
- Console might show runtime errors
- Page remains white

**Solutions:**

1. **Check Environment Variables:**
   - Missing `VITE_*` variables crash the app silently
   - Add all env vars to Vercel Settings → Environment Variables
   - Redeploy

2. **Inspect Console Errors:**
   - Look for `undefined` errors (missing env vars)
   - Check for chunk loading errors
   - Verify error boundary is catching errors

3. **Test with Debug Mode:**
   ```typescript
   // Temporarily add to main.tsx
   console.log('Environment:', import.meta.env);
   ```

### Issue 4: Stale Cache / Old Version

**Symptoms:**
- Deployed new changes but old version shows
- Users report outdated UI

**Solutions:**

1. **Hard Refresh:**
   - Users: Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

2. **Clear Site Data:**
   - F12 → Application → Storage → Clear site data

3. **Force Cache Bust:**
   - Vercel auto-handles with hashed filenames
   - If issue persists, check `Cache-Control` headers

### Issue 5: Large Bundle Size Warnings

**Symptoms:**
- Build shows warnings about chunks > 1000 kB
- Slow initial load

**Solutions:**

1. **Already Optimized:**
   - The app uses lazy loading for routes
   - Vite automatically code-splits

2. **Monitor Performance:**
   - Acceptable for this feature-rich app
   - Chunks load on-demand (not all at once)

---

## ⚡ Performance Optimization

### Asset Caching

The `vercel.json` configures aggressive caching:

```json
"headers": [
  {
    "source": "/assets/(.*)",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }
    ]
  }
]
```

**Benefits:**
- ✅ Assets cached for 1 year
- ✅ `immutable` prevents revalidation
- ✅ Faster subsequent loads

### Lazy Loading

Routes are lazy-loaded with retry logic:

```typescript
const EnhancedDashboard = lazyWithRetry(
  () => import('@/components/dashboard/EnhancedDashboard'),
  'EnhancedDashboard'
);
```

**Benefits:**
- ✅ Only loads code when needed
- ✅ Automatic retry on chunk errors
- ✅ Graceful fallback UI

### Error Boundaries

Multiple levels of error boundaries prevent cascading failures:

```typescript
<ErrorBoundary FallbackComponent={ComponentErrorFallback}>
  <Suspense fallback={<LoadingFallback />}>
    <ActiveComponent />
  </Suspense>
</ErrorBoundary>
```

**Benefits:**
- ✅ Isolated component failures
- ✅ User-friendly error messages
- ✅ Reload/retry options

---

## 📊 Deployment Checklist

Use this checklist before deploying:

### Pre-Deploy
- [ ] Local build succeeds (`npm run build`)
- [ ] Local preview works (`npm run preview`)
- [ ] All routes accessible
- [ ] No console errors
- [ ] Mobile responsive test passed

### Vercel-Specific
- [ ] Environment variables set
- [ ] `vercel.json` committed
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install --legacy-peer-deps`

### Post-Deploy
- [ ] Deployed URL loads successfully
- [ ] Test all major routes
- [ ] Verify assets load (check Network tab)
- [ ] Test on mobile device
- [ ] Check performance (Lighthouse)
- [ ] Monitor for errors (Vercel Analytics)

### Surge-Specific
- [ ] `--single` flag used
- [ ] Custom domain configured (if needed)
- [ ] Base path correct in `vite.config.ts`

---

## 🆘 Getting Help

If deployment issues persist:

1. **Check Vercel Logs:**
   - Dashboard → Deployments → Latest → View Build Logs
   - Look for errors or warnings

2. **Browser DevTools:**
   - Console tab for JavaScript errors
   - Network tab for 404s or failed requests
   - Application tab for storage issues

3. **Community Support:**
   - GitHub Issues: [Report a problem](https://github.com/mhamp1/quantum-falcon-cockp/issues)
   - Email: mhamp1trading@yahoo.com

4. **Reference Documents:**
   - [DEPLOYMENT_VERIFICATION.md](./DEPLOYMENT_VERIFICATION.md)
   - [WHITE_SCREEN_FIX_SUMMARY.md](./WHITE_SCREEN_FIX_SUMMARY.md)

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Homepage loads in < 3 seconds
- ✅ All routes work and refresh correctly
- ✅ No 404 errors in Network tab
- ✅ Console is clean (no critical errors)
- ✅ Mobile view works smoothly
- ✅ Offline mode shows cached data
- ✅ Lighthouse score > 80

---

**🚀 Ready to deploy? Follow the Vercel or Surge sections above!**

**💡 Pro Tip:** Always test locally with `npm run preview` before deploying. It simulates production mode and catches 99% of deployment issues.
