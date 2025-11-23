# Spark Configuration Checklist - CRITICAL
**Date:** November 22, 2025  
**Status:** ⚠️ ACTION REQUIRED IN SPARK UI

## ⚠️ IMPORTANT: This Must Be Done in Spark Settings

The code fixes are complete, but **Spark must be configured** to serve the built output. This cannot be done from code - it must be set in Spark's UI.

---

## Step 1: Verify Build Output (Already Done ✅)

The build is working correctly:
- ✅ `dist/index.html` exists with compiled script: `/assets/index-[hash].js`
- ✅ All chunks generated in `dist/assets/`
- ✅ `EnhancedDashboard-aUUlPolN.js` generated (new hash)
- ✅ Build successful: 13,533 modules transformed

---

## Step 2: Configure Spark Settings (DO THIS NOW)

Open Spark's **"Assets"** or **"Site Settings"** or **"Build & Deploy"** panel and set:

### Required Settings:

1. **Build Command:**
   ```
   npm install && npm run build
   ```

2. **Publish Directory / Output Directory:**
   ```
   dist
   ```
   ⚠️ **CRITICAL:** Must be `dist`, NOT root directory

3. **Entry HTML / Index File:**
   ```
   dist/index.html
   ```
   ⚠️ **CRITICAL:** Must be `dist/index.html`, NOT `index.html`

4. **Base Path (if applicable):**
   ```
   / (root)
   ```

---

## Step 3: Verify What Spark Is Serving

After configuring Spark and triggering a rebuild:

### In Spark Preview DevTools:

1. **Network Tab** → Filter by **Doc**
2. Click the loaded HTML file
3. Check the **Response** tab

### ✅ CORRECT (What You Should See):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quantum Falcon Cockpit</title>
    <link rel="icon" type="image/x-icon" href="/kraken.ico">
    <script type="module" crossorigin src="/assets/index-Btmqsbpk.js"></script>
    <link rel="modulepreload" crossorigin href="/assets/vendor-solana-BNjZdpy9.js">
    <link rel="modulepreload" crossorigin href="/assets/vendor-C42q0_Tj.js">
    <link rel="modulepreload" crossorigin href="/assets/vendor-react-wgD5IoKR.js">
    <link rel="stylesheet" crossorigin href="/assets/vendor-react-DuSOMcHt.css">
    <link rel="stylesheet" crossorigin href="/assets/index-CMJ7mB64.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

**Key:** Script tag should be `/assets/index-[hash].js` (compiled JS)

### ❌ WRONG (What You're Probably Seeing Now):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quantum Falcon Cockpit</title>
    <link rel="icon" type="image/x-icon" href="/kraken.ico">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Key:** Script tag is `/src/main.tsx` (TypeScript source - won't work!)

---

## Step 4: Check Console Logs

After Spark rebuilds with correct settings:

### ✅ If Working Correctly:

You should see these logs in console:
```
[main.tsx] ========== STARTING RENDER ==========
[main.tsx] Root element: [object HTMLDivElement]
[main.tsx] Window available: true
[main.tsx] Attempting to render app...
[App] ========== APP COMPONENT RENDERING ==========
[App] Window available: true
[App] Document available: true
[main.tsx] ========== RENDER CALLED SUCCESSFULLY ==========
[main.tsx] Root element content length: [some number > 0]
```

### ❌ If Still Broken:

- **No logs at all** → Spark is serving source HTML, not built
- **`[main.tsx] Root element content length: 0`** → Runtime error (check first red error)

---

## Step 5: Network Tab Verification

Check Network tab for JS files:

### ✅ CORRECT:
- `/assets/index-[hash].js` → Status 200
- `/assets/EnhancedDashboard-[hash].js` → Status 200
- All assets loading from `/assets/` directory

### ❌ WRONG:
- `/src/main.tsx` → Status 404 or served as text/plain
- No JS files loading
- 404 errors on asset files

---

## Troubleshooting

### If Spark Doesn't Have These Settings:

Some Spark configurations may not expose all settings. In that case:

1. **Check if Spark auto-detects Vite:**
   - Spark's Vite plugin should auto-detect `vite.config.ts`
   - It should automatically use `dist/` as output

2. **Verify Spark is running build:**
   - Check Spark's build logs
   - Should see: `✓ built in [time]`
   - Should see: `dist/index.html` created

3. **Manual workaround (if needed):**
   - If Spark can't be configured, you may need to:
     - Copy `dist/index.html` to root as `index.html` (temporary)
     - Or configure a redirect from root to `dist/`

---

## What to Report Back

After configuring Spark and rebuilding, please share:

1. **HTML Source** (from Network → Doc → Response):
   - Does it have `/assets/index-[hash].js` or `/src/main.tsx`?

2. **Console Logs:**
   - Do you see `[main.tsx] ========== STARTING RENDER ==========`?
   - What's the first red error (if any)?

3. **Network Status:**
   - Are JS files loading from `/assets/`?
   - Any 404 errors?

With that, I can pinpoint the exact issue.

---

## Summary

✅ **Code is fixed** - Build works, chunks generated correctly  
⚠️ **Spark must be configured** - Set publish directory to `dist`  
🔍 **Verify in DevTools** - Check HTML source and console logs  

**The fix is in the code. The configuration is in Spark's UI.**

