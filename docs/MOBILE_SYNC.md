# Quantum Falcon Mobile Sync Guide

## Overview

Quantum Falcon supports mobile access through:
1. **PWA (Progressive Web App)** - Installable on iOS/Android
2. **Native App** - Coming soon (React Native / Flutter)

---

## PWA Installation

### iOS (Safari)

1. Open `https://quantumfalcon.io` in Safari
2. Tap the **Share** button (box with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Name it "Quantum Falcon" and tap **Add**
5. Open from home screen for full-screen experience

### Android (Chrome)

1. Open `https://quantumfalcon.io` in Chrome
2. Tap the **three-dot menu** (⋮)
3. Tap **"Add to Home screen"** or **"Install app"**
4. Confirm installation
5. Open from home screen

---

## Account Sync

Your Quantum Falcon account syncs across all devices automatically:

### What Syncs
- ✅ License & subscription tier
- ✅ XP progress & achievements
- ✅ Strategy configurations
- ✅ Trade history
- ✅ Settings & preferences
- ✅ Quest progress

### What's Device-Local
- 🔒 Master key (stored per device)
- 📱 Theme preferences
- 🔔 Notification settings
- 🎵 Sound/haptic preferences

---

## Multi-Device Login

### Same Account, Multiple Devices

1. Log in with your license key on each device
2. Account data syncs automatically
3. Trade history updates in real-time
4. Strategies deploy to all devices

### Device Management

Go to **Settings → Security → Device Management** to:
- View all logged-in devices
- Remove unrecognized devices
- Set primary device for notifications

---

## Mobile-Specific Features

### Touch Optimizations
- **44px minimum touch targets** for all buttons
- **Swipe gestures** for navigation
- **Pull-to-refresh** on data views
- **Haptic feedback** on actions (configurable)

### Mobile Bottom Navigation
- Quick access to main tabs
- Always visible, never covered by overlays
- Tour card positioned above nav bar

### Offline Support
- View cached dashboard data offline
- Queue trades for execution when online
- Offline indicator in header

---

## API Integration for Mobile Apps

### Authentication

```dart
// Flutter example
final response = await http.post(
  Uri.parse('https://api.quantumfalcon.io/v1/auth/login'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'licenseKey': userLicenseKey,
    'deviceId': await getDeviceId(),
  }),
);
```

### WebSocket Connection

```dart
// Flutter WebSocket
final channel = WebSocketChannel.connect(
  Uri.parse('wss://api.quantumfalcon.io/ws'),
);

channel.sink.add(jsonEncode({
  'type': 'subscribe',
  'channels': ['market', 'trades', 'alerts'],
  'token': authToken,
}));

channel.stream.listen((message) {
  final data = jsonDecode(message);
  handleMessage(data);
});
```

### Push Notifications

```dart
// Firebase Cloud Messaging setup
await FirebaseMessaging.instance.subscribeToTopic('trade-alerts');
await FirebaseMessaging.instance.subscribeToTopic('price-alerts');

FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  showLocalNotification(message);
});
```

---

## Mobile App Roadmap

### Phase 1: PWA Enhancement (Current)
- ✅ Installable PWA
- ✅ Responsive design
- ✅ Touch optimizations
- ✅ Offline support

### Phase 2: React Native App (Q1 2026)
- Native performance
- Push notifications
- Biometric authentication
- Widget support

### Phase 3: Flutter App (Q2 2026)
- Cross-platform codebase
- Advanced charting
- Background trading
- Apple Watch / Wear OS

---

## Troubleshooting

### PWA Not Installing

**iOS:**
- Ensure using Safari (not Chrome)
- Check iOS 11.3+ 
- Clear Safari cache

**Android:**
- Update Chrome to latest
- Clear app data if stuck
- Check storage space

### Sync Issues

1. **Force refresh**: Pull down on dashboard
2. **Re-login**: Settings → Logout → Login
3. **Clear cache**: Settings → Advanced → Clear Cache
4. **Check connection**: Ensure stable internet

### Performance Issues

- **Reduce animations**: Settings → Theme → Animations Off
- **Disable glass effect**: Settings → Theme → Glass Effect Off
- **Clear old data**: Settings → Advanced → Clear History

---

## Contact Support

For mobile-specific issues:
- Email: mobile@quantumfalcon.io
- Discord: #mobile-support channel
- In-app: Support → Contact Form

