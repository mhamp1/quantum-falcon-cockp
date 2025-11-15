import 'package:flutter/material.dart';
import '../services/notification_service.dart';

class HomeScreen extends StatefulWidget {
  final NotificationService notificationService;

  const HomeScreen({super.key, required this.notificationService});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _xp = 0;
  int _streak = 7;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    // Load user data from storage
    // This is a placeholder - implement actual data loading
    setState(() {
      _xp = 2840;
      _streak = 7;
    });
  }

  void _awardXP(int amount, String reason) {
    setState(() {
      _xp += amount;
    });
    widget.notificationService.showXPAwardNotification(
      xpAmount: amount,
      reason: reason,
    );
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('+$amount XP for $reason'),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quantum Falcon'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.pushNamed(context, '/settings');
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // User Stats Card
            Card(
              color: const Color(0xFF1A0F3D),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    const Text(
                      'Your Stats',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.cyanAccent,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatItem('XP', _xp.toString(), Icons.stars),
                        _buildStatItem('Streak', '$_streak days', Icons.local_fire_department),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Test Notifications Section
            const Text(
              'Test Notifications',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 16),

            // XP Award Button
            ElevatedButton.icon(
              onPressed: () => _awardXP(50, 'completing a daily quest'),
              icon: const Icon(Icons.stars),
              label: const Text('Award XP (Test)'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                padding: const EdgeInsets.all(16),
              ),
            ),
            const SizedBox(height: 12),

            // Streak Reminder Button
            ElevatedButton.icon(
              onPressed: () {
                widget.notificationService.showStreakReminderNotification(
                  streakDays: _streak,
                );
              },
              icon: const Icon(Icons.local_fire_department),
              label: const Text('Send Streak Reminder (Test)'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                padding: const EdgeInsets.all(16),
              ),
            ),
            const SizedBox(height: 12),

            // Quest Reset Button
            ElevatedButton.icon(
              onPressed: () {
                widget.notificationService.showQuestResetNotification(
                  questType: 'daily',
                );
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Send Quest Reset (Test)'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                padding: const EdgeInsets.all(16),
              ),
            ),
            const SizedBox(height: 24),

            // FCM Token Display
            FutureBuilder<String?>(
              future: widget.notificationService.getFCMToken(),
              builder: (context, snapshot) {
                if (snapshot.hasData) {
                  return Card(
                    color: const Color(0xFF25174A),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'FCM Token',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.cyanAccent,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            snapshot.data ?? 'No token',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }
                return const SizedBox.shrink();
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.cyanAccent, size: 32),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            color: Colors.white70,
          ),
        ),
      ],
    );
  }
}
