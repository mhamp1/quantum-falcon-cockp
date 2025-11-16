import 'package:flutter_test/flutter_test.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:quantum_falcon_mobile/models/xp_data.dart';
import 'package:quantum_falcon_mobile/models/streak_data.dart';
import 'package:quantum_falcon_mobile/models/quest_progress.dart';
import 'package:quantum_falcon_mobile/services/xp_service.dart';

void main() {
  late XpService xpService;

  setUp(() async {
    // Initialize Hive with temporary directory for testing
    await Hive.initFlutter('test_data');
    xpService = XpService();
    await xpService.initialize();
    await xpService.clearAllData();
  });

  tearDown(() async {
    await xpService.clearAllData();
    await xpService.close();
    await Hive.deleteFromDisk();
  });

  group('XP Data Tests', () {
    test('should save and retrieve XP data', () async {
      final xpData = XpData(
        level: 5,
        currentXp: 50,
        totalXp: 450,
        lastUpdated: DateTime.now(),
        isSynced: false,
      );

      await xpService.saveXpData(xpData);
      final retrieved = xpService.getXpData();

      expect(retrieved, isNotNull);
      expect(retrieved!.level, 5);
      expect(retrieved.currentXp, 50);
      expect(retrieved.totalXp, 450);
      expect(retrieved.isSynced, false);
    });

    test('should award XP and calculate level correctly', () async {
      // Start with no XP
      expect(xpService.getXpData(), isNull);

      // Award 150 XP (should be level 2, 50 current XP)
      await xpService.awardXp(150);

      final xpData = xpService.getXpData();
      expect(xpData, isNotNull);
      expect(xpData!.level, 2); // 150/100 = 1.5, floor + 1 = 2
      expect(xpData.currentXp, 50); // 150 % 100 = 50
      expect(xpData.totalXp, 150);
      expect(xpData.isSynced, false);
    });

    test('should accumulate XP awards correctly', () async {
      await xpService.awardXp(80);
      await xpService.awardXp(30);
      await xpService.awardXp(40);

      final xpData = xpService.getXpData();
      expect(xpData!.totalXp, 150);
      expect(xpData.level, 2);
      expect(xpData.currentXp, 50);
    });

    test('should mark XP as synced', () async {
      await xpService.awardXp(50);
      expect(xpService.getXpData()!.isSynced, false);

      await xpService.markXpAsSynced();
      expect(xpService.getXpData()!.isSynced, true);
    });
  });

  group('Streak Data Tests', () {
    test('should save and retrieve streak data', () async {
      final now = DateTime.now();
      final streakData = StreakData(
        currentStreak: 7,
        longestStreak: 15,
        lastActiveDate: now,
        lastUpdated: now,
        isSynced: false,
      );

      await xpService.saveStreakData(streakData);
      final retrieved = xpService.getStreakData();

      expect(retrieved, isNotNull);
      expect(retrieved!.currentStreak, 7);
      expect(retrieved.longestStreak, 15);
      expect(retrieved.isSynced, false);
    });

    test('should start streak when first updated', () async {
      expect(xpService.getStreakData(), isNull);

      await xpService.updateStreak();

      final streak = xpService.getStreakData();
      expect(streak, isNotNull);
      expect(streak!.currentStreak, 1);
      expect(streak.longestStreak, 1);
    });

    test('should maintain streak on same day', () async {
      await xpService.updateStreak();
      final firstUpdate = xpService.getStreakData()!.currentStreak;

      await xpService.updateStreak();
      final secondUpdate = xpService.getStreakData()!.currentStreak;

      expect(secondUpdate, firstUpdate);
    });

    test('should increment streak on consecutive day', () async {
      final yesterday = DateTime.now().subtract(const Duration(days: 1));
      final streakData = StreakData(
        currentStreak: 5,
        longestStreak: 10,
        lastActiveDate: yesterday,
        lastUpdated: yesterday,
        isSynced: false,
      );
      await xpService.saveStreakData(streakData);

      await xpService.updateStreak();

      final updated = xpService.getStreakData();
      expect(updated!.currentStreak, 6);
      expect(updated.longestStreak, 10);
    });

    test('should reset streak when broken', () async {
      final threeDaysAgo = DateTime.now().subtract(const Duration(days: 3));
      final streakData = StreakData(
        currentStreak: 10,
        longestStreak: 15,
        lastActiveDate: threeDaysAgo,
        lastUpdated: threeDaysAgo,
        isSynced: false,
      );
      await xpService.saveStreakData(streakData);

      await xpService.updateStreak();

      final updated = xpService.getStreakData();
      expect(updated!.currentStreak, 1);
      expect(updated.longestStreak, 15); // Longest should remain
    });

    test('should update longest streak when exceeded', () async {
      final yesterday = DateTime.now().subtract(const Duration(days: 1));
      final streakData = StreakData(
        currentStreak: 15,
        longestStreak: 15,
        lastActiveDate: yesterday,
        lastUpdated: yesterday,
        isSynced: false,
      );
      await xpService.saveStreakData(streakData);

      await xpService.updateStreak();

      final updated = xpService.getStreakData();
      expect(updated!.currentStreak, 16);
      expect(updated.longestStreak, 16);
    });
  });

  group('Quest Progress Tests', () {
    test('should save and retrieve quest progress', () async {
      final quest = QuestProgress(
        questId: 'quest_1',
        questName: 'Complete First Trade',
        currentProgress: 5,
        targetProgress: 10,
        isCompleted: false,
        rewardXp: 100,
        lastUpdated: DateTime.now(),
        isSynced: false,
      );

      await xpService.saveQuestProgress(quest);
      final retrieved = xpService.getQuestProgress('quest_1');

      expect(retrieved, isNotNull);
      expect(retrieved!.questId, 'quest_1');
      expect(retrieved.currentProgress, 5);
      expect(retrieved.targetProgress, 10);
      expect(retrieved.isCompleted, false);
    });

    test('should update quest progress', () async {
      final quest = QuestProgress(
        questId: 'quest_1',
        questName: 'Test Quest',
        currentProgress: 0,
        targetProgress: 10,
        isCompleted: false,
        rewardXp: 50,
        lastUpdated: DateTime.now(),
        isSynced: false,
      );
      await xpService.saveQuestProgress(quest);

      await xpService.updateQuestProgress('quest_1', 3);

      final updated = xpService.getQuestProgress('quest_1');
      expect(updated!.currentProgress, 3);
      expect(updated.isCompleted, false);
    });

    test('should complete quest and award XP', () async {
      final quest = QuestProgress(
        questId: 'quest_1',
        questName: 'Test Quest',
        currentProgress: 8,
        targetProgress: 10,
        isCompleted: false,
        rewardXp: 100,
        lastUpdated: DateTime.now(),
        isSynced: false,
      );
      await xpService.saveQuestProgress(quest);

      await xpService.updateQuestProgress('quest_1', 5);

      final updated = xpService.getQuestProgress('quest_1');
      expect(updated!.currentProgress, 10);
      expect(updated.isCompleted, true);

      // Check that XP was awarded
      final xpData = xpService.getXpData();
      expect(xpData, isNotNull);
      expect(xpData!.totalXp, 100);
    });

    test('should not exceed target progress', () async {
      final quest = QuestProgress(
        questId: 'quest_1',
        questName: 'Test Quest',
        currentProgress: 8,
        targetProgress: 10,
        isCompleted: false,
        rewardXp: 50,
        lastUpdated: DateTime.now(),
        isSynced: false,
      );
      await xpService.saveQuestProgress(quest);

      await xpService.updateQuestProgress('quest_1', 20);

      final updated = xpService.getQuestProgress('quest_1');
      expect(updated!.currentProgress, 10); // Should be clamped to target
    });

    test('should calculate progress percentage correctly', () {
      final quest = QuestProgress(
        questId: 'quest_1',
        questName: 'Test Quest',
        currentProgress: 5,
        targetProgress: 10,
        isCompleted: false,
        rewardXp: 50,
        lastUpdated: DateTime.now(),
      );

      expect(quest.progressPercentage, 0.5);
    });

    test('should get all quests', () async {
      final quest1 = QuestProgress(
        questId: 'quest_1',
        questName: 'Quest 1',
        currentProgress: 5,
        targetProgress: 10,
        isCompleted: false,
        rewardXp: 50,
        lastUpdated: DateTime.now(),
      );

      final quest2 = QuestProgress(
        questId: 'quest_2',
        questName: 'Quest 2',
        currentProgress: 10,
        targetProgress: 10,
        isCompleted: true,
        rewardXp: 100,
        lastUpdated: DateTime.now(),
      );

      await xpService.saveQuestProgress(quest1);
      await xpService.saveQuestProgress(quest2);

      final allQuests = xpService.getAllQuests();
      expect(allQuests.length, 2);
    });

    test('should delete quest', () async {
      final quest = QuestProgress(
        questId: 'quest_1',
        questName: 'Test Quest',
        currentProgress: 5,
        targetProgress: 10,
        isCompleted: false,
        rewardXp: 50,
        lastUpdated: DateTime.now(),
      );
      await xpService.saveQuestProgress(quest);

      await xpService.deleteQuest('quest_1');

      expect(xpService.getQuestProgress('quest_1'), isNull);
    });
  });

  group('Sync Status Tests', () {
    test('should detect unsynced XP data', () async {
      await xpService.awardXp(50);
      expect(xpService.hasUnsyncedData(), true);

      await xpService.markXpAsSynced();
      expect(xpService.hasUnsyncedData(), false);
    });

    test('should detect unsynced streak data', () async {
      await xpService.updateStreak();
      expect(xpService.hasUnsyncedData(), true);

      await xpService.markStreakAsSynced();
      expect(xpService.hasUnsyncedData(), false);
    });

    test('should detect unsynced quest data', () async {
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

      expect(xpService.hasUnsyncedData(), true);

      await xpService.markQuestAsSynced('quest_1');
      expect(xpService.hasUnsyncedData(), false);
    });

    test('should get unsynced data', () async {
      await xpService.awardXp(50);
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

      final unsyncedData = xpService.getUnsyncedData();

      expect(unsyncedData['xp'], isNotNull);
      expect(unsyncedData['streak'], isNotNull);
      expect(unsyncedData['quests'], isA<List>());
      expect((unsyncedData['quests'] as List).length, 1);
    });

    test('should mark all as synced', () async {
      await xpService.awardXp(50);
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

      expect(xpService.hasUnsyncedData(), true);

      await xpService.markAllAsSynced();

      expect(xpService.hasUnsyncedData(), false);
    });
  });
}
