# 🎨 Quantum Falcon Cyberpunk Theme Guide

The Quantum Falcon mobile app features a custom-designed cyberpunk theme aligned with the Solana brand identity, featuring neon aesthetics, holographic effects, and smooth animations.

![Quantum Falcon Theme](https://github.com/user-attachments/assets/3099d157-9276-4b72-8efd-ad50b4943cb3)

## Color Palette

### Brand Colors

- **Solana Green** (`#14F195`) - Primary accent color for CTAs and highlights
- **Solana Purple** (`#9945FF`) - Secondary accent for emphasis and variety
- **Cyberpunk Dark** (`#0A0E27`) - Deep background for contrast
- **Cyberpunk Darker** (`#1A1F3A`) - Layered background for depth

### Usage in Code

```tsx
// Using Tailwind classes
<div className="bg-solana-green text-cyberpunk-dark">
  Solana Green Background
</div>

// Using CSS variables
<div style={{ color: 'var(--solana-green)' }}>
  Neon Green Text
</div>
```

## Visual Effects

### Neon Glow

Text and UI elements with customizable glow effects:

```tsx
// Primary glow (Solana green)
<span className="text-primary neon-glow-primary">QUANTUM</span>

// Secondary glow (Solana purple)
<span className="text-secondary neon-glow-secondary">FALCON</span>

// Accent glow
<div className="neon-glow-accent">Glowing element</div>
```

### Holographic Effects

Cards with gradient borders and layered shadows:

```css
.holographic-glow {
  box-shadow: 
    inset 0 1px 0 oklch(0.72 0.20 195 / 0.15),
    0 0 20px oklch(0.72 0.20 195 / 0.2),
    0 0 40px oklch(0.72 0.20 195 / 0.1);
}
```

### Pulse Animations

Smooth, cyclic animations for interactive elements:

```tsx
// Brightness pulse
<div className="animate-pulse-glow">Pulsing element</div>

// Opacity pulse
<div className="animate-pulse-slow">Slow pulse</div>

// Neon flicker
<div className="animate-neon-flicker">Flickering neon</div>

// Shimmer effect
<div className="animate-shimmer bg-gradient-to-r from-primary to-secondary">
  Shimmering gradient
</div>
```

## Theme Components

### HolographicCard

Reusable card component with neon borders and holographic effects.

```tsx
import { 
  HolographicCard, 
  HolographicCardHeader, 
  HolographicCardTitle,
  HolographicCardDescription,
  HolographicCardContent 
} from '@/components/ui/holographic-card'

<HolographicCard variant="primary" glow pulse>
  <HolographicCardHeader>
    <HolographicCardTitle>Dashboard Stats</HolographicCardTitle>
    <HolographicCardDescription>Real-time metrics</HolographicCardDescription>
  </HolographicCardHeader>
  <HolographicCardContent>
    <p>Your stats here...</p>
  </HolographicCardContent>
</HolographicCard>
```

**Props:**
- `variant`: `"primary" | "secondary" | "accent"` - Color scheme (default: "primary")
- `glow`: `boolean` - Enable neon glow effect (default: true)
- `pulse`: `boolean` - Enable pulse animation (default: false)

**Variants:**
- `primary` - Solana green border with matching glow
- `secondary` - Solana purple border with matching glow
- `accent` - Enhanced green glow with special effects

### NeonProgress

Animated progress bar with shimmer effects for XP tracking.

```tsx
import { NeonProgress } from '@/components/ui/neon-progress'

<NeonProgress 
  value={750} 
  max={1000} 
  variant="accent"
  showLabel
  label="XP Progress to Level 8"
  animate
/>
```

**Props:**
- `value`: `number` - Current progress value
- `max`: `number` - Maximum value (default: 100)
- `variant`: `"primary" | "secondary" | "accent"` - Color scheme
- `showLabel`: `boolean` - Show label and percentage (default: false)
- `label`: `string` - Label text (optional)
- `animate`: `boolean` - Enable smooth transitions and shimmer (default: true)

**Variants:**
- `primary` - Solid Solana green fill
- `secondary` - Solid Solana purple fill
- `accent` - Gradient from green to purple

### NeonBadge

Status badges with jagged corners and glow effects.

```tsx
import { NeonBadge } from '@/components/ui/neon-badge'

<NeonBadge variant="primary" glow pulse>
  <Star size={12} weight="fill" />
  <span>Elite Trader</span>
</NeonBadge>
```

**Props:**
- `variant`: `"primary" | "secondary" | "accent" | "success" | "warning"` - Badge style
- `glow`: `boolean` - Enable neon glow (default: true)
- `pulse`: `boolean` - Enable pulse animation (default: false)

**Variants:**
- `primary` - Solana green
- `secondary` - Solana purple
- `accent` - Gradient (green to purple)
- `success` - Standard green (achievements, verified)
- `warning` - Amber (alerts, pending)

### NeonToast

Notification toast with themed variants for different message types.

```tsx
import { NeonToast } from '@/components/ui/neon-toast'

<NeonToast 
  variant="success"
  title="Trade Executed Successfully"
  description="Your order was filled at market price. +50 XP earned!"
/>
```

**Props:**
- `variant`: `"success" | "warning" | "info" | "error"` - Toast type
- `title`: `string` - Toast title (optional)
- `description`: `string` - Toast description (optional)
- `icon`: `ReactNode` - Custom icon (optional, uses default if not provided)

**Variants:**
- `success` - Green border, checkmark icon
- `info` - Purple border, info icon
- `warning` - Amber border, warning icon
- `error` - Red border, error icon

## Customizing the Theme

### Modifying Colors

Edit `src/index.css` to customize the color palette:

```css
:root {
  /* Update Solana colors */
  --solana-green: #14F195;
  --solana-purple: #9945FF;
  
  /* Update cyberpunk backgrounds */
  --cyberpunk-dark: #0A0E27;
  --cyberpunk-darker: #1A1F3A;
  
  /* Map to primary/secondary using OKLCH color space */
  --primary: oklch(0.72 0.20 195); /* Matches Solana green */
  --secondary: oklch(0.68 0.18 330); /* Matches Solana purple */
}
```

### Adding Custom Animations

The theme includes several animation utilities. Add your own in `tailwind.config.js`:

```js
extend: {
  animation: {
    "custom-pulse": "custom-pulse 3s ease-in-out infinite",
  },
  keyframes: {
    "custom-pulse": {
      "0%, 100%": { 
        opacity: "1",
        transform: "scale(1)" 
      },
      "50%": { 
        opacity: "0.8",
        transform: "scale(1.05)" 
      },
    },
  },
}
```

Then use it:

```tsx
<div className="animate-custom-pulse">Custom animation</div>
```

### Custom Glow Effects

Create custom glow classes in `src/index.css`:

```css
.my-custom-glow {
  text-shadow: 
    0 0 2px #YOUR_COLOR,
    0 0 4px #YOUR_COLOR,
    0 0 6px #YOUR_COLOR;
}

.my-custom-box-glow {
  box-shadow: 
    0 0 10px #YOUR_COLOR,
    0 0 20px #YOUR_COLOR,
    0 0 40px rgba(YOUR_COLOR, 0.5);
}
```

### Custom Card Variants

Extend the HolographicCard with custom variants:

```tsx
// In your component
<HolographicCard 
  className="border-l-amber-500 shadow-[0_0_20px_#fbbf24]"
  glow={false}
>
  <HolographicCardContent>
    Custom amber variant
  </HolographicCardContent>
</HolographicCard>
```

## Animation Reference

### Available Animations

| Animation | Duration | Effect | Use Case |
|-----------|----------|--------|----------|
| `animate-pulse-glow` | 2s | Brightness pulse | Status indicators, badges |
| `animate-pulse-slow` | 3s | Opacity pulse | Background elements |
| `animate-shimmer` | 2s | Sliding gradient | Progress bars, loading |
| `animate-neon-flicker` | 1.5s | Subtle flicker | Neon text, signs |

### Timing Functions

All animations use smooth easing functions:
- `ease-in-out` - Standard smooth transitions
- `cubic-bezier(0.4, 0, 0.6, 1)` - Custom smooth curve
- `linear` - Constant speed (shimmer effects)

## Responsive Behavior

All theme components are fully responsive:

### Breakpoints

```js
// Mobile first approach
sm: '640px',   // Small tablets
md: '768px',   // Tablets (bottom nav switches to sidebar)
lg: '1024px',  // Desktop
xl: '1280px',  // Large desktop
```

### Mobile Optimizations

- Touch-friendly hit areas (minimum 44x44px)
- Bottom navigation for easy thumb access
- Reduced animation complexity on mobile
- Optimized glow effects for performance

### Component Responsiveness

```tsx
// Cards stack on mobile, grid on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <HolographicCard>Card 1</HolographicCard>
  <HolographicCard>Card 2</HolographicCard>
  <HolographicCard>Card 3</HolographicCard>
</div>

// Text sizes adapt
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

## Performance Considerations

### GPU Acceleration

All animations use GPU-accelerated properties:
```css
/* Good - GPU accelerated */
transform: translateX(10px);
opacity: 0.5;

/* Avoid - CPU intensive */
left: 10px;
width: 100px;
```

### Reducing Motion

Respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

### Glow Performance

Use CSS custom properties for dynamic glows:

```tsx
// Efficient - CSS variable
style={{ '--glow-color': dynamicColor }}

// Less efficient - inline style recalculation
style={{ boxShadow: `0 0 20px ${dynamicColor}` }}
```

## Best Practices

### Color Contrast

Ensure sufficient contrast for accessibility:
- Primary text: 12:1 contrast ratio (green on dark)
- Secondary text: 7:1 contrast ratio (purple on dark)
- Muted text: 4.5:1 minimum

### Animation Duration

Follow these guidelines:
- Micro-interactions: 100-200ms
- Component transitions: 200-500ms
- Page transitions: 300-800ms
- Ambient animations: 2-4s loops

### Glow Intensity

Use appropriate glow levels:
- Subtle: 10-15px blur
- Medium: 20-30px blur (default)
- Intense: 40-60px blur (special effects only)

## Examples

### Hero Section

```tsx
<div className="relative min-h-screen bg-gradient-to-br from-cyberpunk-dark via-cyberpunk-darker to-cyberpunk-dark">
  <div className="absolute inset-0 technical-grid opacity-10" />
  <div className="relative z-10 p-8">
    <h1 className="text-6xl font-bold uppercase tracking-[0.15em] mb-4">
      <span className="text-primary neon-glow-primary">QUANTUM</span>
      {' '}
      <span className="text-secondary neon-glow-secondary">FALCON</span>
    </h1>
    <p className="text-muted-foreground uppercase tracking-wide">
      AI-Powered Trading Cockpit
    </p>
  </div>
</div>
```

### Stats Card

```tsx
<HolographicCard variant="primary" glow>
  <HolographicCardHeader>
    <div className="flex items-center justify-between">
      <HolographicCardTitle>Portfolio Value</HolographicCardTitle>
      <NeonBadge variant="success" glow pulse>
        +12.5%
      </NeonBadge>
    </div>
  </HolographicCardHeader>
  <HolographicCardContent>
    <div className="text-4xl font-bold text-primary neon-glow-primary mb-4">
      $127,450.89
    </div>
    <NeonProgress value={75} max={100} variant="accent" animate />
  </HolographicCardContent>
</HolographicCard>
```

### Interactive Button

```tsx
<button className="neon-button px-6 py-3 rounded text-sm font-bold uppercase tracking-wide">
  <Lightning size={16} className="inline mr-2" />
  Execute Trade
</button>
```

## Resources

- [Solana Brand Guidelines](https://solana.com/branding)
- [OKLCH Color Picker](https://oklch.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Cyberpunk Design Inspiration](https://dribbble.com/tags/cyberpunk)

## Support

For questions or issues with the theme:
1. Check this guide first
2. Review existing components in `src/components/ui/`
3. Look at the ThemeShowcase component for examples
4. Open an issue on GitHub with the `theme` label
