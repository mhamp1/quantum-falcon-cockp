import 'package:json_annotation/json_annotation.dart';

part 'quest_model.g.dart';

/// Model representing a quest/achievement in the app
@JsonSerializable()
class QuestModel {
  /// Unique identifier for the quest
  final String id;
  
  /// Quest title
  final String title;
  
  /// Quest description
  final String description;
  
  /// Quest category (daily, weekly, achievement, etc.)
  final QuestCategory category;
  
  /// XP reward for completing the quest
  final int xpReward;
  
  /// Current progress value
  final int progress;
  
  /// Target value to complete the quest
  final int target;
  
  /// Whether the quest is completed
  final bool isCompleted;
  
  /// Quest expiry date (null for permanent quests)
  final DateTime? expiresAt;
  
  /// Date when the quest was completed
  final DateTime? completedAt;

  QuestModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.xpReward,
    this.progress = 0,
    required this.target,
    this.isCompleted = false,
    this.expiresAt,
    this.completedAt,
  });

  factory QuestModel.fromJson(Map<String, dynamic> json) => _$QuestModelFromJson(json);
  Map<String, dynamic> toJson() => _$QuestModelToJson(this);

  /// Calculate completion percentage
  double get progressPercentage {
    if (target == 0) return 0.0;
    return (progress / target * 100).clamp(0.0, 100.0);
  }

  /// Check if quest is expired
  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }

  /// Copy with method
  QuestModel copyWith({
    String? id,
    String? title,
    String? description,
    QuestCategory? category,
    int? xpReward,
    int? progress,
    int? target,
    bool? isCompleted,
    DateTime? expiresAt,
    DateTime? completedAt,
  }) {
    return QuestModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      xpReward: xpReward ?? this.xpReward,
      progress: progress ?? this.progress,
      target: target ?? this.target,
      isCompleted: isCompleted ?? this.isCompleted,
      expiresAt: expiresAt ?? this.expiresAt,
      completedAt: completedAt ?? this.completedAt,
    );
  }
}

/// Quest categories
enum QuestCategory {
  @JsonValue('daily')
  daily,
  
  @JsonValue('weekly')
  weekly,
  
  @JsonValue('monthly')
  monthly,
  
  @JsonValue('achievement')
  achievement,
  
  @JsonValue('special')
  special,
}

/// Response model for quest list
@JsonSerializable()
class QuestListResponse {
  final List<QuestModel> quests;
  final int totalQuests;
  final int completedQuests;

  QuestListResponse({
    required this.quests,
    required this.totalQuests,
    required this.completedQuests,
  });

  factory QuestListResponse.fromJson(Map<String, dynamic> json) => 
      _$QuestListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$QuestListResponseToJson(this);
}
