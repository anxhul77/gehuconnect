import { View, Text, Pressable } from 'react-native'
import React from 'react'
type props={
    handleOnPress:any,
    icon:any,
    text:string
}

export default function AuthButton({handleOnPress,icon,text}:props) {
  return (
    <Pressable onPress={()=>handleOnPress() }className="w-full gap-2 border-[1px] border-white flex-row justify-center items-center rounded-xl bg-white/10 h-20 ">
      {icon}
        <Text className='text-white font-bold'>{text}</Text>
      
    </Pressable>
  )
}