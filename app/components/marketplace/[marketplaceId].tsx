import { FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MarketplaceActionSheet from "./MarketplaceActionSheet";

import { useGetProductConditionsQuery, useGetProductCurousalQuery, useLikeProductMutation } from "@/src/features/marketplace.api";


const { width } = Dimensions.get("window");

const C = {
  bg: '#0A0A0A', surface: '#1A1A1A', surface2: '#242424', border: '#2A2A2A',
  accent: '#FF6B35', neonPink: '#FF2D78', green: '#1DB954',
  white: '#FFFFFF', muted: '#535353', textSec: '#B3B3B3',
}



export default function ListingDetailScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { product: productRaw } = useLocalSearchParams();
  const product = typeof productRaw === 'string' ? JSON.parse(productRaw) : productRaw;
  const [activeImage, setActiveImage] = useState(0)
  const [activeSheet, setActiveSheet] = useState<'chat' | 'offer' | null>(null)
  const [isExpanded, setIsExpanded] = useState(false);
  const [likeProduct] = useLikeProductMutation();
  const [liked, setLiked] = useState(product?.isLiked || false);
  const [likeCount, setLikeCount] = useState(Number(product?.likeCount || 0));

  const flatListRef = useRef<FlatList>(null)
  const bottomSheetRef = useRef<BottomSheet>(null)

  const { data: productData, error: productError, isLoading: ProductLoading } = useGetProductCurousalQuery({ productId: product?.productId });
  const displayPrice = product?.specialPrice || product?.price;
  const originalPrice = product?.price;
  const discount = product?.discount || 0;
  const displayTitle = product?.productName;
  const displayDescription = productData?.description;
  const displayTags = product?.productTags || [];
  const displayViews = product?.seenCount || 0;
  const displayLikes = product?.likeCount || 0;
  const displayRating = product?.rating || "4.5";
  const displayReviews = product?.reviews || "0";
  const displayCategory = product?.category?.categoryName || product?.category;
  const displayCondition = product?.productCondition;
  const displaySellerName = product?.sellerDto?.userName;
  const displayUserSince = product?.sellerDto?.userSince || "2024";
  const displaySales = product?.sellerDto?.sales || "0";
  const isNegotiable = product?.isNegotitable;
  const isUrgent = product?.isUrgentSale;
  const productImages = [
    ...(product?.coverImage ? [product.coverImage] : []),
    ...(productData?.productImageUrls || [])
  ]
  console.log(productData, productImages)
  useEffect(() => {
    if (activeSheet) {
      const t = setTimeout(() => bottomSheetRef.current?.snapToIndex(0), 50)
      return () => clearTimeout(t)
    } else {
      bottomSheetRef.current?.close()
    }
  }, [activeSheet])

  const scrollToImage = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true })
    setActiveImage(index)
  }, [])

  const handleLike = async () => {
    const previousLiked = liked;
    const previousCount = likeCount;

    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);

    try {
      await likeProduct(product.productId).unwrap();
    } catch (error) {
      setLiked(previousLiked);
      setLikeCount(previousCount);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>


        <View style={{ height: 320 }}>
          <FlatList
            ref={flatListRef}
            data={productImages}
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
                onPress={handleLike}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              >
                <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? C.neonPink : C.white} />
              </Pressable>
            </View>
          </View>

          <View className="absolute bottom-3 left-4">
            <View style={{ backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
              <Text className="text-white text-xl font-black">₹{displayPrice}</Text>
            </View>
          </View>

          <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1">

          </View>
        </View>


        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }} style={{ marginTop: 16, flexGrow: 0 }}>
          {productImages.map((img: string, index: number) => (
            <Pressable key={index} onPress={() => scrollToImage(index)}>
              <Image
                source={{ uri: img }}
                style={[
                  { width: 58, height: 58, borderRadius: 10, backgroundColor: '#111' },
                  activeImage === index
                    ? { borderWidth: 2, borderColor: C.accent, transform: [{ scale: 1.05 }] }
                    : { borderWidth: 1, borderColor: '#2A2A2A', opacity: 0.5, transform: [{ scale: 0.95 }] }
                ]}
                contentFit="cover"
              />
            </Pressable>
          ))}
          {ProductLoading && (
            <>
              <View style={{ width: 58, height: 58, borderRadius: 10, backgroundColor: '#2A2A2A', opacity: 0.5 }} />
              <View style={{ width: 58, height: 58, borderRadius: 10, backgroundColor: '#2A2A2A', opacity: 0.5 }} />
              <View style={{ width: 58, height: 58, borderRadius: 10, backgroundColor: '#2A2A2A', opacity: 0.5 }} />
            </>
          )}
        </ScrollView>

        <View className="px-4 mt-5">
          <View className="flex-row flex-wrap items-center gap-2 mb-3">
            {displayCategory && (
              <View className="flex-row items-center justify-center rounded-xl border px-3 h-9 bg-[#3b82f615] border-[#3b82f630] gap-1.5">
                <MaterialCommunityIcons name="tag-outline" size={14} color="#3b82f6" />
                <Text style={{ fontWeight: '800' }} className="text-sm text-[#3b82f6]">
                  {displayCategory}
                </Text>
              </View>
            )}
            {isNegotiable && (
              <View className="flex-row items-center justify-center rounded-xl border px-3 h-9 bg-[#10b98115] border-[#10b98130] gap-1.5">
                <MaterialCommunityIcons name="handshake-outline" size={14} color="#10b981" />
                <Text style={{ fontWeight: '800' }} className="text-sm text-[#10b981]">
                  Negotiable
                </Text>
              </View>
            )}
            {isUrgent && (
              <View className="flex-row items-center justify-center rounded-xl border px-3 h-9 bg-[#ef444415] border-[#ef444430] gap-1.5">
                <MaterialCommunityIcons name="fire" size={14} color="#ef4444" />
                <Text style={{ fontWeight: '800' }} className="text-sm text-[#ef4444]">
                  Urgent
                </Text>
              </View>
            )}
          </View>

          <Text className="text-white text-2xl font-black">{displayTitle}</Text>

          {discount > 0 ? (
            <View className="flex-row items-center gap-3 mt-2">
              <Text className="text-white text-3xl font-black">₹{displayPrice}</Text>
              <Text className="text-zinc-500 text-lg font-bold line-through">₹{originalPrice}</Text>
              <View className="bg-green-500/20 px-2 py-1 rounded-lg">
                <Text className="text-green-500 font-black text-xs">{discount}% OFF</Text>
              </View>
            </View>
          ) : (
            <Text className="text-white text-3xl font-black mt-2">₹{displayPrice}</Text>
          )}

          <View className="flex-row items-center gap-3 mt-3">
            <View className="flex-row items-center gap-1.5">
              <FontAwesome name="star" size={12} color="#facc15" />
              <Text style={{ color: '#facc15', fontWeight: '800', fontSize: 14 }}>{displayRating}</Text>
              <Text style={{ color: C.muted, fontSize: 13 }}>({displayReviews})</Text>
            </View>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.muted }} />
            <View className="flex-row items-center gap-1.5">
              <Ionicons name={liked ? "heart" : "heart-outline"} size={13} color={C.neonPink} />
              <Text style={{ color: C.textSec, fontSize: 13, fontWeight: '600' }}>{likeCount} likes</Text>
            </View>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.muted }} />
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="eye" size={14} color={C.muted} />
              <Text style={{ color: C.muted, fontSize: 13, fontWeight: '600' }}>{displayViews} views</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2 mt-4">
            {displayTags.map((tag: any, idx: number) => {
              const tagName = tag && typeof tag === 'object' ? tag.productTagName : tag;
              if (!tagName) return null;
              return (
                <View key={idx} style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ color: C.textSec, fontSize: 12, fontWeight: '600' }}>#{tagName}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className="my-4" style={{ height: 1, backgroundColor: C.surface }} />

        <View className="px-4">
          <Text style={{ color: C.textSec, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 }} className="mb-2">
            CONDITION
          </Text>
          <View className="bg-[#1A1A1A] px-4 py-3 rounded-xl border border-[#2A2A2A]">
            <Text className="text-white font-bold text-base">{displayCondition}</Text>
          </View>
        </View>

        <View className="my-4" style={{ height: 1, backgroundColor: C.surface }} />

        <View className="px-4">
          <Text style={{ color: C.textSec, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 }} className="mb-3">
            ABOUT THIS ITEM
          </Text>
          {ProductLoading && !displayDescription ? (
            <View>
              <View style={{ height: 16, backgroundColor: '#2A2A2A', borderRadius: 4, width: '100%', marginBottom: 8 }} />
              <View style={{ height: 16, backgroundColor: '#2A2A2A', borderRadius: 4, width: '100%', marginBottom: 8 }} />
              <View style={{ height: 16, backgroundColor: '#2A2A2A', borderRadius: 4, width: '80%' }} />
            </View>
          ) : (
            <>
              <Text style={{ color: C.textSec, fontSize: 15, lineHeight: 24 }}>
                {isExpanded ? displayDescription : (displayDescription?.length > 180 ? `${displayDescription.slice(0, 180)}...` : displayDescription)}
              </Text>
              {displayDescription?.length > 180 && (
                <Pressable onPress={() => setIsExpanded(!isExpanded)} className="mt-2">
                  <Text style={{ color: C.accent, fontWeight: '800', fontSize: 14 }}>
                    {isExpanded ? 'Show less' : 'Read more'}
                  </Text>
                </Pressable>
              )}
            </>
          )}
        </View>

        <View className="my-4" style={{ height: 1, backgroundColor: C.surface }} />

        <View className="px-4 pb-4">
          <Text style={{ color: C.textSec, fontSize: 11, fontWeight: '700', letterSpacing: 1 }} className="mb-3">
            SELLER
          </Text>
          <View className="flex-row items-center">
            <View style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: C.neonPink, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF2D7822', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.neonPink, fontWeight: '800', fontSize: 18 }}>{displaySellerName.charAt(0)}</Text>
              </View>
            </View>
            <View className="ml-3 flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-white font-bold text-[15px]">{displaySellerName}</Text>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="checkmark" size={9} color={C.white} />
                </View>
              </View>
              <Text style={{ color: C.muted, fontSize: 12 }} className="mt-0.5">
                Member since {displayUserSince} · {displaySales} sales
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FontAwesome key={s} name="star" size={10} color={s <= 4 ? '#facc15' : C.muted} />
                ))}
                <Text style={{ color: C.textSec, fontSize: 12 }} className="ml-1">{displayRating}</Text>
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
          disabled={ProductLoading}
          onPress={() => {
            if (productData?.chatId) {
              router.push({
                pathname: '/components/marketplace/ChatPage',
                params: { chatId: productData.chatId }
              });
            } else {
              setActiveSheet('chat');
            }
          }}
          className="flex-1 flex-row items-center justify-center rounded-2xl p-4"
          style={{ backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, opacity: ProductLoading ? 0.5 : 1 }}
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

      <MarketplaceActionSheet
        chatId={productData?.chatId}
        ref={bottomSheetRef}
        activeSheet={activeSheet}
        onClose={() => setActiveSheet(null)}
        listedPrice={Number(product?.price) || 0}
        productId={product?.productId}
        insets={insets}
      />
    </View>
  )
}