import { View, Text, Pressable } from "react-native";
import React from "react";
import { Entypo, EvilIcons, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Video, ResizeMode } from "expo-av";
import { useRouter } from "expo-router";
import { useReactToPostMutation } from "@/src/features/feed.api";

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

export default function Feedpostcard({ post }: { post: any }) {
  const router = useRouter();

  const firstAttachment = post?.attachments?.[0];
  const isVideo =
    firstAttachment && ALLOWED_VIDEO_TYPES.has(firstAttachment.type);

  const [reactToPost] = useReactToPostMutation();

  const handleReaction = (type: "LIKE" | "DISLIKE") => {
    if (!post?.postId) return;

    let reactionType = type;
    if (type === "LIKE" && post.liked) {
      reactionType = "UNLIKE";
    } else if (type === "DISLIKE" && post.disliked) {
      reactionType = "UNDISLIKE";
    }

    reactToPost({
      postId: post.postId,
      postReactionType: reactionType as "LIKE" | "DISLIKE" | "UNLIKE" | "UNDISLIKE",
    });
  };

  return (
    <View className="  border border-b-white/15 bg-black overflow-hidden">

      <View className="flex-row items-center pl-2 pr-4 pt-3 pb-2">
        <View className="h-8 w-8 rounded-full bg-slate-700 items-center justify-center">
          <Ionicons name="person" size={16} color="white" />
        </View>
        <View className="ml-3">
          <Text className="text-white font-semibold text-sm">
            {post?.communityName?.charAt(0)}/{post?.communityName}
          </Text>
          <Text className="text-slate-400 text-xs">
            Posted by u/{post?.author?.author} • 2h ago
          </Text>
        </View>
        <Entypo name="dots-three-vertical" className="absolute right-4" size={18} color="white" />
      </View>


      <Text className="text-white px-4 pt-1 text-base font-semibold">
        {post?.title}
      </Text>

      {!!post?.content && (
        <Text
          className="text-slate-300 px-4 py-2 text-sm leading-5"
          numberOfLines={2}
        >
          {post.content}
        </Text>
      )}


      {firstAttachment && (
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/post/[id]",
              params: { post: JSON.stringify(post) },
            })
          }
        >
          {isVideo ? (
            <View style={{ width: "100%", aspectRatio: 9 / 9, paddingHorizontal: 12 }}>
              <Video
                source={{ uri: firstAttachment.url }}
                resizeMode={ResizeMode.COVER}
                style={{ width: "100%", height: "100%", borderRadius: 10, }}
                isMuted
              />

              <View
                style={{
                  position: "absolute",
                  inset: 0,
                  alignItems: "center",
                  justifyContent: "center",

                  backgroundColor: "rgba(0,0,0,0.3)",
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "rgba(255,255,255,0.85)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="play" size={22} color="#000" />
                </View>
              </View>
            </View>
          ) : (
            <View style={{ width: "100%", paddingHorizontal: 10 }}>
              <Image
                source={{ uri: firstAttachment.url }}
                contentFit="cover"
                transition={200}
                style={{ width: "100%", aspectRatio: 9 / 9, paddingHorizontal: 12, borderRadius: 10 }}
              />
            </View>
          )}
        </Pressable>
      )}



      <View className="flex-row items-center justify-between px-4 pb-4 mt-4">
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center border border-white/15 bg-white/5 rounded-3xl p-1">
            <Pressable
              className="p-1"
              onPress={() => handleReaction("LIKE")}
            >
              <EvilIcons
                name="like"
                size={24}
                color={post?.liked ? "white" : "rgba(255,255,255,0.60)"}
              />
            </Pressable>
            <Text className="text-white/60 text-sm">
              {post?.statsDto?.likes ?? 0}
            </Text>

            <View className="w-px h-4 bg-white/10 ml-2" />

            <Pressable
              className="p-1 ml-1"
              onPress={() => handleReaction("DISLIKE")}
            >
              <EvilIcons
                name="like"
                size={24}
                color={post?.disliked ? "white" : "rgba(255,255,255,0.60)"}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </Pressable>
            <Text className="text-white/60 text-sm mr-1">
              {post?.statsDto?.dislikes ?? 0}
            </Text>
          </View>

          <View className="flex-row items-center border border-white/15 bg-white/5 rounded-3xl p-1 gap-1">
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color="rgba(255,255,255,0.60)"
            />
            <Text className="text-white/60 text-sm mr-2">
              {post?.statsDto?.comments ?? 0}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center border border-white/15 bg-white/5 rounded-full p-2">
          <Ionicons
            name="share-social-outline"
            size={18}
            color="rgba(255,255,255,0.60)"
          />
        </View>
      </View>
    </View>
  );
}