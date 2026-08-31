import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, Platform } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Collapsible from 'react-native-collapsible';
import ContainerwithSwitch from '../../Custom/ContainerwithSwitch';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

const DUMMY_ROLES = [
    { id: '1', name: 'Owner', color: '#ED4956' },
    { id: '2', name: 'Admin', color: '#F59E0B' },
    { id: '3', name: 'Moderator', color: '#5865F2' },
    { id: '4', name: 'Event Manager', color: '#10B981' },
    { id: '5', name: 'Content Moderator', color: '#8B5CF6' },
    { id: '6', name: 'Member', color: '#B5BAC1' },
    { id: '7', name: 'Verified', color: '#38BDF8' },
    { id: '8', name: 'Muted', color: '#4B5563' },
];

const PERMISSION_GROUPS = [
    {
        name: 'Community',
        permissions: ['Manage Community', 'Manage Roles', 'Manage Channels', 'View Audit Log']
    },
    {
        name: 'Feed',
        permissions: ['Create Post', 'Delete Any Post', 'Lock Post', 'Feature Post', 'Pin Post']
    },
    {
        name: 'Messages',
        permissions: ['Send Messages', 'Delete Messages', 'Embed Links', 'Attach Files']
    },
    {
        name: 'Events',
        permissions: ['Create Events', 'Manage Events']
    },
    {
        name: 'Moderation',
        permissions: ['Kick Members', 'Ban Members', 'Timeout Members']
    }
];


const PermissionGroup = ({ group }: { group: any }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <View className="mb-4">

            <Pressable
                className="flex-row items-center justify-between p-4 bg-[#121212] rounded-t-xl border border-white/12"
                style={!isCollapsed && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                onPress={() => setIsCollapsed(!isCollapsed)}
            >
                <Text className="text-white font-bold text-base">{group.name}</Text>
                <Ionicons name={isCollapsed ? "chevron-down" : "chevron-up"} size={20} color="rgba(255,255,255,0.3)" />
            </Pressable>
            <Collapsible collapsed={isCollapsed}>
                <View className="bg-[#121212] border border-t-0 border-white/12 rounded-b-xl overflow-hidden px-2 pb-2 pt-2">
                    {group.permissions.map((perm: string, idx: number) => (
                        <View key={idx} className="mb-2">
                            <ContainerwithSwitch
                                title={perm}
                                backgroundColor="transparent"
                                customSwitch={
                                    <View className="w-12 h-6 bg-white/10 rounded-full justify-center px-1">
                                        <View className="w-4 h-4 bg-white/30 rounded-full" />
                                    </View>
                                }
                            />
                        </View>
                    ))}
                </View>
            </Collapsible>

        </View>

    );
};

export default function RolesSettings() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [selectedRole, setSelectedRole] = useState<any>(null);
    const { data: roleData } = useGetCommunityRolesQuery()
    const handleBack = () => {
        if (selectedRole) {
            setSelectedRole(null);
        } else {
            router.back();
        }
    };

    if (selectedRole) {
        return (
            <SafeAreaView className="flex-1 bg-black">
                <KeyboardAvoidingView className="flex-1 bg-black"
                    behavior="padding"
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}>
                    <View className="flex-row items-center justify-between px-4 py-4">
                        <Pressable onPress={handleBack} className="p-2">
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </Pressable>
                        <Text className="text-white font-bold text-xl flex-1 text-center mr-10">{selectedRole.name}</Text>
                    </View>

                    <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
                        <View className="mb-6">
                            <View className="flex-row justify-between mb-1.5">
                                <Text className="text-white/55 text-sm font-medium">Role Name</Text>
                            </View>
                            <TextInput
                                className="bg-white/[0.05] rounded-xl px-4 py-3 text-[15px] border border-white/12"
                                style={{ color: "#f0f0f0" }}
                                value={selectedRole.name}
                            />
                        </View>

                        <View className="mb-6">
                            <View className="flex-row justify-between mb-1.5">
                                <Text className="text-white/55 text-sm font-medium">Role Color</Text>
                            </View>
                            <Pressable className="flex-row items-center p-4 h-14 bg-white/[0.05] rounded-xl border border-white/12">
                                <View className="w-6 h-6 rounded-full mr-3" style={{ backgroundColor: selectedRole.color }} />
                                <Text className="text-white text-base font-medium">{selectedRole.color}</Text>
                            </Pressable>
                        </View>

                        <View className="mb-8 rounded-xl border border-white/12 overflow-hidden bg-white/[0.05]">
                            <ContainerwithSwitch
                                title="Display Separately"
                                description="Display role members separately from online members"
                                backgroundColor="transparent"
                                customSwitch={
                                    <View className="w-12 h-6 bg-[#5865F2] rounded-full justify-center px-1">
                                        <View className="w-4 h-4 bg-white rounded-full self-end" />
                                    </View>
                                }
                            />
                            <View className="h-px bg-white/6 mx-4" />
                            <ContainerwithSwitch
                                title="Allow Mentioning"
                                description="Allow anyone to @mention this role"
                                backgroundColor="transparent"
                                customSwitch={
                                    <View className="w-12 h-6 bg-white/10 rounded-full justify-center px-1">
                                        <View className="w-4 h-4 bg-white/30 rounded-full" />
                                    </View>
                                }
                            />
                        </View>

                        <View className="flex-row justify-between mb-2">
                            <Text className="text-white/55 text-sm font-medium">Permissions</Text>
                        </View>
                        {PERMISSION_GROUPS.map((group, idx) => (
                            <PermissionGroup key={idx} group={group} />
                        ))}

                        <View style={{ paddingBottom: Math.max(insets.bottom + 20, 40) }} />
                    </ScrollView>
                </KeyboardAvoidingView>
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
                    <Text className="text-white font-bold text-xl">Roles</Text>
                    <Pressable className="p-2">
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </Pressable>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="px-4 py-2">
                        <Text className="text-white/30 text-sm mb-4">Use roles to group members and assign permissions.</Text>
                    </View>

                    <View className="px-4 pb-40">
                        {DUMMY_ROLES.map((role) => (
                            <Pressable
                                key={role.id}
                                className="flex-row items-center justify-between p-4 bg-white/[0.05] rounded-xl mb-2 border border-white/12 active:bg-white/[0.08]"
                                onPress={() => setSelectedRole(role)}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="shield-half" size={20} color={role.color} className="mr-3" />
                                    <Text className="text-white font-semibold text-base ml-3">{role.name}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                            </Pressable>
                        ))}

                        <Pressable className="flex-row items-center justify-center p-4 bg-white/[0.05] rounded-xl mt-4 border border-white/12 border-dashed">
                            <Ionicons name="add" size={20} color="#5865F2" />
                            <Text className="text-[#5865F2] font-semibold text-base ml-2">Create Role</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
