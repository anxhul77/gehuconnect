import CampusCommerceHeader from "@/app/components/CampusCommerceHeader";
import CategoryCard from "@/app/components/marketplace/CategoryCard";
import CategoryCardLoader from "@/app/components/marketplace/CategoryCardLoader";
import FIlterCard from "@/app/components/marketplace/FilterCard";
import ItemCard from "@/app/components/marketplace/ItemCard";
import ItemCardLoader from "@/app/components/marketplace/ItemCardLoader";
import { useGetCategoriesQuery } from "@/src/features/category.api";
import { useGetProductsQuery } from "@/src/features/marketplace.api";

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ScrollView,
} from "react-native";

const HEADER_HEIGHT = 150;

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [sort, setSort] = useState<{ order: string | null; by: string | null }>(
    {
      order: null,
      by: null,
    }
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const scrollY = useRef(new Animated.Value(0)).current;

  const diffClampScrollY = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);

  const headerTranslate = diffClampScrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryParams = useMemo(
    () => ({
      cursor: "0",
      limit: 20,
      category: selectedCategory ?? undefined,
      keyword: debouncedSearch || undefined,
      sortBy: sort.by ?? undefined,
      sortOrder: sort.order ?? undefined,
    }),
    [selectedCategory, debouncedSearch, sort]
  );

  const { data: categories ,isLoading:categoryLoading} = useGetCategoriesQuery();

  const { data: products, isLoading: productsLoading } =
    useGetProductsQuery(queryParams);
 
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <Animated.View
        style={[styles.header, { transform: [{ translateY: headerTranslate }] }]}
      >
        <CampusCommerceHeader headerHeight={HEADER_HEIGHT} />
      </Animated.View>

      <Animated.FlatList
        data={productsLoading ? [...Array(6)] : products?.content}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        keyExtractor={(item, index) =>
          productsLoading ? index.toString() : item.productId.toString()
        }
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + 10,
          paddingBottom: 100,
          paddingHorizontal: 16,
          gap: 20,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        renderItem={({ item }) =>
          productsLoading ? <ItemCardLoader /> : <ItemCard item={item} />
        }
        ListHeaderComponent={
          <>
            <View
              style={styles.searchBox}
              className="bg-[#1A1A1A] border border-[#2A2A2A]"
            >
              <Ionicons name="search" size={20} color="#B3B3B3" />

              <TextInput
                placeholder="Search products..."
                placeholderTextColor="#B3B3B3"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#71717a" />
                </Pressable>
              )}
            </View>
            <View className="flex-row h-12">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginHorizontal: 32, paddingHorizontal: 16 }}
              >
                <View style={{ flexDirection: "row", gap: 8 }}>
                 {!categoryLoading && <CategoryCard
                    item={{
                      categoryId: "0",
                      categoryName: "All",
                    }}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                  />}

                  {!categoryLoading ? categories?.content?.map((item) => (
                    <CategoryCard
                      key={item.categoryId}
                      item={item}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                    />
                  )):<>
                 {[...Array(3)].map(()=>(<CategoryCardLoader></CategoryCardLoader>))}
                  </>}
                </View>
              </ScrollView>

              <FIlterCard sort={sort} onSortChange={setSort} />
            </View>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    height: HEADER_HEIGHT,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "black",
    zIndex: 1000,
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    marginBottom: 16,
  },

  searchInput: {
    color: "white",
    marginLeft: 10,
    flex: 1,
    fontWeight: "500",
  },

  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});