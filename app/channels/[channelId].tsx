import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Alert,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import MessageList from "@/app/components/messages/MessageList";
import TextInputModal from "@/app/components/channel/TextInputModal";
import TypingIndicator from "@/app/components/messages/TypingIndecator";
import EmojiPicker from "@/app/components/channel/EmojiPicker";
import { ChannelHeader } from "@/app/components/channel/ChannelHeader";
import AttachmentTray from "@/app/components/channel/Attachmenttary";
import PublicFeedInputModal from "@/app/components/channel/PublicFeedInputModal";
import PostList from "@/app/components/messages/PostList";

import { useAttachmentUpload } from "@/src/utils/UploadToR2";
import {
  getCategoryFromMime,
  LIMITS,
  LocalAttachment,
  validateAttachment,
} from "@/src/types/Attachment.types";
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useLoadOlderMessagesMutation,
} from "@/src/features/chat/chat.api";
import { router } from "expo-router";

const LOG_TAG = "[Channel]";


function LoadingSkeleton() {
  return (
    <View style={sk.container}>
      {[
        { w: "60%", right: false },
        { w: "45%", right: true },
        { w: "75%", right: false },
        { w: "35%", right: true },
        { w: "55%", right: false },
      ].map((s, i) => (
        <View key={i} style={[sk.row, s.right ? sk.rowRight : sk.rowLeft]}>
          {!s.right && <View style={sk.avatar} />}
          <View style={[sk.bubble, { width: s.w as any }]} />
        </View>
      ))}
    </View>
  );
}

const sk = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, justifyContent: "flex-end" },
  row: { flexDirection: "row", alignItems: "center" },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3F4147",
    marginRight: 12,
  },
  bubble: {
    height: 40,
    borderRadius: 12,
    backgroundColor: "#3F4147",
    opacity: 0.6,
  },
});


function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={es.container}>
      <Ionicons name="cloud-offline-outline" size={52} color="#4E5058" />
      <Text style={es.title}>Couldn't load messages</Text>
      <Text style={es.subtitle}>Check your connection and try again</Text>
      <TouchableOpacity onPress={onRetry} style={es.btn}>
        <Ionicons name="refresh" size={16} color="white" />
        <Text style={es.btnText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const es = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  subtitle: { color: "#72767D", fontSize: 14, textAlign: "center" },
  btn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#5865F2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 99,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});


export default function Channel() {
  const params = useLocalSearchParams<{
    channelId: string;
    name?: string;
    communityId?: string;
  }>();

  const channelId =
    (Array.isArray(params.channelId)
      ? params.channelId[0]
      : params.channelId) ?? "";
  const channelName = Array.isArray(params.name)
    ? params.name[0]
    : params.name;
  const communityId =
    (Array.isArray(params.communityId)
      ? params.communityId[0]
      : params.communityId) ?? "";
  console.log(channelName)
  const [isPublicFeed, setIsPublicFeed] = useState(channelName == "publicfeed")

  const emojiSheetRef = useRef<BottomSheetModal>(null);
  const emojiOpen = useRef(false);


  const [trayVisible, setTrayVisible] = useState(false);

  const [message, setMessage] = useState("");
  const {
    attachments,
    addAttachments,
    removeAttachment,
    clearAttachments,
    isUploading,
  } = useAttachmentUpload(channelId);

  const canSend =
    (message.trim().length > 0 || attachments.length > 0) && !isUploading;
  const sendDisabled = isUploading;


  const {
    data: chatData,
    isLoading: chatLoading,
    isError: chatError,
    refetch: chatRefetch,
    isFetching: chatFetching,
  } = useGetMessagesQuery({ channelId }, { skip: !channelId || isPublicFeed });


  const [sendMessage] = useSendMessageMutation();
  const [loadOlderMessages, { isLoading: isLoadingOlder }] =
    useLoadOlderMessagesMutation();


  const handleLoadOlder = useCallback(async () => {
    const cursor = chatData?.nextCursor;
    if (!cursor || isLoadingOlder) return;
    try {
      await loadOlderMessages({ channelId, cursor });
    } catch (err) {
      console.error(`${LOG_TAG} loadOlder failed`, err);
    }
  }, [channelId, chatData?.nextCursor, isLoadingOlder, loadOlderMessages]);


  const handleRetry = useCallback(
    (clientId: string) => {
      const msg = chatData?.messages.find((m) => m.clientId === clientId);
      if (!msg) return;
      sendMessage({
        channelId,
        content: msg.content,
        attachmentUploadIds:
          msg.attachments?.map((a: any) => a.uploadId) ?? [],
      });
    },
    [chatData, channelId, sendMessage]
  );


  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed && attachments.length === 0) return;

    const uploadedAttachments = attachments.filter(
      (a) => a.status === "uploaded"
    );
    const hasFailedOnly =
      attachments.length > 0 &&
      uploadedAttachments.length === 0 &&
      !trimmed;

    if (hasFailedOnly) {
      Alert.alert(
        "Upload failed",
        "Please remove failed attachments or try uploading again."
      );
      return;
    }

    sendMessage({
      channelId,
      content: trimmed,
      attachmentUploadIds: uploadedAttachments.map((a) => a.uploadId!),
    });

    setMessage("");
    clearAttachments();
  }, [message, attachments, channelId, sendMessage, clearAttachments]);


  const buildAttachment = useCallback(
    (
      uri: string,
      fileName: string,
      mimeType: string,
      fileSize: number,
      thumbUri?: string
    ): LocalAttachment | null => {
      const error = validateAttachment(mimeType, fileSize, attachments.length);
      if (error) {
        Alert.alert("Can't add file", error);
        return null;
      }
      const category = getCategoryFromMime(mimeType);
      if (!category) return null;
      return {
        localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        uri,
        fileName: fileName || "file",
        mimeType,
        fileSize,
        category,
        thumbUri,
        status: "pending",
        progress: 0,
      };
    },
    [attachments.length]
  );


  const handlePlusPress = useCallback(() => {
    if (emojiOpen.current) emojiSheetRef.current?.dismiss();
    setTrayVisible((v) => !v);
  }, []);

  const handleEmojiPress = useCallback(() => {
    setTrayVisible(false);
    Keyboard.dismiss();
    setTimeout(() => emojiSheetRef.current?.present(), 50);
  }, []);

  const handleInputFocus = useCallback(() => {
    setTrayVisible(false);
    if (emojiOpen.current) emojiSheetRef.current?.dismiss();
  }, []);

  const handlePickMedia = useCallback(async () => {
    setTrayVisible(false);
    const remaining = LIMITS.maxFiles - attachments.length;
    if (remaining <= 0) {
      Alert.alert("Limit reached", `Max ${LIMITS.maxFiles} files`);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.85,
      exif: false,
    });
    if (result.canceled) return;

    const items: LocalAttachment[] = [];
    for (const asset of result.assets) {
      const mime =
        asset.mimeType ??
        (asset.type === "video" ? "video/mp4" : "image/jpeg");
      const item = buildAttachment(
        asset.uri,
        asset.fileName ?? "media",
        mime,
        asset.fileSize ?? 0,
        asset.uri
      );
      if (item) items.push(item);
    }
    if (items.length) addAttachments(items);
  }, [attachments.length, buildAttachment, addAttachments]);

  const handlePickDocument = useCallback(async () => {
    setTrayVisible(false);
    const remaining = LIMITS.maxFiles - attachments.length;
    if (remaining <= 0) {
      Alert.alert("Limit reached", `Max ${LIMITS.maxFiles} files`);
      return;
    }
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const items: LocalAttachment[] = [];
    for (const asset of result.assets) {
      const item = buildAttachment(
        asset.uri,
        asset.name,
        asset.mimeType ?? "application/octet-stream",
        asset.size ?? 0
      );
      if (item) items.push(item);
    }
    if (items.length) addAttachments(items);
  }, [attachments.length, buildAttachment, addAttachments]);


  if (!channelId) {
    return (
      <View style={styles.invalidChannel}>
        <Text style={styles.invalidChannelText}>Invalid channel</Text>
      </View>
    );
  }


  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />
      <ChannelHeader name={channelName} online={1} communityId={params.communityId as string} />

      <View style={styles.body}>
        {isPublicFeed ? (

          <PostList communityId={communityId} />
        ) : chatLoading ? (
          <LoadingSkeleton />
        ) : chatError ? (
          <ErrorState onRetry={chatRefetch} />
        ) : (
          <MessageList
            messages={chatData?.messages ?? []}
            loadOlder={handleLoadOlder}
            isLoadingOlder={isLoadingOlder || (chatFetching && !chatLoading)}
            onRetry={handleRetry}
          />
        )}
        {!isPublicFeed && (
          <TypingIndicator users={(chatData as any)?.typingUsers} />
        )}
      </View>

      <View>
        <AttachmentTray
          visible={trayVisible}
          onPickMedia={handlePickMedia}
          onPickDocument={handlePickDocument}
          onCamera={() => {
            setTrayVisible(false);
            Alert.alert("Camera", "Coming soon!");
          }}
          onDismiss={() => setTrayVisible(false)}
        />

        {isPublicFeed ? (
          <PublicFeedInputModal
            channelId={params.channelId}
            communityId={params?.communityId}
          />
        ) : (
          <TextInputModal
            message={message}
            onChangeMessage={setMessage}
            onSend={handleSend}
            onPlusPress={handlePlusPress}
            onEmojiPress={handleEmojiPress}
            onInputFocus={handleInputFocus}
            attachments={attachments}
            onRemoveAttachment={removeAttachment}
            isUploading={isUploading}
            canSend={canSend}
            sendDisabled={sendDisabled}
            channelName={channelName}
          />
        )}
      </View>

      <EmojiPicker
        ref={emojiSheetRef}
        onSelect={(emoji) => setMessage((p) => p + emoji)}
        onChange={(index) => {
          emojiOpen.current = index !== -1;
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
  invalidChannel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#313338",
  },
  invalidChannelText: { color: "#fff", fontSize: 18 },
});
