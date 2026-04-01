// ─────────────────────────────────────────────
//  MessageList.tsx
//  Fixes:
//   1. Full TypeScript types
//   2. Empty state
//   3. Pagination footer loader
//   4. onRetry wired through
//   5. Spotify dark styling
// ─────────────────────────────────────────────

import React, { useCallback, useRef } from "react";
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ListRenderItem,
} from "react-native";
import { Message } from "@/src/features/chat/chat.types";
import MessageBubble from "./MessageBubble";

const LOAD_OLDER_DEBOUNCE_MS = 800;

const COLORS = {
  bg: "#121212",
  textMuted: "#535353",
  accent: "#1DB954",
};

interface Props {
  messages: Message[];
  loadOlder: () => void;
  isLoadingOlder?: boolean;
  onRetry?: (clientId: string) => void;
}

function EmptyChat() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubtext}>Be the first to say something</Text>
    </View>
  );
}

function OlderMessagesLoader() {
  return (
    <View style={styles.loaderRow}>
      <ActivityIndicator size="small" color={COLORS.accent} />
    </View>
  );
}

export default function MessageList({ messages, loadOlder, isLoadingOlder = false, onRetry }: Props) {
  const ref = useRef<FlatList<Message>>(null);


  const lastLoadTimeRef = useRef<number>(0);
  const isLoadingOlderRef = useRef(isLoadingOlder);

  isLoadingOlderRef.current = isLoadingOlder;


  const handleEndReached = useCallback(() => {
    if (isLoadingOlderRef.current) {
      console.debug("[MessageList] onEndReached skipped — already loading");
      return;
    }
    const now = Date.now();
    const elapsed = now - lastLoadTimeRef.current;
    if (elapsed < LOAD_OLDER_DEBOUNCE_MS) {
      console.debug(`[MessageList] onEndReached debounced — ${elapsed}ms since last call`);
      return;
    }
    lastLoadTimeRef.current = now;
    console.debug("[MessageList] onEndReached — loading older messages");
    loadOlder();
  
  }, [loadOlder]); 


  const renderItem = useCallback<ListRenderItem<Message>>(
    ({ item, index }) => (
      <MessageBubble
        item={item}
        
        previous={messages[index + 1]}
        onRetry={onRetry}
      />
    ),
    [messages, onRetry]
  );

  const keyExtractor = useCallback(
    (item: Message) => item.clientId ?? item.messageId?.toString() ?? `fallback-${item.createdAt}`,
    []
  );

  return (
    <FlatList
      ref={ref}
      data={messages}
      
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      
      initialNumToRender={25}
      maxToRenderPerBatch={20}
      windowSize={10}
      removeClippedSubviews
      
      onEndReached={handleEndReached}
   
      onEndReachedThreshold={0.1}
      
      ListFooterComponent={isLoadingOlder ? <OlderMessagesLoader /> : null}
  
      ListEmptyComponent={<EmptyChat />}

      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={messages.length === 0 ? styles.emptyContainer : styles.content}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderRow: {
    paddingVertical: 12,
    alignItems: "center",
  },
  empty: {
    alignItems: "center",
    gap: 6,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 4,
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