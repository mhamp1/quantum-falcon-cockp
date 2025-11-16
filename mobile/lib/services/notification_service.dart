import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Background message handler for FCM
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('Handling background message: ${message.messageId}');
}

/// Service to handle push notifications via FCM and local notifications
class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  // Notification preference keys
  static const String _prefNotificationsEnabled = 'notifications_enabled';
  static const String _prefXPAwardsEnabled = 'xp_awards_enabled';
  static const String _prefStreakRemindersEnabled = 'streak_reminders_enabled';
  static const String _prefQuestResetsEnabled = 'quest_resets_enabled';

  /// Initialize notification service
  Future<void> initialize() async {
    // Request permissions
    await _requestPermissions();

    // Initialize local notifications
    await _initializeLocalNotifications();

    // Configure FCM
    await _configureFCM();

    // Set up FCM listeners
    _setupFCMListeners();
  }

  /// Request notification permissions
  Future<void> _requestPermissions() async {
    final settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      announcement: false,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
    );

    debugPrint('Notification permission status: ${settings.authorizationStatus}');
  }

  /// Initialize local notifications
  Future<void> _initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );
  }

  /// Configure FCM
  Future<void> _configureFCM() async {
    // Set background message handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Get FCM token
    final token = await _fcm.getToken();
    debugPrint('FCM Token: $token');

    // Listen for token refresh
    _fcm.onTokenRefresh.listen((token) {
      debugPrint('FCM Token refreshed: $token');
      // TODO: Send token to backend
    });
  }

  /// Setup FCM message listeners
  void _setupFCMListeners() {
    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
      debugPrint('Received foreground message: ${message.notification?.title}');
      await _handleForegroundMessage(message);
    });

    // Handle notification tap when app is in background
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('Notification tapped: ${message.notification?.title}');
      _handleNotificationTap(message.data);
    });

    // Check for messages that opened the app
    _fcm.getInitialMessage().then((RemoteMessage? message) {
      if (message != null) {
        debugPrint('App opened from notification: ${message.notification?.title}');
        _handleNotificationTap(message.data);
      }
    });
  }

  /// Handle foreground messages by showing local notification
  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    if (!await areNotificationsEnabled()) return;

    final notification = message.notification;
    final android = message.notification?.android;

    if (notification != null) {
      await _localNotifications.show(
        notification.hashCode,
        notification.title,
        notification.body,
        NotificationDetails(
          android: AndroidNotificationDetails(
            'default_channel',
            'Default Notifications',
            channelDescription: 'Default notification channel',
            importance: Importance.high,
            priority: Priority.high,
            icon: android?.smallIcon ?? '@mipmap/ic_launcher',
          ),
          iOS: const DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
        payload: message.data.toString(),
      );
    }
  }

  /// Handle notification tap
  void _onNotificationTapped(NotificationResponse response) {
    debugPrint('Notification tapped with payload: ${response.payload}');
    // TODO: Navigate to appropriate screen based on payload
  }

  /// Handle notification data when tapped
  void _handleNotificationTap(Map<String, dynamic> data) {
    final type = data['type'] as String?;
    debugPrint('Handling notification tap with type: $type');
    
    // TODO: Navigate based on notification type
    switch (type) {
      case 'xp_award':
        // Navigate to profile/XP screen
        break;
      case 'streak_reminder':
        // Navigate to streak screen
        break;
      case 'quest_reset':
        // Navigate to quests screen
        break;
      default:
        // Navigate to home
        break;
    }
  }

  /// Show XP award notification
  Future<void> showXPAwardNotification({
    required int xpAmount,
    required String reason,
  }) async {
    if (!await isXPAwardsEnabled()) return;

    await _showLocalNotification(
      id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title: '🎉 XP Awarded!',
      body: '+$xpAmount XP for $reason',
      type: 'xp_award',
      payload: {'xp': xpAmount, 'reason': reason},
    );
  }

  /// Show streak reminder notification
  Future<void> showStreakReminderNotification({
    required int streakDays,
  }) async {
    if (!await isStreakRemindersEnabled()) return;

    await _showLocalNotification(
      id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title: '🔥 Keep Your Streak!',
      body: "Don't break your $streakDays-day XP streak!",
      type: 'streak_reminder',
      payload: {'streak_days': streakDays},
    );
  }

  /// Show quest reset notification
  Future<void> showQuestResetNotification({
    required String questType,
  }) async {
    if (!await isQuestResetsEnabled()) return;

    await _showLocalNotification(
      id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title: '📋 Quests Reset!',
      body: 'Your $questType quests have been reset. Complete them for bonus XP!',
      type: 'quest_reset',
      payload: {'quest_type': questType},
    );
  }

  /// Show local notification (offline fallback)
  Future<void> _showLocalNotification({
    required int id,
    required String title,
    required String body,
    required String type,
    Map<String, dynamic>? payload,
  }) async {
    await _localNotifications.show(
      id,
      title,
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          '${type}_channel',
          '${type.replaceAll('_', ' ').toUpperCase()} Notifications',
          channelDescription: 'Notifications for $type',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
          styleInformation: const BigTextStyleInformation(''),
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: payload.toString(),
    );
  }

  /// Get FCM token
  Future<String?> getFCMToken() async {
    return await _fcm.getToken();
  }

  /// Subscribe to topic
  Future<void> subscribeToTopic(String topic) async {
    await _fcm.subscribeToTopic(topic);
    debugPrint('Subscribed to topic: $topic');
  }

  /// Unsubscribe from topic
  Future<void> unsubscribeFromTopic(String topic) async {
    await _fcm.unsubscribeFromTopic(topic);
    debugPrint('Unsubscribed from topic: $topic');
  }

  // Notification Preferences

  /// Check if notifications are enabled
  Future<bool> areNotificationsEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_prefNotificationsEnabled) ?? true;
  }

  /// Set notifications enabled/disabled
  Future<void> setNotificationsEnabled(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefNotificationsEnabled, enabled);
  }

  /// Check if XP awards notifications are enabled
  Future<bool> isXPAwardsEnabled() async {
    if (!await areNotificationsEnabled()) return false;
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_prefXPAwardsEnabled) ?? true;
  }

  /// Set XP awards notifications enabled/disabled
  Future<void> setXPAwardsEnabled(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefXPAwardsEnabled, enabled);
  }

  /// Check if streak reminders are enabled
  Future<bool> isStreakRemindersEnabled() async {
    if (!await areNotificationsEnabled()) return false;
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_prefStreakRemindersEnabled) ?? true;
  }

  /// Set streak reminders enabled/disabled
  Future<void> setStreakRemindersEnabled(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefStreakRemindersEnabled, enabled);
  }

  /// Check if quest resets notifications are enabled
  Future<bool> isQuestResetsEnabled() async {
    if (!await areNotificationsEnabled()) return false;
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_prefQuestResetsEnabled) ?? true;
  }

  /// Set quest resets notifications enabled/disabled
  Future<void> setQuestResetsEnabled(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefQuestResetsEnabled, enabled);
  }
}
