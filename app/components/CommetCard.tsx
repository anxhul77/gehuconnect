import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Ionicons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons'

export default function CommentCard() {
    const dummy=()=>{

    }
  return (
    <View className=" flex-1  w-full mt-2 p-3 overflow-hidden rounded-xl   bg-white10">
         <View className="flex-row items-center  ">
          <View className="h-8 w-8  rounded-full bg-slate-700 items-center justify-center">
            <Ionicons name="person" size={14} color="white" />
          </View>
 
          <View className="ml-3">
            <Pressable onPress={()=>dummy}>
              <Text className="text-white font-semibold text-sm">
                dummyname
              </Text>
            </Pressable>

            
          </View>
        </View>
        <Text className="text-white  mt-2  leading-5">
         Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque tempore quasi
        </Text>
        <View className='flex-row gap-6 items-center mt-3'>
        <View  className='flex-row  gap-3'>
           <View className='flex-row gap-1 items-center'>
          <SimpleLineIcons name="like" size={15} color="white" />
          <Text className='text-white'>5</Text>
          </View>
          <View className='flex-row gap-1 items-center'>
          <SimpleLineIcons name="dislike" size={15} color="white" />
           <Text className='text-white'>5</Text>
          </View>
          </View>
          <View className='flex-row gap-1 items-center'>
            <MaterialCommunityIcons name="message-reply-text-outline" size={18} color="white" />
            <Text className='text-white'>5</Text>
          </View>
        </View>
        
    
    </View>
  )
}