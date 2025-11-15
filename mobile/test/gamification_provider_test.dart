import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

import 'package:quantum_falcon_mobile/providers/gamification_provider.dart';
import 'package:quantum_falcon_mobile/services/api_service.dart';
import 'package:quantum_falcon_mobile/models/xp_model.dart';
import 'package:quantum_falcon_mobile/models/quest_model.dart';
import 'package:quantum_falcon_mobile/models/streak_model.dart';

@GenerateMocks([ApiService])
import 'gamification_provider_test.mocks.dart';

void main() {
  group('GamificationProvider', () {
    late GamificationProvider provider;
    late MockApiService mockApiService;

    setUp(() {
      mockApiService = MockApiService();
      provider = GamificationProvider(mockApiService);
    });

    group('XP Methods', () {
      test('fetchXp updates xpData on success', () async {
        // Arrange
        final xpModel = XpModel(
          currentXp: 150,
          level: 3,
          nextLevelXp: 300,
          totalXp: 450,
          multiplier: 1.5,
          lastUpdated: DateTime.now(),
        );

        when(mockApiService.getXp()).thenAnswer((_) async => xpModel);

        // Act
        await provider.fetchXp();

        // Assert
        expect(provider.xpData, isNotNull);
        expect(provider.xpData!.level, 3);
        expect(provider.xpData!.currentXp, 150);
        expect(provider.isLoading, false);
        expect(provider.error, isNull);
      });

      test('fetchXp sets error on failure', () async {
        // Arrange
        when(mockApiService.getXp()).thenThrow(Exception('API Error'));

        // Act
        await provider.fetchXp();

        // Assert
        expect(provider.xpData, isNull);
        expect(provider.error, isNotNull);
        expect(provider.isLoading, false);
      });

      test('awardXp calls API and refreshes XP', () async {
        // Arrange
        final xpAward = XpAward(
          amount: 50,
          reason: 'Test',
          actionType: 'test_action',
          timestamp: DateTime.now(),
          leveledUp: false,
        );

        final xpModel = XpModel(
          currentXp: 200,
          level: 3,
          nextLevelXp: 300,
          totalXp: 500,
          multiplier: 1.0,
          lastUpdated: DateTime.now(),
        );

        when(mockApiService.awardXp(
          amount: 50,
          reason: 'Test',
          actionType: 'test_action',
        )).thenAnswer((_) async => xpAward);

        when(mockApiService.getXp()).thenAnswer((_) async => xpModel);

        // Act
        final result = await provider.awardXp(
          amount: 50,
          reason: 'Test',
          actionType: 'test_action',
        );

        // Assert
        expect(result, isNotNull);
        expect(result!.amount, 50);
        verify(mockApiService.getXp()).called(1);
      });

      test('updateXpOptimistically updates local XP', () {
        // Arrange
        provider.xpData = XpModel(
          currentXp: 50,
          level: 1,
          nextLevelXp: 100,
          totalXp: 50,
          multiplier: 1.0,
          lastUpdated: DateTime.now(),
        );

        // Act
        provider.updateXpOptimistically(30);

        // Assert
        expect(provider.xpData!.currentXp, 80);
        expect(provider.xpData!.totalXp, 80);
      });

      test('updateXpOptimistically handles level up', () {
        // Arrange
        provider.xpData = XpModel(
          currentXp: 90,
          level: 1,
          nextLevelXp: 100,
          totalXp: 90,
          multiplier: 1.0,
          lastUpdated: DateTime.now(),
        );

        // Act
        provider.updateXpOptimistically(20);

        // Assert
        expect(provider.xpData!.level, 2);
        expect(provider.xpData!.currentXp, greaterThan(0));
      });
    });

    group('Quest Methods', () {
      test('fetchQuests updates questData on success', () async {
        // Arrange
        final questResponse = QuestListResponse(
          quests: [
            QuestModel(
              id: 'quest1',
              title: 'Test Quest',
              description: 'Test description',
              category: QuestCategory.daily,
              xpReward: 100,
              progress: 0,
              target: 10,
            ),
          ],
          totalQuests: 1,
          completedQuests: 0,
        );

        when(mockApiService.getQuests(category: null))
            .thenAnswer((_) async => questResponse);

        // Act
        await provider.fetchQuests();

        // Assert
        expect(provider.questData, isNotNull);
        expect(provider.questData!.quests.length, 1);
        expect(provider.questData!.totalQuests, 1);
        expect(provider.error, isNull);
      });

      test('updateQuestProgress updates local quest', () async {
        // Arrange
        final quest = QuestModel(
          id: 'quest1',
          title: 'Test Quest',
          description: 'Test description',
          category: QuestCategory.daily,
          xpReward: 100,
          progress: 5,
          target: 10,
        );

        provider.questData = QuestListResponse(
          quests: [quest],
          totalQuests: 1,
          completedQuests: 0,
        );

        final updatedQuest = quest.copyWith(progress: 6);

        when(mockApiService.updateQuestProgress(
          questId: 'quest1',
          progress: 1,
          increment: true,
        )).thenAnswer((_) async => updatedQuest);

        // Act
        await provider.updateQuestProgress(
          questId: 'quest1',
          progress: 1,
          increment: true,
        );

        // Assert
        expect(provider.questData!.quests[0].progress, 6);
      });

      test('completeQuest refreshes data', () async {
        // Arrange
        final questResponse = QuestListResponse(
          quests: [],
          totalQuests: 1,
          completedQuests: 1,
        );

        final xpModel = XpModel(
          currentXp: 200,
          level: 3,
          nextLevelXp: 300,
          totalXp: 500,
          multiplier: 1.0,
          lastUpdated: DateTime.now(),
        );

        when(mockApiService.completeQuest('quest1'))
            .thenAnswer((_) async => {'success': true});
        when(mockApiService.getQuests(category: null))
            .thenAnswer((_) async => questResponse);
        when(mockApiService.getXp()).thenAnswer((_) async => xpModel);

        // Act
        await provider.completeQuest('quest1');

        // Assert
        verify(mockApiService.completeQuest('quest1')).called(1);
        verify(mockApiService.getQuests(category: null)).called(1);
        verify(mockApiService.getXp()).called(1);
      });

      test('activeQuests filters correctly', () {
        // Arrange
        provider.questData = QuestListResponse(
          quests: [
            QuestModel(
              id: 'quest1',
              title: 'Active Quest',
              description: 'Description',
              category: QuestCategory.daily,
              xpReward: 100,
              progress: 0,
              target: 10,
              isCompleted: false,
            ),
            QuestModel(
              id: 'quest2',
              title: 'Completed Quest',
              description: 'Description',
              category: QuestCategory.daily,
              xpReward: 100,
              progress: 10,
              target: 10,
              isCompleted: true,
            ),
          ],
          totalQuests: 2,
          completedQuests: 1,
        );

        // Act
        final activeQuests = provider.activeQuests;

        // Assert
        expect(activeQuests.length, 1);
        expect(activeQuests[0].id, 'quest1');
      });
    });

    group('Streak Methods', () {
      test('fetchStreaks updates streakData on success', () async {
        // Arrange
        final streakResponse = StreakResponse(
          streaks: [
            StreakModel(
              currentStreak: 5,
              longestStreak: 10,
              streakStartDate: DateTime.now(),
              lastActivityDate: DateTime.now(),
              type: StreakType.dailyLogin,
              nextMilestone: 7,
            ),
          ],
          totalActiveStreaks: 1,
          lastUpdated: DateTime.now(),
        );

        when(mockApiService.getStreaks()).thenAnswer((_) async => streakResponse);

        // Act
        await provider.fetchStreaks();

        // Assert
        expect(provider.streakData, isNotNull);
        expect(provider.streakData!.streaks.length, 1);
        expect(provider.streakData!.totalActiveStreaks, 1);
        expect(provider.error, isNull);
      });

      test('recordStreakActivity updates local streak', () async {
        // Arrange
        final streak = StreakModel(
          currentStreak: 5,
          longestStreak: 10,
          streakStartDate: DateTime.now(),
          lastActivityDate: DateTime.now(),
          type: StreakType.dailyLogin,
          nextMilestone: 7,
        );

        provider.streakData = StreakResponse(
          streaks: [streak],
          totalActiveStreaks: 1,
          lastUpdated: DateTime.now(),
        );

        final updatedStreak = streak.copyWith(currentStreak: 6);

        when(mockApiService.recordStreakActivity(StreakType.dailyLogin))
            .thenAnswer((_) async => updatedStreak);

        // Act
        await provider.recordStreakActivity(StreakType.dailyLogin);

        // Assert
        expect(provider.streakData!.streaks[0].currentStreak, 6);
      });

      test('recordStreakActivity awards bonus XP at milestone', () async {
        // Arrange
        final streak = StreakModel(
          currentStreak: 6,
          longestStreak: 10,
          streakStartDate: DateTime.now(),
          lastActivityDate: DateTime.now(),
          type: StreakType.dailyLogin,
          xpBonusPerMilestone: 500,
          nextMilestone: 7,
        );

        provider.streakData = StreakResponse(
          streaks: [streak],
          totalActiveStreaks: 1,
          lastUpdated: DateTime.now(),
        );

        final updatedStreak = streak.copyWith(currentStreak: 7);

        final xpAward = XpAward(
          amount: 500,
          reason: 'Streak milestone reached: 7 days',
          actionType: 'streak_milestone',
          timestamp: DateTime.now(),
        );

        final xpModel = XpModel(
          currentXp: 500,
          level: 5,
          nextLevelXp: 600,
          totalXp: 1500,
          multiplier: 1.0,
          lastUpdated: DateTime.now(),
        );

        when(mockApiService.recordStreakActivity(StreakType.dailyLogin))
            .thenAnswer((_) async => updatedStreak);
        when(mockApiService.awardXp(
          amount: 500,
          reason: 'Streak milestone reached: 7 days',
          actionType: 'streak_milestone',
        )).thenAnswer((_) async => xpAward);
        when(mockApiService.getXp()).thenAnswer((_) async => xpModel);

        // Act
        await provider.recordStreakActivity(StreakType.dailyLogin);

        // Assert
        verify(mockApiService.awardXp(
          amount: 500,
          reason: 'Streak milestone reached: 7 days',
          actionType: 'streak_milestone',
        )).called(1);
      });

      test('activeStreaks filters correctly', () {
        // Arrange
        provider.streakData = StreakResponse(
          streaks: [
            StreakModel(
              currentStreak: 5,
              longestStreak: 10,
              streakStartDate: DateTime.now(),
              lastActivityDate: DateTime.now(),
              type: StreakType.dailyLogin,
              nextMilestone: 7,
              isActive: true,
            ),
            StreakModel(
              currentStreak: 0,
              longestStreak: 5,
              streakStartDate: DateTime.now(),
              lastActivityDate: DateTime.now().subtract(const Duration(days: 5)),
              type: StreakType.trading,
              nextMilestone: 7,
              isActive: false,
            ),
          ],
          totalActiveStreaks: 1,
          lastUpdated: DateTime.now(),
        );

        // Act
        final activeStreaks = provider.activeStreaks;

        // Assert
        expect(activeStreaks.length, 1);
        expect(activeStreaks[0].type, StreakType.dailyLogin);
      });
    });

    group('Utility Methods', () {
      test('refreshAll calls all fetch methods', () async {
        // Arrange
        when(mockApiService.getXp()).thenAnswer((_) async => XpModel(
          currentXp: 0,
          level: 1,
          nextLevelXp: 100,
          totalXp: 0,
          lastUpdated: DateTime.now(),
        ));
        when(mockApiService.getQuests(category: null))
            .thenAnswer((_) async => QuestListResponse(
          quests: [],
          totalQuests: 0,
          completedQuests: 0,
        ));
        when(mockApiService.getStreaks()).thenAnswer((_) async => StreakResponse(
          streaks: [],
          totalActiveStreaks: 0,
          lastUpdated: DateTime.now(),
        ));

        // Act
        await provider.refreshAll();

        // Assert
        verify(mockApiService.getXp()).called(1);
        verify(mockApiService.getQuests(category: null)).called(1);
        verify(mockApiService.getStreaks()).called(1);
      });

      test('clearError removes error', () {
        // Arrange
        provider.error = 'Test error';

        // Act
        provider.clearError();

        // Assert
        expect(provider.error, isNull);
      });

      test('clear resets all state', () {
        // Arrange
        provider.xpData = XpModel(
          currentXp: 100,
          level: 2,
          nextLevelXp: 200,
          totalXp: 100,
          lastUpdated: DateTime.now(),
        );

        // Act
        provider.clear();

        // Assert
        expect(provider.xpData, isNull);
        expect(provider.questData, isNull);
        expect(provider.streakData, isNull);
        expect(provider.error, isNull);
        expect(provider.isLoading, false);
      });
    });
  });
}
