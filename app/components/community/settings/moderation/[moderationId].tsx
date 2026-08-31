import { View, Text, Pressable, ScrollView, TextInput, Platform } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ContainerwithSwitch from '../../../Custom/ContainerwithSwitch';
import RadioSwitch from '../../../Custom/RadioSwitch';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import CustomSwitch from '@/app/components/Custom/CustomSwitch';
import { useGetBlockedWordsQuery, useGetCommunityModerationSettingsQuery, useUpdateModerationSettingsMutation } from '@/src/features/community/community.api';
import { buildPermissionBit } from '@/src/utils/RoleHelpers';

export default function ModerationSettings() {
    const router = useRouter();
    const insets = useSafeAreaInsets();



    const { moderationId: communityId } = useLocalSearchParams();
    const { data: pageData } = useGetCommunityModerationSettingsQuery(communityId as string);
    const { data: blockedworddata } = useGetBlockedWordsQuery(communityId as string)
    const [verificationLevel, setVerificationLevel] = useState(pageData?.verificationLevel || 'None');
    const [blockedWords, setBlockedWords] = useState(blockedworddata || '');
    const [minAge, setMinAge] = useState(pageData?.maximumAccountAgeDays.toString() || '0');

    const [updateTrigger] = useUpdateModerationSettingsMutation()

    const togglePermission = (communityId: string, groupIdx: number, permissionIdx: number, bit: string, isEnable: boolean, permissionMask: string) => {
        const newMask = buildPermissionBit(isEnable, bit, permissionMask)

        updateTrigger({ communityId: communityId, dto: { permissionMask: newMask }, permissionMask: newMask, groupIdx, permissionIdx })
    }

    const levels = [
        { id: 'None', desc: 'Unrestricted access' },
        { id: 'Low', desc: 'Must have a verified email' },
        { id: 'Medium', desc: 'Must also be registered for longer than 5 minutes' },
        { id: 'High', desc: 'Must also be a member of this community for longer than 10 minutes' }
    ];

    return (
        <SafeAreaView className="flex-1 bg-black">

            <View className="flex-row items-center justify-between px-4 py-4">
                <Pressable onPress={() => router.back()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </Pressable>
                <Text className="text-white font-bold text-xl">Moderation</Text>
                <View className="w-10" />
            </View>

            <KeyboardAwareScrollView bottomOffset={26} className=" px-4 pt-4" showsVerticalScrollIndicator={false}>

                <View className="flex-row justify-between mb-2">
                    <Text className="text-white/55 text-sm font-medium">Verification Level</Text>
                </View>
                <View className="bg-[#121212] rounded-xl border border-white/12 overflow-hidden mb-6">
                    {levels.map((level, idx) => (
                        <View key={level.id}>
                            <Pressable
                                className="flex-row items-center justify-between p-4"
                                onPress={() => {
                                    setVerificationLevel(level.id);
                                    updateTrigger({ communityId: communityId as string, dto: { verificationLevel: level.id } });
                                }}
                            >
                                <View className="flex-1 pr-4">
                                    <Text className="text-white font-semibold text-base">{level.id}</Text>
                                    <Text className="text-white/30 text-xs mt-1">{level.desc}</Text>
                                </View>
                                <RadioSwitch selected={verificationLevel === level.id} />
                            </Pressable>
                            {idx < levels.length - 1 && (
                                <View className="h-px bg-white/6 mx-4" />
                            )}
                        </View>
                    ))}
                </View>

                {pageData?.moderationSettings?.map((group: any, groupIdx: number) => (
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

                <View className="mb-6">
                    <View className="flex-row justify-between mb-1.5">
                        <Text className="text-white/55 text-sm font-medium">Blocked Words</Text>
                    </View>
                    <TextInput
                        className="bg-[#121212] rounded-xl px-4 py-3 text-[15px] border border-white/12"
                        style={{ minHeight: 96, color: "#f0f0f0" }}
                        placeholderTextColor="rgba(255,255,255,0.22)"
                        placeholder="Enter words to block, separated by commas"
                        multiline
                        textAlignVertical="top"
                        value={blockedWords}
                        onChangeText={setBlockedWords}
                    />
                </View>

                <View className="flex-row justify-between mb-2">
                    <Text className="text-white/55 text-sm font-medium">Requirements</Text>
                </View>
                <View className="bg-[#121212] rounded-xl border border-white/12 mb-8">
                    <View className="p-4">
                        <Text className="text-white font-bold text-base mb-2">Minimum Account Age (Days)</Text>
                        <TextInput
                            className="bg-[#121212] rounded-xl px-4 py-3 text-[15px] border border-white/12"
                            style={{ color: "#f0f0f0" }}
                            placeholderTextColor="rgba(255,255,255,0.22)"
                            value={minAge}
                            onChangeText={setMinAge}
                            onBlur={() => {
                                const parsed = parseInt(minAge);
                                if (!isNaN(parsed)) {
                                    updateTrigger({ communityId: communityId as string, dto: { maximumAccountAgeDays: parsed } });
                                }
                            }}
                            keyboardType="numeric"
                        />
                    </View>
                    <View className="h-px bg-white/6 mx-4" />

                </View>

                <View style={{ paddingBottom: Math.max(insets.bottom + 20, 40) }} />
            </KeyboardAwareScrollView>

        </SafeAreaView>
    );
}
