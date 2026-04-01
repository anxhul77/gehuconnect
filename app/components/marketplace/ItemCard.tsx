import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import TagCard from "./TagCard";
import { useRouter } from "expo-router";
import { ItemCardProps } from "@/src/types/types";






export default function ItemCard({
 item
}: ItemCardProps) {
  const router =useRouter();
 function handleByPress(){
    router.push(`/components/marketplace/${item?.productId}`)
 }

  return (
    <View style={styles.card} className="  border  border-[#2A2A2A]">
    
      <View className="h-44 w-full relative">
        <Image
          source={{ uri: item?.image[0] }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
      
        <View className="absolute top-3 left-3 bg-zinc-900/50 border border-white/5 px-3 py-1 rounded-full">
          <Text className="text-white font-bold text-xs">
          {'\u20B9'}{item?.price}
       
          </Text>
        </View>

       

        
        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className="absolute top-3 right-3 bg-black/20 p-2 rounded-full"
        >
          <Ionicons name="heart-outline" size={18} color="white" />
        </Pressable>
      </View>

    
      <View className="p-4">
        <Text className="text-white font-bold text-sm mb-2" numberOfLines={1}>
          {item?.productName}
        </Text>

      
        <View className="flex-row items-center mb-3  ">
          <View className="w-6 h-6 rounded-full bg-zinc-800 items-center justify-center mr-2">
            <Text className="text-white text-[10px] font-bold">
              {item?.sellerDto?.userName.charAt(0)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-zinc-400 text-[10px]" numberOfLines={1}>
              {item?.sellerDto?.userName}{" "}
              <Ionicons name="checkmark-circle" size={10} color="#10b981" />
            </Text>
          </View>
        <TagCard color="#facc15" label={"4.5"} icon={ <FontAwesome name="star" size={10} color="#facc15" />}></TagCard>
        </View>

        
        
        <TagCard color="#3b82f6" label="tag" icon={""}></TagCard>
        <View className=" flex-row  mr-2 items-center ml-2 mb-2 mt-2">
        <FontAwesome name="heart-o" size={12} color="#B3B3B3" />
        <Text className="text-[#B3B3B3] ml-1 mr-2" style={{fontSize:10}}>20</Text>
         <Feather name="eye" size={12} color="#B3B3B3" />
         <Text className="text-[#B3B3B3] ml-1" style={{fontSize:10}}>20</Text>
         </View>
       
        <Pressable  onPress={handleByPress}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.8 : 1,
              backgroundColor:  "#5856D6" ,
            },
          ]}
          className="w-full py-2.5 rounded-xl items-center flex-row justify-center bg-blue-500"
        >
         <Octicons name="shield-check" size={14} color="white" />
          <Text className="text-white font-bold text-xs ml-2 ">
            {"Chat to Buy" }
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48.5%",

    borderRadius: 24,
    overflow: "hidden",
  },
});