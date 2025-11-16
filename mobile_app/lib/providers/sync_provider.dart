import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:connectivity_plus/connectivity_plus.dart';
import '../services/xp_service.dart';

enum SyncStatus {
  idle,
  syncing,
  success,
  error,
}

class SyncProvider with ChangeNotifier {
  final XpService _xpService;
  final String apiBaseUrl;

  SyncStatus _syncStatus = SyncStatus.idle;
  String? _lastError;
  DateTime? _lastSyncedAt;
  bool _isOnline = false;
  Timer? _syncTimer;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;

  SyncProvider({
    required XpService xpService,
    required this.apiBaseUrl,
  }) : _xpService = xpService {
    _initializeConnectivity();
    _startPeriodicSync();
  }

  // Getters
  SyncStatus get syncStatus => _syncStatus;
  String? get lastError => _lastError;
  DateTime? get lastSyncedAt => _lastSyncedAt;
  bool get isOnline => _isOnline;
  bool get hasUnsyncedData => _xpService.hasUnsyncedData();

  /// Initialize connectivity monitoring
  void _initializeConnectivity() {
    _connectivitySubscription = Connectivity()
        .onConnectivityChanged
        .listen((List<ConnectivityResult> results) {
      final wasOffline = !_isOnline;
      _isOnline = results.any((result) =>
          result == ConnectivityResult.mobile ||
          result == ConnectivityResult.wifi ||
          result == ConnectivityResult.ethernet);

      notifyListeners();

      // If just came back online and have unsynced data, sync immediately
      if (wasOffline && _isOnline && hasUnsyncedData) {
        syncData();
      }
    });

    // Check initial connectivity
    _checkInitialConnectivity();
  }

  /// Check initial connectivity status
  Future<void> _checkInitialConnectivity() async {
    final results = await Connectivity().checkConnectivity();
    _isOnline = results.any((result) =>
        result == ConnectivityResult.mobile ||
        result == ConnectivityResult.wifi ||
        result == ConnectivityResult.ethernet);
    notifyListeners();
  }

  /// Start periodic sync (every 5 minutes)
  void _startPeriodicSync() {
    _syncTimer = Timer.periodic(const Duration(minutes: 5), (_) {
      if (_isOnline && hasUnsyncedData) {
        syncData();
      }
    });
  }

  /// Main sync method - syncs all unsynced data with backend
  Future<void> syncData() async {
    if (!_isOnline) {
      _lastError = 'No internet connection';
      notifyListeners();
      return;
    }

    if (_syncStatus == SyncStatus.syncing) {
      return; // Already syncing
    }

    _syncStatus = SyncStatus.syncing;
    _lastError = null;
    notifyListeners();

    try {
      final unsyncedData = _xpService.getUnsyncedData();

      // Sync XP data
      if (unsyncedData['xp'] != null) {
        await _syncXpData(unsyncedData['xp'] as Map<String, dynamic>);
      }

      // Sync streak data
      if (unsyncedData['streak'] != null) {
        await _syncStreakData(unsyncedData['streak'] as Map<String, dynamic>);
      }

      // Sync quest progress
      final quests = unsyncedData['quests'] as List<dynamic>;
      if (quests.isNotEmpty) {
        await _syncQuestData(quests.cast<Map<String, dynamic>>());
      }

      // Mark all as synced
      await _xpService.markAllAsSynced();

      _syncStatus = SyncStatus.success;
      _lastSyncedAt = DateTime.now();
      _lastError = null;
    } catch (e) {
      _syncStatus = SyncStatus.error;
      _lastError = e.toString();
      if (kDebugMode) {
        print('Sync error: $e');
      }
    } finally {
      notifyListeners();
    }
  }

  /// Sync XP data to backend
  Future<void> _syncXpData(Map<String, dynamic> xpData) async {
    final url = Uri.parse('$apiBaseUrl/api/xp/award');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(xpData),
    ).timeout(
      const Duration(seconds: 10),
      onTimeout: () => throw TimeoutException('XP sync timeout'),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to sync XP data: ${response.statusCode}');
    }
  }

  /// Sync streak data to backend
  Future<void> _syncStreakData(Map<String, dynamic> streakData) async {
    final url = Uri.parse('$apiBaseUrl/api/streaks/update');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(streakData),
    ).timeout(
      const Duration(seconds: 10),
      onTimeout: () => throw TimeoutException('Streak sync timeout'),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to sync streak data: ${response.statusCode}');
    }
  }

  /// Sync quest progress to backend
  Future<void> _syncQuestData(List<Map<String, dynamic>> questData) async {
    final url = Uri.parse('$apiBaseUrl/api/quests/progress');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'quests': questData}),
    ).timeout(
      const Duration(seconds: 10),
      onTimeout: () => throw TimeoutException('Quest sync timeout'),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to sync quest data: ${response.statusCode}');
    }
  }

  /// Force sync immediately (for manual sync button)
  Future<void> forceSyncNow() async {
    await syncData();
  }

  /// Retry failed sync
  Future<void> retrySync() async {
    if (_syncStatus == SyncStatus.error) {
      await syncData();
    }
  }

  /// Get time since last sync in human-readable format
  String getLastSyncTimeText() {
    if (_lastSyncedAt == null) {
      return 'Never synced';
    }

    final difference = DateTime.now().difference(_lastSyncedAt!);
    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} min ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} hr ago';
    } else {
      return '${difference.inDays} day(s) ago';
    }
  }

  @override
  void dispose() {
    _syncTimer?.cancel();
    _connectivitySubscription?.cancel();
    super.dispose();
  }
}

class TimeoutException implements Exception {
  final String message;
  TimeoutException(this.message);

  @override
  String toString() => message;
}
