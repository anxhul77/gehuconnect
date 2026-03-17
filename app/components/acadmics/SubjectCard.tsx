import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { Subject } from "./types";

interface SubjectCardProps {
  subject: Subject;
  onPress?: () => void;
}

export default function SubjectCard({ subject, onPress }: SubjectCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      className="w-32 bg-zinc-800/50 rounded-2xl p-3 mr-3 border "
    >
      {/* Colored Icon Badge */}
      <View
        style={{ backgroundColor: subject.color }}
        className="w-10 h-10 rounded-full items-center justify-center mb-2"
      >
        <Text className="text-white font-bold text-xs">
          {subject.shortName}
        </Text>
      </View>

      {/* Subject Name */}
      <Text className="text-white font-bold text-sm mb-1" numberOfLines={1}>
        {subject.name}
      </Text>

      {/* File Count */}
      <View className="flex-row items-center">
        <Ionicons name="folder-outline" size={10} color="#71717a" />
        <Text className="text-zinc-500 text-[10px] ml-1">
          {subject.fileCount} files
        </Text>
      </View>
    </Pressable>
  );
}