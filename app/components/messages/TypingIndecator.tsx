// ─────────────────────────────────────────────
//  TypingIndicator.tsx — Discord style
// ─────────────────────────────────────────────
import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";

interface Props { users?: string[]; }

function Dot({ delay }: { delay: number }) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(y, { toValue: -4, duration: 300, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(600),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.dot, { transform: [{ translateY: y }] }]}
    />
  );
}

function formatTyping(users: string[]): string {
  if (users.length === 1) return `${users[0]} is typing`;
  if (users.length === 2) return `${users[0]} and ${users[1]} are typing`;
  return `${users[0]} and ${users.length - 1} others are typing`;
}

export default function TypingIndicator({ users }: Props) {
  if (!users?.length) return null;
  return (
    <View className="flex-row items-center px-4 py-1.5 gap-2">
      <View className="flex-row gap-0.5 items-center">
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
      <Text className="text-[#B5BAC1] text-xs italic">
        {formatTyping(users)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#B5BAC1",
    marginHorizontal: 1,
  },
});