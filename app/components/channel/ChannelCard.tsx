import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'


export default function ChannelCard({ item, communityId, handleOnChannelPress, idx, isReorderEnabled }: { item: any, communityId: string | undefined, handleOnChannelPress: (item: any, idx: number) => void, idx: number, isReorderEnabled: boolean }) {


  return (
    <Pressable disabled={isReorderEnabled} onPress={() => handleOnChannelPress(item, idx)} className='flex-row items-center ml-4 h-8  mb-2 justify-between  '>
      <View className='flex-row items-center gap-3'>
        {item.channelType !== "VOICE" &&
          <Feather name="hash" size={20} color="gray" />

        }
        {item.channelType === "VOICE" && <Ionicons name="volume-high" size={20} color="gray" />}
        <Text className='text-white/80 '>{item?.channelName}</Text>
      </View>
      {isReorderEnabled && (
        <MaterialIcons name="drag-indicator" size={20} color="white" />
      )}
    </Pressable>
  )
}