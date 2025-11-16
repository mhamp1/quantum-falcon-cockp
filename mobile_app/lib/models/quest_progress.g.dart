// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quest_progress.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class QuestProgressAdapter extends TypeAdapter<QuestProgress> {
  @override
  final int typeId = 2;

  @override
  QuestProgress read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return QuestProgress(
      questId: fields[0] as String,
      questName: fields[1] as String,
      currentProgress: fields[2] as int,
      targetProgress: fields[3] as int,
      isCompleted: fields[4] as bool,
      rewardXp: fields[5] as int,
      lastUpdated: fields[6] as DateTime,
      isSynced: fields[7] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, QuestProgress obj) {
    writer
      ..writeByte(8)
      ..writeByte(0)
      ..write(obj.questId)
      ..writeByte(1)
      ..write(obj.questName)
      ..writeByte(2)
      ..write(obj.currentProgress)
      ..writeByte(3)
      ..write(obj.targetProgress)
      ..writeByte(4)
      ..write(obj.isCompleted)
      ..writeByte(5)
      ..write(obj.rewardXp)
      ..writeByte(6)
      ..write(obj.lastUpdated)
      ..writeByte(7)
      ..write(obj.isSynced);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is QuestProgressAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
