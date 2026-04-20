import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Text,
  StyleSheet,
  Pressable,
  View,
  Keyboard,
  ActivityIndicator,
  Animated,
} from "react-native";
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import CommentCard from "./CommetCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import {
  useGetPostCommentsQuery,
  useAddCommentMutation,
  useGetRepliesQuery,
} from "../../src/features/comment.api";
import {
  CommunityPost,
  CommentSortType,
  CommentResponseDto,
} from "../../src/types/types";

const MAX_LINES = 3;

function TruncatedText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState<boolean | null>(null);

  const handleMeasure = useCallback(
    (e: any) => {
      if (needsTruncation === null) {
        setNeedsTruncation(e.nativeEvent.lines.length > MAX_LINES);
      }
    },
    [needsTruncation]
  );

  return (
    <View className="mt-1 relative">
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, opacity: 0, zIndex: -1 }}>
        <Text className="text-slate-300 text-base leading-6" onTextLayout={handleMeasure}>
          {text}
        </Text>
      </View>

      {expanded ? (
        <Pressable onPress={() => setExpanded(false)}>
          <Text className="text-slate-300 text-base leading-6">
            {text}
            {"  "}
            <Text className="text-blue-400 text-sm font-medium">less</Text>
          </Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => needsTruncation && setExpanded(true)} disabled={!needsTruncation}>
          <Text className="text-slate-300 text-base leading-6" numberOfLines={MAX_LINES}>
            {text}
          </Text>
          {needsTruncation === true && (
            <Text className="text-blue-400 text-sm font-medium mt-0.5">...more</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

interface CommentBottomSheetProps {
  post?: CommunityPost | any;
}

// ─── Footer ──────────────────────────────────────────────────────────────────

interface SharedFooterProps {
  animatedFooterPosition: any;
  postId?: number;
  insetsBottom: number;
  replyingTo?: CommentResponseDto | null;
  onCancelReply: () => void;
}

const SharedFooter = ({
  animatedFooterPosition,
  postId,
  insetsBottom,
  replyingTo,
  onCancelReply,
}: SharedFooterProps) => {
  const [commentText, setCommentText] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [addComment, { isLoading: isSubmitting }] = useAddCommentMutation();

  // Clear input when reply target changes
  useEffect(() => {
    setCommentText("");
  }, [replyingTo?.commentId]);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardVisible(true);
      if (e?.endCoordinates?.height) {
        setKeyboardHeight(e.endCoordinates.height);
      }
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleAddComment = async () => {
    if (!commentText.trim() || !postId) return;
    try {
      await addComment({
        postId: String(postId),
        content: commentText.trim(),
        ...(replyingTo ? { parentCommentId: String(replyingTo.commentId) } : {}),
      }).unwrap();
      setCommentText("");
      Keyboard.dismiss();
      if (replyingTo) onCancelReply();
    } catch (e) {
      console.log("Failed to add comment: ", e);
    }
  };

  return (
    <BottomSheetFooter animatedFooterPosition={animatedFooterPosition} bottomInset={keyboardHeight}>
      <View style={[styles.footerWrapper, { paddingBottom: isKeyboardVisible ? 12 : Math.max(insetsBottom, 12) }]}>
        {replyingTo && (
          <View style={styles.replyBanner}>
            <Text style={styles.replyBannerText}>
              Replying to{" "}
              <Text style={{ fontWeight: "700", color: "#60A5FA" }}>
                {replyingTo.author?.author ?? "user"}
              </Text>
            </Text>
            <Pressable onPress={onCancelReply} hitSlop={10}>
              <Ionicons name="close" size={16} color="#9CA3AF" />
            </Pressable>
          </View>
        )}
        <View style={styles.footer}>
          <BottomSheetTextInput
            placeholder={replyingTo ? `Reply to ${replyingTo.author?.author ?? "user"}...` : "Add a comment..."}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <Pressable onPress={handleAddComment} disabled={isSubmitting || !commentText.trim()}>
            {isSubmitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons
                name="send"
                size={24}
                color={commentText.trim() ? "#3B82F6" : "rgba(255,255,255,0.4)"}
              />
            )}
          </Pressable>
        </View>
      </View>
    </BottomSheetFooter>
  );
};

// ─── Nested Replies View ──────────────────────────────────────────────────────

interface NestedViewProps {
  parentComment: CommentResponseDto;
  postId: number;
  onBack: () => void;
  onReply: (comment: CommentResponseDto) => void;
  replyingTo: CommentResponseDto | null;
}

function NestedView({ parentComment, postId, onBack, onReply, replyingTo }: NestedViewProps) {
  const [cursor, setCursor] = useState("0");

  const { data, isLoading, isFetching } = useGetRepliesQuery(
    { parentId: parentComment.commentId, cursor, limit: 20 },
    { skip: !parentComment.commentId }
  );
  
  const replies = data?.comments ?? [];

  const handleLoadMore = useCallback(() => {
    if (data?.hasNext && !isFetching) {
      setCursor(data.cursor);
    }
  }, [data?.hasNext, data?.cursor, isFetching]);

  const ListHeader = useCallback(() => (
    <View>
      {/* Back button */}
      <Pressable onPress={onBack} style={styles.backRow}>
        <Ionicons name="arrow-back" size={20} color="#9CA3AF" />
        <Text style={styles.backText}>Back to comments</Text>
      </Pressable>

      {/* Parent comment — highlighted */}
      <View style={styles.parentCommentWrapper}>
        <View style={styles.parentCommentAccent} />
        <View style={{ flex: 1 }}>
          <CommentCard comment={parentComment} onReply={onReply} />
        </View>
      </View>

      <View style={styles.repliesHeader}>
        <Text style={styles.repliesHeaderText}>Replies</Text>
      </View>
    </View>
  ), [parentComment, onBack, onReply]);

  const ListFooter = useCallback(() => {
    if (!data?.hasNext) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: "center" }}>
        {isFetching ? (
          <ActivityIndicator color="#9CA3AF" />
        ) : (
          <Pressable onPress={handleLoadMore} style={styles.loadMoreBtn}>
            <Text style={styles.loadMoreText}>Load more replies</Text>
          </Pressable>
        )}
      </View>
    );
  }, [data?.hasNext, isFetching, handleLoadMore]);

  return (
    <BottomSheetFlatList
      data={replies}
      keyExtractor={(item: any, index) => `nested-${item.commentId}-${index}`}
      showsVerticalScrollIndicator
      contentContainerStyle={{ paddingBottom: 140 }}
      ListHeaderComponent={ListHeader}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={ListFooter}
      renderItem={({ item }) => (
        <View style={styles.nestedItem}>
          <View style={styles.nestedLine} />
          <View style={{ flex: 1 }}>
            <CommentCard comment={item} onReply={onReply} />
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View className="items-center justify-center p-8 mt-4">
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-slate-400">No replies yet.</Text>
          )}
        </View>
      }
    />
  );
}

// ─── Main Bottom Sheet ────────────────────────────────────────────────────────

const CommentBottomSheet = forwardRef<BottomSheet, CommentBottomSheetProps>(({ post }, ref) => {
  const insets = useSafeAreaInsets();
  const postId = post?.postId;
  const insetsBottom = insets.bottom;

  // Cursor-based pagination state
  const [cursor, setCursor] = useState("0");

  // Reply / nested view state
  const [selectedComment, setSelectedComment] = useState<CommentResponseDto | null>(null);
  const [replyingTo, setReplyingTo] = useState<CommentResponseDto | null>(null);

  const isNestedView = selectedComment !== null;

  const { data, isLoading, isFetching } = useGetPostCommentsQuery(
    { postId: post?.postId, cursor, commentSortType: CommentSortType.LATEST, limit: 20 },
    { skip: !post?.postId }
  );

  const snapPoints = useMemo(() => ["60%", "95%"], []);

  // Reset state when post changes
  useEffect(() => {
    setCursor("0");
    setSelectedComment(null);
    setReplyingTo(null);
  }, [postId]);

  const handleSheetChanges = useCallback((_index: number) => { }, []);

  // Called when user taps "reply" on any CommentCard
  const handleReply = useCallback((comment: CommentResponseDto) => {
    // If replying from nested view — just set replyingTo
    // If replying from top-level — switch to nested view for that comment
    setSelectedComment(comment);
    setReplyingTo(comment);
  }, []);

  // Called when user taps "reply" inside nested view (to a nested reply)
  const handleNestedReply = useCallback((comment: CommentResponseDto) => {
    setReplyingTo(comment);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedComment(null);
    setReplyingTo(null);
  }, []);

  // Cursor-based load more
  const handleLoadMore = useCallback(() => {
    if (data?.hasNext && !isFetching && !isNestedView) {
      setCursor(data.cursor);
    }
  }, [data?.hasNext, data?.cursor, isFetching, isNestedView]);

  const FooterComponent = useCallback(
    (props: any) => (
      <SharedFooter
        {...props}
        postId={postId}
        insetsBottom={insetsBottom}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
      />
    ),
    [postId, insetsBottom, replyingTo, handleCancelReply]
  );

  const ListHeader = useCallback(() => {
    if (!post) return null;
    return (
      <View className="w-full p-4 overflow-hidden border-b border-gray-800">
        <View className="flex-row items-center">
          <View className="h-8 w-8 rounded-full bg-slate-700 items-center justify-center">
            <Ionicons name="person" size={14} color="white" />
          </View>
          <View className="ml-3">
            <Text className="text-white font-semibold text-sm">
              r/{post?.communityName || "post"}
            </Text>
            <Text className="text-slate-400 text-xs">
              u/{post?.author?.author || post?.author || "unknown"} • 2h ago
            </Text>
          </View>
        </View>
        <Text className="text-white font-bold leading-7 mt-2">{post.title}</Text>
        {!!post.content && <TruncatedText text={post.content} />}
      </View>
    );
  }, [post]);

  const comments = data?.comments ?? [];

  const ListFooter = useCallback(() => {
    if (!data?.hasNext) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: "center" }}>
        {isFetching ? (
          <ActivityIndicator color="#9CA3AF" />
        ) : (
          <Pressable onPress={handleLoadMore} style={styles.loadMoreBtn}>
            <Text style={styles.loadMoreText}>Load more comments</Text>
          </Pressable>
        )}
      </View>
    );
  }, [data?.hasNext, isFetching, handleLoadMore]);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableDynamicSizing={false}
      style={{ overflow: "hidden", flex: 1 }}
      backgroundStyle={{
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: "black",
      }}
      handleStyle={{ paddingTop: 14 }}
      handleIndicatorStyle={{
        backgroundColor: "#9CA3AF",
        width: 40,
        height: 4,
        borderRadius: 2,
      }}
      footerComponent={FooterComponent}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <View style={{ flex: 1 }}>
        {isNestedView ? (
          <NestedView
            parentComment={selectedComment!}
            postId={Number(postId)}
            onBack={handleBack}
            onReply={handleNestedReply}
            replyingTo={replyingTo}
          />
        ) : (
          <BottomSheetFlatList
            data={comments}
            keyExtractor={(item: any, index: number) => `${item.commentId}-${index}`}
            showsVerticalScrollIndicator
            contentContainerStyle={{ paddingBottom: 140 }}
            ListHeaderComponent={ListHeader}
            renderItem={({ item }) => (
              <CommentCard comment={item} onReply={handleReply} />
            )}
            initialNumToRender={10}
            windowSize={5}
            maxToRenderPerBatch={10}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={ListFooter}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center p-8 mt-4">
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-slate-400">No comments yet. Be the first!</Text>
                )}
              </View>
            }
          />
        )}
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  footerWrapper: {
    backgroundColor: "black",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#1F2933",
  },
  replyBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  replyBannerText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  footer: {
    paddingVertical: 12,
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    gap: 15,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.10)",
    color: "white",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1F2933",
  },
  backText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  parentCommentWrapper: {
    flexDirection: "row",
    backgroundColor: "rgba(59,130,246,0.06)",
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  parentCommentAccent: {
    width: 3,
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
  repliesHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1F2933",
  },
  repliesHeaderText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  nestedItem: {
    flexDirection: "row",
    paddingLeft: 20,
  },
  nestedLine: {
    width: 2,
    backgroundColor: "#1F2933",
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 1,
    marginRight: 8,
  },
  loadMoreBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  loadMoreText: {
    color: "#9CA3AF",
    fontSize: 13,
  },
});

export default CommentBottomSheet;
