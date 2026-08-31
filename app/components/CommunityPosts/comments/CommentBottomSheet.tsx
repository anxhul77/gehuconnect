import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Text,
  StyleSheet,
  Pressable,
  View,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { CommentSortType, CommunityPost } from "@/src/types/types";

import CommentCard from "./CommentCard";
import CommentInput from "./CommentInput";


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


const ThreadSeparator = () => <View style={styles.separator} />;


interface CommentBottomSheetProps {
  post?: CommunityPost | any;
}

const CommentBottomSheet = forwardRef<BottomSheet, CommentBottomSheetProps>(
  ({ post }, ref) => {
    const insets = useSafeAreaInsets();
    const postId = post?.postId;
    const insetsBottom = insets.bottom;

    const snapPoints = useMemo(() => ["60%", "95%"], []);





    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
      const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
        if (e?.endCoordinates?.height) {
          setKeyboardHeight(e.endCoordinates.height);
        }
      });
      const hideSub = Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardHeight(0);
      });
      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);

    // ── Footer component (BottomSheetFooter wrapper) ──────
    const FooterComponent = useCallback(
      (props: any) => (
        <BottomSheetFooter
          {...props}
          bottomInset={keyboardHeight}
        >
          <View
            style={{
              paddingBottom: keyboardHeight > 0 ? 12 : Math.max(insetsBottom, 12),
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: "#1F2937",
              backgroundColor: "#000",
            }}
          >
            <CommentInput
              postId={postId}
              replyingTo={replyingTo}
              onCancelReply={cancelReply}
              onCommentAdded={onCommentAdded}
              onOptimisticReply={addOptimisticReply}
              onOptimisticReplyFailed={removeOptimisticReply}
              TextInputComponent={BottomSheetTextInput}
            />
          </View>
        </BottomSheetFooter>
      ),
      [postId, insetsBottom, replyingTo, cancelReply, onCommentAdded, addOptimisticReply, removeOptimisticReply, keyboardHeight]
    );

    // ── List header: post summary ─────────────────────────
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

    // ── List footer: load more ────────────────────────────
    const ListFooter = useCallback(() => {
      if (!hasMore) return null;
      return (
        <View style={{ paddingVertical: 16, alignItems: "center" }}>
          {isFetching ? (
            <ActivityIndicator color="#6B7280" />
          ) : (
            <Pressable onPress={loadMoreRootComments} style={styles.loadMoreBtn}>
              <Text style={styles.loadMoreText}>Load more comments</Text>
            </Pressable>
          )}
        </View>
      );
    }, [hasMore, isFetching, loadMoreRootComments]);

    // ── Render each thread item ───────────────────────────
    const renderItem = useCallback(
      ({ item, index }: { item: VisibleItem; index: number }) => {
        const showSeparator = item.depth === 0 && index > 0;
        const isCollapsed = collapsedIds.has(item.comment.commentId);

        return (
          <>
            {showSeparator && <ThreadSeparator />}
            <CommentCard
              comment={item.comment}
              depth={item.depth}
              timeAgo={item.timeAgo}
              branchMask={item.branchMask}
              isCollapsed={isCollapsed}
              onToggleCollapse={onToggleCollapse}
              onReply={setReplyingTo}
            />
          </>
        );
      },
      [collapsedIds, onToggleCollapse, setReplyingTo]
    );

    const handleSheetChanges = useCallback((_index: number) => { }, []);

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
          backgroundColor: "#141414",
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
          <BottomSheetFlatList
            data={visibleItems}
            keyExtractor={(item: VisibleItem) => item.comment.commentId.toString()}
            showsVerticalScrollIndicator
            contentContainerStyle={{ paddingBottom: 140 }}
            ListHeaderComponent={ListHeader}
            renderItem={renderItem}
            initialNumToRender={10}
            windowSize={5}
            maxToRenderPerBatch={10}
            onEndReached={loadMoreRootComments}
            onEndReachedThreshold={0.4}
            ListFooterComponent={ListFooter}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons
                      name="chatbubbles-outline"
                      size={36}
                      color="#374151"
                    />
                    <Text style={styles.emptyText}>
                      No comments yet. Be the first!
                    </Text>
                  </>
                )}
              </View>
            }
          />
        </View>
      </BottomSheet>
    );
  }
);

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#1F2937",
    marginLeft: 16,
    marginRight: 8,
  },
  loadMoreBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  loadMoreText: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    color: "#4B5563",
    fontSize: 14,
  },
});

export default CommentBottomSheet;
