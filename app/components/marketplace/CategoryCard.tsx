import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Category } from '@/src/types/types'
interface CategoryItem{
  item:{
    categoryId:string
    categoryName:string
  }
  selectedCategory: string | null
  setSelectedCategory: (id: string | null) => void
}
export default function CategoryCard({item, selectedCategory, setSelectedCategory}:CategoryItem) {
  const selected =
  item.categoryName === "All"
    ? selectedCategory === null
    : selectedCategory === item.categoryName;
  function handleOnPress(){
     if(item.categoryName === "All"){
     setSelectedCategory(null);
  }else{
     setSelectedCategory(item.categoryName);
  }
    
  }
  return (
  <Pressable
            key={item?.categoryId}
            onPress={handleOnPress}
            style={({ pressed }) => [
              { opacity: pressed ? 0.8 : 1 },
              
            ]}
            className={`mr-2 px-4 py-2 rounded-full border bg-[#FF4D4D"] ${
                 selected
                ? "border-transparent"
                : "bg-zinc-900/50 border-white/5"
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                  selected ? "text-white" : "text-zinc-400"
              }`}
            >
              {item?.categoryName}
            </Text>
          </Pressable>
  )
}