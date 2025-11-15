# Notification Architecture

This document describes the architecture and implementation details of the notification system in the Quantum Falcon mobile app.

## System Overview

The notification system is built on three key components:

1. **Firebase Cloud Messaging (FCM)**: Primary push notification delivery
2. **Flutter Local Notifications**: Offline fallback and local notification handling
3. **Shared Preferences**: User preference storage

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Backend Server                        │
│  - Game Logic (XP awards, streak tracking, quest resets)   │
│  - Firebase Admin SDK                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (HTTP/HTTPS)
┌─────────────────────────────────────────────────────────────┐
│              Firebase Cloud Messaging (FCM)                 │
│  - Message routing                                          │
│  - Token management                                         │
│  - Topic subscriptions                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (Push via APNs/FCM SDK)
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Application                       │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           NotificationService (Singleton)             │ │
│  │                                                       │ │
│  │  ┌─────────────────┐      ┌─────────────────┐       │ │
│  │  │ FCM Handler     │      │ Local Handler   │       │ │
│  │  │ - Foreground    │      │ - Offline mode  │       │ │
│  │  │ - Background    │      │ - Scheduled     │       │ │
│  │  │ - Terminated    │      │ - Fallback      │       │ │
│  │  └────────┬────────┘      └────────┬────────┘       │ │
│  │           │                        │                │ │
│  │           └───────┬────────────────┘                │ │
│  │                   ↓                                 │ │
│  │      ┌────────────────────────────┐                │ │
│  │      │  Preference Manager        │                │ │
│  │      │  (SharedPreferences)       │                │ │
│  │      └────────────────────────────┘                │ │
│  │                   ↓                                 │ │
│  │      ┌────────────────────────────┐                │ │
│  │      │  Notification Display       │                │ │
│  │      │  - System tray              │                │ │
│  │      │  - Sound/vibration          │                │ │
│  │      │  - Navigation on tap        │                │ │
│  │      └────────────────────────────┘                │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. NotificationService

**Location**: `lib/services/notification_service.dart`

**Responsibilities**:
- Initialize FCM and local notifications
- Handle incoming notifications from FCM
- Create and display local notifications
- Manage user preferences
- Handle notification taps and routing

**Key Methods**:

```dart
// Initialization
Future<void> initialize()

// FCM
Future<String?> getFCMToken()
Future<void> subscribeToTopic(String topic)
Future<void> unsubscribeFromTopic(String topic)

// Display Notifications
Future<void> showXPAwardNotification({required int xpAmount, required String reason})
Future<void> showStreakReminderNotification({required int streakDays})
Future<void> showQuestResetNotification({required String questType})

// Preferences
Future<bool> areNotificationsEnabled()
Future<void> setNotificationsEnabled(bool enabled)
Future<bool> isXPAwardsEnabled()
Future<void> setXPAwardsEnabled(bool enabled)
Future<bool> isStreakRemindersEnabled()
Future<void> setStreakRemindersEnabled(bool enabled)
Future<bool> isQuestResetsEnabled()
Future<void> setQuestResetsEnabled(bool enabled)
```

### 2. Firebase Cloud Messaging

**Configuration Files**:
- Android: `android/app/google-services.json`
- iOS: `ios/Runner/GoogleService-Info.plist`
- Dart: `lib/firebase_options.dart`

**Message Flow**:

1. **Foreground**: App is open and visible
   - FCM delivers message to `FirebaseMessaging.onMessage` listener
   - App creates local notification for display
   - User sees notification in system tray
   - Tapping opens app and navigates to relevant screen

2. **Background**: App is in background (not terminated)
   - FCM delivers message directly to system
   - System displays notification automatically
   - Tapping triggers `FirebaseMessaging.onMessageOpenedApp` listener
   - App opens and navigates to relevant screen

3. **Terminated**: App is closed
   - FCM delivers message directly to system
   - System displays notification automatically
   - Tapping launches app
   - App calls `FirebaseMessaging.getInitialMessage()` to get notification data
   - App navigates to relevant screen

### 3. Local Notifications

**Purpose**: Offline fallback and locally-triggered notifications

**Plugin**: `flutter_local_notifications`

**Channels**:
- `xp_award_channel`: XP award notifications (green)
- `streak_reminder_channel`: Streak reminders (orange)
- `quest_reset_channel`: Quest resets (blue)
- `default_channel`: Fallback for uncategorized notifications

**Platform-Specific Configuration**:

Android:
- Uses notification channels (required for Android 8.0+)
- Custom icons and colors
- Sound and vibration patterns
- Priority levels (high for important notifications)

iOS:
- Uses UNUserNotificationCenter
- Badge updates
- Sound and haptics
- Notification categories

### 4. User Preferences

**Storage**: `SharedPreferences` (key-value store)

**Preference Keys**:
- `notifications_enabled`: Master toggle
- `xp_awards_enabled`: XP award notifications
- `streak_reminders_enabled`: Streak reminder notifications
- `quest_resets_enabled`: Quest reset notifications

**Hierarchy**:
- Master toggle overrides all individual toggles
- Individual toggles work independently when master is enabled
- Preferences persist across app restarts

## Notification Types

### XP Awards

**Trigger**: User earns XP from any action
**Priority**: High
**Sound**: Default notification sound
**Example**: "+50 XP for completing a daily quest!"

**Payload Structure**:
```json
{
  "notification": {
    "title": "🎉 XP Awarded!",
    "body": "+50 XP for completing a daily quest"
  },
  "data": {
    "type": "xp_award",
    "xp": "50",
    "reason": "completing a daily quest"
  }
}
```

**Navigation**: Opens to home screen or XP/profile screen

### Streak Reminders

**Trigger**: Scheduled daily at user's preferred time
**Priority**: High
**Sound**: Default notification sound
**Example**: "Don't break your 7-day XP streak!"

**Payload Structure**:
```json
{
  "notification": {
    "title": "🔥 Keep Your Streak!",
    "body": "Don't break your 7-day XP streak!"
  },
  "data": {
    "type": "streak_reminder",
    "streak_days": "7"
  }
}
```

**Navigation**: Opens to streak/profile screen

### Quest Resets

**Trigger**: When daily/weekly quests reset (scheduled)
**Priority**: Medium
**Sound**: Default notification sound
**Example**: "Your daily quests have been reset. Complete them for bonus XP!"

**Payload Structure**:
```json
{
  "notification": {
    "title": "📋 Quests Reset!",
    "body": "Your daily quests have been reset. Complete them for bonus XP!"
  },
  "data": {
    "type": "quest_reset",
    "quest_type": "daily"
  }
}
```

**Navigation**: Opens to quests screen

## Offline Behavior

When the device is offline:

1. **FCM messages queue** on Firebase servers
   - Delivered when device comes back online
   - Up to 4 weeks retention (FCM default)

2. **Local notifications work normally**
   - Created and displayed by the app
   - No network required
   - Same UI/UX as FCM notifications

3. **Preference changes persist**
   - Stored locally in SharedPreferences
   - Available immediately when app opens

## Security Considerations

### Token Management
- FCM tokens are device-specific
- Tokens can expire and must be refreshed
- Store tokens securely on backend
- Never expose tokens in logs or analytics

### Message Validation
- Backend must validate all notification content
- Sanitize user-generated content
- Rate limit notification sending per user
- Use Firebase Security Rules for data protection

### Privacy
- User preferences stored locally only
- No notification content stored persistently
- Users can disable notifications at any time
- Comply with platform notification policies

## Performance Considerations

### Battery Impact
- FCM uses platform-optimized delivery
- Notifications are batched when possible
- Background work is minimized
- Local notifications have minimal overhead

### Memory Usage
- Singleton pattern for NotificationService
- Listeners cleaned up on disposal
- No persistent message storage
- Notification history limited by OS

### Network Usage
- FCM messages are small (<4KB typical)
- Token refresh happens infrequently
- Topic subscriptions cached locally
- Offline queuing handled by FCM

## Testing Strategy

### Unit Tests
- Preference management
- Notification type logic
- Token handling
- Edge cases (null values, invalid data)

### Integration Tests
- Full notification flows
- UI interactions
- Navigation handling
- Preference persistence
- Offline scenarios

### Manual Testing
- FCM test messages from console
- Local notification buttons in app
- Various device states (foreground, background, terminated)
- Different Android/iOS versions
- Network conditions (online, offline, poor connection)

## Debugging

### Common Issues

**Notifications not appearing**:
- Check device permissions
- Verify FCM token is valid
- Check notification channel settings (Android)
- Ensure notifications are enabled in user preferences
- Review device logs for errors

**iOS-specific issues**:
- Must test on physical device
- Verify Push Notifications capability in Xcode
- Check APNs key is uploaded to Firebase
- Review device console logs in Xcode

**Android-specific issues**:
- Check notification channels are created
- Verify google-services.json is correct
- Review logcat for FCM errors
- Check battery optimization settings

### Debug Logging

Enable verbose logging:
```dart
// In notification_service.dart
import 'package:flutter/foundation.dart';

// Use debugPrint for console output
debugPrint('FCM Token: $token');
```

View logs:
```bash
# Flutter logs
flutter logs

# Android logcat
adb logcat | grep FCM

# iOS console
# Open Xcode → Window → Devices and Simulators → View Device Logs
```

## Future Enhancements

### Planned Features
1. **Rich Notifications**: Images, actions, expandable content
2. **Notification History**: In-app list of past notifications
3. **Custom Sounds**: Per-notification-type sounds
4. **Notification Groups**: Group related notifications
5. **Scheduled Notifications**: User-configurable timing
6. **Notification Actions**: Quick actions from notification
7. **Analytics**: Track notification engagement
8. **A/B Testing**: Test notification variations

### Backend Integration Ideas
1. **Personalization**: Send notifications based on user behavior
2. **Localization**: Multi-language notification content
3. **Dynamic Content**: Real-time data in notifications
4. **User Segments**: Target specific user groups
5. **Notification Campaigns**: Marketing and engagement campaigns

## References

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [flutter_local_notifications Plugin](https://pub.dev/packages/flutter_local_notifications)
- [Android Notification Guide](https://developer.android.com/develop/ui/views/notifications)
- [iOS User Notifications](https://developer.apple.com/documentation/usernotifications)
- [Flutter Push Notifications Guide](https://firebase.flutter.dev/docs/messaging/overview/)
