# Quick Start Guide - Quantum Falcon Mobile App

Get up and running with the offline-first mobile app in 5 minutes!

## Prerequisites

- ✅ Flutter SDK 3.0.0+ ([Install Flutter](https://docs.flutter.dev/get-started/install))
- ✅ Android Studio or Xcode (for mobile development)
- ✅ A connected device or emulator

## Step 1: Install Dependencies (1 minute)

```bash
cd mobile_app
flutter pub get
```

## Step 2: Configure API Endpoint (30 seconds)

Edit `lib/main.dart` line 20:

```dart
apiBaseUrl: 'https://your-backend-api.com', // Change this!
```

## Step 3: Run the App (30 seconds)

```bash
flutter run
```

That's it! The app is now running with full offline capabilities.

## What You Get

### ✅ Offline-First Features
- Award XP while offline
- Track daily streaks
- Update quest progress
- All data cached locally

### ✅ Automatic Sync
- Syncs every 5 minutes when online
- Immediate sync on reconnection
- Visual indicator shows sync status

### ✅ Error Handling
- Network timeouts (10s)
- API errors with retry
- Offline mode detection

## Quick Test

### Test Offline Functionality

```dart
// Award some XP
await xpService.awardXp(100);

// Update streak
await xpService.updateStreak();

// Add a quest
final quest = QuestProgress(
  questId: 'test_quest',
  questName: 'Test Quest',
  currentProgress: 5,
  targetProgress: 10,
  isCompleted: false,
  rewardXp: 50,
  lastUpdated: DateTime.now(),
);
await xpService.saveQuestProgress(quest);
```

### Run Tests

```bash
flutter test
```

You should see 40+ tests passing! ✅

## Common Commands

```bash
# Run on specific device
flutter run -d <device-id>

# Build release APK (Android)
flutter build apk --release

# Build iOS app
flutter build ios --release

# Run tests with coverage
flutter test --coverage

# Format code
flutter format .

# Analyze code
flutter analyze
```

## Project Structure

```
lib/
├── models/        # Data models with Hive annotations
├── services/      # XP Service (core business logic)
├── providers/     # Sync Provider (state management)
├── widgets/       # Sync Indicator (UI component)
└── main.dart      # App entry point
```

## Key Files to Know

| File | Purpose | Lines |
|------|---------|-------|
| `services/xp_service.dart` | Core offline logic | 427 |
| `providers/sync_provider.dart` | Sync with backend | 280 |
| `widgets/sync_indicator.dart` | Sync status UI | 175 |
| `models/*.dart` | Data models | ~220 |

## Usage Examples

### Award XP
```dart
final xpService = Provider.of<XpService>(context, listen: false);
await xpService.awardXp(50);
```

### Check Sync Status
```dart
Consumer<SyncProvider>(
  builder: (context, sync, _) => Text(
    sync.isOnline ? '🟢 Online' : '🔴 Offline'
  ),
)
```

### Manual Sync
```dart
await Provider.of<SyncProvider>(context, listen: false)
    .forceSyncNow();
```

## Troubleshooting

### Issue: "Hive not initialized"
**Solution**: Ensure `xpService.initialize()` is called before `runApp()`.

### Issue: Tests failing
**Solution**: 
```bash
flutter pub get
flutter test
```

### Issue: Build errors with .g.dart files
**Solution**:
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### Issue: Sync not working
**Solution**: Check your API endpoint URL and ensure backend is running.

## Next Steps

1. **Customize**: Modify models to match your needs
2. **Extend**: Add more data types to sync
3. **Style**: Customize the UI components
4. **Deploy**: Build and test on real devices

## Need Help?

- 📖 Read the full [OFFLINE_FIRST_GUIDE.md](./OFFLINE_FIRST_GUIDE.md)
- 📝 Check the [README.md](../README.md) for detailed setup
- 🐛 Look at test files for usage examples
- 📊 Review [IMPLEMENTATION_SUMMARY_OFFLINE_FIRST.md](../IMPLEMENTATION_SUMMARY_OFFLINE_FIRST.md)

## API Endpoints Required

Your backend needs these endpoints:

```
POST /api/xp/award          # Sync XP data
POST /api/streaks/update    # Sync streak data
POST /api/quests/progress   # Sync quest data
```

See README.md for detailed API specifications.

---

**Happy Coding! 🚀**

The app works offline by default. Sync happens automatically in the background.
