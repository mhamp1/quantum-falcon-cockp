import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/xp_service.dart';
import 'providers/sync_provider.dart';
import 'widgets/sync_indicator.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize XP Service with Hive
  final xpService = XpService();
  await xpService.initialize();

  runApp(MyApp(xpService: xpService));
}

class MyApp extends StatelessWidget {
  final XpService xpService;

  const MyApp({super.key, required this.xpService});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => SyncProvider(
        xpService: xpService,
        apiBaseUrl: 'http://localhost:3000', // Change to your API URL
      ),
      child: MaterialApp(
        title: 'Quantum Falcon Mobile',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: Colors.cyan,
            brightness: Brightness.dark,
          ),
          useMaterial3: true,
        ),
        home: const HomeScreen(),
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quantum Falcon'),
        actions: const [
          Padding(
            padding: EdgeInsets.all(8.0),
            child: SyncIndicator(),
          ),
        ],
      ),
      body: const Center(
        child: Text(
          'Offline-First Mobile App\nwith Hive Flutter',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 18),
        ),
      ),
    );
  }
}
