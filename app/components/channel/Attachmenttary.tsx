// ─────────────────────────────────────────────
//  AttachmentTray.tsx
//  Floating card that sits just above the input bar.
//  Uses absolute positioning bottom:100% so it always
//  anchors to whatever is below it (keyboard or panel).
// ─────────────────────────────────────────────

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

interface Props {
  visible: boolean;
  onPickMedia: () => void;
  onPickDocument: () => void;
  onCamera: () => void;
  onDismiss: () => void;
}

interface TrayItem {
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress: () => void;
}

export default function AttachmentTray({
  visible,
  onPickMedia,
  onPickDocument,
  onCamera,
  onDismiss,
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
      mass: 0.8,
    }).start();
  }, [visible]);

  const items: TrayItem[] = [
    {
      label: "Photos & Videos",
      color: "#5865F2",
      icon: <Ionicons name="image-outline" size={26} color="white" />,
      onPress: onPickMedia,
    },
    {
      label: "Document",
      color: "#3BA55C",
      icon: <Ionicons name="document-outline" size={26} color="white" />,
      onPress: onPickDocument,
    },
    {
      label: "Camera",
      color: "#EB459E",
      icon: <Ionicons name="camera-outline" size={26} color="white" />,
      onPress: onCamera,
    },
  ];

  // Don't render at all when fully hidden to avoid touch interception
  if (!visible && anim.__getValue() === 0) return null;

  return (
    <>
      {/* Invisible backdrop to dismiss on tap outside */}
      {visible && (
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        style={[
          styles.tray,
          {
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
              {
                scale: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
            ],
          },
        ]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <View style={styles.row}>
          {items.map((item) => (
            <Pressable
              key={item.label}
              style={styles.item}
              onPress={item.onPress}
              android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: true }}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                {item.icon}
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  tray: {
    position: "absolute",
    bottom: "100%",    // anchors just above whatever is below (input bar)
    left: 12,
    right: 12,
    marginBottom: 8,
    backgroundColor: "#1E1F22",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 24,
    zIndex: 100,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  item: {
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "#B5BAC1",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    maxWidth: 72,
  },
});