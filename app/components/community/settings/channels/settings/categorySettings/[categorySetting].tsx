import { useBottomSheet } from "@/app/contexts/BottomSheetContext";
import { useGetCategoryOverridenMembersQuery, useGetRolesQuery } from "@/src/features/community/role.api";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Platform, Pressable, Text, View, Keyboard, ActivityIndicator } from "react-native";

import { ScrollView, TextInput } from "react-native-gesture-handler";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useUpdateCommunityChannelCategoryMutation } from "@/src/features/community/channel.api";
import { useState } from "react";


export default function channelSettings() {

    const insets = useSafeAreaInsets()
    const { categorySetting: communityId, items } = useLocalSearchParams()
    const { openActionSheet, closeActionSheet } = useBottomSheet()
    const [triggerChannelCategoryUpdate, { isLoading: isSaving }] = useUpdateCommunityChannelCategoryMutation()

    const item = JSON.parse(items as string)
    const [name, setName] = useState<string>(item.name)
    const router = useRouter();
    const handleBack = () => {
        router.back()
    };

    const orignalName = item.name || ''

    const hasChanges =
        name !== orignalName

    const handleSave = async () => {
        Keyboard.dismiss()
        if (!hasChanges) return;

        const changes = {
            name:
                name !== orignalName
                    ?
                    name
                    : undefined,

        };
        try {
            triggerChannelCategoryUpdate({ channelCategoryId: item.id, communityId: communityId as string, dto: { ...changes }, idx: item.idx })
            router.back()
        } catch {

        }



    };

    const { data: roleData } = useGetRolesQuery(communityId as string);
    const { data: members } = useGetCategoryOverridenMembersQuery(item.categoryId as string)
    const handleOpenMemberSheet = (communityId: string) => {

    };
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
                            <FontAwesome6 name="question" size={24} color="rgba(255,255,255,0.3)" />

                        )}

                        <Text className="text-white font-bold text-xl ml-2">
                            {item.name}
                        </Text>
                    </View>


                    <View className="w-12 items-end">
                        {hasChanges && (
                            <Pressable onPress={handleSave} disabled={isSaving}>
                                {isSaving ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#3B82F6"
                                    />) :
                                    (<Text className="text-blue-500 font-medium">
                                        Save
                                    </Text>)}
                            </Pressable>
                        )}
                    </View>
                </View>

                <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
                    <View className="mb-6">
                        <View className="flex-row justify-between mb-1.5">
                            <Text className="text-white/55 text-sm font-medium">Category name</Text>
                        </View>
                        <TextInput
                            className="bg-white/[0.05] rounded-xl px-4 py-3 text-[15px] border border-white/12"
                            style={{ color: "#f0f0f0" }}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>








                    <View className="flex mb-2">
                        <Text className="text-white/55 text-sm font-medium">Category Permissions</Text>
                        <Text className="text-white/55 text-sm ">Note : These permission will override community permission for a particular role at channel level for all the channels inside this category </Text>
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
                    <Text className="text-white/55 text-sm font-medium mt-2">Overriden Members</Text>
                    <View className="bg-white/[0.05] rounded-xl border border-white/12 overflow-hidden mb-8">

                        {members?.map((member, idx) => (
                            <View key={member.id}>
                                <Pressable
                                    className="flex-row items-center justify-between p-4 active:bg-white/[0.08]"
                                    onPress={() => { router.push({ pathname: `/components/community/settings/channels/settings/PermissionSettings/${communityId}`, params: { items: JSON.stringify({ ...item, overrideTypeId: member.id, memberName: member.name, permissionOverrideType: "MEMBER" }) } }) }}
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons name="people" size={20} color="rgba(255,255,255,0.35)" />
                                        <Text className="text-white font-medium text-base ml-3">{member.name}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                                </Pressable>
                                {idx < members?.length - 1 && (
                                    <View className="h-px bg-white/6 mx-4" />
                                )}
                            </View>
                        ))}
                        <View className="h-px bg-white/6 mx-4" />
                        <Pressable className="flex-row items-center p-4 active:bg-white/[0.08]" onPress={() => handleOpenMemberSheet(communityId as string)}>
                            <Ionicons name="add" size={20} color="#5865F2" />
                            <Text className="text-[#5865F2] font-medium text-base ml-2">Add Member</Text>
                        </Pressable>
                    </View>


                    <Pressable className="flex-row items-center items-center gap-2 p-4 h-16  bg-white/[0.05] rounded-xl border border-white/12">
                        <Ionicons name="trash" size={20} color="rgba(227, 24, 24, 0.84)" />
                        <Text className="text-red-700 text-base font-medium">Delete Category</Text>

                    </Pressable>

                    <View style={{ paddingBottom: Math.max(insets.bottom + 20, 40) }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView >
    )
}
