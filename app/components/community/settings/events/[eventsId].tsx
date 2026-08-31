import { View, Text, Pressable, ScrollView, TextInput, Platform } from 'react-native';
import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ContainerwithSwitch from '../../../Custom/ContainerwithSwitch';
import { useGetCommunityEventSettingsQuery, useUpdateEventSettingsMutation } from '@/src/features/community/community.api';
import { buildPermissionBit } from '@/src/utils/RoleHelpers';
import CustomSwitch from '@/app/components/Custom/CustomSwitch';
import { useBottomSheet } from '@/app/contexts/BottomSheetContext';
import RadioSwitch from '@/app/components/Custom/RadioSwitch';


function SelectReminderBottomSheetContent({
    selectedReminder,
    onSelect,
}: {
    selectedReminder: number;
    onSelect: (value: number) => void;
}) {
    const insets = useSafeAreaInsets();
    const [currentVal, setCurrentVal] = React.useState(selectedReminder);

    const options = [
        { label: "At time of event", value: 0 },
        { label: "15 minutes before", value: 15 },
        { label: "30 minutes before", value: 30 },
        { label: "1 hour before", value: 60 },
        { label: "1 day before", value: 1440 },
    ];

    return (
        <View style={{ flex: 1, paddingBottom: insets.bottom + 10 }}>
            <Text className="text-white font-bold text-lg mb-4 text-center">Select Default Reminder</Text>
            <View className='flex-1 bg-black px-4'>
                {options.map((opt, idx) => (
                    <Pressable key={opt.value} onPress={() => {
                        setCurrentVal(opt.value);
                        onSelect(opt.value);
                    }}>
                        <ContainerwithSwitch
                            title={opt.label}
                            style={{
                                borderTopLeftRadius: idx === 0 ? 16 : 0,
                                borderTopRightRadius: idx === 0 ? 16 : 0,
                                borderBottomLeftRadius: idx === options.length - 1 ? 16 : 0,
                                borderBottomRightRadius: idx === options.length - 1 ? 16 : 0,
                                borderBottomWidth: idx === options.length - 1 ? 0 : 1.5,
                                borderBottomColor: "#1a1d20",
                            }}
                            customSwitch={<RadioSwitch selected={currentVal === opt.value} />}
                        />
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

function SelectMaxParticipantsBottomSheetContent({
    selectedMax,
    onSelect,
}: {
    selectedMax: number;
    onSelect: (value: number) => void;
}) {
    const insets = useSafeAreaInsets();
    const [currentVal, setCurrentVal] = React.useState(selectedMax);

    const options = [
        { label: "Unlimited", value: 0 },
        { label: "10 participants", value: 10 },
        { label: "25 participants", value: 25 },
        { label: "50 participants", value: 50 },
        { label: "100 participants", value: 100 },
        { label: "500 participants", value: 500 },
    ];

    return (
        <View style={{ flex: 1, paddingBottom: insets.bottom + 10 }}>
            <Text className="text-white font-bold text-lg mb-4 text-center">Maximum Participants</Text>
            <View className='flex-1 bg-black px-4'>
                {options.map((opt, idx) => (
                    <Pressable key={opt.value} onPress={() => {
                        setCurrentVal(opt.value);
                        onSelect(opt.value);
                    }}>
                        <ContainerwithSwitch
                            title={opt.label}
                            style={{
                                borderTopLeftRadius: idx === 0 ? 16 : 0,
                                borderTopRightRadius: idx === 0 ? 16 : 0,
                                borderBottomLeftRadius: idx === options.length - 1 ? 16 : 0,
                                borderBottomRightRadius: idx === options.length - 1 ? 16 : 0,
                                borderBottomWidth: idx === options.length - 1 ? 0 : 1.5,
                                borderBottomColor: "#1a1d20",
                            }}
                            customSwitch={<RadioSwitch selected={currentVal === opt.value} />}
                        />
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

export default function EventsSettings() {
    const router = useRouter();
    const { eventsId: communityId } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { openActionSheet } = useBottomSheet();
    const { data: pageData } = useGetCommunityEventSettingsQuery(communityId as string);

    const [updateTrigger] = useUpdateEventSettingsMutation();

    const togglePermission = (communityId: string, groupIdx: number, permissionIdx: number, bit: string, isEnable: boolean, permissionMask: string) => {
        const newMask = buildPermissionBit(isEnable, bit, permissionMask);
        updateTrigger({ communityId: communityId, dto: { permissionMask: newMask }, permissionMask: newMask, groupIdx, permissionIdx });
    };

    const handleDefaultReminderClick = () => {
        let tempReminder = pageData?.remainderDuration;

        openActionSheet(
            {
                content: () => (
                    <SelectReminderBottomSheetContent
                        selectedReminder={tempReminder!}
                        onSelect={(val) => {
                            tempReminder = val;
                        }}
                    />
                ),
                snapPoints: ["55%"],
                enablePanDownToClose: true,
                handleComponent: null,
                color: "transparent",
                enableContentPanningGesture: true,
                onDismiss: () => {
                    if (tempReminder !== pageData?.remainderDuration) {
                        updateTrigger({
                            communityId: communityId as string,
                            dto: { remainderDuration: tempReminder },
                            isOther: true,
                        });
                    }
                }
            });
    };

    const handleMaxParticipantsClick = () => {
        let tempMax = pageData?.maximumParticipants;

        openActionSheet({
            content: () => (
                <SelectMaxParticipantsBottomSheetContent
                    selectedMax={tempMax!}
                    onSelect={(val) => {
                        tempMax = val;
                    }}
                />
            ),
            snapPoints: ["63%"],
            enablePanDownToClose: true,
            handleComponent: null,
            color: "transparent",
            enableContentPanningGesture: true,
            onDismiss: () => {
                if (tempMax !== pageData?.maximumParticipants) {
                    updateTrigger({
                        communityId: communityId as string,
                        dto: { maximumParticipants: tempMax },
                        isOther: true,
                    });
                }
            }
        });
    };

    const reminderText = pageData?.remainderDuration !== undefined
        ? pageData.remainderDuration === 0
            ? "At time of event"
            : `${pageData.remainderDuration} minutes`
        : "30 minutes";

    const maxParticipantsText = pageData?.maximumParticipants
        ? `${pageData.maximumParticipants}`
        : "Unlimited";

    return (
        <SafeAreaView className="flex-1 bg-black">

            <View className="flex-row items-center justify-between px-4 py-4">
                <Pressable onPress={() => router.back()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </Pressable>
                <Text className="text-white font-bold text-xl">Events</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>

                {pageData?.eventSettings?.map((group: any, groupIdx: number) => (
                    <React.Fragment key={groupIdx}>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-white/55 text-sm font-medium">{group.group}</Text>
                        </View>
                        <View className="bg-[#121212] rounded-xl border border-white/12 overflow-hidden mb-6">
                            {group.permissions?.map((permission: any, permIdx: number) => (
                                <React.Fragment key={permission.key}>
                                    {permIdx > 0 && <View className="h-px bg-white/6 mx-4" />}
                                    <ContainerwithSwitch
                                        title={permission.title}
                                        description={permission.description}
                                        backgroundColor="transparent"
                                        customSwitch={
                                            <CustomSwitch
                                                value={permission.isEnabled}
                                                onValueChange={() => {
                                                    togglePermission(communityId as string, groupIdx, permIdx, permission.bit, permission.isEnabled, pageData.permissionMask);
                                                }}
                                            />
                                        }
                                    />
                                </React.Fragment>
                            ))}
                        </View>
                    </React.Fragment>
                ))}

                <View className="flex-row justify-between mb-2">
                    <Text className="text-white/55 text-sm font-medium">Defaults</Text>
                </View>
                <View className="bg-[#121212] rounded-xl border border-white/12 mb-6">
                    <Pressable className="flex-row items-center justify-between p-4" onPress={handleDefaultReminderClick}>
                        <View>
                            <Text className="text-white font-bold text-base">Default Reminder</Text>
                            <Text className="text-white/30 text-xs mt-1">When to notify attendees</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-white text-base mr-2">{reminderText}</Text>
                            <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.3)" />
                        </View>
                    </Pressable>
                    <View className="h-px bg-white/6 mx-4" />
                    <Pressable className="flex-row items-center justify-between p-4" onPress={handleMaxParticipantsClick}>
                        <View>
                            <Text className="text-white font-bold text-base">Maximum Participants</Text>
                            <Text className="text-white/30 text-xs mt-1">Default attendee limit</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-white text-base mr-2">{maxParticipantsText}</Text>
                            <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.3)" />
                        </View>
                    </Pressable>
                </View>

                <View style={{ paddingBottom: Math.max(insets.bottom + 20, 40) }} />
            </ScrollView>

        </SafeAreaView>
    );
}
