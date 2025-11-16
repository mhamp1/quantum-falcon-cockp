import 'package:hive_flutter/hive_flutter.dart';
import '../models/xp_data.dart';
import '../models/streak_data.dart';
import '../models/quest_progress.dart';

class XpService {
  static const String xpBoxName = 'xp_box';
  static const String streakBoxName = 'streak_box';
  static const String questBoxName = 'quest_box';

  Box<XpData>? _xpBox;
  Box<StreakData>? _streakBox;
  Box<QuestProgress>? _questBox;

  /// Initialize Hive and open boxes
  Future<void> initialize() async {
    await Hive.initFlutter();

    // Register adapters
    if (!Hive.isAdapterRegistered(0)) {
      Hive.registerAdapter(XpDataAdapter());
    }
    if (!Hive.isAdapterRegistered(1)) {
      Hive.registerAdapter(StreakDataAdapter());
    }
    if (!Hive.isAdapterRegistered(2)) {
      Hive.registerAdapter(QuestProgressAdapter());
    }

    // Open boxes
    _xpBox = await Hive.openBox<XpData>(xpBoxName);
    _streakBox = await Hive.openBox<StreakData>(streakBoxName);
    _questBox = await Hive.openBox<QuestProgress>(questBoxName);
  }

  // ============= XP Data Methods =============

  /// Get current XP data from local cache
  XpData? getXpData() {
    return _xpBox?.get('current_xp');
  }

  /// Save XP data to local cache
  Future<void> saveXpData(XpData xpData) async {
    await _xpBox?.put('current_xp', xpData);
  }

  /// Award XP points (offline-capable)
  Future<void> awardXp(int xpAmount) async {
    final currentData = getXpData() ?? XpData(
      level: 1,
      currentXp: 0,
      totalXp: 0,
      lastUpdated: DateTime.now(),
      isSynced: false,
    );

    final newTotalXp = currentData.totalXp + xpAmount;
    final newLevel = _calculateLevel(newTotalXp);
    final newCurrentXp = _calculateCurrentXp(newTotalXp, newLevel);

    final updatedData = currentData.copyWith(
      level: newLevel,
      currentXp: newCurrentXp,
      totalXp: newTotalXp,
      lastUpdated: DateTime.now(),
      isSynced: false, // Mark as not synced
    );

    await saveXpData(updatedData);
  }

  /// Calculate level from total XP (100 XP per level)
  int _calculateLevel(int totalXp) {
    return (totalXp / 100).floor() + 1;
  }

  /// Calculate current XP within level
  int _calculateCurrentXp(int totalXp, int level) {
    return totalXp % 100;
  }

  // ============= Streak Methods =============

  /// Get current streak data from local cache
  StreakData? getStreakData() {
    return _streakBox?.get('current_streak');
  }

  /// Save streak data to local cache
  Future<void> saveStreakData(StreakData streakData) async {
    await _streakBox?.put('current_streak', streakData);
  }

  /// Update streak (checks if user maintained daily activity)
  Future<void> updateStreak() async {
    final now = DateTime.now();
    final currentData = getStreakData() ?? StreakData(
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: now,
      lastUpdated: now,
      isSynced: false,
    );

    final daysSinceLastActive = now.difference(currentData.lastActiveDate).inDays;

    int newCurrentStreak;
    int newLongestStreak = currentData.longestStreak;

    if (daysSinceLastActive == 0) {
      // Same day, no change
      newCurrentStreak = currentData.currentStreak;
    } else if (daysSinceLastActive == 1) {
      // Consecutive day, increment streak
      newCurrentStreak = currentData.currentStreak + 1;
      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }
    } else {
      // Streak broken, reset to 1
      newCurrentStreak = 1;
    }

    final updatedData = currentData.copyWith(
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: now,
      lastUpdated: now,
      isSynced: false,
    );

    await saveStreakData(updatedData);
  }

  // ============= Quest Progress Methods =============

  /// Get all quest progress from local cache
  List<QuestProgress> getAllQuests() {
    return _questBox?.values.toList() ?? [];
  }

  /// Get specific quest progress by ID
  QuestProgress? getQuestProgress(String questId) {
    return _questBox?.get(questId);
  }

  /// Save quest progress to local cache
  Future<void> saveQuestProgress(QuestProgress questProgress) async {
    await _questBox?.put(questProgress.questId, questProgress);
  }

  /// Update quest progress
  Future<void> updateQuestProgress(String questId, int progressIncrement) async {
    final quest = getQuestProgress(questId);
    if (quest == null) return;

    final newProgress = (quest.currentProgress + progressIncrement)
        .clamp(0, quest.targetProgress);
    final isCompleted = newProgress >= quest.targetProgress;

    final updatedQuest = quest.copyWith(
      currentProgress: newProgress,
      isCompleted: isCompleted,
      lastUpdated: DateTime.now(),
      isSynced: false,
    );

    await saveQuestProgress(updatedQuest);

    // Award XP if quest completed
    if (isCompleted && !quest.isCompleted) {
      await awardXp(quest.rewardXp);
    }
  }

  /// Delete a quest from local cache
  Future<void> deleteQuest(String questId) async {
    await _questBox?.delete(questId);
  }

  /// Clear all quest progress
  Future<void> clearAllQuests() async {
    await _questBox?.clear();
  }

  // ============= Sync Status Methods =============

  /// Get all unsynced data
  Map<String, dynamic> getUnsyncedData() {
    final xpData = getXpData();
    final streakData = getStreakData();
    final quests = getAllQuests();

    return {
      'xp': (xpData != null && !xpData.isSynced) ? xpData.toJson() : null,
      'streak': (streakData != null && !streakData.isSynced)
          ? streakData.toJson()
          : null,
      'quests': quests
          .where((q) => !q.isSynced)
          .map((q) => q.toJson())
          .toList(),
    };
  }

  /// Mark XP data as synced
  Future<void> markXpAsSynced() async {
    final xpData = getXpData();
    if (xpData != null) {
      await saveXpData(xpData.copyWith(isSynced: true));
    }
  }

  /// Mark streak data as synced
  Future<void> markStreakAsSynced() async {
    final streakData = getStreakData();
    if (streakData != null) {
      await saveStreakData(streakData.copyWith(isSynced: true));
    }
  }

  /// Mark quest as synced
  Future<void> markQuestAsSynced(String questId) async {
    final quest = getQuestProgress(questId);
    if (quest != null) {
      await saveQuestProgress(quest.copyWith(isSynced: true));
    }
  }

  /// Mark all data as synced
  Future<void> markAllAsSynced() async {
    await markXpAsSynced();
    await markStreakAsSynced();
    
    final quests = getAllQuests();
    for (final quest in quests) {
      await markQuestAsSynced(quest.questId);
    }
  }

  // ============= Utility Methods =============

  /// Close all boxes
  Future<void> close() async {
    await _xpBox?.close();
    await _streakBox?.close();
    await _questBox?.close();
  }

  /// Clear all data (for testing or reset)
  Future<void> clearAllData() async {
    await _xpBox?.clear();
    await _streakBox?.clear();
    await _questBox?.clear();
  }

  /// Check if there is any unsynced data
  bool hasUnsyncedData() {
    final xpData = getXpData();
    final streakData = getStreakData();
    final quests = getAllQuests();

    return (xpData != null && !xpData.isSynced) ||
        (streakData != null && !streakData.isSynced) ||
        quests.any((q) => !q.isSynced);
  }
}
