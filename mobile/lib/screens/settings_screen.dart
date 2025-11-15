import 'package:flutter/material.dart';
import '../services/notification_service.dart';

class SettingsScreen extends StatefulWidget {
  final NotificationService notificationService;

  const SettingsScreen({super.key, required this.notificationService});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _xpAwardsEnabled = true;
  bool _streakRemindersEnabled = true;
  bool _questResetsEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final notificationsEnabled = await widget.notificationService.areNotificationsEnabled();
    final xpAwardsEnabled = await widget.notificationService.isXPAwardsEnabled();
    final streakRemindersEnabled = await widget.notificationService.isStreakRemindersEnabled();
    final questResetsEnabled = await widget.notificationService.isQuestResetsEnabled();

    setState(() {
      _notificationsEnabled = notificationsEnabled;
      _xpAwardsEnabled = xpAwardsEnabled;
      _streakRemindersEnabled = streakRemindersEnabled;
      _questResetsEnabled = questResetsEnabled;
    });
  }

  Future<void> _toggleNotifications(bool value) async {
    await widget.notificationService.setNotificationsEnabled(value);
    setState(() {
      _notificationsEnabled = value;
    });
    _showSnackBar(
      value ? 'Notifications enabled' : 'Notifications disabled',
    );
  }

  Future<void> _toggleXPAwards(bool value) async {
    await widget.notificationService.setXPAwardsEnabled(value);
    setState(() {
      _xpAwardsEnabled = value;
    });
    _showSnackBar(
      value ? 'XP awards notifications enabled' : 'XP awards notifications disabled',
    );
  }

  Future<void> _toggleStreakReminders(bool value) async {
    await widget.notificationService.setStreakRemindersEnabled(value);
    setState(() {
      _streakRemindersEnabled = value;
    });
    _showSnackBar(
      value ? 'Streak reminders enabled' : 'Streak reminders disabled',
    );
  }

  Future<void> _toggleQuestResets(bool value) async {
    await widget.notificationService.setQuestResetsEnabled(value);
    setState(() {
      _questResetsEnabled = value;
    });
    _showSnackBar(
      value ? 'Quest reset notifications enabled' : 'Quest reset notifications disabled',
    );
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        children: [
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text(
              'Notification Preferences',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.cyanAccent,
              ),
            ),
          ),
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: const Color(0xFF1A0F3D),
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text(
                    'Enable Notifications',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: const Text(
                    'Master toggle for all notifications',
                    style: TextStyle(fontSize: 12),
                  ),
                  value: _notificationsEnabled,
                  activeColor: Colors.cyanAccent,
                  onChanged: _toggleNotifications,
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('XP Awards'),
                  subtitle: const Text(
                    'Notify when you earn XP',
                    style: TextStyle(fontSize: 12),
                  ),
                  value: _xpAwardsEnabled && _notificationsEnabled,
                  activeColor: Colors.green,
                  onChanged: _notificationsEnabled ? _toggleXPAwards : null,
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Streak Reminders'),
                  subtitle: const Text(
                    'Daily reminders to maintain your streak',
                    style: TextStyle(fontSize: 12),
                  ),
                  value: _streakRemindersEnabled && _notificationsEnabled,
                  activeColor: Colors.orange,
                  onChanged: _notificationsEnabled ? _toggleStreakReminders : null,
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Quest Resets'),
                  subtitle: const Text(
                    'Notify when quests reset',
                    style: TextStyle(fontSize: 12),
                  ),
                  value: _questResetsEnabled && _notificationsEnabled,
                  activeColor: Colors.blue,
                  onChanged: _notificationsEnabled ? _toggleQuestResets : null,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Card(
              color: const Color(0xFF25174A),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.info_outline, color: Colors.cyanAccent),
                        SizedBox(width: 8),
                        Text(
                          'About Notifications',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.cyanAccent,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Notifications use Firebase Cloud Messaging (FCM) when online. '
                      'When offline, local notifications are used as a fallback to ensure '
                      'you never miss important updates.',
                      style: TextStyle(fontSize: 14, color: Colors.white70),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
