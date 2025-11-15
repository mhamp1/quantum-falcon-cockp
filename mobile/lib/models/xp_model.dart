import 'package:json_annotation/json_annotation.dart';

part 'xp_model.g.dart';

/// Model representing user XP (Experience Points) data
@JsonSerializable()
class XpModel {
  /// User's current XP points
  final int currentXp;
  
  /// User's current level
  final int level;
  
  /// XP required for next level
  final int nextLevelXp;
  
  /// Total XP earned all-time
  final int totalXp;
  
  /// XP multiplier based on subscription tier
  final double multiplier;
  
  /// Last updated timestamp
  final DateTime lastUpdated;

  XpModel({
    required this.currentXp,
    required this.level,
    required this.nextLevelXp,
    required this.totalXp,
    this.multiplier = 1.0,
    required this.lastUpdated,
  });

  /// Create XpModel from JSON
  factory XpModel.fromJson(Map<String, dynamic> json) => _$XpModelFromJson(json);

  /// Convert XpModel to JSON
  Map<String, dynamic> toJson() => _$XpModelToJson(this);

  /// Calculate progress percentage to next level
  double get progressPercentage {
    if (nextLevelXp == 0) return 0.0;
    return (currentXp / nextLevelXp * 100).clamp(0.0, 100.0);
  }

  /// Copy with method for immutability
  XpModel copyWith({
    int? currentXp,
    int? level,
    int? nextLevelXp,
    int? totalXp,
    double? multiplier,
    DateTime? lastUpdated,
  }) {
    return XpModel(
      currentXp: currentXp ?? this.currentXp,
      level: level ?? this.level,
      nextLevelXp: nextLevelXp ?? this.nextLevelXp,
      totalXp: totalXp ?? this.totalXp,
      multiplier: multiplier ?? this.multiplier,
      lastUpdated: lastUpdated ?? this.lastUpdated,
    );
  }
}

/// Model for XP award transactions
@JsonSerializable()
class XpAward {
  /// Amount of XP awarded
  final int amount;
  
  /// Reason for the award
  final String reason;
  
  /// Action type that triggered the award
  final String actionType;
  
  /// Timestamp of the award
  final DateTime timestamp;
  
  /// Whether this award resulted in a level-up
  final bool leveledUp;

  XpAward({
    required this.amount,
    required this.reason,
    required this.actionType,
    required this.timestamp,
    this.leveledUp = false,
  });

  factory XpAward.fromJson(Map<String, dynamic> json) => _$XpAwardFromJson(json);
  Map<String, dynamic> toJson() => _$XpAwardToJson(this);
}
