import React, { memo, RefObject, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Entypo, Ionicons, MaterialCommunityIcons, SimpleLineIcons } from "@expo/vector-icons";
import { CommentReactionType, CommentResponseDto } from "@/src/types/types";
import ThreadLines from "./ThreadLines";

export interface CommentCardProps {
  comment: CommentResponseDto;
  repliesLoading: boolean;
  loadMoreRepliesLoading: boolean
  LoadReplies: (parentId: number | null, cursor: string, isloadMore?: boolean) => Promise<void>;
  toggleCollaspe: (value: number) => void;
  handleReplyTO: (value: CommentResponseDto) => void
  collaspeSet: Set<number>
  loadedReplies: RefObject<Set<number>>;
  onThreedotMenuClcik: () => void
  onCommentReaction: (commentId: number, commentReactionType: CommentReactionType) => void
}

function CommentCard({
  comment,
  toggleCollaspe,
  handleReplyTO,
  repliesLoading,
  LoadReplies,
  loadedReplies,
  collaspeSet,
  loadMoreRepliesLoading,
  onThreedotMenuClcik,
  onCommentReaction
}: CommentCardProps) {

  const wrapperStyle = comment.isSending ? styles.wrapperSending : styles.wrapper;



  return (
    <View style={{ flex: 1 }}>
      <View style={wrapperStyle}>

        <ThreadLines
          depth={comment.depth}
          ancestorHasNext={comment.ancestorHasNext}
          isLastSibling={comment.isLastSibling}

        />

        <View style={styles.content}>

          <View style={styles.header}>
            <Pressable
              onPress={() => { }}
              style={styles.headerPressable}
            >
              <View style={styles.avatar}>
                <Ionicons name="person" size={11} color="#94A3B8" />
              </View>

              <Text style={styles.username} numberOfLines={1}>
                {comment.author?.author ?? "anonymous"}
              </Text>

              {
                <>
                  <Text style={styles.dot}>·</Text>
                  <Text style={styles.time}>{comment.timeAgo}</Text>
                </>
              }

            </Pressable>
            <Pressable onPress={onThreedotMenuClcik}>
              <Entypo name="dots-three-vertical" size={15} color="#6B7280" />
            </Pressable>
          </View>

          {(
            <>
              <Text style={styles.commentText}>{comment.content}</Text>

              <View style={styles.actions}>
                <View style={styles.votePill}>
                  <Pressable hitSlop={6} style={styles.voteBtn} onPress={() => onCommentReaction(comment.commentId, CommentReactionType.LIKE)}>
                    {comment.liked ? <Ionicons
                      name="thumbs-up-sharp" size={15} color="white" />
                      : <SimpleLineIcons
                        name="like"
                        size={15}
                        color={"#6B7280"}
                      />}
                  </Pressable>
                  <Text
                    style={styles.voteCount}
                  >
                    {comment.likeCount || 0}
                  </Text>
                  <Pressable hitSlop={6} style={styles.voteBtn} onPress={() => onCommentReaction(comment.commentId, CommentReactionType.DISLIKE)}>
                    {comment?.disliked ? <Ionicons
                      name="thumbs-down-sharp" size={15} color="white" /> : <SimpleLineIcons
                      name="dislike"
                      size={15}
                      color={"#6B7280"}
                    />}
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => { handleReplyTO(comment) }}
                  style={styles.actionBtn}
                  hitSlop={6}
                >
                  <MaterialCommunityIcons name="comment-text-outline" size={16} color="#6B7280" />

                </Pressable>

                {comment.replyCount > 0 && (
                  repliesLoading ? <ActivityIndicator color="#6B7280" /> : <Pressable
                    onPress={() => {

                      if (loadedReplies.current.has(comment.commentId)) {

                        toggleCollaspe(comment.commentId)

                      } else {

                        LoadReplies(comment.commentId, comment.replyCursor!)

                      }
                    }}
                    style={styles.actionBtn}
                    hitSlop={6}
                  >
                    {collaspeSet.has(comment.commentId) === true ? <Ionicons
                      name="chevron-down"
                      size={14}
                      color="#6B7280"
                    /> : <Ionicons
                      name="chevron-up"
                      size={14}
                      color="#6B7280"
                    />}
                    <Text style={[styles.actionText, { color: "#6B7280" }]}>
                      {` ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
                    </Text>
                  </Pressable>
                )}
              </View>
            </>
          )}
          {comment?.showLoadMore &&
            (loadMoreRepliesLoading ? (<View style={{ flex: 1, marginTop: 12, marginBottom: 6, justifyContent: "center", alignItems: "center" }
            } >
              <ActivityIndicator color="#6B7280" />
            </View >)
              :

              (<Pressable onPress={() => LoadReplies(comment.parentId, comment.loadMoreCursor!, true)}
                style={{ flex: 1, marginTop: 12, marginBottom: 6, justifyContent: "center", }}>
                <Text style={{ color: "#6B7280", fontSize: 10, fontWeight: "500" }}>Load More Replies</Text>
              </Pressable>))
          }

        </View>


      </View >

    </View>

  );
}

export default memo(CommentCard, (prev, next) => {
  return (
    prev.comment === next.comment &&
    prev.repliesLoading === next.repliesLoading &&

    prev.loadMoreRepliesLoading === next.loadMoreRepliesLoading &&
    prev.collaspeSet.has(prev.comment.commentId) ===
    next.collaspeSet.has(next.comment.commentId)
  );
});



const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    paddingHorizontal: 4,


    backgroundColor: "#000",
  },
  wrapperSending: {
    flexDirection: "row",
    paddingHorizontal: 4,
    marginLeft: 6,
    position: "relative",
    backgroundColor: "#000",
    opacity: 0.45,
  },


  content: {
    flex: 1,

    paddingTop: 10,
    paddingBottom: 8,
    paddingRight: 12,
    paddingLeft: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  headerPressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
  dot: {
    color: "#4B5563",
    fontSize: 11,
  },
  time: {
    color: "#6B7280",
    fontSize: 12,
  },
  collapseIcon: {
    marginLeft: "auto",
  },
  commentText: {
    color: "#D1D5DB",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 8,
  },
  votePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  voteBtn: {
    padding: 2,
  },
  voteCount: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
    minWidth: 12,
    textAlign: "center",
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  actionText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
  },
});
