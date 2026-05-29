import { StyleSheet, Text, View, Pressable, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGetCommunityChannelCategoriesQuery, useAddChannelMutation } from '@/src/features/community.api'

type ChannelType = 'TEXT' | 'VOICE'
type ChannelStatus = 'PUBLIC' | 'PRIVATE'

function CustomSwitch({ value, onValueChange }: { value: boolean; onValueChange: (val: boolean) => void }) {
    return (
        <Pressable
            onPress={() => onValueChange(!value)}
            style={{
                width: 46,
                height: 24,
                borderRadius: 12,
                backgroundColor: value ? '#5865F2' : '#2E3035',
                justifyContent: 'center',
                padding: 0,
                position: 'relative',
                borderWidth: 1,
                borderColor: value ? '#5865F2' : '#3F4248'
            }}
        >
            <View
                style={{
                    width: 22,
                    height: 20,
                    borderRadius: 11,
                    backgroundColor: '#FFFFFF',
                    position: 'absolute',
                    left: value ? 22 : 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 2,
                }}
            />
        </Pressable>
    )
}

export default function CreateChannel() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { communityId } = useLocalSearchParams<{ communityId: string }>()

    const [channelName, setChannelName] = useState('')
    const [channelType, setChannelType] = useState<ChannelType>('TEXT')
    const [isPrivate, setIsPrivate] = useState(false)
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

    const { data: categories, isLoading: categoriesLoading } = useGetCommunityChannelCategoriesQuery(
        Number(communityId),
        { skip: !communityId }
    )
    console.log("channel categoryieshlkh", categories)
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

    const canCreate = channelName.trim().length > 0 && selectedCategoryId !== null && !isCreating

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
        <View style={{ flex: 1, backgroundColor: '#000000' }}>


            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingTop: insets.top + 10,
                    paddingBottom: 16,
                }}
            >
                <Pressable onPress={() => router.back()}>
                    <Text style={{ color: '#C7C8CE', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                </Pressable>

                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Create Channel</Text>

                <Pressable onPress={handleCreate} disabled={!canCreate}>
                    <Text style={{
                        color: canCreate ? '#5865F2' : '#3F4248',
                        fontSize: 16,
                        fontWeight: 'bold'
                    }}>
                        {isCreating ? '...' : 'Create'}
                    </Text>
                </Pressable>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >


                <Text style={sty.sectionLabel}>CHANNEL TYPE</Text>


                <Pressable
                    onPress={() => setChannelType('TEXT')}
                    style={sty.typeCard}
                >
                    <View style={sty.typeCardLeft}>
                        <View style={[sty.typeIconWrap, { backgroundColor: channelType === 'TEXT' ? '#5865F222' : '#2E303522' }]}>
                            <Ionicons name="chatbubble-outline" size={22} color={channelType === 'TEXT' ? '#5865F2' : '#8F9199'} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={sty.typeTitle}>Text</Text>
                            <Text style={sty.typeSub}>Send messages, images, GIFs, emoji, and more</Text>
                        </View>
                    </View>
                    {channelType === 'TEXT' ? (
                        <View style={sty.radioActive}>
                            <View style={sty.radioInner} />
                        </View>
                    ) : (
                        <View style={sty.radioInactive} />
                    )}
                </Pressable>


                <Pressable
                    onPress={() => setChannelType('VOICE')}
                    style={sty.typeCard}
                >
                    <View style={sty.typeCardLeft}>
                        <View style={[sty.typeIconWrap, { backgroundColor: channelType === 'VOICE' ? '#5865F222' : '#2E303522' }]}>
                            <Ionicons name="volume-high-outline" size={22} color={channelType === 'VOICE' ? '#5865F2' : '#8F9199'} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={sty.typeTitle}>Voice</Text>
                            <Text style={sty.typeSub}>Hang out together with voice, video, and screen share</Text>
                        </View>
                    </View>
                    {channelType === 'VOICE' ? (
                        <View style={sty.radioActive}>
                            <View style={sty.radioInner} />
                        </View>
                    ) : (
                        <View style={sty.radioInactive} />
                    )}
                </Pressable>

                {/* Channel Name Input */}
                <Text style={[sty.sectionLabel, { marginTop: 24 }]}>CHANNEL NAME</Text>
                <View style={sty.inputWrap}>
                    <Ionicons
                        name={channelType === 'TEXT' ? 'chatbubble-outline' : 'volume-high-outline'}
                        size={18}
                        color="#8F9199"
                        style={{ marginRight: 10 }}
                    />
                    <TextInput
                        style={sty.input}
                        placeholder={channelType === 'TEXT' ? 'new-channel' : 'New Channel'}
                        placeholderTextColor="#4E5058"
                        value={channelName}
                        onChangeText={handleNameChange}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>


                <Text style={[sty.sectionLabel, { marginTop: 24 }]}>CHANNEL CATEGORY</Text>
                {categoriesLoading ? (
                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                        <ActivityIndicator color="#5865F2" />
                    </View>
                ) : categories && categories.length > 0 ? (
                    <View style={sty.categoryContainer}>
                        {categories.map((cat, index) => {
                            const isSelected = selectedCategoryId === Number(cat.id)
                            const isLast = index === categories.length - 1
                            return (
                                <Pressable
                                    key={cat.id}
                                    onPress={() => setSelectedCategoryId(Number(cat.id))}
                                    style={[
                                        sty.categoryRow,
                                        !isLast && { borderBottomWidth: 1, borderBottomColor: '#1F2027' }
                                    ]}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name="folder-outline" size={20} color="#C7C8CE" style={{ marginRight: 12 }} />
                                        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>{cat.name}</Text>
                                    </View>
                                    {isSelected ? (
                                        <View style={sty.radioActive}>
                                            <View style={sty.radioInner} />
                                        </View>
                                    ) : (
                                        <View style={sty.radioInactive} />
                                    )}
                                </Pressable>
                            )
                        })}
                    </View>
                ) : (
                    <View style={sty.categoryContainer}>
                        <Text style={{ color: '#8F9199', fontSize: 14, padding: 16 }}>No categories available</Text>
                    </View>
                )}

                <View style={[sty.privateToggleRow, { marginTop: 24 }]}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Ionicons name="lock-closed" size={16} color="#C7C8CE" style={{ marginRight: 8 }} />
                            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>Private Channel</Text>
                        </View>
                        <Text style={{ color: '#8F9199', fontSize: 13, lineHeight: 18 }}>
                            Only selected members and roles will be able to view this channel.
                        </Text>
                    </View>
                    <CustomSwitch value={isPrivate} onValueChange={setIsPrivate} />
                </View>

            </ScrollView>
        </View>
    )
}

const sty = StyleSheet.create({
    sectionLabel: {
        color: '#8F9199',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginTop: 8,
    },
    typeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#131318',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
    },

    typeCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    typeIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    typeTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    typeSub: {
        color: '#8F9199',
        fontSize: 13,
        marginTop: 2,
        lineHeight: 17,
    },
    radioActive: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#5865F2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFFFFF',
    },
    radioInactive: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#4E5058',
        backgroundColor: 'transparent',
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#131318',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 52,
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    categoryContainer: {
        backgroundColor: '#131318',
        borderRadius: 14,
        overflow: 'hidden',
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    privateToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#131318',
        borderRadius: 14,
        padding: 16,
    },
})