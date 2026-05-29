import { View, Text, Pressable, ActivityIndicator, ScrollView, FlatList } from 'react-native'
import React, { useState, useCallback, useEffect } from 'react'
import { TextInput } from 'react-native-gesture-handler'
import { AntDesign } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { FlashList } from '@shopify/flash-list'

import { useGetFeedPostsQuery } from '@/src/features/feed.api'
import { useGetCommunitiesQuery } from '@/src/features/community.api'
import { useGetProductsQuery } from '@/src/features/marketplace.api'
import { CommunitySortType, CommunityCardDto, ProductCardResponse, CommunityPost } from '@/src/types/types'

import Feedpostcard from '@/app/components/Feedpostcard'
import ItemCard from '@/app/components/marketplace/ItemCard'
import CommunityCard from '@/app/components/community/CommunityCard'

const TABS = ['Posts', 'Communities', 'Marketplace', 'Academics'] as const;
type TabKey = typeof TABS[number];

const POST_LIMIT = '10';
const COMMUNITY_LIMIT = 16;
const PRODUCT_LIMIT = 20;

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('Posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const hasQuery = debouncedSearch.length > 0;


  const [postCursor, setPostCursor] = useState('');
  const {
    data: postsData,
    isLoading: postsLoading,
    isFetching: postsFetching,
    error: postsError
  } = useGetFeedPostsQuery(
    {
      feedtype: 'LATEST',
      cursor: postCursor,
      keyword: debouncedSearch,
      courseId: '',
      limit: POST_LIMIT,
    },
    { skip: !hasQuery }
  );

  const posts = postsData?.communityPosts ?? [];

  const loadMorePosts = useCallback(() => {
    if (postsData?.hasNext && !postsFetching && postsData.nextCursor !== postCursor) {
      setPostCursor(postsData.nextCursor);
    }
  }, [postsData, postsFetching, postCursor]);


  useEffect(() => {
    setPostCursor('');
  }, [debouncedSearch]);


  const [commCursor, setCommCursor] = useState<string | undefined>(undefined);

  const {
    data: commData,
    isLoading: commLoading,
    isFetching: commFetching,
    error
  } = useGetCommunitiesQuery(
    {
      limit: COMMUNITY_LIMIT,
      cursor: commCursor,
      keyword: debouncedSearch || undefined,
      communitySortType: CommunitySortType.SCORE,
    },
    { skip: !hasQuery }
  );

  const communities = commData?.communities ?? [];

  const loadMoreComm = useCallback(() => {
    if (commData?.hasNext && !commFetching && commData.cursor !== commCursor) {
      setCommCursor(commData.cursor);
    }
  }, [commData, commFetching, commCursor]);

  useEffect(() => {
    setCommCursor(undefined);
  }, [debouncedSearch]);


  const [productCursor, setProductCursor] = useState<string | null>('0');

  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching: productsFetching,
    error: productsError
  } = useGetProductsQuery(
    {
      cursor: productCursor,
      limit: PRODUCT_LIMIT,
      keyword: debouncedSearch || undefined,
    },
    { skip: !hasQuery }
  );

  const products = productsData?.products ?? [];


  const loadMoreProducts = useCallback(() => {
    if (productsData?.hasNext && !productsFetching && productsData.nextCursor !== productCursor) {
      setProductCursor(productsData.nextCursor);
    }
  }, [productsData, productsFetching, productCursor]);

  useEffect(() => {
    setProductCursor('0');
  }, [debouncedSearch]);

  const renderPostItem = useCallback(
    ({ item }: { item: any }) => <Feedpostcard post={item} />,
    []
  );

  const renderCommunityItem = useCallback(
    ({ item }: { item: CommunityCardDto }) => (
      <CommunityCard
        id={item.communityId}
        name={item.communityName}
        category={item.tags?.[0] || 'General'}
        memberCount={(item.memberCount ?? 0).toString()}
        imageUrl={item.avatarUrl}
        isJoined={item.isJoined}
        tags={item.tags}
        isGrid={true}
      />
    ),
    []
  );

  const renderProductItem = useCallback(
    ({ item }: { item: ProductCardResponse }) => <ItemCard item={item} />,
    []
  );

  const renderFooter = (fetching: boolean) =>
    fetching ? (
      <View className="py-6 items-center">
        <ActivityIndicator size="small" color="#888" />
      </View>
    ) : null;

  const renderEmpty = (label: string, loading: boolean) =>
    !loading ? (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-[#666] text-sm">No {label} found</Text>
      </View>
    ) : null;

  const renderLoading = () => (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size="large" color="#888" />
    </View>
  );

  const renderPrompt = () => (
    <View className="flex-1 items-center justify-center py-20">
      <AntDesign name="search1" size={40} color="#444" />
      <Text className="text-[#555] text-sm mt-4">Type to search</Text>
    </View>
  );

  const renderTabContent = () => {
    if (!hasQuery) return renderPrompt();

    switch (activeTab) {
      case 'Posts':
        if (postsLoading && posts.length === 0) return renderLoading();
        return (
          <FlashList
            data={posts}
            estimatedItemSize={200}
            keyExtractor={(item) => item.postId.toString()}
            renderItem={renderPostItem}
            onEndReached={loadMorePosts}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter(postsFetching)}
            ListEmptyComponent={renderEmpty('posts', postsLoading)}
          />
        );

      case 'Communities':
        if (commLoading && communities.length === 0) return renderLoading();
        return (
          <FlatList
            data={communities}
            numColumns={2}
            keyExtractor={(item) => item.communityId.toString()}
            renderItem={renderCommunityItem}
            onEndReached={loadMoreComm}
            onEndReachedThreshold={0.5}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, paddingTop: 10 }}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            ListFooterComponent={renderFooter(commFetching)}
            ListEmptyComponent={renderEmpty('communities', commLoading)}
          />
        );

      case 'Marketplace':
        if (productsLoading && products.length === 0) return renderLoading();
        return (
          <FlatList
            data={products}
            numColumns={2}
            keyExtractor={(item) => item.productId.toString()}
            renderItem={renderProductItem}
            onEndReached={loadMoreProducts}
            onEndReachedThreshold={0.5}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, paddingTop: 10 }}
            ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
            ListFooterComponent={renderFooter(productsFetching)}
            ListEmptyComponent={renderEmpty('products', productsLoading)}
          />
        );

      case 'Academics':
        return (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-[#666] text-sm">Coming soon</Text>
          </View>
        );
    }
  };

  return (
    <View className='flex-1'>

      <View className="h-24 bg-[#2A2A2A] ">
        <View className="flex-row ml-3 mt-1 items-center " style={{ paddingTop: insets.top }}>
          <Pressable onPress={() => router.back()}>
            <AntDesign name="arrow-left" size={22} color="#B3B3B3" />
          </Pressable>

          <TextInput
            className="flex-1  text-white text-[#B3B3B3] text-lg ml-3"
            placeholder='What do you want to explore ? '
            placeholderTextColor="#B3B3B3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

        </View>

      </View>


      <View className="bg-black h-20 justify-center" style={{ borderBottomWidth: 0.5, borderBottomColor: '#333' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 16 }}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="px-6 py-3 mr-2"
              style={{
                borderBottomWidth: activeTab === tab ? 2 : 0,
                borderBottomColor: activeTab === tab ? '#fff' : 'transparent',
              }}
            >
              <Text
                style={{
                  color: activeTab === tab ? '#fff' : '#666',
                  fontSize: 14,
                  fontWeight: activeTab === tab ? '800' : '700',
                }}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>


      <View className="flex-1 bg-black">
        {renderTabContent()}
      </View>

    </View>
  )
}