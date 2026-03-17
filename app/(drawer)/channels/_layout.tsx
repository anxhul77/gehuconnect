import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Stack, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChannelHeader } from '@/app/components/channel/ChannelHeader'

const HEADER_HEIGHT = 120

export default function Layout() {
  return (
    <Stack
      screenOptions={{
      
      headerShown:false
      }}
    >
      <Stack.Screen name="[channelId]" />
    </Stack>
  )
}

