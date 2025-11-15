# Quantum Falcon Cockpit

A comprehensive trading platform featuring a React/TypeScript Progressive Web App (PWA) for desktop and a Flutter mobile application with offline-first capabilities.

## 🚀 What's Inside?

### Desktop Application (PWA)
- React 19 + TypeScript web application
- Cyberpunk-themed UI with real-time trading features
- Multi-agent AI trading system
- Community features with XP progression
- Pre-configured for local development

### Mobile Application (Flutter)
- **Offline-first architecture** using Hive Flutter
- Local caching of XP levels, streaks, and quest progress
- Automatic synchronization with desktop API
- Seamless online/offline transitions
- Comprehensive error handling and retry logic

## 📱 Mobile App - Offline-First Functionality

The mobile app is built with an offline-first approach, ensuring users can continue using the app even without an internet connection.

### Key Features

#### 1. **Local Data Storage with Hive**
- All user data (XP, streaks, quests) is cached locally using `hive_flutter`
- Data persists across app restarts
- No dependency on network connectivity for basic operations

#### 2. **Automatic Sync**
- Background synchronization every 5 minutes when online
- Immediate sync when reconnecting after being offline
- Manual sync option available via UI

#### 3. **Sync Status Indicator**
- Visual indicator showing current sync status
- States: Offline, Syncing, Synced, Sync Failed
- Displays last sync timestamp
- Manual retry button for failed syncs

#### 4. **Data Integrity**
- Conflict-free data merging
- All offline changes tracked with timestamps
- Guaranteed delivery to backend once online

## 🛠 Setup Instructions

### Desktop Application Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Mobile Application Setup

#### Prerequisites
- Flutter SDK 3.0.0 or higher
- Dart SDK 3.0.0 or higher
- Android Studio or Xcode (for mobile development)

#### Installation

```bash
# Navigate to mobile app directory
cd mobile_app

# Get Flutter dependencies
flutter pub get

# Generate Hive type adapters (if needed)
flutter pub run build_runner build

# Run on connected device or emulator
flutter run

# Run tests
flutter test
```

#### Configuring the API Endpoint

Update the API base URL in `lib/main.dart`:

```dart
SyncProvider(
  xpService: xpService,
  apiBaseUrl: 'https://your-api-url.com', // Change this to your backend URL
)
```

### Environment Variables

Create a `.env` file in the root directory for the desktop app:

```env
VITE_API_URL=http://localhost:3000
```

## 📊 Architecture

### Mobile App Structure

```
mobile_app/
├── lib/
│   ├── models/           # Hive data models
│   │   ├── xp_data.dart
│   │   ├── streak_data.dart
│   │   └── quest_progress.dart
│   ├── services/         # Business logic
│   │   └── xp_service.dart
│   ├── providers/        # State management
│   │   └── sync_provider.dart
│   ├── widgets/          # UI components
│   │   └── sync_indicator.dart
│   └── main.dart
├── test/                 # Unit tests
│   ├── services/
│   └── providers/
└── pubspec.yaml
```

### Data Flow

1. **Offline Mode**:
   - User actions → XP Service → Local Hive Storage
   - Data marked as "unsynced"

2. **Online Mode**:
   - Sync Provider monitors connectivity
   - Detects unsynced data
   - Sends to backend API via HTTP
   - Marks data as synced on success

3. **Reconnection**:
   - Automatically detects network restoration
   - Triggers immediate sync of pending data
   - Updates UI with sync status

## 🧪 Testing

### Mobile App Tests

The mobile app includes comprehensive unit tests covering:

- ✅ XP calculation and level progression
- ✅ Streak tracking (consecutive days, resets)
- ✅ Quest progress and completion
- ✅ Offline data caching
- ✅ Sync status tracking
- ✅ Error handling and retry logic
- ✅ Data persistence across restarts

Run all tests:
```bash
cd mobile_app
flutter test
```

Run specific test file:
```bash
flutter test test/services/xp_service_test.dart
```

### Test Coverage

- **XP Service**: 100% coverage of core functionality
- **Sync Provider**: Complete offline/online scenario testing
- **Data Models**: Serialization and deserialization tests

## 📖 API Endpoints

The mobile app syncs with the following backend endpoints:

### XP Award
```
POST /api/xp/award
Content-Type: application/json

{
  "level": 5,
  "currentXp": 50,
  "totalXp": 450,
  "lastUpdated": "2024-01-01T12:00:00.000Z"
}
```

### Streak Update
```
POST /api/streaks/update
Content-Type: application/json

{
  "currentStreak": 7,
  "longestStreak": 15,
  "lastActiveDate": "2024-01-01T12:00:00.000Z",
  "lastUpdated": "2024-01-01T12:00:00.000Z"
}
```

### Quest Progress
```
POST /api/quests/progress
Content-Type: application/json

{
  "quests": [
    {
      "questId": "quest_1",
      "questName": "Complete First Trade",
      "currentProgress": 5,
      "targetProgress": 10,
      "isCompleted": false,
      "rewardXp": 100,
      "lastUpdated": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

## 🔧 Customization

### Adding New Offline Features

1. **Create a Hive Model**:
```dart
@HiveType(typeId: 3) // Use unique typeId
class YourModel extends HiveObject {
  @HiveField(0)
  String field;
  // Add more fields...
}
```

2. **Register in XP Service**:
```dart
Hive.registerAdapter(YourModelAdapter());
```

3. **Add Sync Logic**:
Update `SyncProvider` to include your new data type in sync operations.

### Configuring Sync Intervals

Modify the periodic sync timer in `sync_provider.dart`:

```dart
_syncTimer = Timer.periodic(const Duration(minutes: 10), (_) {
  // Sync every 10 minutes instead of 5
  if (_isOnline && hasUnsyncedData) {
    syncData();
  }
});
```

## 🐛 Troubleshooting

### Common Issues

**Q: Data not syncing to backend?**
- Check internet connectivity
- Verify API endpoint URL is correct
- Check backend API logs for errors
- Ensure backend endpoints are accessible

**Q: Hive initialization error?**
- Clear app data/cache
- Ensure `Hive.initFlutter()` is called before `runApp()`
- Check for conflicting typeIds in models

**Q: Tests failing?**
- Run `flutter pub get` to ensure all dependencies are installed
- Check that Hive test directory is properly cleaned up
- Ensure no boxes are left open between tests

**Q: Build errors with generated files?**
- Run `flutter pub run build_runner build --delete-conflicting-outputs`
- Check that all Hive models have proper annotations

## 📚 Additional Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Hive Documentation](https://docs.hivedb.dev/)
- [Provider State Management](https://pub.dev/packages/provider)
- [Connectivity Plus](https://pub.dev/packages/connectivity_plus)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

---

**Version**: 1.0.0  
**Last Updated**: November 2024
