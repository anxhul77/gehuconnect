import { View, Text, Pressable } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import Collapsible from 'react-native-collapsible'
import { FlatList } from 'react-native-gesture-handler'
import ChannelCard from './ChannelCard'
interface ChannelCategoryProps{
  
  items:any
  
}
export default function ChannelCategory({items}:ChannelCategoryProps) {
   const [collapsed, setCollapsed] = useState(false); 
  
  return (
    <>
    <Pressable
  onPress={() => setCollapsed(prev => !prev)}
  className="flex-row items-center px-1 pt-3 pb-2"
>
  <Ionicons
    name="chevron-down"
    size={18}
    color="#999"
    style={{
      transform: [{ rotate: collapsed ? "180deg" : "0deg" }],
      marginRight: 6,
    }}
  />
  <Text className="text-white/60 font-bold text-md">
    {items?.item.name}
  </Text>
</Pressable>
  <Collapsible collapsed={collapsed}>
          <FlatList
            data={items?.item?.channels}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <ChannelCard item={item} />
            )}
          />
        </Collapsible>
         </> 

  )
}