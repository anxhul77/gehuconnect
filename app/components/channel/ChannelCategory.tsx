import { View, Text, Pressable } from 'react-native'
import React, { useState } from 'react'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'


interface ChannelCategoryProps {
  items: any
  onToggle?: (categoryId: string) => void
  collaspedSet?: Set<string>
  editable?: boolean
  communityId?: string
  idx?: number,
  reorder?: "TEXT" | "CATEGORY" | "VOICE" | null
}

export default function ChannelCategory({ items, onToggle, collaspedSet, editable = false, communityId, idx, reorder }: ChannelCategoryProps) {
  const router = useRouter()



  return (

    <View className='flex-1  flex-row justify-between '>
      <Pressable
        disabled={editable}
        onPress={() => onToggle(items.categoryId)}
        className="flex-row items-center px-1 pt-3 pb-2"
      >
        {!editable &&
          <Ionicons
            name="chevron-down"
            size={18}
            color="#999"
            style={{
              transform: [
                { rotate: collaspedSet!.has(items.categoryId) ? "-90deg" : "0deg" }
              ],
              marginRight: 6
            }}
          />}

        <Text className="text-white/60 font-bold text-md">
          {items?.categoryName}
        </Text>

      </Pressable>

      {
        (editable && reorder === null) ? <Pressable onPress={() => {
          router.push({
            pathname: `/components/community/settings/channels/settings/categorySettings/${communityId}`,
            params: { items: JSON.stringify({ name: items.categoryName, type: items.type, id: items.categoryId, idx: idx }) },
          })
        }} className='flex-1 flex-row items-center px-1 pt-3 pb-2 justify-end'>
          <Text className='text-white/30 font-semibold text-md '>Edit</Text >
        </Pressable> : reorder == "CATEGORY" ? <View className='flex justify-center items-center'><MaterialIcons name="drag-indicator" size={20} color="white" /></View> : null

      }


    </View>

  )
}