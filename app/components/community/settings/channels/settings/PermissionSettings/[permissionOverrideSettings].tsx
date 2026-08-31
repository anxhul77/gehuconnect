import { useCategoryPermissionOverrideQuery, useChannelPermissionOverrideQuery, useUpdateCategoryPermissionOverrideMutation, useUpdateChannelPermissionOverrideMutation } from "@/src/features/community/role.api";

import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const PermissionItem = memo(({ val, onPress, groupIdx, permissionIdx }: { groupIdx: number, permissionIdx: number, val: any, onPress: (permissionStatus: "ALLOW" | "DENY" | "INHERIT", mask: string, groupIdx: number, permissionIdx: number) => void }) => {
    return (
        <View className="bg-white/[0.05] rounded-xl border border-white/12 p-4">
            <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                    <Text className="text-white font-bold text-base mb-1.5">{val.title}</Text>
                    <Text className="text-white/55 text-sm">{val.description}</Text>
                </View>
                <View className="w-[120px] flex-row rounded-lg overflow-hidden border bg-black border-white/12 h-10 ">
                    <Pressable className={`flex-1 mx-1 my-1 rounded-lg  items-center justify-center ${val.state === "DENY" ? "bg-white/10" : ""}`} onPress={() => onPress("DENY", val.bit, groupIdx, permissionIdx)}>

                        <Ionicons name="close" size={20} color="#ED4956" />
                    </Pressable>
                    <View className="w-px bg-white/12" />
                    <Pressable className={`flex-1 mx-1 my-1 rounded-lg items-center justify-center ${val.state === "INHERIT" ? "bg-white/10" : ""}`} onPress={() => onPress("INHERIT", val.bit, groupIdx, permissionIdx)}>

                        <AntDesign name="rollback" size={20} color="rgba(255,255,255,0.3)" />
                    </Pressable>
                    <View className="w-px bg-white/12" />
                    <Pressable className={`flex-1 mx-1 my-1 rounded-lg  items-center justify-center ${val.state === "ALLOW" ? "bg-white/10" : ""}`} onPress={() => onPress("ALLOW", val.bit, groupIdx, permissionIdx)}>
                        <Ionicons name="checkmark" size={20} color="#10B981" />
                    </Pressable>
                </View>
            </View>
        </View>
    );
});

export default function PermissionOverrideSettings() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { items, permissionOverrideSettings: id } = useLocalSearchParams();

    const handleBack = () => {
        router.back();
    };
    const [channelTrigger] = useUpdateChannelPermissionOverrideMutation()
    const [categoryTrigger] = useUpdateCategoryPermissionOverrideMutation()

    const item = JSON.parse(items as string)
    console.log(item)
    let pageData: any;
    if (item.type === "CATEGORY") {
        const { data } = useCategoryPermissionOverrideQuery({
            categoryId: item.id, overrideTypeId: item.overrideTypeId as string, permissionOverrideType: item.permissionOverrideType

        })
        pageData = data
    } else {
        const { data } = useChannelPermissionOverrideQuery({
            channelId: item.channelId, overrideTypeId: item.overrideTypeId as string, permissionOverrideType: item.permissionOverrideType

        })
        pageData = data
    }
    console.log("pageData", pageData)
    function handlePress(permissionStatus: "ALLOW" | "DENY" | "INHERIT", mask: string, groupIdx: number, permissionIdx: number) {

        const allowedMask = BigInt(pageData?.allowedPermissions ?? "0");
        const deniedMask = BigInt(pageData?.deniedPermissions ?? "0");
        const permissionBit = BigInt(mask);
        let updatedAllowedMask;
        let updatedDeniedMask;
        switch (permissionStatus) {
            case "ALLOW":
                updatedAllowedMask = allowedMask | permissionBit;
                updatedDeniedMask = deniedMask & ~permissionBit;
                break;

            case "DENY":
                updatedAllowedMask = allowedMask & ~permissionBit;
                updatedDeniedMask = deniedMask | permissionBit;
                break;

            case "INHERIT":
                updatedAllowedMask = allowedMask & ~permissionBit;
                updatedDeniedMask = deniedMask & ~permissionBit;
                break;

            default:
                throw new Error(`Unknown permission state: ${permissionStatus}`);
        }
        if (item.type === "CATEGORY") {
            categoryTrigger({
                allowedMask: updatedAllowedMask.toString(),
                deniedMask: updatedDeniedMask.toString(),
                overrideTypeId: item.overrideTypeId as string,
                permissionOverrideType: item.permissionOverrideType,
                categoryId: item.id,
                communityId: id as string,
                groupIdx,
                permissionIndex: permissionIdx,
                permissionStatus

            })
        } else {
            channelTrigger({
                allowedMask: updatedAllowedMask.toString(),
                deniedMask: updatedDeniedMask.toString(),
                overrideTypeId: item.overrideTypeId as string,
                permissionOverrideType: item.permissionOverrideType,
                channelId: item.channelId,
                communityId: id as string,
                groupIdx,
                permissionIndex: permissionIdx,
                permissionStatus
            })
        }
    }
    return (
        <SafeAreaView className="flex-1 bg-black">

            <View className="flex-row items-center justify-between px-4 py-4">
                <Pressable onPress={handleBack} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </Pressable>
                <Text className="text-white font-bold text-lg flex-1 text-center mr-10">Role:@{item.roleName} </Text>
            </View>

            <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
                {pageData?.channelPermissionSettings?.map((perm, idx) => (
                    <View key={idx} className="mb-6">
                        <View className="flex-row justify-between  px-1">
                            <Text className="text-white/55 text-sm font-medium">{perm.group}</Text>
                        </View>
                        <View className="">
                            {perm.permissions.map((val: any, permissionIdx: number) => (
                                <PermissionItem key={val.key} val={val} onPress={handlePress} groupIdx={idx} permissionIdx={permissionIdx} />
                            ))}
                        </View>
                    </View>
                ))}
                <View style={{ paddingBottom: Math.max(insets.bottom + 20, 40) }} />
            </ScrollView>

        </SafeAreaView>
    );
}