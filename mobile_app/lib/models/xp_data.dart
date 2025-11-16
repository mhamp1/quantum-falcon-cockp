import 'package:hive/hive.dart';

part 'xp_data.g.dart';

@HiveType(typeId: 0)
class XpData extends HiveObject {
  @HiveField(0)
  int level;

  @HiveField(1)
  int currentXp;

  @HiveField(2)
  int totalXp;

  @HiveField(3)
  DateTime lastUpdated;

  @HiveField(4)
  bool isSynced;

  XpData({
    required this.level,
    required this.currentXp,
    required this.totalXp,
    required this.lastUpdated,
    this.isSynced = false,
  });

  Map<String, dynamic> toJson() => {
        'level': level,
        'currentXp': currentXp,
        'totalXp': totalXp,
        'lastUpdated': lastUpdated.toIso8601String(),
      };

  factory XpData.fromJson(Map<String, dynamic> json) => XpData(
        level: json['level'] as int,
        currentXp: json['currentXp'] as int,
        totalXp: json['totalXp'] as int,
        lastUpdated: DateTime.parse(json['lastUpdated'] as String),
        isSynced: true,
      );

  XpData copyWith({
    int? level,
    int? currentXp,
    int? totalXp,
    DateTime? lastUpdated,
    bool? isSynced,
  }) {
    return XpData(
      level: level ?? this.level,
      currentXp: currentXp ?? this.currentXp,
      totalXp: totalXp ?? this.totalXp,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      isSynced: isSynced ?? this.isSynced,
    );
  }
}
