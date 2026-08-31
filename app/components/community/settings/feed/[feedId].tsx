import { View, Text, Pressable, ScrollView, TextInput, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ContainerwithSwitch from '../../../Custom/ContainerwithSwitch';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useGetCommunityFeedSettingsQuery, useUpdateFeedSettingsMutation } from '@/src/features/community/community.api';
import { buildPermissionBit, feedSettings as defaultFeedSettings } from '@/src/utils/RoleHelpers';
import CustomSwitch from '@/app/components/Custom/CustomSwitch';

export default function FeedSettings() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { feedId: communityId } = useLocalSearchParams();
    const { data: pageData } = useGetCommunityFeedSettingsQuery(communityId as string);

    const [maxLength, setMaxLength] = useState('40000');
    const [updateTrigger] = useUpdateFeedSettingsMutation()


    const togglePermission = (communityId: string, groupIdx: number, permissionIdx: number, bit: string, isEnable: boolean, permissionMask: string) => {
        const newMask = buildPermissionBit(isEnable, bit, permissionMask)

        updateTrigger({ communityId: communityId, dto: { permissionMask: newMask }, permissionMask: newMask, groupIdx, permissionIdx })
    }
    useEffect(() => {
        if (maxLength.length === 0 || maxLength.length === pageData?.maximumPostLength) return;
        const timeout = setTimeout(() => {
            updateTrigger({ communityId: communityId as string, dto: { maximumPostLength: maxLength }, isOther: true })
        }, 500);
        return () => clearTimeout(timeout);
    }, [maxLength, pageData?.maximumPostLength])
    console.log("mask", pageData?.permissionMask)

    return (
        <SafeAreaView className="flex-1 bg-black">

            <View className="flex-row items-center justify-between px-4 py-4">
                <Pressable onPress={() => router.back()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </Pressable>
                <Text className="text-white font-bold text-xl">Feed Settings</Text>
                <View className="w-10" />
            </View>

            <KeyboardAwareScrollView bottomOffset={50}
                extraKeyboardSpace={50} className=" px-4 pt-4" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
                {pageData?.feedSettings?.map((group: any, groupIdx: number) => (
                    <React.Fragment key={groupIdx}>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-white/55 text-sm font-medium">{group.group}</Text>
                        </View>
                        <View className="bg-[#121212] rounded-xl border border-white/12 overflow-hidden mb-6">
                            {group.permissions?.map((permission: any, permIdx: number) => (
                                <React.Fragment key={permission.key}>
                                    {permIdx > 0 && <View className="h-px bg-white/6 mx-4" />}
                                    {permission.key === "ALLOW_NSFW" ? <ContainerwithSwitch
                                        title={permission.title}
                                        description={permission.description}

                                        customSwitch={<CustomSwitch value={false} onValueChange={() => { }}></CustomSwitch>}
                                    /> : <ContainerwithSwitch
                                        title={permission.title}
                                        description={permission.description}
                                        backgroundColor="transparent"
                                        customSwitch={<CustomSwitch value={permission.isEnabled} onValueChange={() => { togglePermission(communityId as string, groupIdx, permIdx, permission.bit, permission.isEnabled, pageData.permissionMask) }}></CustomSwitch>}
                                    />}
                                </React.Fragment>
                            ))}
                        </View>
                    </React.Fragment>
                ))}

                <View className="flex-row justify-between mb-2">
                    <Text className="text-white/55 text-sm font-medium">Limits</Text>
                </View>
                <View className="bg-[#121212] rounded-xl border border-white/12 p-4 mb-8">
                    <Text className="text-white font-bold text-base mb-2">Maximum Post Length</Text>
                    <TextInput
                        className="bg-[#121212] rounded-xl px-4 py-3 text-[15px] border border-white/12"
                        style={{ color: "#f0f0f0" }}
                        placeholderTextColor="rgba(255,255,255,0.22)"
                        value={maxLength}
                        onChangeText={setMaxLength}
                        keyboardType="numeric"
                    />
                    <Text className="text-white/30 text-xs mt-2">Characters (default: 40000)</Text>
                </View>


            </  KeyboardAwareScrollView>

        </SafeAreaView>
    );
}
