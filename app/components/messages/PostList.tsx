import React, { useCallback, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { useGetCommunityPostsQuery } from "@/src/features/community/community.api";
import Feedpostcard from "../CommunityPosts/Feedpostcard";

const PAGE_LIMIT = "10";

export default function PostList({
  communityId,
}: {
  communityId: string;
}) {
  const [cursor, setCursor] = useState("");

  const { data, isLoading, isFetching, isError } =
    useGetCommunityPostsQuery(
      {
        communityId,
        cursor,
        limit: PAGE_LIMIT,
      },
      {
        skip: !communityId,
        refetchOnMountOrArgChange: true,
      }
    );


  const posts = data?.communityPosts ?? [];

  const handleLoadMore = useCallback(() => {
    if (
      isFetching ||
      isLoading ||
      !data?.hasNext ||
      !data?.nextCursor ||
      data.nextCursor === cursor
    ) {
      return;
    }

    setCursor(data.nextCursor);
  }, [
    isFetching,
    isLoading,
    data?.hasNext,
    data?.nextCursor,
    cursor,
  ]);

  const ListFooter = useCallback(() => {
    if (!isFetching || posts.length === 0) return null;

    return (
      <View style={styles.loaderRow}>
        <ActivityIndicator size="small" color="#5865F2" />
      </View>
    );
  }, [isFetching, posts.length]);

  const ListEmpty = useCallback(() => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No posts yet. Be the first!
        </Text>
      </View>
    );
  }, [isLoading]);

  if (isError) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Failed to load posts.
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      data={posts}
      keyExtractor={(item) => item.postId.toString()}
      renderItem={({ item }) => <Feedpostcard post={item} />}
      estimatedItemSize={180}
      inverted
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={ListFooter}
      ListEmptyComponent={ListEmpty}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  loaderRow: {
    paddingVertical: 12,
    alignItems: "center",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },

  emptyText: {
    color: "#72767D",
    fontSize: 15,
  },
});