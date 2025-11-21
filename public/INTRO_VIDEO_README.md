# Intro Video Placeholder

This directory should contain the intro video file `intro.mp4` for the first-time user splash experience.

## Video Specifications

- **File name**: `intro.mp4`
- **Recommended format**: MP4 (H.264 codec)
- **Recommended resolution**: 1920x1080 (Full HD) or 1280x720 (HD)
- **Aspect ratio**: 16:9
- **Duration**: 10-30 seconds recommended
- **File size**: Keep under 10MB for optimal loading

## Content Suggestions

The intro video should showcase:
- Quantum Falcon branding and logo
- Key features of the trading cockpit
- AI agent capabilities
- Cyberpunk neon aesthetic
- Call to action: "Welcome to the future of trading"

## Usage

The video is displayed in the IntroSplash component:
- Auto-plays on mount (muted)
- Shows play button overlay if autoplay fails
- Poster image fallback: `/falcon-head-official.png`
- User can skip by clicking "Enter Cockpit" button or pressing ESC

## Creating the Video

Until the actual video is provided, the IntroSplash component will:
1. Show the poster image (falcon logo)
2. Display a play button overlay
3. Allow users to proceed without video

To add your video:
1. Export your video as `intro.mp4`
2. Place it in the `/public/` directory
3. The component will automatically detect and play it
