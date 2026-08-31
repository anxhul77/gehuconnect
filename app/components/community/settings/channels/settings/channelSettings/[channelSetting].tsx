import { useUpdateCommunityChannelMutation } from "@/src/features/community/channel.api";
import { useGetRolesQuery } from "@/src/features/community/role.api";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { Platform, Pressable, Text } from "react-native";
import { View } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function channelSettings() {

    const insets = useSafeAreaInsets()
    const { channelSetting: communityId, items } = useLocalSearchParams()
    const item = JSON.parse(items as string)
    const [name, setName] = useState<string>(item.channelName || '')
    const [triggerChannelUpdate] = useUpdateCommunityChannelMutation()
    const [description, setDescription] = useState<string>(item.description || '')

    const orignalName = item.channelName || ''
    const orignalDescription = item.description || ''
    const router = useRouter();
    const handleBack = () => {
        router.back()
    };
    const hasChanges =
        name !== orignalName ||
        description !== orignalDescription;

    const handleSave = async () => {
        if (!hasChanges) return;

        const changes = {
            name:
                name !== orignalName
                    ?
                    name

                    : undefined,

            description:
                description !== orignalDescription
                    ?
                    description

                    : undefined,
        };
        try {
            await triggerChannelUpdate({ communityId: communityId as string, channelId: item.channelId, dto: { ...changes }, idx: item.idx })
            router.back()
        } catch {

        }



    };


    const { data: roleData } = useGetRolesQuery(communityId as string);

    return (
        <SafeAreaView className="flex-1 bg-black">
            <KeyboardAvoidingView className="flex-1 bg-black"
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}>

                <View className="w-full flex-row items-center px-4 py-4">

                    <View className="w-12 items-start">
                        <Pressable onPress={handleBack} className="p-2">
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color="#FFFFFF"
                            />
                        </Pressable>
                    </View>


                    <View className="flex-1 flex-row items-center justify-center">
                        {item.type === "voice" ? (
                            <Ionicons
                                name="volume-medium"
                                size={20}
                                color="rgba(255,255,255,0.3)"
                            />
                        ) : (
                            <Feather
                                name="hash"
                                size={24}
                                color="rgba(255,255,255,0.3)"
                            />
                        )}

                        <Text className="text-white font-bold text-xl ml-2">
                            {item.channelName}
                        </Text>
                    </View>


                    <View className="w-12 items-end">
                        {hasChanges && (
                            <Pressable onPress={handleSave}>
                                <Text className="text-blue-500 font-medium">
                                    Save
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </View>


                <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
                    <View className="mb-6">
                        <View className="flex-row justify-between mb-1.5">
                            <Text className="text-white/55 text-sm font-medium">Channel name</Text>
                        </View>
                        <TextInput
                            className="bg-white/[0.05] rounded-xl px-4 py-3 text-[15px] border border-white/12"
                            style={{ color: "#f0f0f0" }}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View className="mb-6">
                        <View className="flex-row justify-between mb-1.5">
                            <Text className="text-white/55 text-sm font-medium">Channel description</Text>
                        </View>
                        <TextInput
                            className="bg-white/[0.05] rounded-xl px-4 py-3 text-[15px] border border-white/12 h-32"
                            style={{ color: "#f0f0f0", textAlignVertical: "top" }}
                            value={description}
                            placeholder="Add a description"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            onChangeText={setDescription}
                            multiline
                        />
                    </View>

                    <View className="flex mb-2">
                        <Text className="text-white/55 text-sm font-medium">Channel Permissions</Text>
                        <Text className="text-white/55 text-sm ">Note : These permission will override community permission for a particular role at channel level for this channel.</Text>
                        <Text className="text-white/55 text-sm font-medium mt-2">Existing Roles</Text>
                    </View>
                    <View className="bg-white/[0.05] rounded-xl border border-white/12 overflow-hidden mb-8">
                        {roleData?.roles.map((role, idx) => (
                            <View key={role.roleId}>
                                <Pressable
                                    className="flex-row items-center justify-between p-4 active:bg-white/[0.08]"
                                    onPress={() => { router.push({ pathname: `/components/community/settings/channels/settings/PermissionSettings/${communityId}`, params: { items: JSON.stringify({ ...item, overrideTypeId: role.roleId, roleName: role.roleName, permissionOverrideType: "ROLE" }) } }) }}
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons name="people" size={20} color="rgba(255,255,255,0.35)" />
                                        <Text className="text-white font-medium text-base ml-3">@{role.roleName}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                                </Pressable>
                                {idx < roleData?.roles.length - 1 && (
                                    <View className="h-px bg-white/6 mx-4" />
                                )}
                            </View>
                        ))}
                        <View className="h-px bg-white/6 mx-4" />
                        <Pressable className="flex-row items-center p-4 active:bg-white/[0.08]">
                            <Ionicons name="add" size={20} color="#5865F2" />
                            <Text className="text-[#5865F2] font-medium text-base ml-2">Add Role</Text>
                        </Pressable>
                    </View>
                    <Pressable className="flex-row items-center items-center gap-2 p-4 h-14 bg-white/[0.05] rounded-xl border border-white/12">
                        <Ionicons name="folder-open" size={20} color="rgba(255,255,255,0.3)" />
                        <Text className="text-white/55 text-base font-medium">Move to different category</Text>
                    </Pressable>
                    <View style={{ paddingBottom: Math.max(insets.bottom + 20, 40) }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
