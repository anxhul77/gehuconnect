import React, { useCallback, useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useGetCommunityPostsQuery } from "@/src/features/community.api";
import { CommunityPost } from "@/src/types/types";
import Feedpostcard from "../Feedpostcard";

const PAGE_LIMIT = "10";

export default function PostList({ channelId }: { channelId: string }) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [allPosts, setAllPosts] = useState<CommunityPost[]>([]);

  const { data, isLoading, isFetching, isError } = useGetCommunityPostsQuery(
    { channelId, cursor: cursor ?? "", limit: PAGE_LIMIT },
    { skip: !channelId }
  );
  console.log("posts",data)
  useEffect(() => {
    if (!data?.communityPosts) return;
    const incoming = Array.isArray(data.communityPosts)
      ? data.communityPosts
      : [data.communityPosts];
    setAllPosts((prev) => {
      const existingIds = new Set(prev.map((p) => p.postId));
      const fresh = incoming.filter((p) => !existingIds.has(p.postId));
      return [...prev, ...fresh];
    });
  }, [data]);

  const handleLoadMore = useCallback(() => {
    if (isFetching || isLoading || !data?.hasNext || !data?.nextCursor) return;
    setCursor(data.nextCursor);
  }, [isFetching, isLoading, data?.hasNext, data?.nextCursor]);

  const ListFooter = useCallback(() => {
    if (!isFetching || allPosts.length === 0) return null;
    return (
      <View style={styles.loaderRow}>
        <ActivityIndicator size="small" color="#5865F2" />
      </View>
    );
  }, [isFetching, allPosts.length]);

  const ListEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No posts yet. Be the first!</Text>
      </View>
    );
  }, [isLoading]);

  if (isError) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Failed to load posts.</Text>
      </View>
    );
  }

  return (
    <FlashList
      data={allPosts}
      keyExtractor={(item) => item.postId}
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