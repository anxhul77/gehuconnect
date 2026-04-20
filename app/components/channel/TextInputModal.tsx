// ─────────────────────────────────────────────
//  TextInputModal.tsx
// ─────────────────────────────────────────────

import React, { useRef, useCallback } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardStickyView } from "react-native-keyboard-controller";

import AttachmentPreviewBar from "./AttachmentViewBar";
import { LocalAttachment } from "@/src/types/Attachment.types";

interface Props {
  message: string;
  onChangeMessage: (text: string) => void;
  onSend: () => void;
  onPlusPress: () => void;
  onEmojiPress: () => void;
  onInputFocus: () => void;
  attachments: LocalAttachment[];
  onRemoveAttachment: (localId: string) => void;
  isUploading: boolean;
  canSend: boolean;
  disabled?: boolean;
  channelName?: string;
  placeholder?: string;
}

export default function TextInputModal({
  message,
  onChangeMessage,
  onSend,
  onPlusPress,
  onEmojiPress,
  onInputFocus,
  attachments,
  onRemoveAttachment,
  isUploading,
  canSend,
  disabled = false,
  channelName,
  placeholder,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  const animIn = useCallback(() =>
    Animated.spring(scaleAnim, { toValue: 0.85, useNativeDriver: true }).start(), [scaleAnim]);
  const animOut = useCallback(() =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start(), [scaleAnim]);

  return (
    <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
      <View style={[styles.wrapper, { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
        <AttachmentPreviewBar attachments={attachments} onRemove={onRemoveAttachment} />

        <View style={styles.row}>
          <Pressable onPress={onPlusPress} style={styles.iconBtn} disabled={disabled}>
            <Feather name="plus" size={22} color="#B5BAC1" />
          </Pressable>

          <TextInput
            ref={inputRef}
            value={message}
            onChangeText={onChangeMessage}
            onFocus={onInputFocus}
            placeholder={placeholder ?? `Message ${channelName ? `#${channelName}` : ""}`}
            placeholderTextColor="#4E5058"
            style={styles.input}
            multiline
            editable={!disabled}
            keyboardAppearance="dark"
          />

          <Pressable onPress={onEmojiPress} style={styles.iconBtn} disabled={disabled}>
            <Ionicons name="happy-outline" size={22} color="#B5BAC1" />
          </Pressable>

          {canSend ? (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Pressable
                onPress={onSend}
                onPressIn={animIn}
                onPressOut={animOut}
                style={styles.sendBtn}
              >
                <Ionicons
                  name={isUploading ? "hourglass-outline" : "send"}
                  size={20}
                  color="white"
                />
              </Pressable>
            </Animated.View>
          ) : (
            <Pressable style={styles.iconBtn} disabled={disabled}>
              <MaterialCommunityIcons name="microphone-outline" size={22} color="#B5BAC1" />
            </Pressable>
          )}
        </View>
      </View>
    </KeyboardStickyView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#111111",
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 4,
    gap: 6,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    minHeight: 36,
    maxHeight: 120,
    color: "white",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: "#5865F2",
    alignItems: "center",
    justifyContent: "center",
  },
});