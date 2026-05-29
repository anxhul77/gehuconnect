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
import { ProductCardResponse } from "@/src/types/types";
import { useLikeProductMutation } from "@/src/features/marketplace.api";
import { useState } from "react";






export default function ItemCard({
  item
}: { item: ProductCardResponse }) {
  const router = useRouter();
  const [likeProduct] = useLikeProductMutation();
  const [liked, setLiked] = useState(item?.isLiked || false);
  const [likeCount, setLikeCount] = useState(parseInt(item?.likeCount || "0"));

  function handleByPress() {
    router.push({
      pathname: `/components/marketplace/${item?.productId}` as any,
      params: {
        productId: item?.productId,
        product: JSON.stringify(item)
      }
    })
  }

  const handleLike = async () => {
    const previousLiked = liked;
    const previousCount = likeCount;

    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);

    try {
      await likeProduct(item.productId).unwrap();
    } catch (error) {

      setLiked(previousLiked);
      setLikeCount(previousCount);
    }
  };


  return (
    <View style={styles.card} className="  border  border-[#2A2A2A]">

      <View className="h-44 w-full relative">
        <Image
          source={{ uri: item?.coverImage }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />

        <View className="absolute top-3 left-3 bg-zinc-900/60 border border-white/10 px-3 py-1.5 rounded-full">
          <Text className="text-white font-black text-sm">
            {'\u20B9'}{item?.specialPrice || item?.price}
          </Text>
        </View>




        <Pressable
          onPress={handleLike}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className={`absolute top-3 right-3 bg-black/20 p-2 rounded-full `}
        >
          <Ionicons name={liked ? "heart" : "heart-outline"} size={18} color={liked ? "#FF2D78" : "white"} />
        </Pressable>
      </View>


      <View className="p-4">
        <Text className="text-white font-bold text-sm mb-2" numberOfLines={2}>
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
          <TagCard color="#facc15" label={"4.5"} icon={<FontAwesome name="star" size={10} color="#facc15" />}></TagCard>
        </View>



        <View className="flex-row flex-wrap gap-1 mb-3">
          <View className="flex-row gap-1">
            {item?.category && (
              <TagCard
                color="#3b82f6"
                label={typeof item.category === 'object' ? item.category.categoryName : item.category}
                icon={<MaterialCommunityIcons name="tag-outline" size={10} color="#3b82f6" />}
              />
            )}
            {item?.isNegotitable && (
              <TagCard color="#10b981" label="Negotiable" icon={<MaterialCommunityIcons name="handshake-outline" size={10} color="#10b981" />} />
            )}
          </View>
          {item?.isUrgentSale && (
            <TagCard color="#ef4444" label="UrgentSale" icon={<MaterialCommunityIcons name="fire" size={10} color="#ef4444" />} />
          )}
        </View>

        <View className="flex-row flex-wrap gap-1 mb-2">
          {item?.productTags?.slice(0, 3).map((tag, idx) => {

            return (
              <Text key={idx} className="text-zinc-500 text-[10px]">#{tag}</Text>
            );
          })}
          {item?.productTags?.length > 3 && (
            <Text className="text-zinc-500 text-[10px]">+{item.productTags.length - 3}</Text>
          )}
        </View>

        {item?.discount > 0 ? (
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-zinc-500 text-xs line-through">{'\u20B9'}{item.price}</Text>
            <View className="bg-red-500/10 px-1.5 py-0.5 rounded">
              <Text className="text-green-500 text-[10px] font-black">{item.discount}% OFF</Text>
            </View>
          </View>
        ) : (
          <Text className="text-white font-bold text-sm mb-3">{'\u20B9'}{item.price}</Text>
        )}

        <View className=" flex-row  mr-2 items-center ml-2 mb-2 mt-2">
          <FontAwesome name={liked ? "heart" : "heart-o"} size={12} color={liked ? "#FF2D78" : "#B3B3B3"} />
          <Text className="text-[#B3B3B3] ml-1 mr-2" style={{ fontSize: 10 }}>{likeCount}</Text>
          <Feather name="eye" size={12} color="#B3B3B3" />
          <Text className="text-[#B3B3B3] ml-1" style={{ fontSize: 10 }}>{item?.seenCount || 0}</Text>
        </View>

        <Pressable onPress={handleByPress}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.8 : 1,
              backgroundColor: "#5856D6",
            },
          ]}
          className="w-full py-2.5 rounded-xl items-center flex-row justify-center bg-blue-500"
        >
          <Octicons name="shield-check" size={14} color="white" />
          <Text className="text-white font-bold text-xs ml-2 ">
            {"Chat to Buy"}
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