import React, { memo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { CommentSortType } from "@/src/types/types";

interface CommentSortBarProps {
  activeSort: CommentSortType;
  onSortChange: (sort: CommentSortType) => void;
}

const SORT_OPTIONS: { label: string; value: CommentSortType }[] = [
  { label: "New", value: CommentSortType.LATEST },
  { label: "Top", value: CommentSortType.TOP },
];

function CommentSortBar({ activeSort, onSortChange }: CommentSortBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sort by</Text>
      {SORT_OPTIONS.map(({ label, value }) => {
        const isActive = activeSort === value;
        return (
          <Pressable
            key={value}
            onPress={() => onSortChange(value)}
            style={[styles.pill, isActive && styles.pillActive]}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default memo(CommentSortBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1F2937",
  },
  label: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginRight: 4,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  pillActive: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
  },
  pillText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#3B82F6",
  },
});
