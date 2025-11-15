import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:quantum_falcon_mobile/services/notification_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('NotificationService', () {
    late NotificationService notificationService;

    setUp(() {
      SharedPreferences.setMockInitialValues({});
      notificationService = NotificationService();
    });

    test('notifications should be enabled by default', () async {
      final enabled = await notificationService.areNotificationsEnabled();
      expect(enabled, true);
    });

    test('can disable notifications', () async {
      await notificationService.setNotificationsEnabled(false);
      final enabled = await notificationService.areNotificationsEnabled();
      expect(enabled, false);
    });

    test('can enable notifications', () async {
      await notificationService.setNotificationsEnabled(false);
      await notificationService.setNotificationsEnabled(true);
      final enabled = await notificationService.areNotificationsEnabled();
      expect(enabled, true);
    });

    test('XP awards should be enabled by default', () async {
      final enabled = await notificationService.isXPAwardsEnabled();
      expect(enabled, true);
    });

    test('can disable XP awards', () async {
      await notificationService.setXPAwardsEnabled(false);
      final enabled = await notificationService.isXPAwardsEnabled();
      expect(enabled, false);
    });

    test('streak reminders should be enabled by default', () async {
      final enabled = await notificationService.isStreakRemindersEnabled();
      expect(enabled, true);
    });

    test('can disable streak reminders', () async {
      await notificationService.setStreakRemindersEnabled(false);
      final enabled = await notificationService.isStreakRemindersEnabled();
      expect(enabled, false);
    });

    test('quest resets should be enabled by default', () async {
      final enabled = await notificationService.isQuestResetsEnabled();
      expect(enabled, true);
    });

    test('can disable quest resets', () async {
      await notificationService.setQuestResetsEnabled(false);
      final enabled = await notificationService.isQuestResetsEnabled();
      expect(enabled, false);
    });

    test('disabling master notifications disables all types', () async {
      await notificationService.setNotificationsEnabled(false);
      
      final xpEnabled = await notificationService.isXPAwardsEnabled();
      final streakEnabled = await notificationService.isStreakRemindersEnabled();
      final questEnabled = await notificationService.isQuestResetsEnabled();
      
      expect(xpEnabled, false);
      expect(streakEnabled, false);
      expect(questEnabled, false);
    });

    test('enabling master notifications respects individual settings', () async {
      // Disable XP awards specifically
      await notificationService.setXPAwardsEnabled(false);
      
      // Master notifications should still be enabled
      final masterEnabled = await notificationService.areNotificationsEnabled();
      expect(masterEnabled, true);
      
      // XP awards should be disabled
      final xpEnabled = await notificationService.isXPAwardsEnabled();
      expect(xpEnabled, false);
      
      // Other types should still be enabled
      final streakEnabled = await notificationService.isStreakRemindersEnabled();
      final questEnabled = await notificationService.isQuestResetsEnabled();
      expect(streakEnabled, true);
      expect(questEnabled, true);
    });
  });
}
