// ─────────────────────────────────────────────
//  Channel.tsx — Discord-style screen
// ─────────────────────────────────────────────

import React, { useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import MessageList from "@/app/components/messages/MessageList";
import TextInputModal from "@/app/components/channel/TextInputModal";
import TypingIndicator from "@/app/components/messages/TypingIndecator";
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useLoadOlderMessagesMutation,
} from "@/src/features/chat/chat.api";

const LOG_TAG = "[Channel]";

// ── Loading skeleton ──────────────────────────
function LoadingSkeleton() {
  return (
    <View className="flex-1 p-4 gap-3 justify-end">
      {[
        { w: "60%", right: false },
        { w: "45%", right: true },
        { w: "75%", right: false },
        { w: "35%", right: true },
        { w: "55%", right: false },
      ].map((s, i) => (
        <View key={i} className={`flex-row ${s.right ? "justify-end" : "justify-start"}`}>
          {!s.right && <View className="w-10 h-10 rounded-full bg-[#3F4147] mr-3" />}
          <View
            className="h-10 rounded-xl bg-[#3F4147] opacity-60"
            style={{ width: s.w as any }}
          />
        </View>
      ))}
    </View>
  );
}

// ── Error state ───────────────────────────────
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 p-8">
      <Ionicons name="cloud-offline-outline" size={52} color="#4E5058" />
      <Text className="text-white text-lg font-bold">Couldn't load messages</Text>
      <Text className="text-[#72767D] text-sm text-center">
        Check your connection and try again
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        className="mt-2 flex-row items-center gap-2 bg-[#5865F2] px-5 py-2.5 rounded-full"
      >
        <Ionicons name="refresh" size={16} color="white" />
        <Text className="text-white font-bold text-sm">Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Channel() {
  const router = useRouter();
  const params = useLocalSearchParams<{ channelId: string; channelName?: string }>();

  const channelId = (Array.isArray(params.channelId) ? params.channelId[0] : params.channelId) ?? "";
  const channelName = Array.isArray(params.channelName) ? params.channelName[0] : params.channelName;

  if (!channelId) {
    return (
      <View className="flex-1 items-center justify-center bg-[#313338]">
        <Text className="text-white text-lg">Invalid channel</Text>
      </View>
    );
  }

  console.debug(`${LOG_TAG} Rendering channel: ${channelId}`);

  const { data, isLoading, isError, refetch, isFetching } = useGetMessagesQuery(
    { channelId },
    { skip: !channelId }
  );

  const [sendMessage] = useSendMessageMutation();
  const [loadOlderMessages, { isLoading: isLoadingOlder }] = useLoadOlderMessagesMutation();

  const handleLoadOlder = useCallback(async () => {
    const cursor = data?.nextCursor;
    if (!cursor || isLoadingOlder) return;
    console.debug(`${LOG_TAG} loadOlder cursor: ${cursor}`);
    try {
      await loadOlderMessages({ channelId, cursor });
    } catch (err) {
      console.error(`${LOG_TAG} loadOlder failed`, err);
    }
  }, [channelId, data?.nextCursor, isLoadingOlder, loadOlderMessages]);

  const handleRetry = useCallback(
    (clientId: string) => {
      const msg = data?.messages.find((m) => m.clientId === clientId);
      if (!msg) return;
      console.debug(`${LOG_TAG} Retrying clientId: ${clientId}`);
      sendMessage({ channelId, content: msg.content });
    },
    [data, channelId, sendMessage]
  );

  const handleSend = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      sendMessage({ channelId, content: trimmed });
    },
    [channelId, sendMessage]
  );

  return (
    <SafeAreaView className="flex-1 bg-[#313338]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#313338" />

      
      <View className="flex-row items-center px-2 py-3 border-b border-[#3F4147] bg-black">
        <Pressable
          onPress={() => router.back()}
          className="p-1 mr-1"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View className=" flex-row ">
          <Text className="text-white text-3xl font-bold  gap-2">#</Text>
        

        <Text className="flex-1 text-white text-2xl  font-bold" numberOfLines={1}>
          {channelName ?? `channel-${channelName}`}
        </Text>
</View>
        <Pressable className="p-1" accessibilityLabel="Channel info">
          <Ionicons name="people-outline" size={22} color="#B5BAC1" />
        </Pressable>
        <Pressable className="p-1 ml-1" accessibilityLabel="Search">
          <Ionicons name="search-outline" size={22} color="#B5BAC1" />
        </Pressable>
      </View>

    
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <MessageList
            messages={data?.messages ?? []}
            loadOlder={handleLoadOlder}
            isLoadingOlder={isLoadingOlder || (isFetching && !isLoading)}
       
            onRetry={handleRetry}
          />
        )}

        <TypingIndicator users={(data as any)?.typingUsers} />
        <TextInputModal onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}