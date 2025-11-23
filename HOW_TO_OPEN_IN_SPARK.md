# How to Open Quantum Falcon in GitHub Copilot Spark

## Quick Answer

**Option 1: From GitHub Repository (Recommended)**

1. Go to your repository: `https://github.com/mhamp1/quantum-falcon-cockp`
2. Click the **"Code"** button (green button, top right)
3. Look for **"Open with Copilot"** or **"Open in Workbench"** button
4. Click it → Spark will open your project automatically

**Option 2: From GitHub Copilot Dashboard**

1. Go to [GitHub Copilot](https://github.com/copilot)
2. Click **"Workbench"** or **"Spaces"** in the sidebar
3. Find your project: **"quantum-falcon-cockp"** or **"spark-template"**
4. Click **"Open"** or **"Start"** if it's stopped
5. Use the **"Preview"** button (not the raw port URL)

---

## What Spark Does Automatically

When you open the project in Spark:

1. **Auto-detects Vite**: Spark sees `vite.config.ts` and `spark.meta.json`
2. **Runs dev server**: Automatically runs `npm run dev` on port 5000
3. **Provides preview**: Shows preview panel with your app
4. **Handles KV storage**: Provides `window.spark.kv` for data persistence
5. **Manages build**: Can build and serve from `dist/` automatically

---

## Current Configuration

Your project is already configured for Spark:

✅ **spark.meta.json** - Identifies as Spark project  
✅ **@github/spark** package - Spark runtime integration  
✅ **sparkPlugin()** in vite.config.ts - Spark Vite plugin  
✅ **SPARK_DIR** environment variable - Correct path handling  

---

## If You See White Screen in Spark

### Step 1: Check Spark Preview (Not Port URL)

- **DON'T** use: `https://...-5000.app.github.dev/`
- **DO** use: Spark's built-in **"Preview"** panel/button

### Step 2: Verify Spark is Serving Built Files

1. In Spark, look for **"Build"** or **"Deploy"** settings
2. Ensure:
   - **Build command**: `npm install && npm run build`
   - **Output directory**: `dist`
   - **Entry point**: `dist/index.html`

### Step 3: Check Console Logs

Open DevTools in Spark preview and look for:
- `[main.tsx] ========== STARTING RENDER ==========`
- `[App] ========== APP COMPONENT RENDERING ==========`
- Pink debug banner at top of page

---

## Troubleshooting

### "Can't find project in Spark"

1. Make sure you're logged into GitHub
2. Go to repository → Click "Code" → "Open with Copilot"
3. If it doesn't appear, Spark may need to index it (wait a few minutes)

### "Preview shows white screen"

1. Check Spark's build logs (should see `✓ built in [time]`)
2. Verify `dist/index.html` exists after build
3. Check console for first red error
4. Ensure Spark is serving from `dist/`, not root

### "Port 5000 URL works but Spark preview doesn't"

- Spark preview uses built files from `dist/`
- Port 5000 uses dev server (source files)
- Make sure Spark runs `npm run build` first

---

## Quick Test

After opening in Spark:

1. **Look for pink debug banner** at top → React is working ✅
2. **Check console** for `[App] RENDERING` logs → App is mounting ✅
3. **If white screen** → Check first console error and share it

---

## Summary

**To open in Spark:**
1. Repository → "Code" → "Open with Copilot"
2. OR: Copilot Dashboard → Workbench → Find project → Open
3. Use Spark's **Preview** button (not port URL)

**Your app is Spark-ready** - all configuration is correct!

