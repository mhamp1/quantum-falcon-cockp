import 'package:json_annotation/json_annotation.dart';

part 'streak_model.g.dart';

/// Model representing user streaks (consecutive days/actions)
@JsonSerializable()
class StreakModel {
  /// Current streak count
  final int currentStreak;
  
  /// Longest streak achieved
  final int longestStreak;
  
  /// Date when the streak started
  final DateTime streakStartDate;
  
  /// Last activity date
  final DateTime lastActivityDate;
  
  /// Streak type (daily_login, trading, learning, etc.)
  final StreakType type;
  
  /// XP bonus per streak milestone
  final int xpBonusPerMilestone;
  
  /// Next milestone to reach for bonus
  final int nextMilestone;
  
  /// Whether the streak is currently active
  final bool isActive;

  StreakModel({
    required this.currentStreak,
    required this.longestStreak,
    required this.streakStartDate,
    required this.lastActivityDate,
    required this.type,
    this.xpBonusPerMilestone = 500,
    required this.nextMilestone,
    this.isActive = true,
  });

  factory StreakModel.fromJson(Map<String, dynamic> json) => 
      _$StreakModelFromJson(json);
  Map<String, dynamic> toJson() => _$StreakModelToJson(this);

  /// Calculate progress to next milestone
  int get progressToMilestone {
    return currentStreak % nextMilestone;
  }

  /// Check if streak is broken (no activity in last 24-48 hours depending on type)
  bool get isBroken {
    final now = DateTime.now();
    final difference = now.difference(lastActivityDate);
    
    switch (type) {
      case StreakType.dailyLogin:
        return difference.inHours > 48; // 2-day grace period
      case StreakType.trading:
        return difference.inHours > 24;
      case StreakType.learning:
        return difference.inHours > 72; // 3-day grace period
      default:
        return difference.inHours > 24;
    }
  }

  /// Copy with method
  StreakModel copyWith({
    int? currentStreak,
    int? longestStreak,
    DateTime? streakStartDate,
    DateTime? lastActivityDate,
    StreakType? type,
    int? xpBonusPerMilestone,
    int? nextMilestone,
    bool? isActive,
  }) {
    return StreakModel(
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      streakStartDate: streakStartDate ?? this.streakStartDate,
      lastActivityDate: lastActivityDate ?? this.lastActivityDate,
      type: type ?? this.type,
      xpBonusPerMilestone: xpBonusPerMilestone ?? this.xpBonusPerMilestone,
      nextMilestone: nextMilestone ?? this.nextMilestone,
      isActive: isActive ?? this.isActive,
    );
  }
}

/// Streak types
enum StreakType {
  @JsonValue('daily_login')
  dailyLogin,
  
  @JsonValue('trading')
  trading,
  
  @JsonValue('learning')
  learning,
  
  @JsonValue('community')
  community,
}

/// Response model for streak data
@JsonSerializable()
class StreakResponse {
  final List<StreakModel> streaks;
  final int totalActiveStreaks;
  final DateTime lastUpdated;

  StreakResponse({
    required this.streaks,
    required this.totalActiveStreaks,
    required this.lastUpdated,
  });

  factory StreakResponse.fromJson(Map<String, dynamic> json) => 
      _$StreakResponseFromJson(json);
  Map<String, dynamic> toJson() => _$StreakResponseToJson(this);
}
