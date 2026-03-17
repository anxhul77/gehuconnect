import { View, Text, Pressable } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Collapsible from "react-native-collapsible";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { FlatList } from "react-native-gesture-handler";

import ChannelCard from "@/app/components/channel/ChannelCard";
import CommunityLogo from "@/app/components/community/CommunityLogo";
import CommunityHeadBar from "@/app/components/community/CommunityHeadBar";
import ChannelCategory from "@/app/components/channel/ChannelCategory";
import { useGetCommunitiesQuery,useGetCommunityQuery } from "@/src/features/community.api";
import { useLocalSearchParams } from "expo-router";


export default function Index() {
   // const { communityId } = useLocalSearchParams();
  
  const [selectedCommunityId, setSelectedCommunityId] =
    useState<string | null>("1");

  
  const {
    data: communities,
    isLoading: isCommunitiesLoading,
    error:communityError
  } = useGetCommunitiesQuery();
  console.log("communities data",communities)
  console.log("communityError",communityError)
  const {
    data: Community,
    isLoading: isCommunityLoading,
  } = useGetCommunityQuery( selectedCommunityId! , {skip:!selectedCommunityId}
    
  );

  console.log(Community)
 
  return (
    <SafeAreaView className="flex-1 flex-row bg-black">
  
      <View className=" pt-20" style={{width:80}}>
        <FlatList
          data={communities}
          keyExtractor={(_, i) => i.toString()}
          renderItem={() => (
            <CommunityLogo imageUrl="https://picsum.photos/200" />
          )}
        />
      </View>

      <View className="flex-1 border bg-zinc-800/50 rounded-tl-3xl overflow-hidden">
   
       <CommunityHeadBar name={Community?.communityName}></CommunityHeadBar>
        <FlatList data={Community?.channelCategories} renderItem={(item)=> <ChannelCategory items={item} ></ChannelCategory>}></FlatList>
       


      
      
      </View>
    </SafeAreaView>
  );
}
