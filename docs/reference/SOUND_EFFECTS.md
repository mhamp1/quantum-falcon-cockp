# Sound Effects System

Subtle, professional sound effects integrated throughout the Quantum Falcon Cockpit.

## Features

- **Subtle & Professional**: Bloomberg Terminal / TradingView Pro quality
- **Web Audio API**: Pure synthesis, no audio files needed
- **Low Volume**: Maximum 0.08 gain (8% volume) - designed for 12-hour sessions
- **User Control**: Mute toggle in Settings > Preferences > Audio
- **Automatic Integration**: Built into all UI components

## Sound Types

### Navigation
- **Tab Switch**: Rising tone (600Hz → 900Hz, 80ms)
- **Hover**: Quick ping (1200Hz, 30ms) - extremely subtle

### Interactions
- **Click**: Brief tone (800Hz, 50ms)
- **Toggle/Checkbox**: Medium tone (880Hz, 60ms)
- **Slider Change**: Soft tone (700Hz, 20ms) - only on change, not drag

### Feedback
- **Success**: Two-tone chime (523Hz + 659Hz, 150ms)
- **Error**: Low buzz (200Hz sawtooth, 120ms)
- **Notification**: Quick rising tone (1000Hz → 1200Hz, 100ms)

### Trading Actions
- **Trade Execution**: Ascending tone (440Hz → 550Hz, 150ms)
- **Data Refresh**: High ping (1500Hz, 40ms)

## Usage

### In Components

```tsx
import { soundEffects } from '@/lib/soundEffects';

// Manual trigger
soundEffects.playClick();
soundEffects.playSuccess();
soundEffects.playError();
```

### Built-In Components

These components automatically play sounds:
- `Button` - plays click sound
- `Switch` - plays toggle sound
- `Checkbox` - plays toggle sound
- Toast notifications - plays success/error/notification sounds

### Tab Navigation

Sound effects are automatically wired into:
- Sidebar navigation
- Mobile bottom nav
- Aggression control panel

## User Control

Users can disable sound effects:
1. Navigate to **Settings** tab
2. Select **Preferences** section
3. Toggle **Sound Effects** switch

The setting is persisted in localStorage and KV storage.

## Technical Details

- **Library**: Web Audio API (native browser)
- **Synthesis**: Pure oscillators (sine, triangle, sawtooth)
- **Volume Range**: 0.015 - 0.08 (1.5% - 8%)
- **Duration Range**: 20ms - 200ms
- **No Dependencies**: No external audio libraries needed
- **Performance**: Zero network requests, instant playback
- **Compatibility**: Works in all modern browsers

## Design Philosophy

Sounds should be **felt, not heard**. They provide tactile feedback without being intrusive during long trading sessions. The volume and duration are carefully calibrated to avoid fatigue.
