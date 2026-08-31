import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ContainerwithSwitch from '../../../Custom/ContainerwithSwitch';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

export default function AppearanceSettings() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [accentColor, setAccentColor] = useState('#5865F2');

    const colors = ['#5865F2', '#ED4956', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

    const handleSave = () => {
        router.back();
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
                    <Text className="text-white font-bold text-xl">Appearance</Text>
                    <View className="w-10" />
                </View>

                <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                    <View className="mb-6">
                        <View className="flex-row justify-between mb-1.5">
                            <Text className="text-white/55 text-sm font-medium">Community Icon</Text>
                        </View>
                        <Pressable className="h-24 w-24 rounded-full bg-white/[0.05] items-center justify-center border border-white/12 border-dashed">
                            <Ionicons name="camera-outline" size={32} color="rgba(255,255,255,0.35)" />
                            <Text className="text-white/30 text-xs mt-1">Upload</Text>
                        </Pressable>
                    </View>

                    <View className="mb-8">
                        <View className="flex-row justify-between mb-1.5">
                            <Text className="text-white/55 text-sm font-medium">Community Banner</Text>
                        </View>
                        <Pressable className="h-32 w-full rounded-2xl bg-white/[0.05] items-center justify-center border border-white/12 border-dashed">
                            <Ionicons name="image-outline" size={40} color="rgba(255,255,255,0.35)" />
                            <Text className="text-white/30 text-xs mt-2">Upload Banner Image (16:9)</Text>
                        </Pressable>
                    </View>

                    <View className="mb-8">
                        <View className="flex-row justify-between mb-1.5">
                            <Text className="text-white/55 text-sm font-medium">Accent Color</Text>
                        </View>
                        <View className="flex-row flex-wrap gap-4">
                            {colors.map((color) => (
                                <Pressable
                                    key={color}
                                    onPress={() => setAccentColor(color)}
                                    style={[
                                        { backgroundColor: color },
                                        styles.colorCircle,
                                        accentColor === color && styles.colorCircleSelected
                                    ]}
                                >
                                    {accentColor === color && (
                                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View className="mb-8 rounded-2xl overflow-hidden border border-white/12 bg-white/[0.05]">
                        <ContainerwithSwitch
                            title="Dark Theme"
                            description="Force dark theme for all members"
                            backgroundColor="transparent"
                            customSwitch={
                                <View className="w-12 h-6 bg-[#5865F2] rounded-full justify-center px-1">
                                    <View className="w-4 h-4 bg-white rounded-full self-end" />
                                </View>
                            }
                        />
                    </View>

                    <View style={{ paddingBottom: Math.max(insets.bottom + 20, 40) }}>
                        <Pressable
                            className="flex justify-center items-center w-full h-14 bg-[#5865F2] rounded-full active:opacity-80"
                            onPress={handleSave}
                        >
                            <Text className="text-white font-bold text-[15px]">Save Changes</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    colorCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    colorCircleSelected: {
        borderWidth: 3,
        borderColor: '#FFFFFF',
    }
});
