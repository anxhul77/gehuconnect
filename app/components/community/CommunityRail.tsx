import { View, Text, Pressable, ActivityIndicator } from "react-native"
import React from "react"
import { useGetCommunityRailQuery } from "@/src/features/community/community.api"
import { Image } from "expo-image"
import { useRouter } from "expo-router"

export default function CommunityRail() {
  const { data, isLoading, error } = useGetCommunityRailQuery({})
  const router = useRouter()

  if (isLoading) {
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#999" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="py-4 px-4">
        <Text className="text-red-500 text-sm">Failed to load communities</Text>
      </View>
    )
  }

  const communities = data?.communities || []

  if (communities.length === 0) {
    return (
      <View className="py-4 px-4">
        <Text className="text-zinc-500 text-sm">You haven't joined any communities yet.</Text>
      </View>
    )
  }

  return (
    <View>
      {communities.map((community) => (
        <Pressable
          key={community.id}
          className="flex-row items-center py-3 px-4 active:bg-white/10"
          onPress={() => {
            router.push({
              pathname: "/(drawer)/(tabs)/communities/profile/[communityProfileId]",
              params: {
                communityProfileId: community.id.toString(),
                name: community.name,
                avatar: community.avatarUrl,
              },
            })
          }}
        >
          {community.avatarUrl ? (
            <Image
              source={{ uri: community.avatarUrl }}
              style={{ width: 28, height: 28, borderRadius: 14 }}
              contentFit="cover"
            />
          ) : (
            <View className="w-7 h-7 rounded-full bg-zinc-700 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {community.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="text-white ml-3 text-[15px] font-medium">
            {community.name}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}