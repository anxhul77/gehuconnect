import { FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatBottomSheet from "./ChatBottomSheet";
import MakeOfferBottomSheet from "./MakeOfferBottomSheet";

import { useGetProductsQuery } from "@/src/features/marketplace.api";
import CategoryCard from "./CategoryCard";

const { width } = Dimensions.get("window");

const C = {
  bg: '#0A0A0A', surface: '#1A1A1A', surface2: '#242424', border: '#2A2A2A',
  accent: '#FF6B35', neonPink: '#FF2D78', green: '#1DB954',
  white: '#FFFFFF', muted: '#535353', textSec: '#B3B3B3',
}

const DUMMY_ITEM = {
  id: "1", title: "MacBook Air M1", price: "₹65,000",
  user: "Aman Sharma", userSince: "2022", rating: "4.9", reviews: 38,
  condition: "Excellent", category: "Electronics",
  description: "MacBook Air M1 8GB RAM 256GB SSD. Very lightly used for about 8 months. Battery health at 95%. Comes with original charger and box. No dents or scratches. Ideal for students and professionals.",
  tags: ["Apple", "Laptop", "M1", "MacBook"], views: 142, saves: 23,
}

export default function ListingDetailScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const item = DUMMY_ITEM
   const{marketplaceId}=useLocalSearchParams();
   console.log(marketplaceId,typeof(marketplaceId))
  const { product } = useGetProductsQuery(
  {},
  {
    selectFromResult: ({ data }) => ({
      product: data?.content?.find(
        p =>String(p.productId) === marketplaceId),
    } )
  }
);
console.log(product)
  const images = [
    `https://picsum.photos/seed/${item.title}1/900/700`,
    `https://picsum.photos/seed/${item.title}2/900/700`,
    `https://picsum.photos/seed/${item.title}3/900/700`,
    `https://picsum.photos/seed/${item.title}4/900/700`,
  ]

  const flatListRef = useRef<FlatList>(null)
  const chatRef = useRef<BottomSheet>(null)
  const offerRef = useRef<BottomSheet>(null)

  const [activeImage, setActiveImage] = useState(0)
  const [liked, setLiked] = useState(false)
  const [activeSheet, setActiveSheet] = useState<'chat' | 'offer' | null>(null)

  useEffect(() => {
    if (activeSheet === 'chat') {
      const t = setTimeout(() => chatRef.current?.snapToIndex(0), 50)
      return () => clearTimeout(t)
    }
    if (activeSheet === 'offer') {
      const t = setTimeout(() => offerRef.current?.snapToIndex(0), 50)
      return () => clearTimeout(t)
    }
  }, [activeSheet])

  const scrollToImage = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true })
    setActiveImage(index)
  }, [])

  return (
    <View className="flex-1" style={{ backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

      
        <View style={{ height: 320 }}>
          <FlatList
            ref={flatListRef}
            data={product?.image}
            keyExtractor={(_, i) => String(i)}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            onMomentumScrollEnd={(e) => setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item: img }) => (
              <Image source={{ uri: img }} style={{ width, height: 320 }} contentFit="cover" />
            )}
          />

          <View
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)' }}
            pointerEvents="none"
          />

          <View
            className="absolute left-4 right-4 flex-row justify-between items-center"
            style={{ top: insets.top + 12 }}
          >
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
              <Ionicons name="arrow-back" size={20} color={C.white} />
            </Pressable>
            <View className="flex-row gap-2">
              <Pressable
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              >
                <Ionicons name="share-social-outline" size={20} color={C.white} />
              </Pressable>
              <Pressable
                onPress={() => setLiked(!liked)}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              >
                <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? C.neonPink : C.white} />
              </Pressable>
            </View>
          </View>

          <View className="absolute bottom-3 left-4">
            <View style={{ backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
              <Text className="text-white text-lg font-extrabold">{item.price}</Text>
            </View>
          </View>

          <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1">
            {images.map((_, index) => (
              <View
                key={index}
                style={{
                  width: activeImage === index ? 18 : 6,
                  height: 6, borderRadius: 3,
                  backgroundColor: activeImage === index ? C.accent : 'rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </View>
        </View>

     
        <View className="flex-row px-3 mt-4 gap-2">
          {product?.image.map((img, index) => (
            <Pressable key={index} onPress={() => scrollToImage(index)}>
              <Image
                source={{ uri: img }}
                style={[
                  { width: 58, height: 58, borderRadius: 10, backgroundColor: '#111' },
                  activeImage === index
                    ? { borderWidth: 2, borderColor: C.accent, transform: [{ scale: 1.05 }] }
                    :  { borderWidth:1,borderColor:'#2A2A2A',opacity:0.5,transform: [{ scale: 0.95 }] }
                ]}
                contentFit="cover"
              />
            </Pressable>
          ))}
        </View>

        <View className="px-4 mt-5">
          <View className="flex-row items-center gap-2 mb-2">
              <View className={` items-center justify-center rounded-xl border px-4 border-[#2A2A2A]  h-10 bg-[#1A1A1A]`}
                      >
                        <Text style={{fontWeight:800}}
                          className={`text-md  
                               text-[#B3B3B3]`}
                        >
                          {product?.category?.categoryName}
                        </Text>
                      </View>
            <View className={` items-center justify-center rounded-xl border border-[#2A2A2A] px-4 h-10 bg-[#1A1A1A]`}
                      >
                        <Text style={{fontWeight:800}}
                          className={`text-md  
                               text-[#B3B3B3]
                          `}
                        >
                          {product?.productConditionDto?.name}
                        </Text>
                      </View>
          </View>

          <Text className="text-white text-2xl font-extrabold">{item.title}</Text>

          <View className="flex-row items-center gap-3 mt-2">
            <View className="flex-row items-center gap-1">
              <FontAwesome name="star" size={12} color="#facc15" />
              <Text style={{ color: '#facc15', fontWeight: '700', fontSize: 13 }}>{item.rating}</Text>
              <Text style={{ color: C.muted, fontSize: 12 }}>({item.reviews})</Text>
            </View>
            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: C.muted }} />
            <View className="flex-row items-center gap-1">
              <Ionicons name="heart-outline" size={12} color={C.neonPink} />
              <Text style={{ color: C.textSec, fontSize: 12 }}>{item.saves} saves</Text>
            </View>
            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: C.muted }} />
            <View className="flex-row items-center gap-1">
              <Ionicons name="eye-outline" size={12} color={C.muted} />
              <Text style={{ color: C.muted, fontSize: 12 }}>{item.views} views</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2 mt-3">
            {item.tags.map((tag) => (
              <View key={tag} style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: C.textSec, fontSize: 12 }}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="my-4" style={{ height: 1, backgroundColor: C.surface }} />

        <View className="px-4">
          <Text style={{ color: C.textSec, fontSize: 11, fontWeight: '700', letterSpacing: 1 }} className="mb-2">
            ABOUT THIS ITEM
          </Text>
          <Text style={{ color: C.textSec, fontSize: 14, lineHeight: 22 }}>{item.description}</Text>
        </View>

        <View className="my-4" style={{ height: 1, backgroundColor: C.surface }} />

        <View className="px-4 pb-4">
          <Text style={{ color: C.textSec, fontSize: 11, fontWeight: '700', letterSpacing: 1 }} className="mb-3">
            SELLER
          </Text>
          <View className="flex-row items-center">
            <View style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: C.neonPink, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF2D7822', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.neonPink, fontWeight: '800', fontSize: 18 }}>{product?.sellerDto?.userName.charAt(0)}</Text>
              </View>
            </View>
            <View className="ml-3 flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-white font-bold text-[15px]">{product?.sellerDto?.userName}</Text>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="checkmark" size={9} color={C.white} />
                </View>
              </View>
              <Text style={{ color: C.muted, fontSize: 12 }} className="mt-0.5">
                Member since {item.userSince} · {item.reviews} sales
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                {[1,2,3,4,5].map((s) => (
                  <FontAwesome key={s} name="star" size={10} color={s <= 4 ? '#facc15' : C.muted} />
                ))}
                <Text style={{ color: C.textSec, fontSize: 12 }} className="ml-1">{item.rating}</Text>
              </View>
            </View>
            <Pressable style={{ borderWidth: 1, borderColor: C.accent, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
              <Text style={{ color: C.accent, fontSize: 12, fontWeight: '700' }}>Profile</Text>
            </Pressable>
          </View>
        </View>

        <View className="mx-4 mb-4 p-3 rounded-xl" style={{ backgroundColor: '#1DB95410', borderWidth: 1, borderColor: '#1DB95430' }}>
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="shield-checkmark-outline" size={14} color={C.green} />
            <Text style={{ color: C.green, fontSize: 12, fontWeight: '700' }}>Safety Tips</Text>
          </View>
          <Text style={{ color: C.muted, fontSize: 12, lineHeight: 18 }}>
            Meet in a public place · Inspect before paying · Never pay in advance
          </Text>
        </View>

      </ScrollView>


      <View
        className="absolute bottom-0 left-0 right-0 flex-row gap-2.5 px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 8, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.surface }}
      >
        <Pressable
          onPress={() => setActiveSheet('chat')}
          className="flex-1 flex-row items-center justify-center rounded-2xl p-4"
          style={{ backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border }}
        >
          <Ionicons name="chatbubble-outline" size={18} color={C.white} />
          <Text className="text-white font-bold ml-2">Chat</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveSheet('offer')}
          className="flex-[2] flex-row items-center justify-center rounded-2xl p-4"
          style={{ backgroundColor: C.accent }}
        >
          <MaterialCommunityIcons name="tag-outline" size={18} color={C.white} />
          <Text className="text-white font-extrabold ml-2  ">Make Offer</Text>
        </Pressable>
      </View>

      {activeSheet === 'chat' && (
        <ChatBottomSheet
          ref={chatRef}
        />
      )}
      {activeSheet === 'offer' && (
        <MakeOfferBottomSheet
          ref={offerRef}
          listedPrice={65000}
          onClose={() => setActiveSheet(null)}
        />
      )}
    </View>
  )
}