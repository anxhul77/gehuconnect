import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { AcadRepoAuditLogDto } from '@/src/features/acadmecis.api'
import { Feather, FontAwesome } from '@expo/vector-icons'


export default function AcadRepoAuidLogCard({ item }: { item: AcadRepoAuditLogDto }) {
    const [showMetaData, setShowMetaData] = useState<boolean>(false);
    const showMetaDataHandler = () => {
        setShowMetaData(!showMetaData);
    }
    console.log(item)
    if (item.targetType === 'MEMBER') {
        return (
            <View className="flex-row items-center px-4">
                <View className='flex-row items-center gap-2 '>
                    {item.targetMemberDto?.avatarUrl ? (
                        <Image
                            source={{ uri: item.targetMemberDto.avatarUrl }}
                            className="w-6 h-6 rounded-full bg-white/10"
                        />) : <Feather name="user" size={20} color="white" />}
                    {item.actorMemberDto?.avatarUrl ? (
                        <Image
                            source={{ uri: item.actorMemberDto.avatarUrl }}
                            className="w-8 h-8 rounded-full bg-white/10"
                        />) : <Feather name="user" size={20} color="white" />}

                </View>

                <View>
                    <Text className='text-white'>{item.actorMemberDto?.name} {item.message}{item.targetMemberDto?.name}</Text>
                </View>
            </View>
        )
    } else {
        return (
            <Pressable onPress={showMetaDataHandler} className="flex-col   px-8 mb-4 ">
                <View className='flex-row gap-2 items-center'>
                    <View className='flex-row gap-2 '>
                        {item.action == 'PULL_REQUEST' ? (
                            <Feather name="git-pull-request" size={20} color="grey" />) : <Feather name="user" size={20} color="white" />}
                        {item.actorMemberDto?.avatarUrl ? (
                            <Image
                                source={{ uri: item.actorMemberDto.avatarUrl }}
                                className="w-8 h-8 rounded-full bg-white/10"
                            />) : <Feather name="user" size={20} color="white" />}

                    </View>

                    <View className="flex-1 flex-col justify-center ">
                        <Text className='text-white' >{item.actorMemberDto?.name} {item.message} inside {item.subjectName}/{item.subsectionName}</Text>
                        <Text className="text-gray-500 text-xs">{item.createdAt}</Text>

                    </View>
                    {item.metadata ? <View className=' '>
                        <FontAwesome name={showMetaData ? "angle-down" : "angle-right"} size={24} color="gray" />

                    </View> : null}
                </View>
                {showMetaData && item.metadata ? (
                    <View className="mt-2 p-3 bg-gray-800 rounded-lg ml-14">
                        <View className="flex-row justify-between">
                            <Text className="text-white">{Object.keys(item.metadata)}</Text>
                            <Text className="text-white">{Object.values(item.metadata)}</Text>
                        </View>

                    </View>
                ) : null}

            </Pressable>
        )
    }
}

