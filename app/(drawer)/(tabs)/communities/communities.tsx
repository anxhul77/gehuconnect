
import { MaterialIcons } from "@expo/vector-icons"; // Using Expo icons as established

import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CommunityCard from "../../../components/community/CommunityCard";
import { useRouter } from "expo-router";

export default function Communities() {
  
   const router=useRouter()
  return (
    <SafeAreaProvider className="flex-1 bg-black">
      <ScrollView
        className="flex-1 px-4 "

        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40 }}
      >
        <Pressable className="flex-row items-center mt-2 " onPress={()=>{router.push("/components/community/CreateCommunityPage")}}>
        <Text className="text-white text-2xl  font-bold mb-4 mt-2">
          Popular Clubs
        </Text>
        <View className="w-10 h-10 rounded-full  bg-zinc-800 items-center justify-center mb-4 absolute right-0">
            <Text className="text-[#71717a] text-3xl">+</Text>
          </View>
          </Pressable>
        <ScrollView
         
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row mb-8 "
          contentContainerStyle={{ paddingRight: 20 }}
        >
          <CommunityCard
            name="GeHU Connect"
            category="General"
            memberCount="1.2k"
            imageUrl="https://picsum.photos/400/400"
          />
          <CommunityCard
            name="Basketball"
            category="Sports"
            memberCount="423"
            isJoined={true}
            imageUrl="https://picsum.photos/401/401"
          />
          <CommunityCard
            name="Tech Society"
            category="Technology"
            memberCount="2.1k"
            imageUrl="https://picsum.photos/402/402"
          />
          <CommunityCard
            name="Music Club"
            category="Arts"
            memberCount="856"
            imageUrl="https://picsum.photos/403/403"
          />
        </ScrollView>
        
        <ScrollView
         
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row mb-8 "
          contentContainerStyle={{ paddingRight: 20 }}
        >
          <CommunityCard
            name="GeHU Connect"
            category="General"
            memberCount="1.2k"
            imageUrl="https://picsum.photos/400/400"
          />
          <CommunityCard
            name="Basketball"
            category="Sports"
            memberCount="423"
            isJoined={true}
            imageUrl="https://picsum.photos/401/401"
          />
          <CommunityCard
            name="Tech Society"
            category="Technology"
            memberCount="2.1k"
            imageUrl="https://picsum.photos/402/402"
          />
          <CommunityCard
            name="Music Club"
            category="Arts"
            memberCount="856"
            imageUrl="https://picsum.photos/403/403"
          />
        </ScrollView>
        <Text className="text-white text-xl font-bold mb-2">
          Active Threads
        </Text>

      
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
