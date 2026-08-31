import { View, Text, Pressable, LayoutAnimation, Keyboard } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { TextInput } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

export default function AcadmicsHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter()


  const handleBackArrow = () => {
    router.back()
  }
  return (
    <View
      className=" px-4 flex-row items-center  "
      style={{ paddingTop: insets.top + 8, height: 90 }}
    >

      <Pressable onPress={handleBackArrow} className="mb-4 mr-4">
        <Ionicons name="arrow-back" color="gray" size={22} />
      </Pressable>

      <View className="flex-1 flex-row items-center justify-between mb-4">

        <View style={{ flex: 1 }}>
          <Text className="text-white text-2xl font-black">
            Academics
          </Text>
          <Text className="text-zinc-500 text-xs">
            Community-driven resources
          </Text>
        </View>



      </View>
    </View>

  )
}