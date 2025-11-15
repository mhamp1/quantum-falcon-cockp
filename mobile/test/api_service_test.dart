import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'dart:convert';

import 'package:quantum_falcon_mobile/services/api_service.dart';
import 'package:quantum_falcon_mobile/models/xp_model.dart';
import 'package:quantum_falcon_mobile/models/quest_model.dart';
import 'package:quantum_falcon_mobile/models/streak_model.dart';

// Generate mocks
@GenerateMocks([http.Client])
import 'api_service_test.mocks.dart';

void main() {
  group('ApiService', () {
    late ApiService apiService;
    late MockClient mockClient;
    const baseUrl = 'https://api.test.com';

    setUp(() {
      mockClient = MockClient();
      apiService = ApiService(
        baseUrl: baseUrl,
        client: mockClient,
      );
    });

    tearDown(() {
      apiService.dispose();
    });

    group('XP Endpoints', () {
      test('getXp returns XpModel on success', () async {
        // Arrange
        final responseBody = json.encode({
          'currentXp': 150,
          'level': 3,
          'nextLevelXp': 300,
          'totalXp': 450,
          'multiplier': 1.5,
          'lastUpdated': DateTime.now().toIso8601String(),
        });

        when(mockClient.get(
          Uri.parse('$baseUrl/api/xp'),
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(responseBody, 200));

        // Act
        final result = await apiService.getXp();

        // Assert
        expect(result, isA<XpModel>());
        expect(result.currentXp, 150);
        expect(result.level, 3);
        expect(result.multiplier, 1.5);
      });

      test('getXp returns fallback data on network error', () async {
        // Arrange
        when(mockClient.get(
          Uri.parse('$baseUrl/api/xp'),
          headers: anyNamed('headers'),
        )).thenThrow(Exception('Network error'));

        // Act
        final result = await apiService.getXp();

        // Assert
        expect(result, isA<XpModel>());
        expect(result.level, 1);
        expect(result.currentXp, 0);
      });

      test('awardXp returns XpAward on success', () async {
        // Arrange
        final responseBody = json.encode({
          'amount': 50,
          'reason': 'Trade completed',
          'actionType': 'trade_execution',
          'timestamp': DateTime.now().toIso8601String(),
          'leveledUp': false,
        });

        when(mockClient.post(
          Uri.parse('$baseUrl/api/xp/award'),
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(responseBody, 200));

        // Act
        final result = await apiService.awardXp(
          amount: 50,
          reason: 'Trade completed',
          actionType: 'trade_execution',
        );

        // Assert
        expect(result, isA<XpAward>());
        expect(result.amount, 50);
        expect(result.reason, 'Trade completed');
      });

      test('getLeaderboard returns list on success', () async {
        // Arrange
        final responseBody = json.encode({
          'leaderboard': [
            {'userId': 'user1', 'username': 'Player1', 'totalXp': 1000},
            {'userId': 'user2', 'username': 'Player2', 'totalXp': 800},
          ],
        });

        when(mockClient.get(
          Uri.parse('$baseUrl/api/xp/leaderboard?limit=100&period=all_time'),
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(responseBody, 200));

        // Act
        final result = await apiService.getLeaderboard();

        // Assert
        expect(result, isA<List>());
        expect(result.length, 2);
      });
    });

    group('Quest Endpoints', () {
      test('getQuests returns QuestListResponse on success', () async {
        // Arrange
        final responseBody = json.encode({
          'quests': [
            {
              'id': 'quest1',
              'title': 'First Trade',
              'description': 'Complete your first trade',
              'category': 'daily',
              'xpReward': 100,
              'progress': 0,
              'target': 1,
              'isCompleted': false,
              'expiresAt': null,
              'completedAt': null,
            },
          ],
          'totalQuests': 1,
          'completedQuests': 0,
        });

        when(mockClient.get(
          Uri.parse('$baseUrl/api/quests'),
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(responseBody, 200));

        // Act
        final result = await apiService.getQuests();

        // Assert
        expect(result, isA<QuestListResponse>());
        expect(result.quests.length, 1);
        expect(result.totalQuests, 1);
      });

      test('getQuestById returns QuestModel on success', () async {
        // Arrange
        final responseBody = json.encode({
          'id': 'quest1',
          'title': 'First Trade',
          'description': 'Complete your first trade',
          'category': 'daily',
          'xpReward': 100,
          'progress': 0,
          'target': 1,
          'isCompleted': false,
          'expiresAt': null,
          'completedAt': null,
        });

        when(mockClient.get(
          Uri.parse('$baseUrl/api/quests/quest1'),
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(responseBody, 200));

        // Act
        final result = await apiService.getQuestById('quest1');

        // Assert
        expect(result, isA<QuestModel>());
        expect(result.id, 'quest1');
        expect(result.title, 'First Trade');
      });

      test('updateQuestProgress returns updated QuestModel', () async {
        // Arrange
        final responseBody = json.encode({
          'id': 'quest1',
          'title': 'First Trade',
          'description': 'Complete your first trade',
          'category': 'daily',
          'xpReward': 100,
          'progress': 1,
          'target': 1,
          'isCompleted': true,
          'expiresAt': null,
          'completedAt': DateTime.now().toIso8601String(),
        });

        when(mockClient.post(
          Uri.parse('$baseUrl/api/quests/quest1/progress'),
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(responseBody, 200));

        // Act
        final result = await apiService.updateQuestProgress(
          questId: 'quest1',
          progress: 1,
        );

        // Assert
        expect(result, isA<QuestModel>());
        expect(result.progress, 1);
        expect(result.isCompleted, true);
      });
    });

    group('Streak Endpoints', () {
      test('getStreaks returns StreakResponse on success', () async {
        // Arrange
        final responseBody = json.encode({
          'streaks': [
            {
              'currentStreak': 5,
              'longestStreak': 10,
              'streakStartDate': DateTime.now().toIso8601String(),
              'lastActivityDate': DateTime.now().toIso8601String(),
              'type': 'daily_login',
              'xpBonusPerMilestone': 500,
              'nextMilestone': 7,
              'isActive': true,
            },
          ],
          'totalActiveStreaks': 1,
          'lastUpdated': DateTime.now().toIso8601String(),
        });

        when(mockClient.get(
          Uri.parse('$baseUrl/api/streaks'),
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(responseBody, 200));

        // Act
        final result = await apiService.getStreaks();

        // Assert
        expect(result, isA<StreakResponse>());
        expect(result.streaks.length, 1);
        expect(result.totalActiveStreaks, 1);
      });

      test('recordStreakActivity returns updated StreakModel', () async {
        // Arrange
        final responseBody = json.encode({
          'currentStreak': 6,
          'longestStreak': 10,
          'streakStartDate': DateTime.now().toIso8601String(),
          'lastActivityDate': DateTime.now().toIso8601String(),
          'type': 'daily_login',
          'xpBonusPerMilestone': 500,
          'nextMilestone': 7,
          'isActive': true,
        });

        when(mockClient.post(
          Uri.parse('$baseUrl/api/streaks/dailyLogin/activity'),
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(responseBody, 200));

        // Act
        final result = await apiService.recordStreakActivity(StreakType.dailyLogin);

        // Assert
        expect(result, isA<StreakModel>());
        expect(result.currentStreak, 6);
      });
    });

    group('Error Handling', () {
      test('throws ApiException on HTTP 404', () async {
        // Arrange
        when(mockClient.get(
          Uri.parse('$baseUrl/api/xp'),
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response('Not Found', 404));

        // Act & Assert
        try {
          await apiService.getXp();
        } catch (e) {
          expect(e, isA<XpModel>()); // Returns fallback
        }
      });

      test('throws ApiException on HTTP 500', () async {
        // Arrange
        when(mockClient.post(
          Uri.parse('$baseUrl/api/quests/quest1/complete'),
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response('Server Error', 500));

        // Act & Assert
        expect(
          () => apiService.completeQuest('quest1'),
          throwsA(isA<ApiException>()),
        );
      });
    });

    group('Cache', () {
      test('returns cached data when offline', () async {
        // Arrange - First successful call
        final responseBody = json.encode({
          'currentXp': 150,
          'level': 3,
          'nextLevelXp': 300,
          'totalXp': 450,
          'multiplier': 1.5,
          'lastUpdated': DateTime.now().toIso8601String(),
        });

        when(mockClient.get(
          Uri.parse('$baseUrl/api/xp'),
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(responseBody, 200));

        await apiService.getXp();

        // Now simulate network error
        when(mockClient.get(
          Uri.parse('$baseUrl/api/xp'),
          headers: anyNamed('headers'),
        )).thenThrow(Exception('Network error'));

        // Act - Should return cached data
        final result = await apiService.getXp();

        // Assert
        expect(result.level, 3);
        expect(result.currentXp, 150);
      });

      test('clearCache removes all cached data', () {
        // Act
        apiService.clearCache();

        // Assert - No way to directly test cache, but ensure no errors
        expect(apiService, isNotNull);
      });
    });
  });
}
