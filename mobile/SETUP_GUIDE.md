# Quick Setup Guide for Firebase Push Notifications

This guide walks you through setting up Firebase Cloud Messaging for the Quantum Falcon mobile app.

## Step 1: Create Firebase Project (5 minutes)

1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Enter project name: `quantum-falcon-mobile`
4. Disable Google Analytics (optional)
5. Click **"Create project"**

## Step 2: Add Android App (5 minutes)

1. In Firebase Console, click **"Add app"** → Android icon
2. Enter Android package name: `com.quantumfalcon.mobile`
3. Enter app nickname (optional): `Quantum Falcon Android`
4. Click **"Register app"**
5. Download `google-services.json`
6. Copy it to: `mobile/android/app/google-services.json`
7. Click **"Next"** through remaining steps (already configured in code)

## Step 3: Add iOS App (10 minutes)

1. In Firebase Console, click **"Add app"** → iOS icon
2. Enter iOS bundle ID: `com.quantumfalcon.mobile`
3. Enter app nickname (optional): `Quantum Falcon iOS`
4. Click **"Register app"**
5. Download `GoogleService-Info.plist`
6. Copy it to: `mobile/ios/Runner/GoogleService-Info.plist`
7. Click **"Next"** through remaining steps

### iOS Additional Setup

1. Open `mobile/ios/Runner.xcworkspace` in Xcode
2. Select **Runner** target in left sidebar
3. Go to **"Signing & Capabilities"** tab
4. Click **"+ Capability"** → Search for **"Push Notifications"** → Add it
5. Click **"+ Capability"** → Search for **"Background Modes"** → Add it
6. Enable **"Remote notifications"** checkbox

### Apple Developer Portal (iOS only)

1. Go to https://developer.apple.com/account/
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Keys** → **"+"** button
4. Name it: `Quantum Falcon APNs Key`
5. Enable **"Apple Push Notifications service (APNs)"**
6. Click **"Continue"** → **"Register"**
7. Download the `.p8` key file (save it securely!)
8. Note the **Key ID** (you'll need this next)

### Upload APNs Key to Firebase

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Select **"Cloud Messaging"** tab
3. Scroll to **"Apple app configuration"**
4. Under **"APNs Authentication Key"**, click **"Upload"**
5. Upload the `.p8` file you downloaded
6. Enter **Key ID** and **Team ID** (found in Apple Developer Portal)
7. Click **"Upload"**

## Step 4: Update Firebase Configuration (2 minutes)

1. Open `mobile/lib/firebase_options.dart`
2. Replace placeholder values with your Firebase credentials:

From Firebase Console → Project Settings → General:
- Get `apiKey`, `appId`, `messagingSenderId`, `projectId`, `storageBucket`
- Update both `android` and `ios` configurations

Example:
```dart
static const FirebaseOptions android = FirebaseOptions(
  apiKey: 'AIzaSyAbc123...',           // From Firebase Console
  appId: '1:123456789:android:abc123', // From Firebase Console
  messagingSenderId: '123456789',       // From Firebase Console
  projectId: 'quantum-falcon-mobile',   // Your project ID
  storageBucket: 'quantum-falcon-mobile.appspot.com',
);
```

## Step 5: Test Installation (2 minutes)

1. Connect Android device or start emulator
2. Run: `flutter run -d android`
3. App should launch without errors
4. Check home screen for FCM token display

For iOS:
1. Connect iOS device (simulator won't receive notifications)
2. Run: `flutter run -d ios`
3. App should launch without errors
4. Check home screen for FCM token display

## Step 6: Test Notifications (5 minutes)

### Test via App UI

1. Launch the app
2. Tap **"Award XP (Test)"** button
3. Check system notification tray for notification
4. Tap notification to verify app opens

### Test via Firebase Console

1. Go to Firebase Console → **Cloud Messaging**
2. Click **"Send your first message"**
3. Enter notification title and text
4. Click **"Send test message"**
5. Enter your FCM token (displayed on app home screen)
6. Click **"Test"**
7. Notification should appear on device

## Step 7: Test Settings (2 minutes)

1. In app, tap **Settings** icon (top right)
2. Toggle **"Enable Notifications"** off
3. Return to home screen
4. Try sending test notification
5. No notification should appear
6. Re-enable notifications in settings

## Common Issues

### Android: "google-services.json not found"
- **Solution**: Ensure file is at `mobile/android/app/google-services.json`
- File must be named exactly `google-services.json` (not .example)

### iOS: "GoogleService-Info.plist not found"
- **Solution**: Ensure file is at `mobile/ios/Runner/GoogleService-Info.plist`
- Open Xcode and verify file is in Runner folder

### iOS: Notifications not appearing
- **Solution**: Must test on physical device, not simulator
- Verify Push Notifications capability is enabled in Xcode
- Check APNs key is uploaded to Firebase Console

### Android: Notifications not appearing
- **Solution**: Check notification permissions in device settings
- Go to: Settings → Apps → Quantum Falcon → Notifications
- Ensure all notification categories are enabled

### FCM Token is null
- **Solution**: Check internet connection
- Verify Firebase is initialized (check logs)
- Restart app and wait 5-10 seconds for token generation

## Next Steps

After setup is complete:

1. **Integrate with Backend**: Use Firebase Admin SDK to send notifications from your server
2. **Customize Notifications**: Modify notification channels and styling in `notification_service.dart`
3. **Add More Types**: Create new notification types for your specific use cases
4. **Schedule Notifications**: Implement scheduled notifications for streak reminders
5. **Analytics**: Track notification engagement in Firebase Analytics

## Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Flutter Firebase Messaging Plugin](https://pub.dev/packages/firebase_messaging)
- [Apple Developer Portal](https://developer.apple.com/account/)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels)

## Support

If you encounter issues:
1. Check logs: `flutter logs`
2. Review error messages carefully
3. Consult Firebase documentation
4. Open issue on GitHub repository
