import { View, Text } from 'react-native'
import React from 'react'

export default function MessageBubble(items:{item:any}) {
  console.log("messagebubleitem",items)
  
  return (
    <View className='p-2 border-t justify-center'>
      <View className='flex-row gap-4 items-center '>
      <View className='border border-white rounded-full w-12 h-12'></View>
      <Text className='text-white font-bold'>{items?.item?.senderName}</Text>
      </View>
      <Text className='text-white ml-16'>{items?.item?.content}</Text>
    </View>
  )
}