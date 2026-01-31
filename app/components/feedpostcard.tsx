import { View, Text, Pressable, } from 'react-native'
import React, { useState } from 'react'
import { EvilIcons, Ionicons, SimpleLineIcons } from '@expo/vector-icons';
import {Image} from 'expo-image'
import { feedPost } from '@/src/types/types';
import { useRouter } from 'expo-router';
// import reactlogo from '../../assets/images/react-logo.png'

export default function Feedpostcard(post:feedPost) {
  const router=useRouter();

  console.log('Feedpostcard rendered');
  return (
    <Pressable  onPress={()=>router.push("/post/[id]")}>
    <View className="mx-4 my-3 rounded-2xl border border-white15 bg-black overflow-hidden">
      
        <Pressable>
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <View className="h-8 w-8 rounded-full bg-slate-700 items-center justify-center">
          <Ionicons name="person" size={16} color="white" />
        </View>
         
        <View className="ml-3">
          <Text className="text-white font-semibold text-sm">
            r/reactnative
          </Text>
           <Pressable>
          <Text className="text-slate-400 text-xs">
            Posted by u/ansh • 2h ago
          </Text>
          </Pressable>
        </View>
      </View>
       </Pressable>
     
      <Text className="text-white px-4 pt-2 text-base font-semibold">
        Expo Image not rendering inside NativeWind?
      </Text>

      
      <Text className="text-slate-300 px-4 py-2 text-sm leading-5">
        I am using expo-image with NativeWind but the image doesn’t show
        unless I explicitly give width. Any idea why this happens?
      </Text>

      
      <Image
        source={require("../../assets/images/icon.png")}
        contentFit="cover"
        transition={200}
        style={{
          width: "100%",
          aspectRatio: 12 / 9,
       
        }}
      />
      <View className='h-0.5   bg-white15  mx-4 my-2'></View>
      
      <View className="flex-row items-center justify-between px-4 pb-4 ">
        <View className='flex-row items-center gap-4'>
        <View className="flex-row items-center  border border-white15 bg-white5 rounded-3xl p-1">
         <EvilIcons name="like" size={24} color="rgba(255,255,255,0.60)" />
          <Text className="text-white20 text-sm ">124</Text>
           <View className=' w-[1px] h-4 bg-white10 ml-2'></View>
            <EvilIcons name="like" size={24} color="rgba(255,255,255,0.60)" className='rotate-180'/>
           <Text className="text-white20 text-sm mr-1">124</Text>
        
        </View>
          <View className="flex-row items-center space-x-1 border border-white15 bg-white5 rounded-3xl p-1">
            <Ionicons name="chatbubble-outline" size={18} color="rgba(255,255,255,0.60)"  />
            <Text className="text-white20 text-sm mr-2">18</Text>
          </View>
    </View>
        <View className="flex-row items-center space-x-4 border border-white15 bg-white5 rounded-full p-2">
          

          <Ionicons name="share-social-outline" size={18} color="rgba(255,255,255,0.60)" />
        </View>
      </View>
    </View>
    </Pressable>
  );
}