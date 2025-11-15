import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'services/notification_service.dart';
import 'screens/home_screen.dart';
import 'screens/settings_screen.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  // Initialize Notification Service
  final notificationService = NotificationService();
  await notificationService.initialize();
  
  runApp(MyApp(notificationService: notificationService));
}

class MyApp extends StatelessWidget {
  final NotificationService notificationService;
  
  const MyApp({super.key, required this.notificationService});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Quantum Falcon',
      theme: ThemeData(
        primarySwatch: Colors.cyan,
        scaffoldBackgroundColor: const Color(0xFF0D0718),
        brightness: Brightness.dark,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => HomeScreen(notificationService: notificationService),
        '/settings': (context) => SettingsScreen(notificationService: notificationService),
      },
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'services/api_service.dart';
import 'providers/gamification_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load environment variables
  await dotenv.load(fileName: ".env");
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Get API base URL from environment
    final apiBaseUrl = dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000';
    
    // Initialize API service
    final apiService = ApiService(baseUrl: apiBaseUrl);
    
    return MultiProvider(
      providers: [
        // Provide API service
        Provider<ApiService>.value(value: apiService),
        
        // Provide gamification provider
        ChangeNotifierProvider(
          create: (_) => GamificationProvider(apiService),
        ),
      ],
      child: MaterialApp(
        title: 'Quantum Falcon Mobile',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: Colors.cyan,
            brightness: Brightness.dark,
          ),
          useMaterial3: true,
        ),
        home: const HomePage(),
      ),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    // Load initial data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<GamificationProvider>();
      provider.refreshAll();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quantum Falcon Cockpit'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Consumer<GamificationProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.xpData == null) {
            return const Center(child: CircularProgressIndicator());
          }
          
          if (provider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    'Error: ${provider.error}',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.red),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => provider.refreshAll(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }
          
          return RefreshIndicator(
            onRefresh: () => provider.refreshAll(),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // XP Section
                  _buildXpCard(provider),
                  const SizedBox(height: 16),
                  
                  // Streaks Section
                  _buildStreaksCard(provider),
                  const SizedBox(height: 16),
                  
                  // Quests Section
                  _buildQuestsCard(provider),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildXpCard(GamificationProvider provider) {
    final xp = provider.xpData;
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Experience Points',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                if (xp != null)
                  Chip(
                    label: Text('Level ${xp.level}'),
                    backgroundColor: Colors.cyan,
                  ),
              ],
            ),
            const SizedBox(height: 16),
            if (xp != null) ...[
              LinearProgressIndicator(
                value: xp.progressPercentage / 100,
                minHeight: 8,
              ),
              const SizedBox(height: 8),
              Text('${xp.currentXp} / ${xp.nextLevelXp} XP'),
              const SizedBox(height: 8),
              Text('Total XP: ${xp.totalXp}'),
              Text('Multiplier: ${xp.multiplier}x'),
            ] else
              const Text('No XP data available'),
          ],
        ),
      ),
    );
  }

  Widget _buildStreaksCard(GamificationProvider provider) {
    final streaks = provider.activeStreaks;
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Active Streaks',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (streaks.isEmpty)
              const Text('No active streaks')
            else
              ...streaks.map((streak) => ListTile(
                leading: const Icon(Icons.local_fire_department, color: Colors.orange),
                title: Text(streak.type.toString().split('.').last),
                subtitle: Text('${streak.currentStreak} days'),
                trailing: Text('Best: ${streak.longestStreak}'),
              )),
          ],
        ),
      ),
    );
  }

  Widget _buildQuestsCard(GamificationProvider provider) {
    final quests = provider.activeQuests;
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Active Quests',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (quests.isEmpty)
              const Text('No active quests')
            else
              ...quests.take(5).map((quest) => ListTile(
                leading: CircleAvatar(
                  child: Text('${quest.xpReward}'),
                ),
                title: Text(quest.title),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(quest.description),
                    const SizedBox(height: 4),
                    LinearProgressIndicator(
                      value: quest.progressPercentage / 100,
                    ),
                  ],
                ),
                trailing: Text('${quest.progress}/${quest.target}'),
              )),
          ],
        ),
      ),
    );
  }
}
