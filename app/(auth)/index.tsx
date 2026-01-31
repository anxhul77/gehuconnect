import { View, Text, Pressable } from 'react-native'
import React from 'react'
import InputForm from '../components/Inputform/InputForm'
import { NeumorphicButton } from '../components/Inputform/FormButton'
import { useRouter } from 'expo-router'



const index = () => {
  const router=useRouter()
  const handleOnPress=()=>{
    router.push("/(tabs)")
  }
  return (
    <View className='flex-1 justify-center items-center '>
  <InputForm></InputForm> 
  <Pressable onPress={()=>{handleOnPress()}}>
    <Text className='test-white mb-48'>
         skip
    </Text>
  </Pressable>
    </View>
  )
}

export default index