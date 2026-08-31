import { View, Text, Pressable, TextInput, ScrollView, Platform } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons, SimpleLineIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ContainerwithSwitch from '../../../Custom/ContainerwithSwitch';
import RadioSwitch from '../../../Custom/RadioSwitch';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

export default function GeneralSettings() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isChanged, setIsChanged] = useState<string[]>([]);
    const [name, setName] = useState();
    const [description, setDescription] = useState();
    const [visibility, setVisibility] = useState<'Public' | 'Private'>('Public');
    const [tags, setTags] = useState();

    const handleSave = () => {
        router.back();
    };
    const handleNameChange = (val: any) => {
        setName(val)
        setIsChanged((prev) => [...prev, "CHANNEL"])
    }
    const handleDescriptionChange = (val: any) => {
        setDescription(val)
        setIsChanged((prev) => [...prev, "DESCRIPTION"])
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
                    <Text className="text-white font-bold text-xl">General</Text>
                    <View className="w-10" />
                </View>

                <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                    <View className="mb-6">
                        <View className="flex-row justify-between mb-1.5">
                            <Text className="text-white/55 text-sm font-medium">Community Name</Text>
                        </View>
                        <TextInput
                            className="bg-white/[0.05] rounded-xl px-4 py-3 text-[15px] border border-white/12"
                            style={{ color: "#f0f0f0" }}
                            placeholderTextColor="rgba(255,255,255,0.22)"
                            placeholder="Enter community name"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View className="mb-6">
                        <View className="flex-row justify-between mb-1.5">
                            <Text className="text-white/55 text-sm font-medium">Description</Text>
                        </View>
                        <TextInput
                            className="bg-white/[0.05] rounded-xl px-4 py-3 text-[15px] border border-white/12"
                            style={{ minHeight: 112, color: "#f0f0f0" }}
                            placeholderTextColor="rgba(255,255,255,0.22)"
                            placeholder="Write a description"
                            multiline
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <View className="mb-6">
                        <View className="flex-row justify-between mb-1.5">
                            <Text className="text-white/55 text-sm font-medium">Visibility</Text>
                        </View>
                        <View className="bg-white/[0.05] rounded-xl border border-white/12 overflow-hidden">
                            <Pressable onPress={() => setVisibility('Public')}>
                                <ContainerwithSwitch
                                    icon={<SimpleLineIcons name="globe" size={24} color="#c7c8ce" />}
                                    title="Public"
                                    style={{ borderTopRightRadius: 16, borderTopLeftRadius: 16, }}
                                    description="Anyone can see and join"
                                    backgroundColor="transparent"
                                    customSwitch={
                                        <RadioSwitch selected={visibility === 'Public'}></RadioSwitch>
                                    }
                                />
                            </Pressable>
                            <View className="h-px bg-white/6 mx-4" />
                            <Pressable onPress={() => setVisibility('Private')}>
                                <ContainerwithSwitch
                                    icon={<SimpleLineIcons name="lock" size={24} color="#c7c8ce" />}
                                    title="Private"
                                    description="Invite only"
                                    backgroundColor="transparent"
                                    style={{ borderBottomRightRadius: 16, borderBottomLeftRadius: 16 }}
                                    customSwitch={
                                        <RadioSwitch selected={visibility === 'Private'}></RadioSwitch>
                                    }
                                />
                            </Pressable>
                        </View>
                    </View>

                    <View className="mb-8">
                        <View className="flex-row justify-between mb-1.5">
                            <Text className="text-white/55 text-sm font-medium">Tags</Text>
                        </View>
                        <TextInput
                            className="bg-white/[0.05] rounded-xl px-4 py-3 text-[15px] border border-white/12"
                            style={{ color: "#f0f0f0" }}
                            placeholderTextColor="rgba(255,255,255,0.22)"
                            placeholder="e.g. gaming, technology"
                            value={tags}
                            onChangeText={setTags}
                        />
                        <Text className="text-white/30 text-xs mt-2">Separate tags with commas</Text>
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
