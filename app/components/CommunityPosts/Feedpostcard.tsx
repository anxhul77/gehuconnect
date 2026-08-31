import { View, Text, Pressable } from "react-native";
import React, { useCallback, useRef } from "react";
import { AntDesign, Entypo, EvilIcons, Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Video, ResizeMode } from "expo-av";
import { useRouter } from "expo-router";
import { useReactToPostMutation } from "@/src/features/feed.api";
import { useBottomSheet } from "@/app/contexts/BottomSheetContext";
import ShareSheet from "../home/modals/ShareSheet";
import ThreeDotModal from "../home/modals/ThreeDotModal";


const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);
const content = [
  {
    icon: <Feather name="flag" size={20} color="white" />, title: "Report", onPress: () => { }

  },
  {
    icon: <Entypo name="block" size={20} color="white" />, title: "Block", onPress: () => {

    }
  },
  {
    icon: <AntDesign name="eye-invisible" size={20} color="white" />, title: "Mark not interested", onPress: () => {

    }
  }
]

function Feedpostcard({
  post,

  isCommentPage = false,

}: {
  post: any;

  isCommentPage?: boolean;

}) {
  const { openActionSheet } = useBottomSheet()
  const router = useRouter();

  const firstAttachment = post?.attachments?.[0];
  const isVideo =
    firstAttachment && ALLOWED_VIDEO_TYPES.has(firstAttachment.type);

  const [reactToPost] = useReactToPostMutation();

  const handleCommentPress = () => {
    if (isCommentPage) return;

    router.push(
      `/components/CommunityPosts/comments/${post?.postId}`,

    );

  };

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


  const handleShareClick = useCallback(() => {
    openActionSheet({ content: () => (<ShareSheet></ShareSheet>), snapPoints: ["35%"], enablePanDownToClose: true, })
  }, [])
  const handleThreeDotClick = useCallback(() => {
    openActionSheet({ content: () => (<ThreeDotModal content={content}></ThreeDotModal>), snapPoints: ["25%"], enablePanDownToClose: true })
  }, [])
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
        <Pressable className="absolute right-4" onPress={handleThreeDotClick}>
          <Entypo name="dots-three-vertical" size={18} color="white" />
        </Pressable>
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
          disabled={isCommentPage}
          onPress={() =>
            router.push(`/components/CommunityPosts/${post.postId}`)
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

          <Pressable
            onPress={handleCommentPress}
            disabled={isCommentPage}
            className="flex-row items-center border border-white/15 bg-white/5 rounded-3xl p-2 h-10 gap-1"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color="rgba(255,255,255,0.60)"
            />
            <Text className="text-white/60 text-sm ">
              {post?.statsDto?.comments ?? 0}
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={() => handleShareClick()} className="flex-row items-center border border-white/15 bg-white/5 rounded-full p-2">
          <Ionicons
            name="share-social-outline"
            size={18}
            color="rgba(255,255,255,0.60)"
          />
        </Pressable>
      </View>
    </View>
  );
}
export default React.memo(Feedpostcard, (prev, next) => (
  prev.post.statsDto.comments === next.post.statsDto.comments &&
  prev.post.statsDto.likes === next.post.statsDto.likes &&
  prev.post.liked === next.post.liked &&
  prev.post.disliked === next.post.disliked
)

);