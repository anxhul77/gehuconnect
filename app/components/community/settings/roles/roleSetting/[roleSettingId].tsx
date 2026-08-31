import { View, Text, Pressable, ScrollView, TextInput, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Collapsible from 'react-native-collapsible';
import ContainerwithSwitch from '../../../../Custom/ContainerwithSwitch';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useChangePermissionMutation, useGetRoleQuery } from '@/src/features/community/role.api';
import CustomSwitch from '@/app/components/Custom/CustomSwitch';
import { RoleCardDto } from '@/src/types/types';
import { buildPermissionBit } from '@/src/utils/RoleHelpers';



const PermissionGroup = ({ index, group, onToggle, roleId, communityId, permissionMask }: {
    index: number, group: any, onToggle:
    (roleId: string, communityId: string, permissionMask: string,
        permissionTypeIndex: number, isEnable: boolean, permissionBit: string, permissionIndex: number) => void, roleId: string, communityId: string,
    permissionMask: string
}) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <View >
            <Pressable
                className="flex-row items-center justify-between p-4 bg-[#121212] rounded-t-xl border border-white/12"
                style={!isCollapsed && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                onPress={() => setIsCollapsed(!isCollapsed)}
            >
                <View className="flex-1 pr-4">
                    <Text className="text-white font-bold text-base">{group.name}</Text>
                    <Text className="text-white/55 text-sm font-medium">{group.description}</Text>
                </View>
                <Ionicons name={isCollapsed ? "chevron-down" : "chevron-up"} size={20} color="rgba(255,255,255,0.3)" />
            </Pressable>
            <Collapsible collapsed={isCollapsed}>
                <View className="bg-[#121212] border border-t-0 border-white/12 rounded-b-xl overflow-hidden px-2 pb-2 pt-2">
                    {group.permissions.map((perm: any, idx: number) => (
                        <View key={idx} className="mb-2">
                            <ContainerwithSwitch
                                title={perm.title}
                                description={perm.description}
                                backgroundColor="#121212"
                                customSwitch={
                                    <CustomSwitch value={perm.isEnabled} onValueChange={() => onToggle(roleId, communityId as string, permissionMask, index, perm.isEnabled, perm.bit, idx)} />
                                }
                            />
                        </View>
                    ))}
                </View>
            </Collapsible>
        </View>
    );
};

export default function RoleSettings() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { roleSettingId: communityId, roleData } = useLocalSearchParams();

    let role: RoleCardDto = JSON.parse(roleData as string);


    const { data: pageData } = useGetRoleQuery(role.roleId.toString())

    const [changePermission] = useChangePermissionMutation()
    function onPermissionToggle(roleId: string, communityId: string, permissionMask: string, permissionTypeIndex: number, isEnable: boolean, permissionBit: string, permissionIndex: number) {
        let newMask = buildPermissionBit(isEnable, permissionBit, permissionMask)



        changePermission({ communityId, roleId, permissionMask: newMask.toString() as string, permissionTypeIndex, permissionIndex })
    }

    const handleBack = () => {
        router.back();
    };

    if (!roleData) {
        return (
            <SafeAreaView className="flex-1 bg-black justify-center items-center">
                <Text className="text-white">Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <KeyboardAvoidingView className="flex-1 bg-black"
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}>
                <View className="flex-row items-center justify-between px-4 py-4">
                    <Pressable onPress={handleBack} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </Pressable>
                    <Text className="text-white font-bold text-xl flex-1 text-center mr-10">{role!.roleName}</Text>
                </View>

                <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
                    <View className="mb-6">
                        <View className="flex-row justify-between mb-1.5">
                            <Text className="text-white/55 text-sm font-medium">Role Name</Text>
                        </View>
                        <TextInput
                            className="bg-white/[0.05] rounded-xl px-4 py-3 text-[15px] border border-white/12"
                            style={{ color: "#f0f0f0" }}
                            value={role!.roleName}
                            editable={false}
                        />
                    </View>

                    <View className="mb-6">
                        <View className="flex-row justify-between mb-1.5">
                            <Text className="text-white/55 text-sm font-medium">Role Color</Text>
                        </View>
                        <Pressable className="flex-row items-center p-4 h-14 bg-white/[0.05] rounded-xl border border-white/12">
                            <View className="w-6 h-6 rounded-full mr-3" style={{ backgroundColor: role!.roleColor || '#99aab5' }} />
                            <Text className="text-white text-base font-medium">{role!.roleColor || '#99aab5'}</Text>
                        </Pressable>
                    </View>

                    <View className="mb-8 rounded-xl border border-white/12 overflow-hidden bg-white/[0.05]">
                        <ContainerwithSwitch
                            title="Display Separately"
                            description="Display role members separately from online members"
                            backgroundColor="transparent"
                            customSwitch={
                                <CustomSwitch value={pageData!?.displaySeparately} onValueChange={() => { }} />
                            }
                        />
                        <View className="h-px bg-white/6 mx-4" />
                        <ContainerwithSwitch
                            title="Allow Mentioning"
                            description="Allow anyone to @mention this role"
                            backgroundColor="transparent"
                            customSwitch={
                                <CustomSwitch value={pageData!?.allowMentioning} onValueChange={() => { }} />
                            }
                        />
                    </View>

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-white/55 text-sm font-medium">Permissions</Text>
                    </View>
                    {pageData?.permissionGroups?.map((group: any, idx: number) => (
                        <PermissionGroup key={idx} index={idx} group={group} onToggle={onPermissionToggle} roleId={(role!?.roleId).toString()} communityId={communityId as string} permissionMask={pageData?.permissionsMask} />
                    ))}

                    <View style={{ paddingBottom: Math.max(insets.bottom + 20, 40) }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
