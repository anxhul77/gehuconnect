// ─────────────────────────────────────────────
//  TextInputModal.tsx — Discord-style input bar
// ─────────────────────────────────────────────

import React, { useState, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  channelName?: string;
}

export default function TextInputModal({
  onSend,
  placeholder,
  disabled = false,
  channelName,
}: Props) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  const hasText = message.trim().length > 0;

  const handleSend = useCallback(() => {
    if (!hasText || disabled) return;
    onSend(message.trim());
    setMessage("");
    inputRef.current?.focus();
  }, [message, hasText, disabled, onSend]);

  const animIn = useCallback(() => {
    if (!hasText) return;
    Animated.spring(scaleAnim, { toValue: 0.85, useNativeDriver: true, speed: 60 }).start();
  }, [hasText, scaleAnim]);

  const animOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  }, [scaleAnim]);

  return (
    <View
      style={{ paddingBottom: insets.bottom + 4 }}
      className="bg-black px-3 pt-2"
    >
      <View className="flex-row items-end bg-[#383A40] rounded-2xl px-2 py-1.5 gap-2">

     
        <Pressable
          className="w-8 h-8 items-center justify-center mb-0.5"
          accessibilityLabel="Attach"
        >
          <Feather name="plus-circle" size={22} color="#B5BAC1" />
        </Pressable>

     
        <TextInput
          ref={inputRef}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder ?? `Message ${channelName ? `#${channelName}` : ""}`}
          placeholderTextColor="#4E5058"
          style={styles.input}
          multiline
          maxLength={2000}
      
          editable={!disabled}
          keyboardAppearance="dark"
          selectionColor="#5865F2"
          onSubmitEditing={Platform.OS === "android" ? handleSend : undefined}
          accessibilityLabel="Message input"
        />

     
        <Pressable className="w-8 h-8 items-center justify-center mb-0.5">
          <Ionicons name="happy-outline" size={22} color="#B5BAC1" />
        </Pressable>

     
        {hasText && (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              onPress={handleSend}
              onPressIn={animIn}
              onPressOut={animOut}
              disabled={disabled}
              className="w-8 h-8 rounded-full bg-[#5865F2] items-center justify-center mb-0.5"
              accessibilityLabel="Send message"
              accessibilityRole="button"
            >
              <Ionicons name="send" size={15} color="white" style={styles.sendIcon} />
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    color: "black",
    fontSize: 15,
    lineHeight: 20,
    minHeight: 36,
    maxHeight: 120,
    textAlignVertical: "center",
    padding: 0,
    margin: 0,
  },
  sendIcon: {
    marginLeft: 2,
  },
});