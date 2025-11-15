# Quantum Falcon Mobile App

A Flutter mobile application for the Quantum Falcon Cockpit trading platform with integrated XP gamification, quests, and streak tracking.

## Features

- **XP System**: Track experience points, levels, and progression
- **Quest Management**: Complete daily, weekly, and achievement quests
- **Streak Tracking**: Maintain activity streaks for bonus rewards
- **Real-time Sync**: Seamless communication with backend APIs
- **Offline Support**: Cached data for offline functionality
- **State Management**: Provider pattern for reactive UI updates

## Getting Started

### Prerequisites

- Flutter SDK 3.0.0 or higher
- Dart SDK 3.0.0 or higher
- iOS development: Xcode 14+ (macOS only)
- Android development: Android Studio with Android SDK

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mhamp1/quantum-falcon-cockp.git
   cd quantum-falcon-cockp/mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your backend API URL:
   ```env
   API_BASE_URL=https://api.quantumfalcon.com
   ```

4. **Generate code for models**
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

5. **Run the app**
   ```bash
   # Run on iOS simulator
   flutter run -d ios
   
   # Run on Android emulator
   flutter run -d android
   
   # Run on Chrome (for web development)
   flutter run -d chrome
   ```

## Project Structure

```
mobile/
├── lib/
│   ├── models/           # Data models
│   │   ├── xp_model.dart
│   │   ├── quest_model.dart
│   │   └── streak_model.dart
│   ├── providers/        # State management
│   │   └── gamification_provider.dart
│   ├── services/         # API communication
│   │   └── api_service.dart
│   ├── screens/          # UI screens (add your own)
│   ├── widgets/          # Reusable widgets (add your own)
│   └── main.dart         # App entry point
├── test/                 # Unit and widget tests
│   ├── api_service_test.dart
│   └── gamification_provider_test.dart
├── .env.example          # Environment variables template
├── pubspec.yaml          # Dependencies
└── README.md            # This file
```

## Backend API Integration

### Base Configuration

The app communicates with the backend API specified in the `.env` file. All API calls include proper error handling and offline caching.

### Available Endpoints

#### XP Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/xp` | Get current user XP data |
| POST | `/api/xp/award` | Award XP to user |
| GET | `/api/xp/leaderboard` | Get XP leaderboard |

**Example: Award XP**
```dart
final provider = context.read<GamificationProvider>();
await provider.awardXp(
  amount: 50,
  reason: 'Completed trade',
  actionType: 'trade_execution',
);
```

#### Quest Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quests` | Get all available quests |
| GET | `/api/quests/:id` | Get specific quest |
| POST | `/api/quests/:id/progress` | Update quest progress |
| POST | `/api/quests/:id/complete` | Mark quest as completed |

**Example: Update Quest Progress**
```dart
final provider = context.read<GamificationProvider>();
await provider.updateQuestProgress(
  questId: 'quest_123',
  progress: 1,
  increment: true,
);
```

#### Streak Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/streaks` | Get all user streaks |
| GET | `/api/streaks/:type` | Get specific streak by type |
| POST | `/api/streaks/:type/activity` | Record streak activity |

**Example: Record Daily Login**
```dart
final provider = context.read<GamificationProvider>();
await provider.recordStreakActivity(StreakType.dailyLogin);
```

### Request/Response Formats

#### Award XP Request
```json
{
  "amount": 50,
  "reason": "Completed trade",
  "actionType": "trade_execution",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Quest Progress Request
```json
{
  "progress": 5,
  "increment": true,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Streak Activity Request
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## State Management

The app uses the Provider pattern for state management. The `GamificationProvider` manages all XP, quest, and streak data.

### Usage in Widgets

```dart
// Read data
Consumer<GamificationProvider>(
  builder: (context, provider, child) {
    if (provider.isLoading) {
      return CircularProgressIndicator();
    }
    
    return Text('Level: ${provider.xpData?.level ?? 0}');
  },
)

// Trigger actions
final provider = context.read<GamificationProvider>();
await provider.fetchXp();
```

### Provider Methods

- `fetchXp()` - Fetch current XP data
- `awardXp(amount, reason, actionType)` - Award XP
- `fetchQuests({category})` - Fetch quests
- `updateQuestProgress(questId, progress, {increment})` - Update quest
- `completeQuest(questId)` - Complete quest
- `fetchStreaks()` - Fetch streaks
- `recordStreakActivity(type)` - Record streak activity
- `refreshAll()` - Refresh all gamification data

## Error Handling

The app includes comprehensive error handling:

1. **Network Errors**: Automatically falls back to cached data
2. **API Errors**: Displays user-friendly error messages
3. **Timeout Handling**: 30-second timeout with retry option
4. **Offline Mode**: Cached data available when offline

### Error Example

```dart
try {
  await apiService.awardXp(
    amount: 50,
    reason: 'Trade',
    actionType: 'trade',
  );
} on ApiException catch (e) {
  print('API Error: ${e.message}');
  // Show error to user
}
```

## Testing

### Run All Tests
```bash
flutter test
```

### Run Specific Test
```bash
flutter test test/api_service_test.dart
```

### Run with Coverage
```bash
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

### Test Structure

- `api_service_test.dart` - Tests for API communication layer
- `gamification_provider_test.dart` - Tests for state management
- Widget tests - Add your own widget tests in `test/`

## Development Guidelines

### Adding New API Endpoints

1. **Add method to `ApiService`**
   ```dart
   Future<ResponseModel> newEndpoint(params) async {
     try {
       final data = await _get('/api/new-endpoint');
       return ResponseModel.fromJson(data);
     } catch (e) {
       // Handle error
     }
   }
   ```

2. **Add method to Provider** (if needed)
   ```dart
   Future<void> fetchNewData() async {
     try {
       _newData = await _apiService.newEndpoint(params);
       notifyListeners();
     } catch (e) {
       _error = e.toString();
     }
   }
   ```

3. **Write tests**
   ```dart
   test('newEndpoint returns data on success', () async {
     // Arrange, Act, Assert
   });
   ```

### Creating New Models

1. **Define model class**
   ```dart
   @JsonSerializable()
   class NewModel {
     final String id;
     final String name;
     
     NewModel({required this.id, required this.name});
     
     factory NewModel.fromJson(Map<String, dynamic> json) => 
       _$NewModelFromJson(json);
     Map<String, dynamic> toJson() => _$NewModelToJson(this);
   }
   ```

2. **Generate serialization code**
   ```bash
   flutter pub run build_runner build
   ```

## Connecting to Backend

### Development Setup

1. **Start your backend server** (from desktop repository)
   ```bash
   npm run dev
   ```

2. **Update mobile `.env`**
   ```env
   API_BASE_URL=http://localhost:3000
   ```

3. **Run mobile app**
   ```bash
   flutter run
   ```

### Production Setup

1. **Deploy backend** to production server
2. **Update `.env` for production build**
   ```env
   API_BASE_URL=https://api.quantumfalcon.com
   ```
3. **Build release version**
   ```bash
   flutter build apk --release  # Android
   flutter build ios --release  # iOS
   ```

## API Authentication

To add authentication to API calls:

1. **Store auth token** (using `shared_preferences` or `flutter_secure_storage`)
2. **Add to headers** in `ApiService`
   ```dart
   Map<String, String> get _headers => {
     'Content-Type': 'application/json',
     'Authorization': 'Bearer $authToken',
   };
   ```

## Troubleshooting

### Common Issues

**Issue: "No backend connection"**
- Check `.env` file has correct `API_BASE_URL`
- Verify backend server is running
- Check device/emulator network connectivity

**Issue: "Build runner errors"**
- Run `flutter pub run build_runner clean`
- Then run `flutter pub run build_runner build --delete-conflicting-outputs`

**Issue: "Provider not found"**
- Ensure `MultiProvider` is set up in `main.dart`
- Use `context.read<>()` or `context.watch<>()` correctly

**Issue: "Tests failing"**
- Run `flutter pub run build_runner build` first
- Check mock setup in test files
- Verify test data matches expected formats

## Contributing

1. Create a feature branch
2. Write tests for new functionality
3. Ensure all tests pass: `flutter test`
4. Follow Dart style guidelines: `flutter analyze`
5. Submit pull request

## License

Copyright © 2024 Quantum Falcon. All rights reserved.

## Support

For issues and questions:
- GitHub Issues: https://github.com/mhamp1/quantum-falcon-cockp/issues
- Documentation: See `/docs` folder
- Email: support@quantumfalcon.com

---

**Note**: This mobile app is designed to work with the Quantum Falcon Cockpit desktop backend. Ensure your backend implements the required API endpoints documented above.
