import { View, Text, Pressable } from "react-native";
import React from "react";
import { Ionicons, MaterialCommunityIcons, SimpleLineIcons } from "@expo/vector-icons";
import { CommentResponseDto } from "../../src/types/types";

interface CommentCardProps {
  comment: CommentResponseDto;
  onReply?: (comment: CommentResponseDto) => void;
}

export default function CommentCard({ comment, onReply }: CommentCardProps) {
  return (
    <View style={{ opacity: comment.isSending ? 0.6 : 1 }} className="w-full mt-2 p-3 overflow-hidden rounded-xl">
      <View className="flex-row items-center">
        <View className="h-8 w-8 rounded-full bg-slate-700 items-center justify-center">
          <Ionicons name="person" size={14} color="white" />
        </View>
        <View className="ml-3">
          <Text className="text-white font-semibold text-sm">
            {comment?.author?.author}
          </Text>
        </View>
      </View>

      <Text className="text-white mt-2 leading-5">
        {comment?.content}
      </Text>

      <View className="flex-row gap-6 items-center mt-3 ml-3">
        <View className="flex-row gap-3">
          <View className="flex-row gap-1 items-center">
            <SimpleLineIcons
              name="like"
              size={15}
              color={comment?.liked ? "#3B82F6" : "white"}
            />
            <Text className="text-white">{comment?.likeCount || 0}</Text>
          </View>
          <View className="flex-row gap-1 items-center">
            <SimpleLineIcons
              name="dislike"
              size={15}
              color={comment?.disliked ? "#EF4444" : "white"}
            />
          </View>
        </View>

        <Pressable
          onPress={() => onReply?.(comment)}
          className="flex-row gap-1 items-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <MaterialCommunityIcons name="message-reply-text-outline" size={18} color="#9CA3AF" />
          <Text className="text-slate-400 text-sm">
            {(comment?.replyCount ?? 0) > 0
              ? `${comment.replyCount} ${(comment.replyCount ?? 0) === 1 ? "reply" : "replies"}`
              : "reply"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}