import 'package:hive/hive.dart';

part 'streak_data.g.dart';

@HiveType(typeId: 1)
class StreakData extends HiveObject {
  @HiveField(0)
  int currentStreak;

  @HiveField(1)
  int longestStreak;

  @HiveField(2)
  DateTime lastActiveDate;

  @HiveField(3)
  DateTime lastUpdated;

  @HiveField(4)
  bool isSynced;

  StreakData({
    required this.currentStreak,
    required this.longestStreak,
    required this.lastActiveDate,
    required this.lastUpdated,
    this.isSynced = false,
  });

  Map<String, dynamic> toJson() => {
        'currentStreak': currentStreak,
        'longestStreak': longestStreak,
        'lastActiveDate': lastActiveDate.toIso8601String(),
        'lastUpdated': lastUpdated.toIso8601String(),
      };

  factory StreakData.fromJson(Map<String, dynamic> json) => StreakData(
        currentStreak: json['currentStreak'] as int,
        longestStreak: json['longestStreak'] as int,
        lastActiveDate: DateTime.parse(json['lastActiveDate'] as String),
        lastUpdated: DateTime.parse(json['lastUpdated'] as String),
        isSynced: true,
      );

  StreakData copyWith({
    int? currentStreak,
    int? longestStreak,
    DateTime? lastActiveDate,
    DateTime? lastUpdated,
    bool? isSynced,
  }) {
    return StreakData(
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      lastActiveDate: lastActiveDate ?? this.lastActiveDate,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      isSynced: isSynced ?? this.isSynced,
    );
  }
}
