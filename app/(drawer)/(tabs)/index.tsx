import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useState, useCallback, useRef } from "react";
import Feedpostcard from "../../components/Feedpostcard";
import { useGetFeedPostsQuery } from "@/src/features/feed.api";

const LIMIT = "10";

export default function Index() {
  const [cursor, setCursor] = useState<string>("");
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const seenCursors = useRef<Set<string>>(new Set());

  const { data, isLoading, isFetching, isError } = useGetFeedPostsQuery(
    {
      feedtype: "LATEST",
      cursor,
      keyword: "",
      courseId: "",
      limit: LIMIT,
    },
    {
      refetchOnMountOrArgChange: false,
    }
  );

  const handleNewData = useCallback(() => {
    // ✅ Fixed: data.communityPosts, not data.post.communityPosts
    const posts = data?.communityPosts;
    const currentCursor = cursor;

    if (!posts?.length) return;
    if (seenCursors.current.has(currentCursor)) return;
    seenCursors.current.add(currentCursor);

    setAllPosts((prev) => {
      const merged = [...prev, ...posts];
      return Array.from(
        new Map(merged.map((item) => [item.postId, item])).values()
      );
    });
  }, [data, cursor]);

  handleNewData();

  const loadMore = useCallback(() => {
    // ✅ Fixed: data.hasNext and data.nextCursor
    if (data?.hasNext && !isFetching) {
      setCursor(data.nextCursor);
    }
  }, [data, isFetching]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => <Feedpostcard post={item} />,
    []
  );

  const keyExtractor = useCallback((item: any) => item.postId, []);

  const ListFooter = isFetching ? (
    <Text className="text-center my-4 text-gray-500">Loading more...</Text>
  ) : null;

  if (isLoading && allPosts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error loading posts</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlashList
        data={allPosts}
        estimatedItemSize={200}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={ListFooter}
      />
    </View>
  );
}