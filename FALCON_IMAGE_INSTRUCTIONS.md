# CRITICAL: Add Official Falcon Head Image

## The Issue
The Support & Onboarding page is currently using a generic SVG falcon instead of the **EXACT, OFFICIAL** neon falcon head from your screenshot (the beautiful one with the glowing pink eye, sharp purple-cyan feathers, and lightning bolt).

## What You Need to Do

### Step 1: Get the Exact Image
You need the **exact falcon head image** that's circled in your screenshot - the one that looks like this:
- Glowing pink/magenta eye in the center
- Sharp angular purple and cyan feathers
- Lightning bolt accent on the head
- Dark background with neon glow effects

This image should be from:
- Your original design files
- The Quantum Falcon repository
- Extracted from the reference screenshot you have

### Step 2: Save It Here
Save the image file as:
```
/workspaces/spark-template/public/falcon-head-official.png
```

**Requirements:**
- Format: PNG (with transparent background if possible)
- Size: At least 800x800px (high resolution)
- File name: EXACTLY `falcon-head-official.png`

### Step 3: Verify It's There
After saving, the file should be at:
```
/workspaces/spark-template/public/falcon-head-official.png
```

## What I've Already Done

I've updated `/workspaces/spark-template/src/pages/SupportOnboarding.tsx` to:
- Use `<img src="/falcon-head-official.png" />` instead of the generic SVG
- Add subtle pulse animation (scale 1 → 1.03 → 1 over 4s)
- Add faint purple glow (drop-shadow 0 0 40px #9945FF)
- Responsive sizing (w-96 h-96 desktop, w-64 h-64 mobile)
- Perfect centering

## Result After You Add the Image

Once you place the correct image at `/workspaces/spark-template/public/falcon-head-official.png`, the Support & Onboarding page will display:
- ✅ The EXACT falcon head from your screenshot
- ✅ Subtle breathing pulse animation
- ✅ Purple/pink neon glow
- ✅ Perfect centering
- ✅ Mobile responsive

## Why I Can't Do This for You

I cannot directly extract or save images from screenshots - I can only work with text files and code. You need to provide the actual image file from your original source.

## Next Steps

1. Locate the official falcon head image from your design files or repo
2. Save it as `public/falcon-head-official.png`
3. Refresh the app - the Support page will now show the correct image

---

**The code is ready. Just add the image file and it will work perfectly.**
