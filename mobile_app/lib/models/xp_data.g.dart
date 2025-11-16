// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'xp_data.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class XpDataAdapter extends TypeAdapter<XpData> {
  @override
  final int typeId = 0;

  @override
  XpData read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return XpData(
      level: fields[0] as int,
      currentXp: fields[1] as int,
      totalXp: fields[2] as int,
      lastUpdated: fields[3] as DateTime,
      isSynced: fields[4] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, XpData obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.level)
      ..writeByte(1)
      ..write(obj.currentXp)
      ..writeByte(2)
      ..write(obj.totalXp)
      ..writeByte(3)
      ..write(obj.lastUpdated)
      ..writeByte(4)
      ..write(obj.isSynced);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is XpDataAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
