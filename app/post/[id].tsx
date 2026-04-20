import { Entypo, EvilIcons, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Video, ResizeMode } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View, Text, Dimensions, FlatList, LayoutChangeEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef, useState, useCallback } from "react";
import CommentBottomSheet from "../components/CommentBottomSheet";
import BottomSheet from "@gorhom/bottom-sheet";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_LINES = 3;

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

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
    <View>

      <Text
        style={{ position: "absolute", opacity: 0, zIndex: -1 }}
        className="text-slate-300 text-base leading-6"
        onTextLayout={handleMeasure}
      >
        {text}
      </Text>


      {expanded ? (
        <Pressable onPress={() => setExpanded(false)}>
          <Text className="text-slate-300 text-base leading-6 ">
            {text}
            {"  "}
            <Text className="text-blue-400 text-sm font-medium">less</Text>
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => needsTruncation && setExpanded(true)}
          disabled={!needsTruncation}
        >
          <Text
            className="text-slate-300 text-base leading-6"
            numberOfLines={MAX_LINES}
          >
            {text}
          </Text>

          {needsTruncation === true && (
            <Text className="text-blue-400 text-sm font-medium mt-0.5">
              ...more
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}


type Attachment = { url: string; type: string };

function MediaItem({ attachment }: { attachment: Attachment }) {
  const isVideo = ALLOWED_VIDEO_TYPES.has(attachment.type);

  if (isVideo) {
    return (
      <Video
        source={{ uri: attachment.url }}
        resizeMode={ResizeMode.COVER}
        useNativeControls
        style={{ width: SCREEN_WIDTH, aspectRatio: 1, backgroundColor: "#000" }}
      />
    );
  }

  return (
    <Image
      source={{ uri: attachment.url }}
      contentFit="cover"
      transition={150}
      style={{ width: SCREEN_WIDTH, aspectRatio: 1, backgroundColor: "#000" }}
    />
  );
}

function MediaCarousel({
  attachments,
  onIndexChange,
}: {
  attachments: Attachment[];
  onIndexChange: (i: number) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = useCallback(
    (e: any) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      if (index !== activeIndex) {
        setActiveIndex(index);
        onIndexChange(index);
      }
    },
    [activeIndex, onIndexChange]
  );

  const goTo = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
    onIndexChange(index);
  };

  if (!attachments?.length) return null;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={attachments}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <MediaItem attachment={item} />}
      />

      {attachments.length > 1 && (
        <View className="flex-row items-center justify-center px-4 py-2">
          <View className="flex-row items-center gap-1.5">
            {attachments.map((_, i) => (
              <Pressable key={i} onPress={() => goTo(i)} hitSlop={6}>
                <View
                  style={{
                    width: i === activeIndex ? 18 : 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor:
                      i === activeIndex ? "white" : "rgba(255,255,255,0.25)",
                  }}
                />
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── FeedPostSection ──────────────────────────────────────────────────────────
export default function FeedPostSection() {
  const commentBottomSheetRef = useRef<BottomSheet>(null);
  const router = useRouter();
  const params = useLocalSearchParams();

  const [mediaIndex, setMediaIndex] = useState(0);
  // Track the rendered height of the bottom panel so we can push the
  // media center point up by that amount, making it truly centered in the
  // visible space above the panel.
  const [bottomHeight, setBottomHeight] = useState(0);

  const safeParse = (value: any) => {
    try {
      if (typeof value !== "string") return null;
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const post = safeParse(params.post as string);
  const attachments: Attachment[] = post?.attachments ?? [];



  const onBottomLayout = useCallback((e: LayoutChangeEvent) => {
    setBottomHeight(e.nativeEvent.layout.height);
  }, []);

  return (
    <View className="flex-1 bg-black">
      {/* ── Header ── */}
      <SafeAreaView>
        <View className="flex-row py-4 items-center px-2 w-full">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Entypo name="cross" size={32} color="white" />
          </Pressable>

          <Text className="flex-1 text-center text-white font-semibold text-base">
            {post?.communityName?.charAt(0)}/{post?.communityName}
          </Text>

          {attachments.length > 1 && (
            <View className="absolute right-12 bg-black/50 rounded-full px-2 py-0.5">
              <Text className="text-white text-xs font-medium">
                {mediaIndex + 1}/{attachments.length}
              </Text>
            </View>
          )}

          <Pressable hitSlop={8}>
            <Entypo name="dots-three-vertical" size={22} color="white" />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* ── Media ──
           flex-1 takes all remaining height.
           marginBottom = bottomHeight reserves the exact space the overlay
           occupies, so justifyContent:"center" centers within the true gap. ── */}
      <View
        style={{ flex: 1, justifyContent: "center", marginBottom: bottomHeight }}
      >
        {attachments.length > 0 ? (
          <MediaCarousel
            attachments={attachments}
            onIndexChange={setMediaIndex}
          />
        ) : (
          <View
            style={{ width: SCREEN_WIDTH, aspectRatio: 1 }}
            className="bg-slate-900 items-center justify-center"
          >
            <Ionicons
              name="image-outline"
              size={48}
              color="rgba(255,255,255,0.2)"
            />
          </View>
        )}
      </View>

      {/* ── Bottom panel — absolutely pinned, NO background ── */}
      <SafeAreaView
        edges={["bottom"]}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        onLayout={onBottomLayout}
      >
        <View className="px-4 pt-4 pb-2 gap-2">
          {/* Author */}
          <View className="flex-row items-center">
            <View className="h-8 w-8 rounded-full bg-slate-700 items-center justify-center">
              <Ionicons name="person" size={14} color="white" />
            </View>
            <View className="ml-3">
              <Text className="text-white font-semibold text-sm">
                {post?.communityName?.charAt(0)}/{post?.communityName}
              </Text>
              <Text className="text-slate-400 text-xs">
                u/{post?.author?.author} • 2h ago
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-white font-bold text-base leading-6">
            {post?.title}
          </Text>

          {/* Body */}
          {!!post?.content && <TruncatedText text={post.content} />}

          {/* Actions */}
          <View className="flex-row items-center justify-between mt-1 mb-1">
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center border border-white/15 bg-white/5 rounded-3xl px-1 h-[42px]">
                <Pressable hitSlop={6} className="px-1">
                  <EvilIcons name="like" size={24} color="white" />
                </Pressable>
                <Text className="text-white text-sm">
                  {post?.statsDto?.likes ?? 0}
                </Text>
                <View className="w-px h-4 bg-white/15 mx-2" />
                <Pressable hitSlop={6} className="px-1">
                  <EvilIcons
                    name="like"
                    size={24}
                    color="white"
                    style={{ transform: [{ rotate: "180deg" }] }}
                  />
                </Pressable>
                <Text className="text-white text-sm mr-2">
                  {post?.statsDto?.dislikes ?? 0}
                </Text>
              </View>

              <Pressable
                onPress={() => commentBottomSheetRef.current?.snapToIndex(0)}
              >
                <View className="flex-row items-center gap-1 border border-white/15 bg-white/5 rounded-3xl px-3 h-[42px]">
                  <Ionicons name="chatbubble-outline" size={18} color="white" />
                  <Text className="text-white text-sm">
                    {post?.statsDto?.comments ?? 0}
                  </Text>
                </View>
              </Pressable>
            </View>

            <View className="flex-row items-center gap-1 border border-white/15 bg-white/5 rounded-full px-3 h-[42px]">
              <Ionicons name="share-social-outline" size={18} color="white" />
              <Text className="text-white text-sm">
                {post?.statsDto?.shares ?? 0}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <CommentBottomSheet ref={commentBottomSheetRef} post={post} />
    </View>
  );
}