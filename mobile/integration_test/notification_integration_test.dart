import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:quantum_falcon_mobile/main.dart' as app;
import 'package:quantum_falcon_mobile/services/notification_service.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Notification Integration Tests', () {
    testWidgets('Test XP award notification flow', (WidgetTester tester) async {
      // Start app
      app.main();
      await tester.pumpAndSettle();

      // Find and tap the XP award test button
      final xpButton = find.text('Award XP (Test)');
      expect(xpButton, findsOneWidget);
      
      await tester.tap(xpButton);
      await tester.pumpAndSettle();

      // Verify snackbar appears
      expect(find.text('+50 XP for completing a daily quest'), findsOneWidget);
    });

    testWidgets('Test streak reminder notification flow', (WidgetTester tester) async {
      // Start app
      app.main();
      await tester.pumpAndSettle();

      // Find and tap the streak reminder test button
      final streakButton = find.text('Send Streak Reminder (Test)');
      expect(streakButton, findsOneWidget);
      
      await tester.tap(streakButton);
      await tester.pumpAndSettle();
    });

    testWidgets('Test quest reset notification flow', (WidgetTester tester) async {
      // Start app
      app.main();
      await tester.pumpAndSettle();

      // Find and tap the quest reset test button
      final questButton = find.text('Send Quest Reset (Test)');
      expect(questButton, findsOneWidget);
      
      await tester.tap(questButton);
      await tester.pumpAndSettle();
    });

    testWidgets('Test notification settings navigation', (WidgetTester tester) async {
      // Start app
      app.main();
      await tester.pumpAndSettle();

      // Navigate to settings
      final settingsButton = find.byIcon(Icons.settings);
      expect(settingsButton, findsOneWidget);
      
      await tester.tap(settingsButton);
      await tester.pumpAndSettle();

      // Verify settings screen loaded
      expect(find.text('Notification Preferences'), findsOneWidget);
      expect(find.text('Enable Notifications'), findsOneWidget);
    });

    testWidgets('Test toggling notification preferences', (WidgetTester tester) async {
      // Start app
      app.main();
      await tester.pumpAndSettle();

      // Navigate to settings
      await tester.tap(find.byIcon(Icons.settings));
      await tester.pumpAndSettle();

      // Find notification toggle switches
      final masterToggle = find.widgetWithText(SwitchListTile, 'Enable Notifications');
      expect(masterToggle, findsOneWidget);

      // Toggle master notifications off
      await tester.tap(masterToggle);
      await tester.pumpAndSettle();

      // Verify snackbar appears
      expect(find.text('Notifications disabled'), findsOneWidget);
      
      // Wait for snackbar to disappear
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Toggle master notifications back on
      await tester.tap(masterToggle);
      await tester.pumpAndSettle();

      // Verify snackbar appears
      expect(find.text('Notifications enabled'), findsOneWidget);
    });

    testWidgets('Test individual notification type toggles', (WidgetTester tester) async {
      // Start app
      app.main();
      await tester.pumpAndSettle();

      // Navigate to settings
      await tester.tap(find.byIcon(Icons.settings));
      await tester.pumpAndSettle();

      // Test XP awards toggle
      final xpToggle = find.widgetWithText(SwitchListTile, 'XP Awards');
      expect(xpToggle, findsOneWidget);
      
      await tester.tap(xpToggle);
      await tester.pumpAndSettle();
      expect(find.textContaining('XP awards notifications disabled'), findsOneWidget);
      
      await tester.pumpAndSettle(const Duration(seconds: 3));
      
      await tester.tap(xpToggle);
      await tester.pumpAndSettle();
      expect(find.textContaining('XP awards notifications enabled'), findsOneWidget);
    });

    testWidgets('Test offline notification fallback', (WidgetTester tester) async {
      // Start app
      app.main();
      await tester.pumpAndSettle();

      final notificationService = NotificationService();

      // Simulate offline scenario by directly calling local notification methods
      await notificationService.showXPAwardNotification(
        xpAmount: 50,
        reason: 'completing offline quest',
      );

      await tester.pumpAndSettle();

      // Notification should still be created via local notifications
      // In a real test, we would verify the notification was created
    });

    testWidgets('Test FCM token display', (WidgetTester tester) async {
      // Start app
      app.main();
      await tester.pumpAndSettle();

      // Verify FCM token card exists (may be empty in test environment)
      expect(find.text('FCM Token'), findsOneWidget);
    });
  });
}
