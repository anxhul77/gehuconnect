// ─────────────────────────────────────────────
//  MessageBubble.tsx — Discord-style UI
//  NativeWind used for layout/spacing/color
//  StyleSheet used only for complex/dynamic values
// ─────────────────────────────────────────────
import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Message } from "@/src/features/chat/chat.types";
import { useAppSelector } from "@/src/store/Hooks";

interface Props {
  item: Message;
  /** The message rendered directly above this one (chronologically previous) */
  isGrouped: boolean; // true = same sender as previous msg within 5 min
  onRetry?: (clientId: string) => void;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatFullDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString([], {
      weekday: "long", month: "long", day: "numeric",
    });
  } catch {
    return "";
  }
}

// ── Avatar ────────────────────────────────────
function Avatar({ uri, name }: { uri?: string; name?: string }) {
  const initial = (name ?? "?")[0].toUpperCase();
  if (uri) {
    return <Image source={{ uri }} style={styles.avatar} />;
  }
  // Deterministic hue from name
  const hue = [...(name ?? "U")].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: `hsl(${hue},60%,40%)` }]}>
      <Text style={styles.avatarInitial}>{initial}</Text>
    </View>
  );
}

// ── Status icon ───────────────────────────────
function MessageStatus({ item }: { item: Message }) {
  if (item.failed) {
    return <Ionicons name="alert-circle" size={13} color="#ED4245" />;
  }
  if (item.pending) {
    return <ActivityIndicator size={10} color="#72767D" />;
  }
  if (item.seen) {
    return <Ionicons name="checkmark-done" size={13} color="#3BA55C" />;
  }
  if (item.delivered) {
    return <Ionicons name="checkmark-done" size={13} color="#72767D" />;
  }
  return <Ionicons name="checkmark" size={13} color="#72767D" />;
}

export default function MessageBubble({ item, isGrouped, onRetry }: Props) {
  const currentUserId = useAppSelector((s) => s.auth?.user?.id?.toString());
  const isOwn = item.senderId === currentUserId;

  const handleRetry = useCallback(() => {
    onRetry?.(item.clientId);
  }, [item.clientId, onRetry]);

  const displayName = item.senderName ?? item.senderId;

  return (
    <View
      className={`flex-row px-3 ${isGrouped ? "pt-0.5 pb-0" : "pt-3 pb-0"}`}
    >
      {/* ── Avatar column (44px wide) ── */}
      <View className="w-11 mr-3 items-center">
        {!isGrouped ? (
          <Avatar uri={item.senderAvatar} name={displayName} />
        ) : (
          // Hover timestamp placeholder — Discord shows time on hover
          // On mobile we show it inline for grouped messages
          <Text className="text-[10px] text-[#4E5058] mt-1" numberOfLines={1}>
            {formatTime(item.createdAt)}
          </Text>
        )}
      </View>

      {/* ── Content column ── */}
      <View className="flex-1">
        {/* Header row: name + timestamp (only on first msg in group) */}
        {!isGrouped && (
          <View className="flex-row items-baseline gap-2 mb-0.5">
            <Text
              className="text-[15px] font-semibold leading-5"
              style={{ color: isOwn ? "#00AFF4" : "#FFFFFF" }}
              numberOfLines={1}
            >
              {isOwn ? "You" : displayName}
            </Text>
            <Text className="text-[11px] text-[#4E5058]">
              {formatTime(item.createdAt)}
            </Text>
          </View>
        )}

        {/* Message content */}
        <View className="flex-row flex-wrap items-end gap-1.5">
          <Text
            selectable
            className={`text-[15px] leading-5 flex-shrink ${
              item.failed
                ? "text-[#ED4245]"
                : item.pending
                ? "text-[#8E9297]"
                : "text-[#DCDDDE]"
            }`}
          >
            {item.content}
          </Text>

          {/* Status (own messages only) */}
          {isOwn && (
            <View className="mb-0.5">
              <MessageStatus item={item} />
            </View>
          )}
        </View>

        {/* Failed error row */}
        {item.failed && (
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-[12px] text-[#ED4245]">
              Message failed to send.
            </Text>
            <TouchableOpacity onPress={handleRetry} accessibilityLabel="Retry message">
              <Text className="text-[12px] text-[#00AFF4] font-semibold">
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

// ── Date separator ────────────────────────────
export function DateSeparator({ date }: { date: string }) {
  return (
    <View className="flex-row items-center px-4 my-4">
      <View className="flex-1 h-px bg-[#3F4147]" />
      <Text className="mx-3 text-[12px] font-semibold text-[#72767D]">
        {formatFullDate(date)}
      </Text>
      <View className="flex-1 h-px bg-[#3F4147]" />
    </View>
  );
}