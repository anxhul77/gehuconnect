import { View, Text, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native-gesture-handler";

import CommunityLogo from "@/app/components/community/CommunityLogo";
import CommunityHeadBar from "@/app/components/community/CommunityHeadBar";
import ChannelCategory from "@/app/components/channel/ChannelCategory";
import { useGetCommunityQuery, useGetCommunityRailQuery } from "@/src/features/community.api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CommunityResposneDto } from "@/src/types/types";
import { Fontisto } from "@expo/vector-icons";

export default function Index() {
  const { communityId } = useLocalSearchParams();

  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    (communityId as string) || null
  );
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)
  const [communitiesList, setCommunitiesList] = useState<CommunityResposneDto[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const {
    data: communitiesData,
    isLoading: isCommunitiesLoading,
    isFetching: isCommunitiesFetching,
    error: communitiesError
  } = useGetCommunityRailQuery({ limit: 16, cursor });

  useEffect(() => {
    if (communitiesData?.communities) {
      setCommunitiesList((prev) => {
        const newComms = communitiesData.communities.filter(
          (c) => !prev.find((p) => p.id === c.id)
        );
        return [...prev, ...newComms];
      });

      if (!selectedCommunityId && communitiesData.communities.length > 0) {
        setSelectedCommunityId(String(communitiesData.communities[0].id));
      }
    }
  }, [communitiesData, selectedCommunityId]);

  const loadMore = () => {
    if (communitiesData?.hasNext && !isCommunitiesFetching) {
      setCursor(communitiesData.cursor);
    }
  };

  const {
    data: Community,
    isLoading: isCommunityLoading,
    error: communityError
  } = useGetCommunityQuery(selectedCommunityId as string, { skip: !selectedCommunityId });

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
        communityProfileId: String(Community?.id),
        name: Community?.communityName,
        avatar: avatarUrl,
        isJoined: "true"

      },
    });
  }
  return (
    <SafeAreaView className="flex-1 flex-row bg-black">
      <View className="pt-32" style={{ width: 80 }}>
        <FlatList
          data={communitiesList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CommunityLogo
              imageUrl={item.avatarUrl}
              isSelected={selectedCommunityId === String(item.id)}
              onPress={() => {
                setSelectedCommunityId(String(item.id));
                setAvatarUrl(item.avatarUrl)
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderLoader}
        />
      </View>

      <View className="flex-1 border bg-zinc-800/50 rounded-tl-3xl h-screen overflow-hidden">
        <CommunityHeadBar name={Community?.communityName} onClick={handleHeaderPress} />

        {isCommunityLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <FlatList
            data={Community?.channelCategories}
            renderItem={(item) => <ChannelCategory items={item} communityId={Community?.id} />}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
