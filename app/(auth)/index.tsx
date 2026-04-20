import { View, Text,   } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'
import AuthButton from '../components/AuthButton'
import { AntDesign, Fontisto } from '@expo/vector-icons'
import { useRouter } from 'expo-router'



const index = () => {
  const router=useRouter();
 const onGooglePress=()=>{
     router.push("/(auth)/registerform")
 }
 const redirecttabs=()=>{
    router.push("/(auth)/loginScreen")
 }
function handleLoginEmail(){
  router.push("/(auth)/login")
}
  return (
    <View  className='bg-black flex-1 items-center pt-16'>
     <View className=''>
      <Image   source={require("../../assets/images/geuconnectlogotransparent.png")}
        contentFit="cover"
        transition={200}
        style={{
          width: "100%",
          aspectRatio: 12 / 9,
        }}/>
        </View>
        <View className='flex items-center gap-3'>
        <Text className=' font-bold text-5xl text-[#FF6B35]'>GEU Connect</Text>
        <Text className="text-slate-300 px-5 text-center">Your campus community platform for students and clubs</Text>
        </View>
        <View className='w-full flex justify-center items-center mt-8 px-6 gap-5'>
          <AuthButton handleOnPress={onGooglePress} text={"Continue with Google"} icon={<AntDesign name="google" size={24} color="white" />}></AuthButton>
          <AuthButton handleOnPress={redirecttabs} text={"Continue with Apple"} icon={<AntDesign name="apple" size={24} color="white" />}></AuthButton>
          <AuthButton handleOnPress={handleLoginEmail} text={"Continue with Email"} icon={<Fontisto name="email" size={24} color="white" />}></AuthButton>
        </View>
     <Text className='text-white mt-3'>Already have an account? login </Text>
    </View>
  )
}

export default index