import 'package:shared_preferences/shared_preferences.dart';

/// Model for managing user notification preferences
class UserPreferences {
  static const String _keyNotificationsEnabled = 'notifications_enabled';
  static const String _keyXPAwardsEnabled = 'xp_awards_enabled';
  static const String _keyStreakRemindersEnabled = 'streak_reminders_enabled';
  static const String _keyQuestResetsEnabled = 'quest_resets_enabled';

  final SharedPreferences _prefs;

  UserPreferences(this._prefs);

  /// Load user preferences from storage
  static Future<UserPreferences> load() async {
    final prefs = await SharedPreferences.getInstance();
    return UserPreferences(prefs);
  }

  /// Get master notifications enabled state
  bool get notificationsEnabled => _prefs.getBool(_keyNotificationsEnabled) ?? true;

  /// Set master notifications enabled state
  Future<void> setNotificationsEnabled(bool value) async {
    await _prefs.setBool(_keyNotificationsEnabled, value);
  }

  /// Get XP awards notifications enabled state
  bool get xpAwardsEnabled => _prefs.getBool(_keyXPAwardsEnabled) ?? true;

  /// Set XP awards notifications enabled state
  Future<void> setXPAwardsEnabled(bool value) async {
    await _prefs.setBool(_keyXPAwardsEnabled, value);
  }

  /// Get streak reminders enabled state
  bool get streakRemindersEnabled => _prefs.getBool(_keyStreakRemindersEnabled) ?? true;

  /// Set streak reminders enabled state
  Future<void> setStreakRemindersEnabled(bool value) async {
    await _prefs.setBool(_keyStreakRemindersEnabled, value);
  }

  /// Get quest resets notifications enabled state
  bool get questResetsEnabled => _prefs.getBool(_keyQuestResetsEnabled) ?? true;

  /// Set quest resets notifications enabled state
  Future<void> setQuestResetsEnabled(bool value) async {
    await _prefs.setBool(_keyQuestResetsEnabled, value);
  }

  /// Check if a specific notification type is enabled (considering master toggle)
  bool isTypeEnabled(String type) {
    if (!notificationsEnabled) return false;

    switch (type) {
      case 'xp_award':
        return xpAwardsEnabled;
      case 'streak_reminder':
        return streakRemindersEnabled;
      case 'quest_reset':
        return questResetsEnabled;
      default:
        return false;
    }
  }

  /// Clear all preferences
  Future<void> clear() async {
    await _prefs.clear();
  }
}
