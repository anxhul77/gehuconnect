import { FontAwesome5, MaterialIcons, SimpleLineIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CommunityCard from "../../../components/community/CommunityCard";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useGetCommunitiesQuery } from "@/src/features/community/community.api";
import { CommunityCardDto, CommunitySortType } from "@/src/types/types";

export default function Communities() {
  const router = useRouter();
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { data, isFetching, isLoading } = useGetCommunitiesQuery({
    limit: 16,
    cursor: cursor,
    communitySortType: CommunitySortType.SCORE,
  });

  const communities = data?.communities ?? [];

  const loadMore = () => {
    if (data?.hasNext && !isFetching && data.cursor !== cursor) {
      setCursor(data.cursor);
    }
  };

  const list1Ref = useRef<FlashList<CommunityCardDto>>(null);
  const list2Ref = useRef<FlashList<CommunityCardDto>>(null);
  const isSyncing = useRef(false);

  const onScroll1 = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isSyncing.current) {
      isSyncing.current = true;
      list2Ref.current?.scrollToOffset({
        offset: event.nativeEvent.contentOffset.x,
        animated: false,
      });

      setTimeout(() => {
        isSyncing.current = false;
      }, 20);
    }
  };

  const onScroll2 = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isSyncing.current) {
      isSyncing.current = true;
      list1Ref.current?.scrollToOffset({
        offset: event.nativeEvent.contentOffset.x,
        animated: false,
      });
      setTimeout(() => {
        isSyncing.current = false;
      }, 20);
    }
  };

  const row1Data = communities.filter((_, i) => i % 2 === 0);
  const row2Data = communities.filter((_, i) => i % 2 !== 0);

  const renderCommunity = ({ item }: { item: CommunityCardDto }) => (
    <CommunityCard
      id={item.communityId}
      name={item.communityName}
      category={item.tags?.[0] || "General"}
      memberCount={(item.memberCount ?? 0).toString()}
      imageUrl={item.avatarUrl}
      isJoined={item.isJoined}
      tags={item.tags}
    />
  );

  const renderLoader = () => (
    <View className="justify-center items-center px-4 h-[160px]">
      {data?.hasNext && isFetching && (
        <ActivityIndicator size="small" color="#3b82f6" />
      )}
    </View>
  );

  return (
    <SafeAreaProvider className="flex-1 bg-black">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View
          className="flex-row items-center mt-2"

        >
          <Text className="text-white text-2xl font-bold mb-4 mt-2">
            Popular Clubs
          </Text>
          <View className="flex-row gap-4 absolute right-0">
            <Pressable onPress={() => {
              router.push("/(drawer)/(tabs)/communities/[communityId]");
            }} className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center mb-4">
              <SimpleLineIcons name="people" size={18} color="#71717a" />
            </Pressable>

            <Pressable onPress={() => {
              router.push("/components/community/CreateCommunityPage");
            }} className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center mb-4">
              <Text className="text-[#71717a] text-3xl">+</Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-4" style={{ height: 160 }}>
          <FlashList
            ref={list1Ref}
            data={row1Data}
            renderItem={renderCommunity}
            keyExtractor={(item) => item.communityId.toString()}
            horizontal
            estimatedItemSize={140}
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll1}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderLoader}
            contentContainerStyle={{ paddingRight: 20 }}
          />
        </View>

        <View className="mb-8" style={{ height: 160 }}>
          <FlashList
            ref={list2Ref}
            data={row2Data}
            renderItem={renderCommunity}
            keyExtractor={(item) => item.communityId.toString()}
            horizontal
            estimatedItemSize={140}
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll2}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderLoader}
            contentContainerStyle={{ paddingRight: 20 }}
          />
        </View>

        <Text className="text-white text-xl font-bold mb-2">Active Threads</Text>

        <View className="w-full py-12 items-center justify-center rounded-[32px] bg-zinc-900/30 border border-white/5 border-dashed">
          <View className="w-12 h-12 rounded-full bg-zinc-800 items-center justify-center mb-4">
            <MaterialIcons
              name="chat-bubble-outline"
              size={24}
              color="#71717a"
            />
          </View>
          <Text className="text-zinc-500 font-medium text-center">
            No new threads yet.{"\n"}
            <Text className="text-zinc-600 text-xs">
              Start a conversation in a club!
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}
