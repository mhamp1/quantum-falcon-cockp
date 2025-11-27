import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';
import 'services/notification_service.dart';
import 'services/api_service.dart';
import 'providers/gamification_provider.dart';
import 'screens/home_screen.dart';
import 'screens/settings_screen.dart';
import 'firebase_options.dart';

/// Quantum Falcon Mobile v2025.1.0
/// Optimized for 60FPS, <30MB install, zero jank
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // ═══════════════════════════════════════════════════════════════
  // System UI Optimization — Edge-to-Edge, 60FPS
  // ═══════════════════════════════════════════════════════════════
  if (Platform.isAndroid) {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.light,
    ));
  }
  
  // Lock orientation for consistent UX
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // ═══════════════════════════════════════════════════════════════
  // Initialize Services (Parallel for Speed)
  // ═══════════════════════════════════════════════════════════════
  await Future.wait([
    Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform),
    Hive.initFlutter(),
  ]);
  
  // Open Hive boxes for offline storage
  await Hive.openBox('user_data');
  await Hive.openBox('xp_cache');
  await Hive.openBox('strategies_cache');
  
  // Initialize Notification Service
  final notificationService = NotificationService();
  await notificationService.initialize();
  
  // Initialize API Service
  final apiService = ApiService();
  
  runApp(
    QuantumFalconApp(
      notificationService: notificationService,
      apiService: apiService,
    ),
  );
}

class QuantumFalconApp extends StatelessWidget {
  final NotificationService notificationService;
  final ApiService apiService;
  
  const QuantumFalconApp({
    super.key, 
    required this.notificationService,
    required this.apiService,
  });

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => GamificationProvider(apiService: apiService),
        ),
      ],
      child: MaterialApp(
        title: 'Quantum Falcon',
        debugShowCheckedModeBanner: false,
        
        // ═══════════════════════════════════════════════════════════
        // Cyberpunk Theme — Matches Web App
        // ═══════════════════════════════════════════════════════════
        theme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF0D0718),
          primaryColor: const Color(0xFF00FFFF),
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF00FFFF),      // Cyan
            secondary: Color(0xFFDC1FFF),    // Purple
            surface: Color(0xFF0D0718),      // Dark background
            error: Color(0xFFFF4444),
            onPrimary: Color(0xFF000000),
            onSecondary: Color(0xFFFFFFFF),
            onSurface: Color(0xFFE0E0E0),
          ),
          fontFamily: 'Orbitron',
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF0D0718),
            foregroundColor: Color(0xFF00FFFF),
            elevation: 0,
            centerTitle: true,
          ),
          cardTheme: CardTheme(
            color: const Color(0xFF1A1025),
            elevation: 8,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(
                color: Color(0xFF00FFFF),
                width: 1,
              ),
            ),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00FFFF),
              foregroundColor: const Color(0xFF000000),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          // ═══════════════════════════════════════════════════════════
          // Page Transitions — Fast & Smooth (300ms)
          // ═══════════════════════════════════════════════════════════
          pageTransitionsTheme: const PageTransitionsTheme(
            builders: {
              TargetPlatform.android: CupertinoPageTransitionsBuilder(),
              TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
            },
          ),
        ),
        
        // ═══════════════════════════════════════════════════════════
        // Routes
        // ═══════════════════════════════════════════════════════════
        initialRoute: '/',
        routes: {
          '/': (context) => HomeScreen(notificationService: notificationService),
          '/settings': (context) => SettingsScreen(notificationService: notificationService),
        },
      ),
    );
  }
}

/// Loading shimmer widget for skeleton screens
class LoadingShimmer extends StatelessWidget {
  final double width;
  final double height;
  final BorderRadius? borderRadius;
  
  const LoadingShimmer({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: const Color(0xFF1A1025),
        borderRadius: borderRadius ?? BorderRadius.circular(8),
      ),
    );
  }
}

/// Offline indicator widget
class OfflineIndicator extends StatelessWidget {
  const OfflineIndicator({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.orange.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.orange, width: 1),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.cloud_off, size: 16, color: Colors.orange),
          SizedBox(width: 6),
          Text(
            'Offline',
            style: TextStyle(
              color: Colors.orange,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
