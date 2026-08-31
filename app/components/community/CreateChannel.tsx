import { StyleSheet, Text, View, Pressable, TextInput, ScrollView, Alert, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react'
import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGetCommunityChannelCategoriesQuery, } from '@/src/features/community/community.api'
import RadioSwitch from '../Custom/RadioSwitch'

import CustomSwitch from '../Custom/CustomSwitch'
import { useAddChannelMutation } from '@/src/features/community/channel.api'

type ChannelType = 'TEXT' | 'VOICE'



export default function CreateChannel() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { communityId } = useLocalSearchParams<{ communityId: string }>()

    const [channelName, setChannelName] = useState('')
    const [channelType, setChannelType] = useState<ChannelType>('TEXT')
    const [isPrivate, setIsPrivate] = useState(false)
    const [description, setDescription] = useState('')
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

    const { data: categories, isLoading: categoriesLoading } = useGetCommunityChannelCategoriesQuery(
        Number(communityId),
        { skip: !communityId }
    )
    const [addChannel, { isLoading: isCreating }] = useAddChannelMutation()

    const formatChannelName = (text: string) => {
        if (channelType === 'TEXT') {
            return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        }
        return text
    }

    const handleNameChange = (text: string) => {
        setChannelName(formatChannelName(text))
    }
    const canCreate = channelName.trim().length > 0 && selectedCategoryId !== null && description.trim().length > 0 && !isCreating

    const handleCreate = async () => {
        if (!canCreate || selectedCategoryId === null) return

        try {
            await addChannel({
                channelDto: {
                    name: channelName.trim(),
                    type: channelType,
                    status: isPrivate ? 'PRIVATE' : 'PUBLIC',
                },
                channelCategoryId: selectedCategoryId,
            }).unwrap()

            Alert.alert('Success', 'Channel created successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ])
        } catch (error: any) {
            Alert.alert('Error', error?.data?.message || 'Failed to create channel. Please try again.')
        }
    }

    return (
        <SafeAreaView className="flex-1">
            <KeyboardAvoidingView
                className="flex-1 bg-black"
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
            >

                <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
                    <View className="flex-row items-center gap-3">
                        <Pressable
                            className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="close" size={18} color="#f0f0f0" />
                        </Pressable>
                        <View>
                            <Text
                                className="text-white font-bold text-base tracking-tight"
                                style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium' }}
                            >
                                Create Channel
                            </Text>
                            <Text className="text-white/35 text-xs mt-0.5">
                                Set up a new channel
                            </Text>
                        </View>
                    </View>

                    <Pressable
                        disabled={!canCreate}
                        onPress={handleCreate}
                        className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full ${canCreate ? 'bg-[#5865F2]' : 'bg-white/5'}`}
                    >
                        {isCreating ? (
                            <ActivityIndicator size="small" color={canCreate ? '#fff' : 'rgba(255,255,255,0.3)'} />
                        ) : (
                            <>
                                <Ionicons
                                    name="checkmark"
                                    size={14}
                                    color={canCreate ? '#fff' : 'rgba(255,255,255,0.3)'}
                                />
                                <Text className={`text-sm font-medium ${canCreate ? 'text-white' : 'text-white/30'}`}>
                                    Create
                                </Text>
                            </>
                        )}
                    </Pressable>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"

                >

                    <View className="px-4 mt-5 mb-6">
                        <Text className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3">
                            Channel Type
                        </Text>
                        <View className="bg-[#121212] rounded-xl border border-white/12 overflow-hidden ">
                            <Pressable
                                className="flex-row items-center justify-between p-4"
                                onPress={() => setChannelType('TEXT')}
                            >
                                <View className="flex-1 pr-4">
                                    <Text className="text-white font-semibold text-base">Text Channel</Text>
                                    <Text className="text-white/30 text-xs mt-1">Send messages, images, GIFs, emoji, and more</Text>
                                </View>
                                <RadioSwitch selected={channelType === "TEXT"} />
                            </Pressable>
                            <Pressable
                                className="flex-row items-center justify-between p-4"
                                onPress={() => setChannelType('VOICE')}
                            >
                                <View className="flex-1 pr-4">
                                    <Text className="text-white font-semibold text-base">Voice Channel</Text>
                                    <Text className="text-white/30 text-xs mt-1">Hang out together with voice, video, and screen share</Text>
                                </View>
                                <RadioSwitch selected={channelType === "VOICE"} />
                            </Pressable>
                        </View>
                    </View>




                    <View className="px-5">
                        <Text className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3">
                            Channel Name
                        </Text>
                        <View className="flex-row items-center bg-white/[0.05] rounded-xl px-4 border border-white/12">

                            <Ionicons name="chatbubble-outline" size={18} color="rgba(255,255,255,0.35)" style={{ marginRight: 8 }} />
                            <TextInput
                                value={channelName}
                                onChangeText={handleNameChange}
                                placeholder={channelType === 'TEXT' ? 'New-channel' : 'New Channel'}
                                placeholderTextColor="rgba(255,255,255,0.22)"
                                autoCapitalize="none"
                                autoCorrect={false}
                                className="flex-1 py-3 text-[15px]"
                                style={{ color: '#f0f0f0' }}
                            />
                        </View>
                    </View>
                    <View className="px-5 mt-5">
                        <Text className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3">
                            Channel Descripttion
                        </Text>

                        <View className="flex-row bg-white/[0.05] rounded-xl px-4 border border-white/12 min-h-[100px] max-h-[100px]">
                            <AntDesign name="paper-clip" size={18} color="rgba(255,255,255,0.35)" style={{ marginRight: 8, marginTop: 14 }} />

                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder={'Add a descripttion'}
                                placeholderTextColor="rgba(255,255,255,0.22)"
                                autoCapitalize="none"
                                autoCorrect={false}
                                multiline
                                className="flex-1  text-[15px]"
                                style={{ color: '#f0f0f0', textAlignVertical: 'top' }}
                            />
                        </View>
                    </View>
                    <View className="h-px bg-white/6 mx-5 my-5" />


                    <View className="px-4">
                        <Text className="text-white/40 text-xs font-bold tracking-widest uppercase mb-1">
                            Channel Category
                        </Text>
                        <Text className="text-white/30 text-xs mb-3">
                            Select a category to organize this channel
                        </Text>

                        {categoriesLoading ? (
                            <View className="py-6 items-center">
                                <ActivityIndicator color="#fff" />
                            </View>
                        ) : categories ? (
                            <View className="bg-[#121212] rounded-xl border border-white/12 overflow-hidden">
                                {channelType === 'TEXT' ? categories?.textChannels.map((cat) => {
                                    const isSelected = selectedCategoryId === Number(cat.id)
                                    return (
                                        <Pressable
                                            key={cat.id}
                                            className="flex-row items-center justify-between p-4"
                                            onPress={() => setSelectedCategoryId(Number(cat.id))}
                                        >
                                            <View className="flex-row items-center flex-1 pr-4">
                                                <FontAwesome5 name="folder" size={18} color="rgba(255,255,255,0.5)" style={{ marginRight: 10 }} />
                                                <Text className="text-white font-semibold text-base" numberOfLines={1}>
                                                    {cat.name}
                                                </Text>
                                            </View>
                                            <RadioSwitch selected={isSelected} />
                                        </Pressable>
                                    )
                                }) : categories?.voiceChannels.map((cat) => {
                                    const isSelected = selectedCategoryId === Number(cat.id)
                                    return (
                                        <Pressable
                                            key={cat.id}
                                            className="flex-row items-center justify-between p-4"
                                            onPress={() => setSelectedCategoryId(Number(cat.id))}
                                        >
                                            <View className="flex-row items-center flex-1 pr-4">
                                                <FontAwesome5 name="folder" size={18} color="rgba(255,255,255,0.5)" style={{ marginRight: 10 }} />
                                                <Text className="text-white font-semibold text-base" numberOfLines={1}>
                                                    {cat.name}
                                                </Text>
                                            </View>
                                            <RadioSwitch selected={isSelected} />
                                        </Pressable>
                                    )
                                })}
                            </View>
                        ) : (
                            <View className="p-4 bg-[#121212] rounded-xl border border-white/12 items-center">
                                <Text className="text-white/30 text-xs">No categories available</Text>
                            </View>
                        )}
                    </View>

                    <View className="h-px bg-white/6 mx-5 my-5" />


                    <View className="px-5">
                        <View className="flex-row items-center justify-between p-4 bg-[#121212] rounded-xl ">
                            <View className="flex-1 pr-3">
                                <View className="flex-row items-center mb-1">
                                    <Ionicons name="lock-closed" size={16} color='#B3B3B3' style={{ marginRight: 8 }} />
                                    <Text className="text-white text-base font-bold">Private Channel</Text>
                                </View>
                                <Text className="text-white/40 text-xs leading-4">
                                    Only selected members and roles will be able to view this channel.
                                </Text>
                            </View>
                            <CustomSwitch value={isPrivate} onValueChange={setIsPrivate} />
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView >
    )
}
