# Offline-First Implementation Guide

This guide explains the offline-first architecture implemented in the Quantum Falcon mobile app using `hive_flutter`.

## Overview

The mobile app is designed to work seamlessly both online and offline, providing users with a consistent experience regardless of network connectivity. All critical data is cached locally and synchronized with the backend when a connection is available.

## Architecture Components

### 1. Hive Flutter - Local Database

Hive is a lightweight, fast NoSQL database that runs on the device. It's used to store:

- **XP Data**: User level, current XP, and total XP
- **Streak Data**: Current streak count, longest streak, and last active date
- **Quest Progress**: Individual quest states, progress, and completion status

#### Benefits of Hive:
- ✅ Pure Dart implementation (no native dependencies)
- ✅ Extremely fast read/write operations
- ✅ Type-safe with code generation
- ✅ Minimal storage overhead
- ✅ Works on all Flutter platforms (iOS, Android, Web, Desktop)

### 2. XP Service - Business Logic Layer

The `XpService` class (`lib/services/xp_service.dart`) handles all data operations:

```dart
// Initialize the service
final xpService = XpService();
await xpService.initialize();

// Award XP (works offline)
await xpService.awardXp(50);

// Update streak
await xpService.updateStreak();

// Update quest progress
await xpService.updateQuestProgress('quest_1', 5);
```

#### Key Methods:

- `awardXp(int xpAmount)`: Adds XP and recalculates level
- `updateStreak()`: Checks and updates daily streak
- `updateQuestProgress(String questId, int increment)`: Updates quest and awards XP on completion
- `getUnsyncedData()`: Returns all data that needs to be synced
- `markAllAsSynced()`: Marks all local data as synchronized

### 3. Sync Provider - Synchronization Layer

The `SyncProvider` class (`lib/providers/sync_provider.dart`) manages network synchronization:

```dart
// Monitor sync status
Consumer<SyncProvider>(
  builder: (context, syncProvider, child) {
    if (syncProvider.syncStatus == SyncStatus.syncing) {
      return CircularProgressIndicator();
    }
    return YourWidget();
  },
)

// Force manual sync
await syncProvider.forceSyncNow();

// Check if online
if (syncProvider.isOnline) {
  // Show online features
}
```

#### Sync Behavior:

- **Automatic**: Syncs every 5 minutes when online and has unsynced data
- **Reconnection**: Immediately syncs when connection is restored
- **Manual**: User can trigger sync via UI button
- **Background**: Continues attempting sync in background

### 4. Sync Indicator Widget

The `SyncIndicator` widget (`lib/widgets/sync_indicator.dart`) provides visual feedback:

- 🔵 **Syncing**: Blue with loading spinner
- 🟢 **Synced**: Green with checkmark
- 🔴 **Error**: Red with error icon
- ⚫ **Offline**: Gray with offline icon
- 🟡 **Pending**: Gray with upload icon

## Data Flow

### Offline Operation

```
User Action (e.g., complete quest)
         ↓
    XP Service
         ↓
   Hive Database (Local Storage)
         ↓
    Data marked as "unsynced"
         ↓
   UI updates immediately
```

### Sync Operation

```
Connectivity Detected
         ↓
   Sync Provider checks for unsynced data
         ↓
   Collects all unsynced items
         ↓
   Sends to Backend API (HTTP POST)
         ↓
   Backend validates and stores
         ↓
   Success: Mark local data as synced
   Failure: Keep unsynced flag, retry later
```

## Usage Patterns

### Pattern 1: Offline-First User Action

```dart
// Award XP for completing an action
Future<void> handleUserAction() async {
  // This works immediately, even offline
  await xpService.awardXp(50);
  
  // UI updates instantly
  setState(() {
    // Refresh UI
  });
  
  // Sync happens automatically in background
}
```

### Pattern 2: Checking Sync Status

```dart
Widget build(BuildContext context) {
  return Consumer<SyncProvider>(
    builder: (context, syncProvider, child) {
      return Column(
        children: [
          if (!syncProvider.isOnline)
            Banner(
              message: 'Offline Mode',
              color: Colors.orange,
            ),
          if (syncProvider.hasUnsyncedData)
            Text('${syncProvider.unsyncedCount} items pending sync'),
        ],
      );
    },
  );
}
```

### Pattern 3: Manual Sync

```dart
ElevatedButton(
  onPressed: () async {
    final syncProvider = Provider.of<SyncProvider>(context, listen: false);
    await syncProvider.forceSyncNow();
    
    if (syncProvider.syncStatus == SyncStatus.success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Sync successful')),
      );
    }
  },
  child: Text('Sync Now'),
)
```

## Error Handling

### Scenario 1: Network Timeout

```dart
// Sync Provider handles timeout automatically
try {
  await _syncXpData(xpData);
} catch (e) {
  if (e is TimeoutException) {
    // Data remains unsynced
    // Will retry on next sync cycle
    _lastError = 'Sync timeout';
  }
}
```

### Scenario 2: Backend API Error

```dart
// If API returns non-200 status
if (response.statusCode != 200) {
  // Data remains unsynced
  // User can retry manually
  throw Exception('Failed to sync');
}
```

### Scenario 3: Offline During Sync

```dart
// Connectivity check prevents unnecessary attempts
if (!_isOnline) {
  _lastError = 'No internet connection';
  return;
}
```

## Testing Offline Functionality

### Test 1: Offline Data Storage

```dart
test('should cache data when offline', () async {
  // Award XP while offline
  await xpService.awardXp(50);
  
  // Verify data is stored
  final xpData = xpService.getXpData();
  expect(xpData.totalXp, 50);
  expect(xpData.isSynced, false);
});
```

### Test 2: Sync on Reconnection

```dart
test('should sync when reconnected', () async {
  // Create unsynced data
  await xpService.awardXp(50);
  
  // Simulate coming online
  syncProvider.simulateOnline();
  
  // Wait for sync
  await syncProvider.syncData();
  
  // Verify synced
  expect(xpService.hasUnsyncedData(), false);
});
```

## Best Practices

### 1. Always Check Sync Status for Critical Operations

```dart
// Before showing "data saved" confirmation
if (syncProvider.isOnline && !syncProvider.hasUnsyncedData) {
  showSnackBar('Data saved and synced');
} else {
  showSnackBar('Data saved locally, will sync when online');
}
```

### 2. Provide Visual Feedback

```dart
// Use the SyncIndicator widget
AppBar(
  actions: [
    SyncIndicator(), // Always visible
  ],
)
```

### 3. Handle Conflicts Gracefully

```dart
// If backend has newer data
if (serverTimestamp > localTimestamp) {
  // Use server data
  await xpService.saveXpData(serverData);
} else {
  // Keep local changes
}
```

### 4. Clear Old Data Periodically

```dart
// In settings or during app maintenance
await xpService.clearAllData();
// This removes all cached data
```

## Performance Considerations

### Hive Performance

- **Read Operations**: <1ms for typical queries
- **Write Operations**: <5ms for typical writes
- **Storage Size**: ~1KB per user data set
- **Memory Usage**: Minimal (lazy loading)

### Sync Performance

- **Sync Duration**: 1-3 seconds for typical user data
- **Network Usage**: <10KB per sync operation
- **Battery Impact**: Negligible (uses efficient Timer)

## Debugging

### Enable Debug Logging

```dart
// In sync_provider.dart
if (kDebugMode) {
  print('Sync status: $_syncStatus');
  print('Unsynced data: ${xpService.getUnsyncedData()}');
}
```

### Inspect Hive Data

```dart
// Get all XP records
final box = await Hive.openBox<XpData>('xp_box');
print('Total records: ${box.length}');
for (var key in box.keys) {
  print('$key: ${box.get(key)}');
}
```

### Monitor Network Status

```dart
// In sync_provider.dart
Connectivity().onConnectivityChanged.listen((result) {
  print('Connectivity changed: $result');
});
```

## Migration Guide

### Upgrading from Previous Version

If you're upgrading from a version without offline support:

1. **Backup existing data**:
```dart
final existingData = await fetchFromBackend();
```

2. **Initialize Hive**:
```dart
await xpService.initialize();
```

3. **Populate local cache**:
```dart
await xpService.saveXpData(existingData.xp);
await xpService.saveStreakData(existingData.streak);
```

4. **Mark as synced**:
```dart
await xpService.markAllAsSynced();
```

## Security Considerations

### Data Encryption

Hive supports encryption for sensitive data:

```dart
final encryptionKey = await getEncryptionKey();
final encryptedBox = await Hive.openBox(
  'secure_box',
  encryptionCipher: HiveAesCipher(encryptionKey),
);
```

### API Authentication

Add authentication headers in sync requests:

```dart
final response = await http.post(
  url,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $authToken',
  },
  body: jsonEncode(data),
);
```

## Future Enhancements

- [ ] Conflict resolution strategy for concurrent updates
- [ ] Batch sync optimization for large datasets
- [ ] Compressed sync payloads
- [ ] Delta sync (only changed fields)
- [ ] Sync progress indicators
- [ ] Offline queue visualization
- [ ] Custom sync intervals per data type

## Support

For issues or questions about offline functionality:

1. Check the [Troubleshooting](#troubleshooting) section in main README
2. Review test files for usage examples
3. Open an issue on GitHub with:
   - Device information
   - Network conditions
   - Steps to reproduce
   - Logs from debug mode

---

**Last Updated**: November 2024  
**Version**: 1.0.0
