import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

export interface CategoryItem {
  id: string;
  title: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
}

interface CategoryIconProps {
  category: CategoryItem;
  onPress?: () => void;
}

export default function CategoryIcon({ category, onPress }: CategoryIconProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      className="w-20 items-center mr-3"
    >
      {/* Icon Container */}
      <View
        style={{ backgroundColor: `${category.iconColor}15` }}
        className="w-14 h-14 rounded-2xl items-center justify-center mb-2 border border-white/5"
      >
        <MaterialCommunityIcons
          name={category.iconName}
          size={24}
          color={category.iconColor}
        />
      </View>

      {/* Title */}
      <Text
        className="text-zinc-400 font-medium text-[10px] text-center"
        numberOfLines={2}
      >
        {category.title}
      </Text>
    </Pressable>
  );
}

export const RESOURCE_CATEGORIES: CategoryItem[] = [
  {
    id: "timetable",
    title: "Timetable",
    iconName: "calendar-clock",
    iconColor: "#06b6d4",
  },
  {
    id: "syllabus",
    title: "Syllabus",
    iconName: "format-list-bulleted",
    iconColor: "#a855f7",
  },
  {
    id: "pyq",
    title: "PYQs",
    iconName: "file-document-outline",
    iconColor: "#ef4444",
  },
  {
    id: "notes",
    title: "Notes",
    iconName: "notebook-outline",
    iconColor: "#22c55e",
  },
  {
    id: "assignments",
    title: "Assignments",
    iconName: "clipboard-text-outline",
    iconColor: "#f97316",
  },
  {
    id: "lab",
    title: "Lab Manual",
    iconName: "flask-outline",
    iconColor: "#3b82f6",
  },
];