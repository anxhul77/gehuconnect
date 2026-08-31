import { View, ActivityIndicator } from "react-native";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native-gesture-handler";

import CommunityLogo from "@/app/components/community/CommunityLogo";
import CommunityHeadBar from "@/app/components/community/CommunityHeadBar";
import ChannelCategory from "@/app/components/channel/ChannelCategory";
import { useGetCommunityRailQuery, useGetCommunitySideBarQuery } from "@/src/features/community/community.api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CommunityResponseDto, CommunitySideBarDto } from "@/src/types/types";
import { useBottomSheet } from "@/app/contexts/BottomSheetContext";
import EventBottomSheetContent from "@/app/components/community/EventBottomSheetContent";
import { FlashList } from "@shopify/flash-list";
import buildVisibleItems, { toggleCategory } from "@/src/utils/CommunityUtils";
import ChannelCard from "@/app/components/channel/ChannelCard";

export default function Index() {
  const { communityId } = useLocalSearchParams();
  const [collaspedSet, setCollaspedSet] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [communityIds, setCommunityIds] = useState<string[]>([]);
  const [communityEntities, setCommunityEntities] = useState<
    Record<string, CommunityResponseDto>
  >({});
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | undefined>(communityId as string);
  const {
    data: communitiesData,
    isLoading: isCommunitiesLoading,
    isFetching: isCommunitiesFetching,

  } = useGetCommunityRailQuery({ limit: 50, cursor });
  console.log("communitiesData", communitiesData);
  useEffect(() => {
    if (!communitiesData) return;

    setCommunityEntities(prev => ({
      ...prev,
      ...communitiesData.entities,
    }));

    setCommunityIds(prev => {
      const seen = new Set(prev);

      const newIds = communitiesData.ids.filter(id => !seen.has(id));

      return [...prev, ...newIds];
    });
  }, [communitiesData]);

  const {
    data: communitySideBar,
    isLoading: isCommunityLoading,
    error: communityError
  } = useGetCommunitySideBarQuery(selectedCommunityId as string, { skip: !selectedCommunityId });
  const visibleCategories: CommunitySideBarDto[] = useMemo<CommunitySideBarDto[]>(() => {
    return buildVisibleItems(collaspedSet, communitySideBar)
  }, [collaspedSet, communitySideBar]);
  const handleOnChannelPress = useCallback((item: any) => {
    router.push({
      pathname: `/channels/${item?.channelId}`,
      params: { name: item?.channelName, communityId: communityId }
    }
    )
  }, [])
  function toggleCollapse(categoryId: string) {
    toggleCategory(categoryId, setCollaspedSet)
  }
  const renderItem = useCallback(({ item }: { item: CommunitySideBarDto }) => { return item.type === "CATEGORY" ? <ChannelCategory items={item} onToggle={toggleCollapse} collaspedSet={collaspedSet} /> : <ChannelCard item={item} communityId={communityId as string} handleOnChannelPress={handleOnChannelPress} ></ChannelCard> }
    ,
    [collaspedSet, communitySideBar])
  const renderLoader = () => (
    <View className="justify-center items-center py-4">
      {communitiesData?.hasNext && isCommunitiesFetching && (
        <ActivityIndicator size="small" color="#3b82f6" />
      )}
    </View>
  );

  const router = useRouter();
  function handleHeaderPress() {
    router.push({
      pathname: "/(drawer)/(tabs)/communities/profile/[communityProfileId]",
      params: {
        communityProfileId: selectedCommunityId as string,
        name: communityEntities[selectedCommunityId as string]?.name,
        avatar: communityEntities[selectedCommunityId as string]?.avatarUrl,
        isJoined: "true"

      },
    });
  }

  const { openActionSheet, closeActionSheet } = useBottomSheet();
  function handleEventClick() {
    openActionSheet({ content: () => <EventBottomSheetContent communityId={selectedCommunityId as string} closeActionSheet={closeActionSheet} />, snapPoints: ["40%"], enablePanDownToClose: true, handleComponent: null, color: "transparent", enableContentPanningGesture: true, onDismiss: () => closeActionSheet() });
  }

  return (
    <SafeAreaView className="flex-1 flex-row bg-black">
      <View className="pt-32" style={{ width: 80 }}>
        <FlashList
          data={communityIds}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <CommunityLogo
              imageUrl={communityEntities[item]?.avatarUrl}
              isSelected={selectedCommunityId === item}
              onPress={() => {
                setSelectedCommunityId(item);

              }}
            />
          )}
          showsVerticalScrollIndicator={false}

          onEndReachedThreshold={0.5}
          ListFooterComponent={renderLoader}
        />
      </View>

      <View className="flex-1 border bg-zinc-800/50 rounded-tl-3xl h-screen overflow-hidden">
        <CommunityHeadBar name={communityEntities[selectedCommunityId as string]?.name} onClick={handleHeaderPress} onEventClick={handleEventClick} />

        {isCommunityLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <FlashList<CommunitySideBarDto>
            data={visibleCategories}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
