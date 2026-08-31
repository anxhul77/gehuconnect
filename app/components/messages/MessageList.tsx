import React, {
  useCallback,
  useRef,
  useEffect,
  memo,
  forwardRef,
} from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { Message } from "@/src/features/chat/chat.types";
import MessageBubble from "./MessageBubble";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const LOAD_OLDER_DEBOUNCE_MS = 800;

const COLORS = {
  textMuted: "#535353",
  accent: "#5865F2",
};

interface Props {
  messages: Message[];
  loadOlder: () => void;
  isLoadingOlder?: boolean;
  onRetry?: (id: string) => void;
}

const EmptyChat = memo(() => (
  <View style={styles.empty}>
    <Text style={styles.emptyIcon}>💬</Text>
    <Text style={styles.emptyText}>No messages yet</Text>
    <Text style={styles.emptySubtext}>Be the first to say something</Text>
  </View>
));

const Loader = memo(() => (
  <View style={styles.loaderRow}>
    <ActivityIndicator size="small" color={COLORS.accent} />
  </View>
));

// Memoised so FlashList doesn't re-render the scroll component on every render
const KeyboardScrollComponent = memo(
  forwardRef<any, any>((props, ref) => (
    <KeyboardAwareScrollView {...props} ref={ref} />
  ))
);

export default function MessageList({
  messages,
  loadOlder,
  isLoadingOlder = false,
  onRetry,
}: Props) {
  const listRef = useRef<any>(null);
  const lastLoadRef = useRef(0);
  const isLoadingRef = useRef(false);
  const prevCountRef = useRef(messages.length);

  // Keep ref in sync so handleEnd closure is always current
  isLoadingRef.current = isLoadingOlder;

  // Auto-scroll to bottom when a new message arrives (not when older load)
  useEffect(() => {
    if (messages.length === 0) return;
    if (messages.length > prevCountRef.current) {
      // Inverted list — index 0 is visually the bottom
      try {
        listRef.current?.scrollToIndex({ index: 0, animated: true });
      } catch {
        // scrollToIndex can throw if list isn't ready yet — safe to ignore
      }
    }
    prevCountRef.current = messages.length;
  }, [messages.length]);

  // Debounced pagination — fires when user reaches the visual top (= list end in inverted)
  const handleEnd = useCallback(() => {
    if (isLoadingRef.current) return;
    const now = Date.now();
    if (now - lastLoadRef.current < LOAD_OLDER_DEBOUNCE_MS) return;
    lastLoadRef.current = now;
    loadOlder();
  }, [loadOlder]);

  const renderItem = useCallback<ListRenderItem<Message>>(
    ({ item }) => (
      <MessageBubble
        item={item}
        isGrouped={item.isGrouped}
        onRetry={onRetry}
      />
    ),
    [onRetry]
  );

  const keyExtractor = useCallback(
    (item: Message) => item.clientId,
    []
  );

  const getItemType = useCallback(
    (item: Message) => item.layoutType ?? "default",
    []
  );

  const overrideLayout = useCallback(
    (layout: { size: number }, item: Message) => {
      switch (item.layoutType) {
        case "textSmall":  layout.size = 54;  break;
        case "textMedium": layout.size = 80;  break;
        case "textLarge":  layout.size = 115; break;
        case "system":     layout.size = 42;  break;
        default:           layout.size = 72;
      }
  
      if (item.isGrouped) layout.size = Math.max(layout.size - 14, 32);
      
      if (item.attachments && item.attachments.length > 0) {
        layout.size = item.attachments.length === 1 ? 300 : 320;
      }
    },
    []
  );

  return (
    <FlashList
      ref={listRef}
      data={messages}
      renderItem={renderItem}
    
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      overrideItemLayout={overrideLayout}
      estimatedItemSize={72}
      drawDistance={400}
      onEndReached={handleEnd}
      onEndReachedThreshold={0.25}
      // In an inverted list, footer = visual top = older messages loader
      ListFooterComponent={isLoadingOlder ? <Loader /> : null}
      ListEmptyComponent={<EmptyChat />}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 8,
  },
  loaderRow: {
    paddingVertical: 14,
    alignItems: "center",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});