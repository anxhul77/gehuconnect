import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router';

export default function PublicFeedInputModal({channelId,communityId}:{channelId:string,communityId?:string}) {
  const insets=useSafeAreaInsets();
  const router=useRouter();
  return (
    <View className={`bg-[#1A1A1A] h-32 py-4 px-4 items-center justify-center rounded-t-3xl border-t border-[#2A2A2A]` }style={{paddingBottom:insets.bottom}} >
      <Pressable className='bg-white w-full h-full rounded-3xl justify-center items-center ' onPress={()=> router.push({ pathname:"/components/community/CreatePostScreen",
          params:{channelId:channelId,communityId:communityId}
      })}>
        <Text className='text-lg font-medium italic'>
          Post
        </Text>
      </Pressable>
    </View>
  )
}