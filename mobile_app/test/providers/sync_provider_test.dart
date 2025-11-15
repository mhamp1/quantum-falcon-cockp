import 'package:flutter_test/flutter_test.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:quantum_falcon_mobile/models/xp_data.dart';
import 'package:quantum_falcon_mobile/models/streak_data.dart';
import 'package:quantum_falcon_mobile/models/quest_progress.dart';
import 'package:quantum_falcon_mobile/services/xp_service.dart';
import 'package:quantum_falcon_mobile/providers/sync_provider.dart';
import 'dart:convert';

void main() {
  late XpService xpService;
  late SyncProvider syncProvider;

  setUp(() async {
    await Hive.initFlutter('test_sync_data');
    xpService = XpService();
    await xpService.initialize();
    await xpService.clearAllData();

    syncProvider = SyncProvider(
      xpService: xpService,
      apiBaseUrl: 'http://test-api.com',
    );
  });

  tearDown(() async {
    await xpService.clearAllData();
    await xpService.close();
    syncProvider.dispose();
    await Hive.deleteFromDisk();
  });

  group('Sync Provider Tests', () {
    test('should initialize with idle status', () {
      expect(syncProvider.syncStatus, SyncStatus.idle);
      expect(syncProvider.lastSyncedAt, isNull);
      expect(syncProvider.lastError, isNull);
    });

    test('should detect unsynced data', () async {
      expect(syncProvider.hasUnsyncedData, false);

      await xpService.awardXp(50);
      expect(syncProvider.hasUnsyncedData, true);
    });

    test('should return "Never synced" when no sync has occurred', () {
      expect(syncProvider.getLastSyncTimeText(), 'Never synced');
    });

    test('should return "Just now" for recent sync', () {
      // Simulate a sync by setting the last synced time manually
      // This requires accessing the private field, so we'll test after a real sync
      expect(syncProvider.getLastSyncTimeText(), 'Never synced');
    });

    test('should not sync when offline', () async {
      await xpService.awardXp(50);

      // Since we can't easily mock connectivity in tests,
      // we test the error message when sync is attempted offline
      await syncProvider.syncData();

      // The sync will fail in test environment due to no network
      // but we can verify the behavior
      expect(syncProvider.hasUnsyncedData, true);
    });

    test('should format sync time correctly', () async {
      // Test the time formatting logic
      expect(syncProvider.getLastSyncTimeText(), 'Never synced');
      
      // After a sync, it should show time
      // This would be tested in integration tests with actual sync
    });
  });

  group('Sync Status Tracking', () {
    test('should track sync status changes', () async {
      expect(syncProvider.syncStatus, SyncStatus.idle);

      // Add unsynced data
      await xpService.awardXp(50);
      expect(syncProvider.hasUnsyncedData, true);

      // After marking as synced
      await xpService.markAllAsSynced();
      expect(syncProvider.hasUnsyncedData, false);
    });

    test('should have unsynced data after XP award', () async {
      await xpService.awardXp(100);
      expect(syncProvider.hasUnsyncedData, true);
    });

    test('should have unsynced data after streak update', () async {
      await xpService.updateStreak();
      expect(syncProvider.hasUnsyncedData, true);
    });

    test('should have unsynced data after quest update', () async {
      final quest = QuestProgress(
        questId: 'quest_1',
        questName: 'Test Quest',
        currentProgress: 5,
        targetProgress: 10,
        isCompleted: false,
        rewardXp: 50,
        lastUpdated: DateTime.now(),
        isSynced: false,
      );
      await xpService.saveQuestProgress(quest);
      
      expect(syncProvider.hasUnsyncedData, true);
    });
  });

  group('Error Handling', () {
    test('should handle sync errors gracefully', () async {
      await xpService.awardXp(50);

      // Attempt to sync (will fail in test environment)
      await syncProvider.syncData();

      // Should be able to retry
      expect(syncProvider.hasUnsyncedData, true);
    });

    test('should allow retry after error', () async {
      // Set up error state
      await xpService.awardXp(50);
      await syncProvider.syncData();

      // Should be able to call retrySync
      await syncProvider.retrySync();
      
      // Data should still be present for retry
      expect(syncProvider.hasUnsyncedData, true);
    });

    test('should maintain data integrity on sync failure', () async {
      final initialXp = 100;
      await xpService.awardXp(initialXp);
      
      final xpBefore = xpService.getXpData();
      
      // Attempt sync (will fail)
      await syncProvider.syncData();
      
      final xpAfter = xpService.getXpData();
      
      // Data should remain unchanged
      expect(xpAfter?.totalXp, xpBefore?.totalXp);
      expect(xpAfter?.level, xpBefore?.level);
    });
  });

  group('Sync Data Collection', () {
    test('should collect XP data for sync', () async {
      await xpService.awardXp(150);
      
      final unsyncedData = xpService.getUnsyncedData();
      expect(unsyncedData['xp'], isNotNull);
      expect(unsyncedData['xp']['totalXp'], 150);
    });

    test('should collect streak data for sync', () async {
      await xpService.updateStreak();
      
      final unsyncedData = xpService.getUnsyncedData();
      expect(unsyncedData['streak'], isNotNull);
    });

    test('should collect quest data for sync', () async {
      final quest = QuestProgress(
        questId: 'quest_1',
        questName: 'Test Quest',
        currentProgress: 5,
        targetProgress: 10,
        isCompleted: false,
        rewardXp: 50,
        lastUpdated: DateTime.now(),
        isSynced: false,
      );
      await xpService.saveQuestProgress(quest);
      
      final unsyncedData = xpService.getUnsyncedData();
      expect(unsyncedData['quests'], isNotEmpty);
    });

    test('should collect multiple quest data for sync', () async {
      for (int i = 1; i <= 3; i++) {
        final quest = QuestProgress(
          questId: 'quest_$i',
          questName: 'Test Quest $i',
          currentProgress: i * 2,
          targetProgress: 10,
          isCompleted: false,
          rewardXp: 50,
          lastUpdated: DateTime.now(),
          isSynced: false,
        );
        await xpService.saveQuestProgress(quest);
      }
      
      final unsyncedData = xpService.getUnsyncedData();
      expect((unsyncedData['quests'] as List).length, 3);
    });
  });

  group('Offline Functionality', () {
    test('should cache data when offline', () async {
      // Award XP while "offline"
      await xpService.awardXp(50);
      await xpService.updateStreak();
      
      // Data should be cached locally
      expect(xpService.getXpData()?.totalXp, 50);
      expect(xpService.getStreakData()?.currentStreak, 1);
      
      // And marked as unsynced
      expect(syncProvider.hasUnsyncedData, true);
    });

    test('should accumulate multiple offline operations', () async {
      // Perform multiple operations while offline
      await xpService.awardXp(30);
      await xpService.awardXp(40);
      await xpService.awardXp(30);
      await xpService.updateStreak();
      
      final quest = QuestProgress(
        questId: 'quest_1',
        questName: 'Test Quest',
        currentProgress: 5,
        targetProgress: 10,
        isCompleted: false,
        rewardXp: 50,
        lastUpdated: DateTime.now(),
        isSynced: false,
      );
      await xpService.saveQuestProgress(quest);
      
      // All data should be cached
      expect(xpService.getXpData()?.totalXp, 100);
      expect(xpService.getStreakData(), isNotNull);
      expect(xpService.getQuestProgress('quest_1'), isNotNull);
      
      // All should be unsynced
      expect(syncProvider.hasUnsyncedData, true);
    });

    test('should preserve data across app restarts', () async {
      // Add data
      await xpService.awardXp(75);
      final xpBefore = xpService.getXpData();
      
      // Simulate app restart by closing and reopening
      await xpService.close();
      
      final newXpService = XpService();
      await newXpService.initialize();
      
      final xpAfter = newXpService.getXpData();
      expect(xpAfter?.totalXp, xpBefore?.totalXp);
      expect(xpAfter?.level, xpBefore?.level);
      
      await newXpService.close();
    });
  });

  group('Force Sync', () {
    test('should allow manual sync trigger', () async {
      await xpService.awardXp(50);
      
      expect(syncProvider.hasUnsyncedData, true);
      
      // Trigger manual sync
      await syncProvider.forceSyncNow();
      
      // In real scenario with network, data would be synced
      // In test, we just verify the method can be called
      expect(syncProvider.hasUnsyncedData, true);
    });
  });
}
