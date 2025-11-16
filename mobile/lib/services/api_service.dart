import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/xp_model.dart';
import '../models/quest_model.dart';
import '../models/streak_model.dart';

/// Exception thrown when API communication fails
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  
  ApiException(this.message, {this.statusCode});
  
  @override
  String toString() => 'ApiException: $message${statusCode != null ? ' (Status: $statusCode)' : ''}';
}

/// Service class for handling all backend API communications
class ApiService {
  final String baseUrl;
  final http.Client client;
  final Duration timeout;
  
  /// Cache for offline mode
  final Map<String, dynamic> _cache = {};
  
  ApiService({
    required this.baseUrl,
    http.Client? client,
    this.timeout = const Duration(seconds: 30),
  }) : client = client ?? http.Client();

  /// Common headers for all requests
  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  /// Make GET request with error handling
  Future<Map<String, dynamic>> _get(String endpoint, {String? cacheKey}) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final response = await client.get(uri, headers: _headers).timeout(timeout);
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        if (cacheKey != null) {
          _cache[cacheKey] = data;
        }
        return data;
      } else {
        throw ApiException(
          'Failed to fetch data',
          statusCode: response.statusCode,
        );
      }
    } on SocketException {
      // Network error - return cached data if available
      if (cacheKey != null && _cache.containsKey(cacheKey)) {
        return _cache[cacheKey] as Map<String, dynamic>;
      }
      throw ApiException('No internet connection. Please check your network.');
    } on TimeoutException {
      throw ApiException('Request timed out. Please try again.');
    } catch (e) {
      throw ApiException('An error occurred: ${e.toString()}');
    }
  }

  /// Make POST request with error handling
  Future<Map<String, dynamic>> _post(
    String endpoint,
    Map<String, dynamic> data,
  ) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final response = await client
          .post(
            uri,
            headers: _headers,
            body: json.encode(data),
          )
          .timeout(timeout);
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body) as Map<String, dynamic>;
      } else {
        throw ApiException(
          'Failed to send data',
          statusCode: response.statusCode,
        );
      }
    } on SocketException {
      throw ApiException('No internet connection. Please check your network.');
    } on TimeoutException {
      throw ApiException('Request timed out. Please try again.');
    } catch (e) {
      throw ApiException('An error occurred: ${e.toString()}');
    }
  }

  // ============================================================================
  // XP ENDPOINTS
  // ============================================================================

  /// Get current user XP data
  /// Endpoint: GET /api/xp
  Future<XpModel> getXp() async {
    try {
      final data = await _get('/api/xp', cacheKey: 'xp');
      return XpModel.fromJson(data);
    } catch (e) {
      // Return fallback data for offline mode
      if (_cache.containsKey('xp')) {
        return XpModel.fromJson(_cache['xp'] as Map<String, dynamic>);
      }
      return _getFallbackXp();
    }
  }

  /// Award XP to the user
  /// Endpoint: POST /api/xp/award
  /// 
  /// Request body:
  /// {
  ///   "amount": 50,
  ///   "reason": "Completed trade",
  ///   "actionType": "trade_execution"
  /// }
  Future<XpAward> awardXp({
    required int amount,
    required String reason,
    required String actionType,
  }) async {
    try {
      final response = await _post('/api/xp/award', {
        'amount': amount,
        'reason': reason,
        'actionType': actionType,
        'timestamp': DateTime.now().toIso8601String(),
      });
      
      return XpAward.fromJson(response);
    } catch (e) {
      // Log error but don't throw - XP awards can be retried later
      print('Failed to award XP: $e');
      
      // Return a pending award that can be synced later
      return XpAward(
        amount: amount,
        reason: reason,
        actionType: actionType,
        timestamp: DateTime.now(),
        leveledUp: false,
      );
    }
  }

  /// Get XP leaderboard
  /// Endpoint: GET /api/xp/leaderboard
  Future<List<Map<String, dynamic>>> getLeaderboard({
    int limit = 100,
    String period = 'all_time',
  }) async {
    try {
      final data = await _get(
        '/api/xp/leaderboard?limit=$limit&period=$period',
        cacheKey: 'leaderboard_$period',
      );
      return (data['leaderboard'] as List).cast<Map<String, dynamic>>();
    } catch (e) {
      // Return cached leaderboard if available
      if (_cache.containsKey('leaderboard_$period')) {
        final cached = _cache['leaderboard_$period'] as Map<String, dynamic>;
        return (cached['leaderboard'] as List).cast<Map<String, dynamic>>();
      }
      return [];
    }
  }

  // ============================================================================
  // QUEST ENDPOINTS
  // ============================================================================

  /// Get all available quests for the user
  /// Endpoint: GET /api/quests
  Future<QuestListResponse> getQuests({String? category}) async {
    try {
      final endpoint = category != null 
          ? '/api/quests?category=$category'
          : '/api/quests';
      
      final data = await _get(endpoint, cacheKey: 'quests${category ?? ''}');
      return QuestListResponse.fromJson(data);
    } catch (e) {
      // Return cached quests if available
      if (_cache.containsKey('quests${category ?? ''}')) {
        return QuestListResponse.fromJson(
          _cache['quests${category ?? ''}'] as Map<String, dynamic>,
        );
      }
      return _getFallbackQuests();
    }
  }

  /// Get a specific quest by ID
  /// Endpoint: GET /api/quests/:id
  Future<QuestModel> getQuestById(String questId) async {
    try {
      final data = await _get('/api/quests/$questId', cacheKey: 'quest_$questId');
      return QuestModel.fromJson(data);
    } catch (e) {
      throw ApiException('Failed to fetch quest: ${e.toString()}');
    }
  }

  /// Update quest progress
  /// Endpoint: POST /api/quests/:id/progress
  /// 
  /// Request body:
  /// {
  ///   "progress": 5,
  ///   "increment": true
  /// }
  Future<QuestModel> updateQuestProgress({
    required String questId,
    required int progress,
    bool increment = true,
  }) async {
    try {
      final response = await _post('/api/quests/$questId/progress', {
        'progress': progress,
        'increment': increment,
        'timestamp': DateTime.now().toIso8601String(),
      });
      
      return QuestModel.fromJson(response);
    } catch (e) {
      print('Failed to update quest progress: $e');
      throw ApiException('Failed to update quest progress');
    }
  }

  /// Mark a quest as completed
  /// Endpoint: POST /api/quests/:id/complete
  Future<Map<String, dynamic>> completeQuest(String questId) async {
    try {
      final response = await _post('/api/quests/$questId/complete', {
        'completedAt': DateTime.now().toIso8601String(),
      });
      
      return response;
    } catch (e) {
      throw ApiException('Failed to complete quest');
    }
  }

  // ============================================================================
  // STREAK ENDPOINTS
  // ============================================================================

  /// Get all user streaks
  /// Endpoint: GET /api/streaks
  Future<StreakResponse> getStreaks() async {
    try {
      final data = await _get('/api/streaks', cacheKey: 'streaks');
      return StreakResponse.fromJson(data);
    } catch (e) {
      // Return cached streaks if available
      if (_cache.containsKey('streaks')) {
        return StreakResponse.fromJson(_cache['streaks'] as Map<String, dynamic>);
      }
      return _getFallbackStreaks();
    }
  }

  /// Get a specific streak by type
  /// Endpoint: GET /api/streaks/:type
  Future<StreakModel> getStreakByType(StreakType type) async {
    try {
      final typeStr = type.toString().split('.').last;
      final data = await _get('/api/streaks/$typeStr', cacheKey: 'streak_$typeStr');
      return StreakModel.fromJson(data);
    } catch (e) {
      throw ApiException('Failed to fetch streak');
    }
  }

  /// Update streak (record activity)
  /// Endpoint: POST /api/streaks/:type/activity
  Future<StreakModel> recordStreakActivity(StreakType type) async {
    try {
      final typeStr = type.toString().split('.').last;
      final response = await _post('/api/streaks/$typeStr/activity', {
        'timestamp': DateTime.now().toIso8601String(),
      });
      
      return StreakModel.fromJson(response);
    } catch (e) {
      print('Failed to record streak activity: $e');
      throw ApiException('Failed to update streak');
    }
  }

  // ============================================================================
  // FALLBACK DATA FOR OFFLINE MODE
  // ============================================================================

  /// Provide fallback XP data when offline
  XpModel _getFallbackXp() {
    return XpModel(
      currentXp: 0,
      level: 1,
      nextLevelXp: 100,
      totalXp: 0,
      multiplier: 1.0,
      lastUpdated: DateTime.now(),
    );
  }

  /// Provide fallback quests when offline
  QuestListResponse _getFallbackQuests() {
    return QuestListResponse(
      quests: [],
      totalQuests: 0,
      completedQuests: 0,
    );
  }

  /// Provide fallback streaks when offline
  StreakResponse _getFallbackStreaks() {
    return StreakResponse(
      streaks: [],
      totalActiveStreaks: 0,
      lastUpdated: DateTime.now(),
    );
  }

  /// Clear cache (useful for logout)
  void clearCache() {
    _cache.clear();
  }

  /// Dispose resources
  void dispose() {
    client.close();
  }
}
