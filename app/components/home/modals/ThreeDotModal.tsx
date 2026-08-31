import { View, Text } from 'react-native'
import React from 'react'
import TextModal from './TextModal'

type ModalItem = {
    icon: React.ReactNode;
    title: string;
    onPress?: () => void;
}



export default function ThreeDotModal({ content }: { content: ModalItem[] }) {
    return (
        <View className='flex-1   '>
            {content?.map((item, index) => (
                <TextModal key={index} icon={item.icon} title={item.title} onPress={item.onPress}></TextModal>
            ))}
        </View>
    )
}