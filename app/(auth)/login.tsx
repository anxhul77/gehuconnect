import { View, Text, Pressable } from 'react-native'
import React from 'react'
import InputForm from '../components/Inputform/InputForm'
import { useRouter } from 'expo-router'

export default function login() {
    const router=useRouter()
  const handleOnPress=()=>{
    router.push("/(drawer)/(tabs)")
  }
  return (
    <View className='flex-1 justify-center items-center '>
  <InputForm></InputForm> 
  <Pressable onPress={()=>{handleOnPress()}}>
    <Text className='text-white mb-48'>
         skip
    </Text>
  </Pressable>
    </View>
  )
  
}