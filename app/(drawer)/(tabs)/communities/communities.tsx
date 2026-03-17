
import { MaterialIcons } from "@expo/vector-icons"; // Using Expo icons as established
import { useHeaderHeight } from "@react-navigation/elements";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CommunityCard from "../../../components/community/CommunityCard";

export default function Communities() {
  const headerHeight = useHeaderHeight();

  return (
    <SafeAreaProvider className="flex-1 bg-black">
      <ScrollView
        className="flex-1 px-4 "

        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40 }}
      >
        <Text className="text-white text-2xl  font-bold mb-4 mt-2">
          Popular Clubs
        </Text>

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
