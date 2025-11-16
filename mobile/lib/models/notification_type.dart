/// Enum representing different types of notifications
enum NotificationType {
  xpAward('xp_award', '🎉 XP Awarded!'),
  streakReminder('streak_reminder', '🔥 Keep Your Streak!'),
  questReset('quest_reset', '📋 Quests Reset!'),
  unknown('unknown', 'Notification');

  const NotificationType(this.key, this.defaultTitle);

  final String key;
  final String defaultTitle;

  /// Get notification type from string key
  static NotificationType fromKey(String key) {
    return NotificationType.values.firstWhere(
      (type) => type.key == key,
      orElse: () => NotificationType.unknown,
    );
  }

  /// Get notification channel ID for this type
  String get channelId => '${key}_channel';

  /// Get notification channel name for this type
  String get channelName => '${key.replaceAll('_', ' ').toUpperCase()} Notifications';

  /// Get notification channel description for this type
  String get channelDescription => 'Notifications for $key';
}
