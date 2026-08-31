import { View, Text, Pressable } from 'react-native'
import React from 'react'

export default function TextModal({ icon, title, onPress }: any) {
    return (
        <Pressable onPress={onPress} className='flex-row items-center gap-4 p-5 '>
            {icon}
            <Text className="text-white  text-lg">{title}</Text>
        </Pressable>
    )
}