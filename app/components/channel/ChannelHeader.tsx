import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Feather, Ionicons } from '@expo/vector-icons'

export  const ChannelHeader= ({
  name,
  online,
}: {
  name: string
  online: number
}) => {

  const router = useRouter()

  return (
    <View
      
      className="w-full h-16 flex-row border-b border-white/20 px-4 bg-black items-center  gap-5 "
    >
      <Pressable onPress={() => router.back()} className=" items-start align-start ">
        <Ionicons name="arrow-back" color="white" size={24} />
      </Pressable>
      <View className='flex-row justify-center items-center gap-2'>
       <Feather name="hash" size={24} color="white"  />
     <View className=' items-center'>
      
      <Text className="font-bold text-xl text-white">{name}</Text>
      <Text className="text-xs text-gray-400">{online} online</Text>
      </View>
      </View>
    </View>
  )
}

