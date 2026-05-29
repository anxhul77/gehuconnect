import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Feather, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'


export default function ChannelCard({ item, communityId }: { item: any, communityId: string | undefined }) {
  const router = useRouter()

  console.log(item)
  function handleOnChannelPress() {
    router.push({
      pathname: `/channels/${item?.id}`,
      params: { name: item?.name, communityId: communityId }
    }
    )
  }
  return (
    <Pressable onPress={() => handleOnChannelPress()} className='flex-row items-center ml-4 h-8 gap-3 mb-2 '>
      <Feather name="hash" size={20} color="gray" />
      <Text className='text-white/80 '>{item?.name}</Text>
    </Pressable>
  )
}