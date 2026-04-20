// ─────────────────────────────────────────────
//  AttachmentPanel.tsx
//  Plain animated View — NOT a BottomSheet.
// ─────────────────────────────────────────────

import React, { memo } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import Reanimated, { useAnimatedStyle, interpolate } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  height: number;
  animValue: Reanimated.SharedValue<number>;
  onPickMedia: () => void;
  onPickDocument: () => void;
  onCamera: () => void;
}

export default memo(function AttachmentPanel({
  height,
  animValue,
  onPickMedia,
  onPickDocument,
  onCamera,
}: Props) {
  const animStyle = useAnimatedStyle(() => ({
    height,
    transform: [
      { translateY: interpolate(animValue.value, [0, 1], [height, 0]) },
    ],
    opacity: interpolate(animValue.value, [0, 0.3, 1], [0, 1, 1]),
  }));

  return (
    <Reanimated.View style={[styles.container, animStyle]}>
      <View style={styles.grid}>
        <Pressable style={styles.btn} onPress={onPickMedia}>
          <View style={[styles.icon, { backgroundColor: "#5865F2" }]}>
            <Ionicons name="image-outline" size={28} color="white" />
          </View>
          <Text style={styles.label}>Photos & Videos</Text>
        </Pressable>

        <Pressable style={styles.btn} onPress={onPickDocument}>
          <View style={[styles.icon, { backgroundColor: "#3BA55C" }]}>
            <Ionicons name="document-outline" size={28} color="white" />
          </View>
          <Text style={styles.label}>File</Text>
        </Pressable>

        <Pressable style={styles.btn} onPress={onCamera}>
          <View style={[styles.icon, { backgroundColor: "#EB459E" }]}>
            <Ionicons name="camera-outline" size={28} color="white" />
          </View>
          <Text style={styles.label}>Camera</Text>
        </Pressable>
      </View>
    </Reanimated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E1F22",
    overflow: "hidden",
  },
  grid: {
    flexDirection: "row",
    paddingHorizontal: 32,
    paddingTop: 28,
    gap: 36,
  },
  btn: { alignItems: "center", gap: 10 },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { color: "#B5BAC1", fontSize: 12, fontWeight: "500" },
});