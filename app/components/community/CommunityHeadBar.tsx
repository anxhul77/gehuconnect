import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function CommunityHeadBar({ name, onClick }: { name: any, onClick: () => void }) {


  return (
    <View className="border-b border-white/10 px-6 pb-4  pt-4 ">
      <Pressable className='flex-row  gap-2' onPress={onClick}>
        <Text className="text-white font-bold text-2xl mb-3">
          {name}
        </Text>
        <Fontisto name="angle-right" className='mt-4' size={10} color="gray" />
      </Pressable>

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