import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { TrendingResource } from "./types";

interface TrendingResourceCardProps {
  resource: TrendingResource;
  onDownload?: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  PYQ: "#ef4444",
  Notes: "#22c55e",
  Assignment: "#3b82f6",
  "Lab Manual": "#a855f7",
};

export default function TrendingResourceCard({
  resource,
  onDownload,
}: TrendingResourceCardProps) {
  const typeColor = TYPE_COLORS[resource.type] || "#71717a";

  return (
    <View className="  p-4 mb-4 border ">
      {/* Top Row: Icon + Title */}
      <View className="flex-row items-start mb-3">
        {/* Icon */}
        <View
          style={{ backgroundColor: `${typeColor}20` }}
          className="w-12 h-12 rounded-xl items-center justify-center mr-3"
        >
          <MaterialCommunityIcons
            name={
              resource.type === "PYQ"
                ? "file-document-outline"
                : "notebook-outline"
            }
            size={22}
            color={typeColor}
          />
        </View>

        {/* Title and Tags */}
        <View className="flex-1">
          <Text
            className="text-white font-bold text-base mb-1"
            numberOfLines={1}
          >
            {resource.title}
          </Text>
          <View className="flex-row items-center">
            <View
              style={{ backgroundColor: typeColor }}
              className="px-2 py-0.5 rounded mr-2"
            >
              <Text className="text-white text-[10px] font-bold">
                {resource.type}
              </Text>
            </View>
            <Text className="text-zinc-500 text-xs">• {resource.subject}</Text>
          </View>
        </View>
      </View>

      {/* Contributor Row */}
      <View className="flex-row items-center mb-4 bg-zinc-800/50 rounded-xl py-2 px-3">
        <Ionicons name="person-outline" size={14} color="#71717a" />
        <Text className="text-zinc-400 text-xs ml-2">Contributed by</Text>
        <Text className="text-white text-xs font-bold ml-1">
          {resource.contributor}
        </Text>
      </View>

      
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="download-outline" size={14} color="#71717a" />
          <Text className="text-zinc-500 text-xs ml-1">
            {resource.downloads}
          </Text>
          <Text className="text-zinc-700 mx-2">•</Text>
          <Text className="text-zinc-500 text-xs">{resource.size}</Text>
        </View>

        <Pressable
          onPress={onDownload}
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          className="bg-[#5865f2] px-5 py-2 rounded-full"
        >
          <Text className="text-white font-bold text-xs">Download</Text>
        </Pressable>
      </View>
    </View>
  );
}