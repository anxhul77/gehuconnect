import { View, Text, Pressable, TextInput, ScrollView, Image, Platform } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useBottomSheet } from '../../../../contexts/BottomSheetContext';

const DUMMY_MEMBERS = [
    { id: '1', name: 'John', role: 'Owner', joined: 'Joined 2 years ago', avatar: 'https://i.pravatar.cc/150?u=john' },
    { id: '2', name: 'Mike', role: 'Admin', joined: 'Joined yesterday', avatar: 'https://i.pravatar.cc/150?u=mike' },
    { id: '3', name: 'Sarah', role: 'Member', joined: 'Joined 3 months ago', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { id: '4', name: 'Alex', role: 'Moderator', joined: 'Joined 1 year ago', avatar: 'https://i.pravatar.cc/150?u=alex' },
];

const MemberActionsSheet = ({ member, onClose }: { member: any, onClose: () => void }) => {
    return (
        <View className="flex-1 bg-[#0a0a0a] p-6 rounded-t-3xl">
            <View className="flex-row items-center mb-6">
                <Image source={{ uri: member.avatar }} className="w-16 h-16 rounded-full mr-4" />
                <View>
                    <Text className="text-white font-bold text-xl">{member.name}</Text>
                    <Text className="text-white/30 text-sm">{member.role}</Text>
                </View>
            </View>

            <View className="flex-row justify-between mb-2">
                <Text className="text-white/55 text-sm font-medium">Roles</Text>
            </View>
            <View className="bg-white/[0.05] rounded-2xl overflow-hidden border border-white/12 mb-6">
                <View className="flex-row items-center justify-between p-4">
                    <Text className="text-white font-medium">Member</Text>
                    <Ionicons name="checkmark" size={20} color="#5865F2" />
                </View>
                <View className="h-px bg-white/6 mx-4" />
                <View className="flex-row items-center justify-between p-4">
                    <Text className="text-white font-medium">Verified</Text>
                    <Ionicons name="checkmark" size={20} color="#5865F2" />
                </View>
                <View className="h-px bg-white/6 mx-4" />
                <Pressable className="flex-row items-center p-4">
                    <Ionicons name="add" size={20} color="#5865F2" />
                    <Text className="text-[#5865F2] font-medium ml-2">Add Role</Text>
                </Pressable>
            </View>

            <View className="flex-row justify-between mb-2">
                <Text className="text-white/55 text-sm font-medium">Moderation</Text>
            </View>
            <View className="bg-white/[0.05] rounded-2xl overflow-hidden border border-white/12">
                <Pressable className="p-4 active:bg-white/[0.08]">
                    <Text className="text-white font-medium">Remove from Community</Text>
                </Pressable>
                <View className="h-px bg-white/6 mx-4" />
                <Pressable className="p-4 active:bg-white/[0.08]">
                    <Text className="text-[#ED4956] font-medium">Kick {member.name}</Text>
                </Pressable>
                <View className="h-px bg-white/6 mx-4" />
                <Pressable className="p-4 active:bg-white/[0.08]">
                    <Text className="text-[#ED4956] font-medium">Ban {member.name}</Text>
                </Pressable>
                <View className="h-px bg-white/6 mx-4" />
                <Pressable className="p-4 active:bg-white/[0.08]">
                    <Text className="text-[#ED4956] font-medium">Timeout {member.name}</Text>
                </Pressable>
            </View>
        </View>
    );
};

export default function MembersSettings() {
    const router = useRouter();
    const { openActionSheet, closeActionSheet } = useBottomSheet();
    const [search, setSearch] = useState('');

    const filteredMembers = DUMMY_MEMBERS.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

    const handleMemberPress = (member: any) => {
        openActionSheet(
            () => <MemberActionsSheet member={member} onClose={closeActionSheet} />,
            ["75%"],
            true,
            null,
            "#0a0a0a"
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <KeyboardAvoidingView className="flex-1 bg-black"
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}>
                <View className="flex-row items-center justify-between px-4 py-4">
                    <Pressable onPress={() => router.back()} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </Pressable>
                    <Text className="text-white font-bold text-xl">Members</Text>
                    <View className="w-10" />
                </View>

                <View className="px-4 pb-4">
                    <View className="flex-row items-center bg-white/[0.05] rounded-xl px-4 py-3 border border-white/12">
                        <Ionicons name="search" size={20} color="rgba(255,255,255,0.35)" />
                        <TextInput
                            className="flex-1 ml-3 text-white text-base"
                            placeholder="Search members..."
                            placeholderTextColor="rgba(255,255,255,0.22)"
                            value={search}
                            onChangeText={setSearch}
                            style={{ color: "#f0f0f0" }}
                        />
                    </View>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {filteredMembers.map((member, index) => (
                        <View key={member.id}>
                            <Pressable
                                className="flex-row items-center justify-between px-6 py-4 bg-transparent active:bg-white/[0.05]"
                                onPress={() => handleMemberPress(member)}
                            >
                                <View className="flex-row items-center">
                                    <Image source={{ uri: member.avatar }} className="w-12 h-12 rounded-full mr-4 bg-white/10" />
                                    <View>
                                        <Text className="text-white font-semibold text-lg">{member.name}</Text>
                                        <Text className="text-white/30 text-sm mt-0.5">{member.role} • {member.joined}</Text>
                                    </View>
                                </View>
                                <Ionicons name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.3)" />
                            </Pressable>
                            {index < filteredMembers.length - 1 && (
                                <View className="h-px bg-white/6 ml-[88px]" />
                            )}
                        </View>
                    ))}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
