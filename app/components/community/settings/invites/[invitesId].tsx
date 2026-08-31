import { View, Text, Pressable, ScrollView, Platform, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useBottomSheet } from '@/app/contexts/BottomSheetContext';
import SettingBottomSheetTemplate from '../channels/settings/SettingBottomSheetTemplate';
import { useCreateCommunityInviteMutation, useGetCommunityInviteQuery, useUpdateCommunityInviteMutation } from '@/src/features/community/communityInvite.api';
import * as Clipboard from 'expo-clipboard'
import BottomSheet from '@gorhom/bottom-sheet';

const expirtesAtOptions = [
    { label: "Never", value: 0 },
    { label: "1 hour ", value: 1 },
    { label: "6 hours ", value: 6 },
    { label: "12 hours ", value: 12 },
    { label: "1 day ", value: 24 },
    { label: "7 days ", value: 168 }

]

const maxUsesOptions = [
    { label: "Unlimited", value: 0 },
    { label: "1 participants", value: 1 },
    { label: "5 participants", value: 5 },
    { label: "10 participants", value: 10 },
    { label: "25 participants", value: 25 },
    { label: "50 participants", value: 50 },
    { label: "100 participants", value: 100 }
]

export default function InvitesSettings() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { invitesId: communityId } = useLocalSearchParams()

    const { data: pageData, isLoading } = useGetCommunityInviteQuery(communityId as string)
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
    const [updateCommunityInvite, { isLoading: updating }] = useUpdateCommunityInviteMutation()
    console.log(pageData)
    const [expires, setExpires] = useState(expirtesAtOptions.find(
        option => option.value === pageData?.expiresAt
    ) ?? expirtesAtOptions[0]);
    const [maxUses, setMaxUses] = useState(maxUsesOptions.find(
        option => option.value === pageData?.maxUses
    ) ?? maxUsesOptions[0]);
    const [createInvite] = useCreateCommunityInviteMutation()

    const { openActionSheet, closeActionSheet } = useBottomSheet()
    const orignalExpiration = pageData?.expiresAt
    const originalMaxUser = pageData?.maxUses

    const hasChanges = expires.value !== orignalExpiration || maxUses.value !== originalMaxUser
    const navigation = useNavigation()
    useEffect(() => {
        const unsubscibe = navigation.addListener('beforeRemove', (e) => {
            if (isBottomSheetOpen) {
                e.preventDefault()
                closeActionSheet()
            }

        })
        return unsubscibe
    }, [navigation, isBottomSheetOpen])


    const openExpireAfter = () => {
        setIsBottomSheetOpen(true)
        openActionSheet({
            content: () => (
                <SettingBottomSheetTemplate
                    title="Expirs After"
                    options={expirtesAtOptions}
                    selected={expires}
                    onSelect={setExpires}

                />

            ),
            snapPoints: ["58%"],
            color: "transparent",
            onDismiss: () => setIsBottomSheetOpen(false)
        })
    }
    const openMaxUses = () => {
        setIsBottomSheetOpen(true)
        openActionSheet({
            content: () => (
                <SettingBottomSheetTemplate
                    title="Maximum Uses"
                    options={maxUsesOptions}
                    selected={maxUses}
                    onSelect={setMaxUses}

                />

            ),
            snapPoints: ["65%"],
            color: "transparent",
            onDismiss: () => setIsBottomSheetOpen(false)
        })
    }
    async function handleCopyLink() {
        await Clipboard.setStringAsync(pageData?.inviteUrl!)

    }
    async function handleUpdateCommunityInvite() {
        if (!hasChanges) return
        const changes = {
            expiresInHours:
                expires.value !== orignalExpiration
                    ?
                    expires.value

                    : undefined,


            maxUses: maxUses.value == originalMaxUser
                ?
                maxUses.value

                : undefined,
        };
        await updateCommunityInvite({ inviteId: pageData?.inviteId!, communityId: communityId as string, request: changes })
    }
    async function handleCreateInvite() {

        await createInvite({ communityId: communityId as string, createInviteRequest: { maxUses: maxUses.value, expiresInHours: expires.value } }).unwrap()

    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <KeyboardAvoidingView className="flex-1 bg-black"
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}>
                <View className="flex-row items-center justify-between px-4 py-4">
                    <Pressable onPress={() => router.back()} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </Pressable>
                    <Text className="text-white font-bold text-xl">Invites</Text>
                    <Pressable onPress={handleUpdateCommunityInvite} className="w-12 flex justify-center items-center" >{hasChanges && (updating ? <ActivityIndicator color={"#377aff"}></ActivityIndicator> : <Text className='text-md text-[#377aff]'>Save</Text>)}</Pressable>
                </View>

                <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-white/55 text-sm font-medium">Current Invite Link</Text>
                    </View>
                    <View className="bg-[#121212] rounded-xl border border-white/12 p-4 flex-row items-center justify-between mb-8">
                        <Text className="text-[#377aff] font-semibold text-base flex-1" numberOfLines={1}>
                            {pageData?.inviteUrl}
                        </Text>
                        <Pressable disabled={!pageData?.inviteUrl} className="ml-4 p-2 bg-white/10 rounded-lg" onPress={handleCopyLink}>
                            <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
                        </Pressable>
                    </View>

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-white/55 text-sm font-medium">Create New Invite</Text>
                    </View>
                    <View className="bg-[#121212] rounded-xl border border-white/12 mb-6">
                        <Pressable className="flex-row items-center justify-between p-4" onPress={openExpireAfter}>
                            <View>
                                <Text className="text-white font-bold text-base">Expires After</Text>
                                <Text className="text-white/30 text-xs mt-1">Time until link becomes invalid</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Text className="text-white text-base mr-2">{expires.label}</Text>
                                <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.3)" />
                            </View>
                        </Pressable>
                        <View className="h-px bg-white/6 mx-4" />
                        <Pressable className="flex-row items-center justify-between p-4" onPress={openMaxUses}>
                            <View>
                                <Text className="text-white font-bold text-base">Maximum Uses</Text>
                                <Text className="text-white/30 text-xs mt-1">Number of times link can be used</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Text className="text-white text-base mr-2">{maxUses.label}</Text>
                                <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.3)" />
                            </View>
                        </Pressable>
                    </View>

                    <Pressable className="flex-row items-center justify-center w-full h-14 bg-[#377aff] rounded-full active:opacity-80" onPress={handleCreateInvite} >
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                        <Text className="text-white font-bold text-[15px] ml-2">Generate a New Link</Text>
                    </Pressable>

                    <View style={{ paddingBottom: Math.max(insets.bottom + 20, 40) }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
