import React, { useState, useEffect, useCallback, } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommentDto, CommentResponseDto } from "@/src/types/types";
import { useAddCommentMutation } from "@/src/features/comment.api";
import * as Crypto from "expo-crypto"

interface CommentInputProps {
  postId?: number;
  replyingTo: CommentResponseDto | null;
  onCancelReply?: () => void;
  onCommentAdded: (comment: CommentDto) => void;
  ref: React.RefObject<TextInput | null>;


}

export default function CommentInput({
  postId,
  replyingTo,
  onCancelReply,
  onCommentAdded,
  ref,


}: CommentInputProps) {
  const [commentText, setCommentText] = useState("");
  const [addComment, { isLoading: isSubmitting }] = useAddCommentMutation();


  useEffect(() => {
    setCommentText("");
  }, [replyingTo?.commentId]);

  const handleSubmit = useCallback(async () => {
    if (!commentText.trim() || !postId) return;
    const text = commentText.trim();
    const parentId = replyingTo?.commentId || null;

    onCommentAdded({
      parentCommentId: parentId,
      postId: postId,
      content: text,
      clientId: Crypto.randomUUID()
    })


    setCommentText("");
    Keyboard.dismiss();
    if (replyingTo) onCancelReply?.();

  }, [commentText, postId, replyingTo, addComment, onCancelReply, onCommentAdded]);

  return (


    <View style={[styles.container, {

      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "#46515A"
    }]}>
      {replyingTo && (
        <View style={styles.replyBanner}>
          <Text style={styles.replyText}>
            Replying to{" "}
            <Text style={styles.replyUsername}>
              {replyingTo.author?.author ?? "user"}
            </Text>
          </Text>
          <Pressable onPress={onCancelReply} hitSlop={10}>
            <Ionicons name="close" size={16} color="#6B7280" />
          </Pressable>
        </View>
      )}
      <View style={styles.inputRow}>
        <TextInput
          placeholder={
            replyingTo
              ? `Reply to ${replyingTo.author?.author ?? "user"}...`
              : "Add a comment..."
          }
          placeholderTextColor="#6B7280"
          style={styles.input}
          ref={ref}
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        {commentText && <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || !commentText.trim()}
          style={styles.sendBtn}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#3B82F6" size="small" />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={"#3B82F6"}
            />
          )}
        </Pressable>}
      </View>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
  },
  replyBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  replyText: {
    color: "#6B7280",
    fontSize: 12,
  },
  replyUsername: {
    fontWeight: "700",
    color: "#3B82F6",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#1F2937",
    color: "white",
    fontSize: 14,
  },
  sendBtn: {
    padding: 4,
  },
});
