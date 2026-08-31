import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useState, useCallback, useRef } from "react";
import Feedpostcard from "../../../components/CommunityPosts/Feedpostcard";
import ApplicationHeader from "../../../components/ApplicationHeader";
import { useGetFeedPostsQuery } from "@/src/features/feed.api";

import { BottomSheetHandle, BottomSheetModal } from "@gorhom/bottom-sheet";



const LIMIT = "10";
const modalConfig = {
  threedot: {
    snapPoints: ["25%"],
    enablePanDownToClose: true,
    handleComponent: null,
  },
  share: {
    snapPoints: ["35%"],
    enablePanDownToClose: true,
    handleComponent: null,
  },
  comment: {
    snapPoints: ["85%"],
    keyboardBehavior: "interactive",
    enablePanDownToClose: false,
    handleComponent: BottomSheetHandle,
  },
};
export default function Index() {
  const [cursor, setCursor] = useState("");

  const { data, isLoading, isFetching, isError } = useGetFeedPostsQuery(
    {
      feedtype: "LATEST",
      cursor,
      keyword: "",
      courseId: "",
      limit: LIMIT,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const posts = data?.communityPosts ?? [];

  const loadMore = useCallback(() => {
    if (
      data?.hasNext &&
      !isFetching &&
      data.nextCursor !== cursor
    ) {
      setCursor(data.nextCursor);
    }
  }, [data, isFetching, cursor]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => <Feedpostcard post={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: any) => item.postId.toString(),
    []
  );

  const ListFooter = isFetching ? (
    <Text className="text-center my-4 text-gray-500">
      Loading more...
    </Text>
  ) : null;

  if (isLoading && posts.length === 0) {
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
    <View className="flex-1 bg-black">
      <ApplicationHeader />
      <FlashList
        data={posts}
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