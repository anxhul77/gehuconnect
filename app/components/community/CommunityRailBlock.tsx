import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

export default function CommunityRailBlock({community}:any) {
  const communityId:string='1';
  const channelId:string='1';
  const router=useRouter();
  console.log("obj",community)
  console.log("rendered")
   function handleOnPress(){
    console.log("licked")
    router.push(
      `/communities/${communityId}/channels/${channelId}`
    )
   }      
  return (

    <Pressable className='flex-row items-center' onPress={()=>handleOnPress()} >
      <Text className='text-white'>{community.name}</Text>
    </Pressable>
  )
}