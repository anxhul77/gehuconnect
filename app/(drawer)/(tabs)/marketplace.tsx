import CampusCommerceHeader from "@/app/components/CampusCommerceHeader";
import CategoryCard from "@/app/components/marketplace/CategoryCard";
import ItemCard from "@/app/components/marketplace/ItemCard";
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
  ScrollView
} from "react-native";

const HEADER_HEIGHT = 170;

export default function Marketplace() {

  const [selectedCategory,setSelectedCategory]=useState<string | null>(null);
  const [searchQuery,setSearchQuery]=useState("");
  const [debouncedSearch,setDebouncedSearch]=useState("");

  const scrollY = useRef(new Animated.Value(0)).current;

  const diffClampScrollY = Animated.diffClamp(scrollY,0,HEADER_HEIGHT);

  const headerTranslate = diffClampScrollY.interpolate({
    inputRange:[0,HEADER_HEIGHT],
    outputRange:[0,-HEADER_HEIGHT]
  });

 
  useEffect(()=>{

    const timer=setTimeout(()=>{
      setDebouncedSearch(searchQuery.trim());
    },500);

    return ()=>clearTimeout(timer);

  },[searchQuery]);

  
  const queryParams = useMemo(()=>({

    cursor:"0",
    limit:20,
    category:selectedCategory ?? undefined,
    keyword:debouncedSearch || undefined

  }),[selectedCategory,debouncedSearch]);

  const {
    data:categories,
    isLoading:categoryLoading
  } = useGetCategoriesQuery();

  const {
    data:products,
    isLoading:productsLoading
  } = useGetProductsQuery(queryParams);

  return (

    <View style={{flex:1,backgroundColor:"black"}}>
      <Animated.View
        style={[
          styles.header,
          {transform:[{translateY:headerTranslate}]}
        ]}
      >
        <CampusCommerceHeader headerHeight={HEADER_HEIGHT}/>
      </Animated.View>
      <Animated.FlatList  data={products?.content} numColumns={2} keyExtractor={(item)=>item.productId.toString()}
     columnWrapperStyle={{gap:12}}
         contentContainerStyle={{
          paddingTop:HEADER_HEIGHT+10,
          paddingBottom:100,
          paddingHorizontal:16,
          gap:20
        }}

        onScroll={Animated.event(
          [{nativeEvent:{contentOffset:{y:scrollY}}}],
          {useNativeDriver:true}
        )}

        scrollEventThrottle={16}

        renderItem={({item})=>(
          <ItemCard item={item}/>
        )}

        ListHeaderComponent={
          <>

          <View style={{marginBottom:12}}>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >

              <CategoryCard
                item={{
                  categoryId:"0",
                  categoryName:"All"
                }}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />

              {categories?.content?.map((item)=>(
                <CategoryCard
                  key={item.categoryId}
                  item={item}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              ))}

            </ScrollView>

          </View>

          <View style={styles.searchBox}>

            <Ionicons
              name="search"
              size={20}
              color="#71717a"
            />
            <TextInput
              placeholder="Search products..."
              placeholderTextColor="#71717a"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}

            />

            {searchQuery.length>0 && (

              <Pressable
                onPress={()=>setSearchQuery("")}
              >

                <Ionicons
                  name="close-circle"
                  size={20}
                  color="#71717a"
                />

              </Pressable>

            )}

          </View>

          </>

        }

      />

    </View>

  );

}

const styles = StyleSheet.create({

  header:{
    position:"absolute",
    height:HEADER_HEIGHT,
    top:0,
    left:0,
    right:0,
    backgroundColor:"black",
    zIndex:1000,
    justifyContent:"center",
    paddingHorizontal:10
  },

  searchBox:{
    backgroundColor:"#18181b",
    flexDirection:"row",
    alignItems:"center",
    paddingHorizontal:16,
    paddingVertical:8,
    borderRadius:16,
    marginBottom:8,
    borderWidth:1,
    borderColor:"#27272a"
  },

  searchInput:{
    color:"white",
    marginLeft:10,
    flex:1,
    fontWeight:"500"
  }

});