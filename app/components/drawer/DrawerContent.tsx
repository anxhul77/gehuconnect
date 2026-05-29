import { View, Text, Pressable, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, AntDesign, SimpleLineIcons } from '@expo/vector-icons'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import CommunityRail from '../community/CommunityRail'

export default function DrawerContent() {
  const [isCommunitiesExpanded, setIsCommunitiesExpanded] = useState(true)
  const router = useRouter()

  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: withTiming(isCommunitiesExpanded ? '90deg' : '0deg', { duration: 200 }) }
      ]
    }
  })

  return (
    <SafeAreaView className="flex-1 bg-[#1A1A1C]" edges={['top', 'bottom']}>
      <ScrollView className="flex-1 pt-2" showsVerticalScrollIndicator={false}>

        {/* Profile / Header Section */}
        <View className="px-4 py-4 border-b border-white/10 mb-2">
          <Text className="text-white text-xl font-bold">GehuConnect</Text>
        </View>

        {/* Standard Links */}
        <Pressable
          className="flex-row items-center py-3 px-4 active:bg-white/10"
          onPress={() => router.push('/(drawer)/(tabs)/home')}
        >
          <AntDesign name="home" size={22} color="#fff" />
          <Text className="text-white ml-4 text-[15px] font-medium">Home</Text>
        </Pressable>

        <Pressable
          className="flex-row items-center py-3 px-4 active:bg-white/10"
          onPress={() => router.push('/(drawer)/(tabs)/profile')}
        >
          <AntDesign name="user" size={22} color="#fff" />
          <Text className="text-white ml-4 text-[15px] font-medium">Profile</Text>
        </Pressable>

        <Pressable
          className="flex-row items-center py-3 px-4 active:bg-white/10"
          onPress={() => router.push('/offers')}
        >
          <MaterialIcons name="local-offer" size={22} color="#fff" />
          <Text className="text-white ml-4 text-[15px] font-medium">Offers</Text>
        </Pressable>

        <View className="h-[1px] bg-white/10 my-2 mx-4" />

        {/* Communities Accordion Header */}
        <Pressable
          className="flex-row items-center justify-between py-3 px-4 active:bg-white/5"
          onPress={() => setIsCommunitiesExpanded(!isCommunitiesExpanded)}
        >
          <View className="flex-row items-center">
            <Animated.View style={chevronStyle}>
              <MaterialIcons name="chevron-right" size={24} color="#999" />
            </Animated.View>
            <Text className="text-zinc-400 ml-2 text-xs font-semibold uppercase tracking-wider">
              Your Communities
            </Text>
          </View>

          <Pressable
            className="p-1 rounded-full active:bg-white/10"
            onPress={() => router.push('/components/community/CreateCommunityPage')}
            hitSlop={10}
          >
            <Ionicons name="add" size={20} color="#999" />
          </Pressable>
        </Pressable>

        {isCommunitiesExpanded && (
          <View className="mb-2">
            <CommunityRail />
          </View>
        )}

        <View className="h-[1px] bg-white/10 my-2 mx-4" />


        <Pressable
          className="flex-row items-center py-3 px-4 active:bg-white/10"
          onPress={() => router.push('/components/marketplace/OfferPage')}
        >
          <Ionicons name="settings-outline" size={22} color="#fff" />
          <Text className="text-white ml-4 text-[15px] font-medium">Settings</Text>
        </Pressable>

        <Pressable
          className="flex-row items-center py-3 px-4 active:bg-white/10 mb-4"
          onPress={() => router.push('/help')}
        >
          <MaterialIcons name="help-outline" size={22} color="#fff" />
          <Text className="text-white ml-4 text-[15px] font-medium">Help and Support</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  )
}