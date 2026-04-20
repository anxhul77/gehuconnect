import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CommunityCardProps {
  name: string;
  category: string;
  memberCount: string;
  imageUrl?: string;
  isJoined?: boolean;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  name,
  category,
  memberCount,
  imageUrl,
  isJoined,
}) => {
  const router=useRouter();
   function handleCommunnityPress(){
    router.push("/(drawer)/(tabs)/communities/profile/[communityProfileId]")
  }
  return (
    <Pressable onPress={()=> handleCommunnityPress()}
      style={styles.cardContainer}
      className="mr-4 border border-white/5 overflow-hidden"
    >
    
      <View style={StyleSheet.absoluteFill}>
        {imageUrl ? (
          <>
            <Image
              source={{ uri: imageUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
            />
            <View className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <View className="flex-1 bg-zinc-800 items-center justify-center">
            <MaterialIcons name="groups" size={32} color="#3f3f46" />
          </View>
        )}
      </View>


      <View className="flex-1 p-3 justify-end">
        <Text
          className="text-white font-bold text-[13px] mb-0.5"
          numberOfLines={1}
        >
          {name}
        </Text>

        <View className="flex-row items-center mb-2">
          <MaterialIcons name="people-outline" size={12} color="#a1a1aa" />
          <Text className="text-zinc-400 text-[9px] ml-1 font-medium">
            {memberCount}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={isJoined ? styles.buttonJoined : styles.buttonJoin}
          className="w-full py-1.5 rounded-lg items-center justify-center"
        >
          <Text className="text-white font-bold text-[10px]">
            {isJoined ? "Joined" : "Join"}
          </Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 140, 
    height: 160, 
    borderRadius: 20,
    backgroundColor: "#1E1E22",
  },
  buttonJoin: { backgroundColor: "#3b82f6" },
  buttonJoined: { backgroundColor: "rgba(255,255,255,0.1)" },
});

export default CommunityCard;