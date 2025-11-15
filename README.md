# 🚀 Quantum Falcon Cockpit

A cyberpunk-themed trading platform with Solana-inspired neon aesthetics, AI-powered agents, and comprehensive mobile-desktop integration.

![Quantum Falcon Theme](https://github.com/user-attachments/assets/650689ad-bb01-4ece-83f2-c129c179c6d9)

## 🎨 Cyberpunk Neon Theme

This app features a custom Solana-inspired cyberpunk theme with neon aesthetics, holographic effects, and smooth animations.

**Key Features:**
- Solana Green (#14F195) and Purple (#9945FF) color palette
- Holographic cards with neon glow effects
- Animated progress bars with shimmer effects
- Custom notification toasts and badges
- Fully responsive design (mobile-first)

📖 **[Complete Theme Guide](./THEME_GUIDE.md)** - Learn how to customize and extend the theme

**Quick Start:**
```tsx
import { HolographicCard, NeonProgress, NeonBadge } from '@/components/ui'

<HolographicCard variant="primary" glow pulse>
  <NeonProgress value={750} max={1000} animate />
  <NeonBadge variant="accent">Elite Trader</NeonBadge>
</HolographicCard>
```

## 🧪 Testing

The mobile app includes comprehensive unit tests covering:

- ✅ XP calculation and level progression
- ✅ Streak tracking (consecutive days, resets)
- ✅ Quest progress and completion
- ✅ Offline data caching
- ✅ Sync status tracking
- ✅ Error handling and retry logic
- ✅ Data persistence across restarts

**Run all tests:**
```bash
cd mobile_app
flutter test
```

**Run specific test file:**
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

## 🚀 Development

### Web App (React/TypeScript)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Mobile App (Flutter)

```bash
# Install dependencies
cd mobile_app
flutter pub get

# Run on device/simulator
flutter run

# Run tests
flutter test

# Build for production
flutter build apk  # Android
flutter build ios  # iOS
```

## 📚 Additional Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Hive Documentation](https://docs.hivedb.dev/)
- [Provider State Management](https://pub.dev/packages/provider)
- [Connectivity Plus](https://pub.dev/packages/connectivity_plus)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Solana Branding Guidelines](https://solana.com/branding)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
