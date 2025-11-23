# White Screen Diagnosis Guide - Vercel & Spark

**Date:** November 22, 2025  
**Status:** Active Investigation

## Quick Diagnosis Steps

### 1. Check Browser Console (F12)

**Open DevTools → Console tab and look for:**

✅ **Good Signs:**
- `[main.tsx] ========== STARTING RENDER ==========`
- `[App] ========== APP COMPONENT RENDERING ==========`
- `[main.tsx] ✅ Root has content - app appears to be rendering`

❌ **Bad Signs:**
- `[main.tsx] ========== WHITE SCREEN DETECTED ==========`
- `[main.tsx] Root element is empty after render!`
- Red errors about missing modules or chunks
- 404 errors on `/assets/index-[hash].js`

### 2. Check Network Tab

**Open DevTools → Network tab → Reload page:**

✅ **Correct:**
- `/assets/index-[hash].js` → Status 200
- `/assets/vendor-react-[hash].js` → Status 200
- `/assets/index-[hash].css` → Status 200

❌ **Wrong:**
- `/src/main.tsx` → Status 404 (means serving source, not built)
- Any 404 errors on asset files
- No JS files loading at all

### 3. Check HTML Source

**Right-click page → View Page Source (or Network → Doc → Response):**

✅ **Correct (Built):**
```html
<script type="module" crossorigin src="/assets/index-BbyYdHkj.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-nw7fHSiY.css">
```

❌ **Wrong (Source):**
```html
<script type="module" src="/src/main.tsx"></script>
```

### 4. Use Debug Page

**Navigate to:** `https://your-vercel-url.vercel.app/debug.html`

This page will test:
- Asset loading
- Environment detection
- Network connectivity

## Common Causes & Fixes

### Cause 1: Vercel Serving Source Files

**Symptom:** Network tab shows `/src/main.tsx` instead of `/assets/index-[hash].js`

**Fix:** 
1. Go to Vercel Dashboard → Project → Settings → General
2. Verify:
   - **Output Directory:** `dist`
   - **Build Command:** `npm install --legacy-peer-deps --no-audit --no-fund && npm run build`
   - **Framework Preset:** Vite (or leave blank)

### Cause 2: Auth Never Initializes

**Symptom:** Console shows `[App] Auth initialization timeout` but still white screen

**Fix:** Already implemented - 3 second timeout forces login page. If still stuck, check:
- `usePersistentAuth` hook is completing
- No errors in license validation
- localStorage is accessible

### Cause 3: Module Loading Error

**Symptom:** Console shows `can't access property "exports"` error

**Fix:** Already implemented - improved chunk splitting and error handling. If persists:
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check if chunks are loading in Network tab

### Cause 4: CSS Not Loading

**Symptom:** Page loads but is completely black/white (no styles)

**Fix:** 
- Check Network tab for CSS file 404s
- Verify `index.css` is imported in `main.tsx`
- Check if Tailwind is building correctly

## Verification Checklist

After deploying, verify:

- [ ] Build completes successfully (check Vercel logs)
- [ ] `dist/index.html` exists with correct script tags
- [ ] Browser console shows `[main.tsx] STARTING RENDER`
- [ ] Network tab shows JS/CSS files loading (200 status)
- [ ] No 404 errors on assets
- [ ] `/debug.html` page loads and shows tests

## Next Steps if Still White Screen

1. **Share Console Output:**
   - Copy all console logs (especially first red error)
   - Share Network tab showing which files are loading/failing

2. **Share Build Logs:**
   - Vercel deployment logs
   - Any build errors or warnings

3. **Test Local Preview:**
   ```bash
   npm run build
   npm run preview
   ```
   - If local preview works → deployment issue
   - If local preview fails → code issue

## Current Configuration

✅ **vite.config.ts:**
- `base: '/'` - Correct for Vercel/Spark
- `outDir: 'dist'` - Correct output directory
- Proper chunk splitting configured

✅ **vercel.json:**
- `outputDirectory: 'dist'` - Correct
- `buildCommand` includes `--legacy-peer-deps`
- SPA rewrites configured

✅ **App.tsx:**
- Auth timeout: 3 seconds
- Always renders something (never null)
- Fallback to login page if auth fails

✅ **main.tsx:**
- Inline styles on body/root
- White screen detection
- Comprehensive error handling

## Debug Commands

```bash
# Test local production build
npm run build
npm run preview

# Check built files
ls -la dist/
cat dist/index.html

# Verify asset paths
grep -r "assets/" dist/index.html
```

