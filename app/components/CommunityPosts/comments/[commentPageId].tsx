import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,



} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, } from "expo-router";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { CommentDto, CommentReactionType, CommentResponseDto, CommentSortType, } from "@/src/types/types";

import CommentCard from "./CommentCard";
import CommentInput from "./CommentInput";


import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useAddCommentMutation, useCommentReactionMutation, useGetPostCommentsQuery, useLazyGetRepliesQuery } from "@/src/features/comment.api";
import { getVisibleComments, } from "@/src/utils/CommentUtils";


import { TextInput } from "react-native-gesture-handler";
import { useBottomSheet } from "@/app/contexts/BottomSheetContext";
import ThreeDotModal from "../../home/modals/ThreeDotModal";

import CommentHeader from "./CommentHeader";

import FlashListHeaderComponent from "./CommentListHeader";
import { feedApi } from "@/src/features/feed.api";
import { useSelector } from "react-redux";



const content = [
  { icon: <FontAwesome5 name="share" size={20} color="white" />, title: "Share", onPress: () => { alert("Report") } },
  { icon: <MaterialIcons name="report-gmailerrorred" size={20} color="white" />, title: "Report", onPress: () => { alert("Report") } },

]
export default function CommentPage() {

  const [collaspedComments, setCollapsedComments] = useState<Set<number>>(new Set<number>());

  const [sortType, setSortType] = useState<CommentSortType>(
    CommentSortType.LATEST
  );
  const [replyingTo, setReplyingTo] = useState<CommentResponseDto | null>(null)
  const [menuVisible, setMenuVisible] = useState(false);
  const [repliesLoading, setLoadingReplies] = useState<Record<number, boolean>>({});
  const [postHeight, setPostHeight] = useState<number>(0);
  const [showCompactHeader, setShowCompactHeader] = useState<boolean>(false)
  const [loadingMoreReplies, setLoadingMoreReplies] = useState<Record<number, boolean>>({});
  const [getReplies, { error: replyError }] = useLazyGetRepliesQuery()
  const [addReaction] = useCommentReactionMutation()
  const loadedReplies = useRef<Set<number>>(new Set<number>())
  const { openActionSheet } = useBottomSheet()
  const [addComment, { isLoading: addCommentLoading, error: addCommentError }] = useAddCommentMutation()
  const { commentPageId } = useLocalSearchParams()
  const postId = Number(commentPageId);

  const { data, isFetching, isLoading, refetch } = useGetPostCommentsQuery({
    postId: postId.toString(),
    cursor: null,
    limit: 10,
    commentSortType: sortType
  })
  const feedData = useSelector(
    feedApi.endpoints.getFeedPosts.select({
      feedtype: "LATEST",
      cursor: "",
      keyword: "",
      courseId: "",
      limit: "",
    })
  );

  const post =
    feedData.data?.communityPosts[
    feedData.data?.postIndexMap[postId]
    ];

  const inputRef = useRef<TextInput | null>(null);


  function toggleCollapse(commentId: number) {
    setCollapsedComments(prev => {
      const next = new Set(prev);

      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }

      return next;
    });
  }



  const ListFooter = useCallback(() => {
    if (!data?.hasNext) return null;
    return (
      <View style={styles.footerLoader}>
        {isFetching ? (
          <ActivityIndicator color="#6B7280" />
        ) : (
          <Pressable onPress={() => { }} style={styles.loadMoreBtn}>
            <Text style={styles.loadMoreText}>Load more comments</Text>
          </Pressable>
        )}
      </View>
    );
  }, [data?.hasNext, isFetching,]);

  const handleOnReply = useCallback((comment: CommentResponseDto) => {

    setReplyingTo(comment);
    if (!inputRef.current?.isFocused()) {
      inputRef.current?.focus();
    }


  }, [])
  const onCommentReaction = useCallback((commentId: number, reactionType: CommentReactionType) => {
    addReaction({
      commentId: commentId,
      commentReaction: reactionType
    })
  }, [])
  const onCancelReply = () => {
    setReplyingTo(null);
    inputRef.current?.clear();
  }
  const displayItems = useMemo(
    () =>
      data
        ? getVisibleComments(
          data.comments,
          collaspedComments,
          loadedReplies,

        )
        : [],
    [data?.comments, collaspedComments, loadedReplies, loadingMoreReplies]
  );







  const onCommentAdded = useCallback((comment: CommentDto) => {
    addComment(comment)
  }, []);
  const handleScroll = useCallback((e: any) => {
    const visible = e.nativeEvent.contentOffset.y > postHeight - 60;

    setShowCompactHeader(prev =>
      prev === visible ? prev : visible
    );
  }, [postHeight]);
  const LoadReplies = useCallback(async (parentId: number | null, cursor: string, isLoadMore?: boolean) => {

    if (parentId == null) return;

    const setLoading = isLoadMore
      ? setLoadingMoreReplies
      : setLoadingReplies;

    setLoading(prev => {
      const next = {
        ...prev,
        [parentId]: true
      };
      return next;
    });
    await new Promise((resolve) => setTimeout(() => (resolve()), 5000))
    try {
      await getReplies({
        parentId,
        cursor,
        limit: 10,
        isLoadMore,
      }).unwrap();
    } finally {
      setLoading(prev => {
        const next = {
          ...prev,
          [parentId]: false
        };
        return next;
      });
    }
  }, [getReplies]);
  const onOptionClick = useCallback(() => {
    openActionSheet({ content: () => (<ThreeDotModal content={content}></ThreeDotModal>), snapPoints: ["20%"] })
  }, [openActionSheet])
  const renderItem = useCallback(
    ({ item }: { item: CommentResponseDto }) => {

      return (
        <CommentCard
          comment={item as CommentResponseDto}
          toggleCollaspe={toggleCollapse}
          handleReplyTO={handleOnReply}
          repliesLoading={!!repliesLoading[item.commentId]}
          LoadReplies={LoadReplies}
          collaspeSet={collaspedComments}
          loadedReplies={loadedReplies}
          loadMoreRepliesLoading={!!loadingMoreReplies[item.parentId || 0]}
          onThreedotMenuClcik={onOptionClick}
          onCommentReaction={onCommentReaction}
        />
      );


    },
    [repliesLoading,
      collaspedComments,
      handleOnReply, loadingMoreReplies]
  );

  const insets = useSafeAreaInsets();
  useEffect(() => {
    refetch();
  }, []);
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <CommentHeader post={post} showCompactHeader={showCompactHeader} sortType={sortType} setSortType={setSortType} setMenuVisible={setMenuVisible} menuVisible={menuVisible}></CommentHeader>


      <FlashList<CommentResponseDto >
        data={displayItems}
        renderItem={renderItem}

        onScroll={handleScroll}
        keyExtractor={(item) => (item as CommentResponseDto).commentId?.toString()}
        ListHeaderComponent={<FlashListHeaderComponent post={post} setPostHeight={setPostHeight}></FlashListHeaderComponent>}
        ListFooterComponent={ListFooter}

        onEndReachedThreshold={0.4}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons
                  name="chatbubbles-outline"
                  size={36}
                  color="#6c7178ff"
                />
                <Text style={styles.emptyText}>
                  No comments yet. Be the first!
                </Text>
              </>
            )}
          </View>
        }
      />

      <KeyboardStickyView offset={{ closed: -insets.bottom, opened: 0 }}>
        <CommentInput
          postId={postId}
          replyingTo={replyingTo}
          onCancelReply={onCancelReply}
          onCommentAdded={onCommentAdded}
          ref={inputRef}
        />
      </KeyboardStickyView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    flexDirection: "column",
  },

  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
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
