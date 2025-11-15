# Quantum Falcon Mobile App

A Flutter-based mobile application for Quantum Falcon with real-time push notifications using Firebase Cloud Messaging (FCM) and offline fallback support.

## Features

### Real-Time Notifications

The app supports real-time notifications for:

- **XP Awards**: Get notified when you earn XP (e.g., "+50 XP for completing a daily quest!")
- **Streak Reminders**: Daily reminders to maintain your XP streak (e.g., "Don't break your 7-day XP streak!")
- **Quest Resets**: Notifications when daily or weekly quests reset

### Notification System

- **Firebase Cloud Messaging (FCM)**: Push notifications when app is online
- **Local Notifications**: Automatic fallback when offline
- **User Preferences**: Full control over notification types in Settings
- **Smart Routing**: Notifications can navigate to specific screens based on type

## Setup Instructions

### Prerequisites

- Flutter SDK (3.0.0 or higher)
- Firebase account
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Firebase Setup

#### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it "quantum-falcon-mobile" (or your preferred name)
4. Follow the setup wizard

#### 2. Configure Android

1. In Firebase Console, add an Android app:
   - Package name: `com.quantumfalcon.mobile`
   - Download `google-services.json`
   - Place it in `mobile/android/app/`

2. The app is already configured with necessary dependencies in:
   - `mobile/android/build.gradle`
   - `mobile/android/app/build.gradle`
   - `mobile/android/app/src/main/AndroidManifest.xml`

3. Update notification icon (optional):
   - Replace `mobile/android/app/src/main/res/drawable/ic_notification.png`

#### 3. Configure iOS

1. In Firebase Console, add an iOS app:
   - Bundle ID: `com.quantumfalcon.mobile`
   - Download `GoogleService-Info.plist`
   - Place it in `mobile/ios/Runner/`

2. Enable Push Notifications capability in Xcode:
   - Open `mobile/ios/Runner.xcworkspace` in Xcode
   - Select Runner target → Signing & Capabilities
   - Click "+ Capability" → Push Notifications
   - Click "+ Capability" → Background Modes
   - Enable "Remote notifications"

3. Upload APNs Authentication Key to Firebase:
   - In Apple Developer Portal, create an APNs Auth Key
   - Download the `.p8` file
   - Upload to Firebase Console → Project Settings → Cloud Messaging → APNs Authentication Key

#### 4. Update Firebase Configuration

Edit `mobile/lib/firebase_options.dart` with your Firebase credentials:

```dart
static const FirebaseOptions android = FirebaseOptions(
  apiKey: 'YOUR_ANDROID_API_KEY',
  appId: '1:YOUR_APP_ID:android:YOUR_ANDROID_ID',
  messagingSenderId: 'YOUR_SENDER_ID',
  projectId: 'your-project-id',
  storageBucket: 'your-project-id.appspot.com',
);

static const FirebaseOptions ios = FirebaseOptions(
  apiKey: 'YOUR_IOS_API_KEY',
  appId: '1:YOUR_APP_ID:ios:YOUR_IOS_ID',
  messagingSenderId: 'YOUR_SENDER_ID',
  projectId: 'your-project-id',
  storageBucket: 'your-project-id.appspot.com',
  iosBundleId: 'com.quantumfalcon.mobile',
);
```

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mhamp1/quantum-falcon-cockp.git
   cd quantum-falcon-cockp/mobile
   ```

2. **Install dependencies**:
   ```bash
   flutter pub get
   ```

3. **Run the app**:
   ```bash
   # For Android
   flutter run -d android
   
   # For iOS
   flutter run -d ios
   ```

## Architecture

### Notification Service

The `NotificationService` (`lib/services/notification_service.dart`) handles all notification logic:

- **Initialization**: Sets up FCM and local notifications
- **Permission Requests**: Asks user for notification permissions
- **FCM Listeners**: Handles foreground, background, and terminated app states
- **Local Notifications**: Fallback when offline or for scheduled notifications
- **Preferences Management**: Stores user preferences using SharedPreferences

### Notification Flow

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Backend Server                                         │
│  ↓                                                      │
│  Firebase Cloud Messaging (FCM)                         │
│  ↓                                                      │
│  ┌─────────────────────────────────────────────┐       │
│  │  App State                                  │       │
│  │  ├─ Foreground → Local Notification Display│       │
│  │  ├─ Background → System Notification        │       │
│  │  └─ Terminated → System Notification        │       │
│  └─────────────────────────────────────────────┘       │
│  ↓                                                      │
│  User Taps Notification                                 │
│  ↓                                                      │
│  App Opens → Navigate to Relevant Screen               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Offline Fallback

When the app is offline or FCM is unavailable:

1. Notifications are created locally using `flutter_local_notifications`
2. Same notification channels are used for consistency
3. User experience remains identical
4. Notifications persist even if app is closed

### Notification Types

#### 1. XP Awards
- **Trigger**: User earns XP from completing quests, trades, etc.
- **Example**: "+50 XP for completing a daily quest!"
- **Icon**: 🎉
- **Channel**: `xp_award_channel`

#### 2. Streak Reminders
- **Trigger**: Daily reminder at user's preferred time
- **Example**: "Don't break your 7-day XP streak!"
- **Icon**: 🔥
- **Channel**: `streak_reminder_channel`

#### 3. Quest Resets
- **Trigger**: When daily/weekly quests reset
- **Example**: "Your daily quests have been reset. Complete them for bonus XP!"
- **Icon**: 📋
- **Channel**: `quest_reset_channel`

## User Preferences

Users can control notifications in the Settings screen:

- **Master Toggle**: Enable/disable all notifications
- **XP Awards**: Toggle XP award notifications
- **Streak Reminders**: Toggle streak reminder notifications
- **Quest Resets**: Toggle quest reset notifications

Preferences are stored locally using `shared_preferences` and persist across app restarts.

## Testing

### Unit Tests

Run unit tests for the notification service:

```bash
flutter test test/notification_service_test.dart
```

Tests cover:
- Default preference states
- Enabling/disabling notifications
- Individual notification type toggles
- Master toggle affecting all types

### Integration Tests

Run integration tests on a device or emulator:

```bash
# Android
flutter test integration_test/notification_integration_test.dart -d android

# iOS
flutter test integration_test/notification_integration_test.dart -d ios
```

Integration tests cover:
- Full notification flows
- UI interactions
- Settings navigation
- Preference persistence
- Offline scenarios

### Manual Testing

1. **Test FCM Notifications**:
   - Use Firebase Console → Cloud Messaging → Send Test Message
   - Enter your FCM token (displayed on home screen)
   - Send notification and verify receipt

2. **Test Local Notifications**:
   - Use test buttons on home screen
   - Verify notifications appear in system tray
   - Tap notifications and verify app opens

3. **Test Offline Mode**:
   - Enable airplane mode
   - Trigger notifications using test buttons
   - Verify local notifications still work

4. **Test Settings**:
   - Toggle notification preferences
   - Trigger notifications
   - Verify only enabled types appear

## Backend Integration

### Sending Notifications from Backend

Use Firebase Admin SDK to send notifications:

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Send XP award notification
async function sendXPAwardNotification(fcmToken, xpAmount, reason) {
  const message = {
    token: fcmToken,
    notification: {
      title: '🎉 XP Awarded!',
      body: `+${xpAmount} XP for ${reason}`
    },
    data: {
      type: 'xp_award',
      xp: xpAmount.toString(),
      reason: reason
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'xp_award_channel',
        color: '#00D9FF'
      }
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1
        }
      }
    }
  };

  return admin.messaging().send(message);
}
```

### Topic-Based Notifications

Subscribe users to topics for group notifications:

```dart
// Subscribe to daily quests topic
await notificationService.subscribeToTopic('daily_quests');

// Send to all subscribed users
admin.messaging().send({
  topic: 'daily_quests',
  notification: {
    title: '📋 Quests Reset!',
    body: 'Your daily quests have been reset. Complete them for bonus XP!'
  },
  data: {
    type: 'quest_reset',
    quest_type: 'daily'
  }
});
```

## Troubleshooting

### Android Issues

**Problem**: Notifications not appearing
- **Solution**: Check that `google-services.json` is in `android/app/`
- **Solution**: Verify notification permissions are granted in device settings
- **Solution**: Check notification channel is created (Settings → Apps → Quantum Falcon → Notifications)

**Problem**: Build errors
- **Solution**: Run `flutter clean && flutter pub get`
- **Solution**: Verify Android SDK is up to date
- **Solution**: Check that google-services plugin is applied in `build.gradle`

### iOS Issues

**Problem**: Notifications not appearing
- **Solution**: Verify `GoogleService-Info.plist` is in `ios/Runner/`
- **Solution**: Check Push Notifications capability is enabled in Xcode
- **Solution**: Verify APNs key is uploaded to Firebase Console
- **Solution**: Test on physical device (push notifications don't work in simulator)

**Problem**: Build errors
- **Solution**: Run `cd ios && pod install && cd ..`
- **Solution**: Open `ios/Runner.xcworkspace` (not .xcodeproj) in Xcode
- **Solution**: Update CocoaPods: `sudo gem install cocoapods`

### General Issues

**Problem**: FCM token is null
- **Solution**: Ensure Firebase is initialized before calling `getFCMToken()`
- **Solution**: Check internet connectivity
- **Solution**: Verify Firebase configuration is correct

**Problem**: Notifications work in foreground but not background
- **Solution**: Ensure background message handler is registered
- **Solution**: On iOS, verify Background Modes capability is enabled
- **Solution**: Check that notification data includes all required fields

## Project Structure

```
mobile/
├── android/                    # Android-specific configuration
│   ├── app/
│   │   ├── build.gradle       # Android build configuration with FCM
│   │   ├── google-services.json.example  # Template for Firebase config
│   │   └── src/main/
│   │       ├── AndroidManifest.xml       # Permissions and services
│   │       ├── kotlin/com/quantumfalcon/mobile/
│   │       │   └── MainActivity.kt
│   │       └── res/
│   │           └── values/
│   │               └── colors.xml         # Notification colors
│   └── build.gradle           # Root build configuration
├── ios/                       # iOS-specific configuration
│   └── Runner/
│       ├── Info.plist         # iOS app configuration
│       ├── AppDelegate.swift  # FCM initialization
│       └── GoogleService-Info.plist.example  # Template for Firebase config
├── lib/                       # Dart source code
│   ├── main.dart             # App entry point
│   ├── firebase_options.dart # Firebase configuration
│   ├── services/
│   │   └── notification_service.dart     # Notification logic
│   └── screens/
│       ├── home_screen.dart              # Main screen with test buttons
│       └── settings_screen.dart          # Notification preferences
├── test/                      # Unit tests
│   └── notification_service_test.dart
├── integration_test/          # Integration tests
│   └── notification_integration_test.dart
├── pubspec.yaml              # Flutter dependencies
└── README.md                 # This file
```

## Dependencies

- `firebase_core`: ^2.24.2 - Firebase initialization
- `firebase_messaging`: ^14.7.9 - FCM push notifications
- `flutter_local_notifications`: ^16.3.0 - Local notification fallback
- `shared_preferences`: ^2.2.2 - Store user preferences

## Security Considerations

- **Never commit** `google-services.json` or `GoogleService-Info.plist` to version control
- Store FCM tokens securely on your backend
- Validate notification payloads on the backend before sending
- Use Firebase Security Rules to protect user data
- Implement rate limiting for notification sending
- Sanitize user input in notification content

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests: `flutter test`
6. Submit a pull request

## License

See LICENSE file in repository root.

## Support

For issues or questions:
- GitHub Issues: https://github.com/mhamp1/quantum-falcon-cockp/issues
- Documentation: See this README and inline code comments
