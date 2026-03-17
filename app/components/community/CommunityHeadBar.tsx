import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'

export default function CommunityHeadBar({ name }: { name: any }) {
  return (
    <View className="border-b border-white/10 px-6 pb-4  pt-4 ">
          <Text className="text-white font-bold text-2xl mb-3">
            {name}
          </Text>
          <View className=" flex-row  gap-4 items-center "> 
          <Pressable className="flex-1 bg-[#1F1F1F] rounded-3xl h-10 justify-center items-center flex-row w-24 gap-1">
            <Ionicons name="search" size={18} color="#999" />
            <Text className=" text-[#999] ">Search</Text>
          </Pressable>
          <Pressable className="bg-[#1F1F1F] flex rounded-full justify-center items-center p-1 w-10 h-10">
   <MaterialIcons name="person-add-alt-1" size={20} color="#999" />
         </Pressable>
         </View>
         </View>
  )
}