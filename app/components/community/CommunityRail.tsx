import { View, Text } from "react-native"
import React from "react"
import { FlatList } from "react-native-gesture-handler"

import CommunityRailBlock from "./CommunityRailBlock"
import { useGetCommunitiesQuery } from "@/src/features/community.api"


export default function CommunityRail() {
  const { data, isLoading, error } = useGetCommunitiesQuery()
  console.log("rendered")
  console.log("communityerror",error)
  console.log("FULL DATA:", data)
console.log("communities:", data)

  if (isLoading) {
    return <Text className="text-white">Loading...</Text>
  }

  if (error) {
    return <Text className="text-red-500">Failed to load communities</Text>
  }

  return (
    <View className="bg-pink-400 ">
      <Text className="text-white">Communities</Text>
      <FlatList
        data={data}
        keyExtractor={(data) => data.id}
        showsVerticalScrollIndicator={false}
        renderItem={(data) => (
          <CommunityRailBlock community={data} />
        )}
      />
    </View>
  )
}