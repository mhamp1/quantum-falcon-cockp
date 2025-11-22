# Falcon Head Image Instructions

## CRITICAL: Manual Image Placement Required

The Support & Onboarding page (`/src/pages/SupportOnboarding.tsx`) is configured to display the **official Quantum Falcon logo** from the user's screenshot.

### Image Requirements

**Source:** The exact falcon head image from the user's screenshot showing:
- Glowing pink/magenta eye
- Lightning bolt accent
- Sharp purple and cyan feathers
- Cyberpunk/neon aesthetic

### Installation Steps

1. **Create the public directory** (if it doesn't exist):
   ```bash
   mkdir -p /workspaces/spark-template/public
   ```

2. **Save the falcon head image** as:
   ```
   /workspaces/spark-template/public/falcon-head-official.png
   ```

3. **Image specifications:**
   - Format: PNG with transparent background preferred
   - Minimum size: 512x512px
   - Recommended: 1024x1024px or higher for sharp display
   - File name: MUST be exactly `falcon-head-official.png`

### Current Behavior

- If the image is **found**: Displays with pulsing animation and purple glow
- If the image is **missing**: Hidden with console warning, page still functional

### Visual Effects Applied

The image will automatically receive:
- Subtle scale pulse animation (1.0 → 1.03 → 1.0) over 4 seconds
- Purple drop-shadow glow effect
- Responsive sizing (96x96 on desktop, 64x64 on mobile)
- Smooth infinite loop animation

### Testing

After placing the image, verify:
1. Navigate to Support & Onboarding page
2. Falcon head should be centered and glowing
3. Animation should be smooth
4. No console errors

---

**Last Updated:** November 20, 2025
**Component:** `/src/pages/SupportOnboarding.tsx`
