import 'package:flutter/foundation.dart';
import '../models/xp_model.dart';
import '../models/quest_model.dart';
import '../models/streak_model.dart';
import '../services/api_service.dart';

/// Provider for managing gamification state (XP, quests, streaks)
class GamificationProvider extends ChangeNotifier {
  final ApiService _apiService;
  
  // State
  XpModel? _xpData;
  QuestListResponse? _questData;
  StreakResponse? _streakData;
  
  bool _isLoading = false;
  String? _error;
  
  // Getters
  XpModel? get xpData => _xpData;
  QuestListResponse? get questData => _questData;
  StreakResponse? get streakData => _streakData;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  GamificationProvider(this._apiService);

  // ============================================================================
  // XP METHODS
  // ============================================================================

  /// Fetch user XP data
  Future<void> fetchXp() async {
    _setLoading(true);
    _error = null;
    
    try {
      _xpData = await _apiService.getXp();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    } finally {
      _setLoading(false);
    }
  }

  /// Award XP to the user
  Future<XpAward?> awardXp({
    required int amount,
    required String reason,
    required String actionType,
  }) async {
    try {
      final award = await _apiService.awardXp(
        amount: amount,
        reason: reason,
        actionType: actionType,
      );
      
      // Refresh XP data after awarding
      await fetchXp();
      
      return award;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  /// Update local XP optimistically (for immediate UI feedback)
  void updateXpOptimistically(int xpToAdd) {
    if (_xpData == null) return;
    
    final newCurrentXp = _xpData!.currentXp + xpToAdd;
    final newTotalXp = _xpData!.totalXp + xpToAdd;
    
    // Check if leveled up
    int newLevel = _xpData!.level;
    int newNextLevelXp = _xpData!.nextLevelXp;
    int remainingXp = newCurrentXp;
    
    while (remainingXp >= newNextLevelXp) {
      remainingXp -= newNextLevelXp;
      newLevel++;
      newNextLevelXp = _calculateNextLevelXp(newLevel);
    }
    
    _xpData = _xpData!.copyWith(
      currentXp: remainingXp,
      level: newLevel,
      nextLevelXp: newNextLevelXp,
      totalXp: newTotalXp,
      lastUpdated: DateTime.now(),
    );
    
    notifyListeners();
  }

  /// Calculate XP required for next level
  int _calculateNextLevelXp(int level) {
    // Simple formula: 100 * level^1.5
    return (100 * (level * 1.5)).round();
  }

  // ============================================================================
  // QUEST METHODS
  // ============================================================================

  /// Fetch all quests
  Future<void> fetchQuests({String? category}) async {
    _setLoading(true);
    _error = null;
    
    try {
      _questData = await _apiService.getQuests(category: category);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    } finally {
      _setLoading(false);
    }
  }

  /// Get quest by ID
  Future<QuestModel?> getQuestById(String questId) async {
    try {
      return await _apiService.getQuestById(questId);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  /// Update quest progress
  Future<void> updateQuestProgress({
    required String questId,
    required int progress,
    bool increment = true,
  }) async {
    try {
      final updatedQuest = await _apiService.updateQuestProgress(
        questId: questId,
        progress: progress,
        increment: increment,
      );
      
      // Update local quest data
      if (_questData != null) {
        final questIndex = _questData!.quests.indexWhere((q) => q.id == questId);
        if (questIndex != -1) {
          final updatedQuests = List<QuestModel>.from(_questData!.quests);
          updatedQuests[questIndex] = updatedQuest;
          
          _questData = QuestListResponse(
            quests: updatedQuests,
            totalQuests: _questData!.totalQuests,
            completedQuests: updatedQuest.isCompleted 
                ? _questData!.completedQuests + 1 
                : _questData!.completedQuests,
          );
          
          notifyListeners();
        }
      }
      
      // Refresh XP if quest is completed
      if (updatedQuest.isCompleted) {
        await fetchXp();
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Complete a quest
  Future<void> completeQuest(String questId) async {
    try {
      await _apiService.completeQuest(questId);
      
      // Refresh quests and XP
      await Future.wait([
        fetchQuests(),
        fetchXp(),
      ]);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Get active quests (not completed, not expired)
  List<QuestModel> get activeQuests {
    if (_questData == null) return [];
    
    return _questData!.quests.where((quest) {
      return !quest.isCompleted && !quest.isExpired;
    }).toList();
  }

  /// Get completed quests
  List<QuestModel> get completedQuests {
    if (_questData == null) return [];
    
    return _questData!.quests.where((quest) => quest.isCompleted).toList();
  }

  // ============================================================================
  // STREAK METHODS
  // ============================================================================

  /// Fetch all streaks
  Future<void> fetchStreaks() async {
    _setLoading(true);
    _error = null;
    
    try {
      _streakData = await _apiService.getStreaks();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    } finally {
      _setLoading(false);
    }
  }

  /// Get streak by type
  Future<StreakModel?> getStreakByType(StreakType type) async {
    try {
      return await _apiService.getStreakByType(type);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  /// Record streak activity
  Future<void> recordStreakActivity(StreakType type) async {
    try {
      final updatedStreak = await _apiService.recordStreakActivity(type);
      
      // Update local streak data
      if (_streakData != null) {
        final streakIndex = _streakData!.streaks.indexWhere((s) => s.type == type);
        if (streakIndex != -1) {
          final updatedStreaks = List<StreakModel>.from(_streakData!.streaks);
          updatedStreaks[streakIndex] = updatedStreak;
          
          _streakData = StreakResponse(
            streaks: updatedStreaks,
            totalActiveStreaks: updatedStreaks.where((s) => s.isActive).length,
            lastUpdated: DateTime.now(),
          );
          
          notifyListeners();
        }
      }
      
      // Check if streak milestone reached - award bonus XP
      if (updatedStreak.currentStreak % updatedStreak.nextMilestone == 0) {
        await awardXp(
          amount: updatedStreak.xpBonusPerMilestone,
          reason: 'Streak milestone reached: ${updatedStreak.currentStreak} days',
          actionType: 'streak_milestone',
        );
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Get active streaks
  List<StreakModel> get activeStreaks {
    if (_streakData == null) return [];
    
    return _streakData!.streaks.where((streak) => streak.isActive).toList();
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /// Refresh all gamification data
  Future<void> refreshAll() async {
    await Future.wait([
      fetchXp(),
      fetchQuests(),
      fetchStreaks(),
    ]);
  }

  /// Clear error message
  void clearError() {
    _error = null;
    notifyListeners();
  }

  /// Set loading state
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  /// Clear all data (for logout)
  void clear() {
    _xpData = null;
    _questData = null;
    _streakData = null;
    _error = null;
    _isLoading = false;
    notifyListeners();
  }
}
