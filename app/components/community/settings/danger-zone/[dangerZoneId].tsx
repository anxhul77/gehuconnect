import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

export default function DangerZoneSettings() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView className="flex-1 bg-black">
            <KeyboardAvoidingView className="flex-1 bg-black"
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}>
            <View className="flex-row items-center justify-between px-4 py-4">
                <Pressable onPress={() => router.back()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </Pressable>
                <Text className="text-[#ED4956] font-bold text-xl">Danger Zone</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                
                <View className="flex-row justify-between mb-2">
                    <Text className="text-[#ED4956]/80 text-sm font-medium">Destructive Actions</Text>
                </View>
                <View className="bg-white/[0.05] rounded-xl border border-white/12 overflow-hidden mb-8">
                    
                    <Pressable className="flex-row items-center justify-between p-4 active:bg-white/[0.08]">
                        <View>
                            <Text className="text-[#ED4956] font-bold text-base">Transfer Ownership</Text>
                            <Text className="text-white/55 text-xs mt-1">Give community to another member</Text>
                        </View>
                        <Ionicons name="swap-horizontal" size={24} color="#ED4956" />
                    </Pressable>
                    <View className="h-px bg-white/6 mx-4" />

                    <Pressable className="flex-row items-center justify-between p-4 active:bg-white/[0.08]">
                        <View>
                            <Text className="text-[#ED4956] font-bold text-base">Leave Community</Text>
                            <Text className="text-white/55 text-xs mt-1">Remove yourself from this community</Text>
                        </View>
                        <Ionicons name="exit-outline" size={24} color="#ED4956" />
                    </Pressable>
                    <View className="h-px bg-white/6 mx-4" />

                    <Pressable className="flex-row items-center justify-between p-4 active:bg-white/[0.08]">
                        <View>
                            <Text className="text-[#ED4956] font-bold text-base">Delete Community</Text>
                            <Text className="text-white/55 text-xs mt-1">Permanently destroy this community</Text>
                        </View>
                        <Ionicons name="trash-outline" size={24} color="#ED4956" />
                    </Pressable>

                </View>

                <View className="p-4 rounded-xl border mb-8" style={{ backgroundColor: 'rgba(237, 73, 86, 0.1)', borderColor: 'rgba(237, 73, 86, 0.2)' }}>
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="warning" size={20} color="#ED4956" />
                        <Text className="text-[#ED4956] font-bold text-base ml-2">Warning</Text>
                    </View>
                    <Text className="text-[#ED4956]/80 text-sm leading-5">
                        These actions are irreversible. If you delete the community, all channels, messages, and member data will be permanently lost.
                    </Text>
                </View>

                <View style={{ paddingBottom: Math.max(insets.bottom + 20, 40) }} />
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
