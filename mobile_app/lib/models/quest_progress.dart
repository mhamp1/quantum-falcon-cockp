import 'package:hive/hive.dart';

part 'quest_progress.g.dart';

@HiveType(typeId: 2)
class QuestProgress extends HiveObject {
  @HiveField(0)
  String questId;

  @HiveField(1)
  String questName;

  @HiveField(2)
  int currentProgress;

  @HiveField(3)
  int targetProgress;

  @HiveField(4)
  bool isCompleted;

  @HiveField(5)
  int rewardXp;

  @HiveField(6)
  DateTime lastUpdated;

  @HiveField(7)
  bool isSynced;

  QuestProgress({
    required this.questId,
    required this.questName,
    required this.currentProgress,
    required this.targetProgress,
    required this.isCompleted,
    required this.rewardXp,
    required this.lastUpdated,
    this.isSynced = false,
  });

  Map<String, dynamic> toJson() => {
        'questId': questId,
        'questName': questName,
        'currentProgress': currentProgress,
        'targetProgress': targetProgress,
        'isCompleted': isCompleted,
        'rewardXp': rewardXp,
        'lastUpdated': lastUpdated.toIso8601String(),
      };

  factory QuestProgress.fromJson(Map<String, dynamic> json) => QuestProgress(
        questId: json['questId'] as String,
        questName: json['questName'] as String,
        currentProgress: json['currentProgress'] as int,
        targetProgress: json['targetProgress'] as int,
        isCompleted: json['isCompleted'] as bool,
        rewardXp: json['rewardXp'] as int,
        lastUpdated: DateTime.parse(json['lastUpdated'] as String),
        isSynced: true,
      );

  QuestProgress copyWith({
    String? questId,
    String? questName,
    int? currentProgress,
    int? targetProgress,
    bool? isCompleted,
    int? rewardXp,
    DateTime? lastUpdated,
    bool? isSynced,
  }) {
    return QuestProgress(
      questId: questId ?? this.questId,
      questName: questName ?? this.questName,
      currentProgress: currentProgress ?? this.currentProgress,
      targetProgress: targetProgress ?? this.targetProgress,
      isCompleted: isCompleted ?? this.isCompleted,
      rewardXp: rewardXp ?? this.rewardXp,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      isSynced: isSynced ?? this.isSynced,
    );
  }

  double get progressPercentage {
    if (targetProgress == 0) return 0.0;
    return (currentProgress / targetProgress).clamp(0.0, 1.0);
  }
}
