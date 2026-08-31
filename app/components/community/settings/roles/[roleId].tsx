import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useGetRolesQuery } from '@/src/features/community/role.api';

export default function RolesSettings() {
    const router = useRouter();
    const { roleId: communityId } = useLocalSearchParams();

    const { data: roleData } = useGetRolesQuery(communityId as string);

    const defaultRoles = roleData?.defaultRoles || [];
    const customRoles = roleData?.customRoles || [];
    console.log("defaultroles", defaultRoles)
    const handleBack = () => {
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <KeyboardAvoidingView className="flex-1 bg-black"
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}>
                <View className="flex-row items-center justify-between px-4 py-4">
                    <Pressable onPress={handleBack} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </Pressable>
                    <Text className="text-white font-bold text-xl">Roles</Text>
                    <Pressable className="p-2" onPress={() => router.push("/components/community/settings/roles/createRole/createRole")}>
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </Pressable>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="flex justify-center items-center">
                        <Text className="text-white/55 text-sm mb-4">Use roles to group members and assign permissions.</Text>
                    </View>

                    <View className="px-4 pb-40">
                        {defaultRoles.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-white/55 text-xs font-bold uppercase mb-2 ml-1">Default Roles</Text>
                                {defaultRoles.map((role: any) => (
                                    <Pressable
                                        key={role.roleId}
                                        className="flex-row items-center justify-between p-4 bg-[#121212] rounded-xl mb-2 border border-white/12 active:bg-white/[0.08]"
                                        onPress={() => router.push({
                                            pathname: `/components/community/settings/roles/roleSetting/${communityId}`,
                                            params: { roleData: JSON.stringify(role) }
                                        })}
                                    >
                                        <View className="flex-row items-center">
                                            <Ionicons name="shield-half" size={24} color={role.roleColor || '#99aab5'} className="mr-3" />
                                            <View className='flex justify-center ml-3'>
                                                <Text className="text-white font-semibold text-base ">@{role.roleName}</Text>
                                                <Text className="text-gray-400 text-xs">Default permissions for community member</Text>
                                            </View>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        <View className="mb-6">
                            <Text className="text-white/55 text-xs font-bold uppercase mb-2 ml-1">Custom Roles</Text>
                            {customRoles.map((role: any) => (
                                <Pressable
                                    key={role.roleId}
                                    className="flex-row items-center justify-between p-4 bg-[#121212] rounded-xl mb-2 border border-white/12 active:bg-white/[0.08]"
                                    onPress={() => router.push({
                                        pathname: `/components/community/settings/roles/roleSetting/${communityId}`,
                                        params: { roleData: JSON.stringify(role) }
                                    })}
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons name="shield-half" size={20} color={role.roleColor || '#99aab5'} className="mr-3" />
                                        <Text className="text-white font-semibold text-base ml-3">{role.roleName}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                                </Pressable>
                            ))}

                            <Pressable className="flex-row items-center justify-center p-4 bg-white/[0.05] rounded-xl mt-2 border border-white/12 border-dashed">
                                <Ionicons name="add" size={20} color="#5865F2" />
                                <Text className="text-[#5865F2] font-semibold text-base ml-2">Create Role</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
