import { View, Text, Pressable, ScrollView, TextInput, Platform, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { DraxProvider, DraxList, SortableReorderEvent } from 'react-native-drax';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useGetCommunitySideBarQuery } from '@/src/features/community/community.api';
import { CommunitySideBarDto, ReorderType } from '@/src/types/types';
import ChannelCategory from '@/app/components/channel/ChannelCategory';
import ChannelCard from '@/app/components/channel/ChannelCard';
import { FlashList } from '@shopify/flash-list';

import ContainerwithSwitch from '@/app/components/Custom/ContainerwithSwitch';

import { useBottomSheet } from '@/app/contexts/BottomSheetContext';

import { useReorderChannelsAndCategoriesMutation } from '@/src/features/community/channel.api';


const SelectReorderTypeBottomSheetContent = ({ closeActionSheet, setReorderType }: { closeActionSheet: () => void, setReorderType: (reorderType: string) => void }) => {
    const insets = useSafeAreaInsets()
    return (
        <View style={{ flex: 1, paddingBottom: insets.bottom + 10 }}>
            <Text className="text-white font-bold text-lg mb-4 text-center">Reorder</Text>
            <View className='flex-1 bg-black px-4'>

                <Pressable onPress={() => {
                    setReorderType("CATEGORY");
                    closeActionSheet()

                }}>
                    <ContainerwithSwitch
                        title={"Categories"}
                        icon={<MaterialIcons className=" m" name="category" size={24} color="white" />}
                        style={{

                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,

                            borderBottomWidth: 1.5,
                            borderBottomColor: "#1a1d20",
                        }}

                    />
                </Pressable>
                <Pressable onPress={() => {
                    setReorderType("TEXT")
                    closeActionSheet()
                }}>
                    <ContainerwithSwitch
                        title={"Text channels"}
                        icon={<FontAwesome6 name="hashtag" size={24} color="white" />}
                        style={{

                            borderBottomWidth: 1.5,
                            borderBottomColor: "#1a1d20",
                        }}

                    />
                </Pressable>
                <Pressable onPress={() => {
                    setReorderType("VOICE")
                    closeActionSheet()
                }}>
                    <ContainerwithSwitch
                        title={"Voice channels"}
                        icon={<MaterialCommunityIcons name="account-voice" size={24} color="white" />}
                        style={{

                            borderBottomLeftRadius: 16,
                            borderBottomRightRadius: 16,

                        }}

                    />
                </Pressable>

            </View>
        </View>
    )
}

export default function ChannelsSettings() {
    const router = useRouter();

    const [updatereorder, { isLoading }] = useReorderChannelsAndCategoriesMutation()
    const { channelsSettingsId: communityId } = useLocalSearchParams()
    const {
        data,
        isLoading: isCommunityLoading,

    } = useGetCommunitySideBarQuery(communityId as string);
    const [reorderType, setReorderType] = useState<"TEXT" | "VOICE" | "CATEGORY" | null>(null)

    const [localItems, setLocalItems] = useState<CommunitySideBarDto[]>(data || []);

    useEffect(() => {
        if (data) {
            setLocalItems(data);
        }
    }, [data]);


    const handleOnChannelPress = useCallback((item: any, idx: number) => {
        router.push({
            pathname: `/components/community/settings/channels/settings/channelSettings/${communityId}`,
            params: { items: JSON.stringify({ ...item, idx: idx }) }
        }
        )
    }, [])
    const { openActionSheet, closeActionSheet } = useBottomSheet()
    function handleReorderClick() {

        openActionSheet({ content: () => (<SelectReorderTypeBottomSheetContent closeActionSheet={closeActionSheet} setReorderType={setReorderType} />), snapPoints: ["35%"], color: "transparent" })
    }


    const reorderItems = useMemo<CommunitySideBarDto[]>(() => {
        if (reorderType === null) {
            return localItems;
        }

        if (reorderType === "CATEGORY") {
            return localItems.filter(
                item => item.type === "CATEGORY"
            );
        }

        if (reorderType === "TEXT") {
            return localItems.filter(
                item =>
                    item.type === "CATEGORY" ||
                    item.channelType === "TEXT"
            );
        }

        if (reorderType === "VOICE") {
            return localItems.filter(
                item =>
                    item.type === "CATEGORY" ||
                    item.channelType === "VOICE"
            );
        }

        return localItems;
    }, [localItems, reorderType]);
    const renderItem = useCallback(
        ({
            item,
            index,
        }: {
            item: CommunitySideBarDto;
            index: number;
        }) => {

            if (item.type === "CATEGORY") {
                return (
                    <ChannelCategory
                        items={item}
                        reorder={reorderType}
                        editable={true}
                        communityId={communityId as string}
                        idx={index}
                    />
                );
            }

            return (
                <View className="flex-1 my-2">
                    <ChannelCard
                        item={item}
                        communityId={communityId as string}
                        handleOnChannelPress={
                            handleOnChannelPress
                        }
                        idx={index}
                        isReorderEnabled={reorderType === item.channelType}
                    />
                </View>
            );

        },
        [
            reorderType,
            communityId,
            handleOnChannelPress,

        ]
    );

    const keyExtractor = useCallback(
        (item: CommunitySideBarDto) => {
            if (item.type === "CATEGORY") {
                return `category-${item.categoryId}`;
            }

            return `channel-${item.channelId}`;
        },
        []
    );


    const calculateChannelChanges = (
        items: CommunitySideBarDto[],
        originalItems: CommunitySideBarDto[]
    ) => {
        let lastSeenCategoryId: string | null = null;
        let currentPosition = 1;

        const originalMap = new Map(
            originalItems
                .filter(item => item.type === "CHANNEL")
                .map(item => [item.channelId, item])
        );

        const finalChanges: {
            channelId: string;
            categoryId: string;
            channelPosition: number;

        }[] = [];

        for (const item of items) {


            if (item.type === "CATEGORY") {
                lastSeenCategoryId = item.categoryId;
                currentPosition = 1;
                continue;
            }


            const newCategoryId = lastSeenCategoryId!;
            const newPosition = currentPosition++;

            const original = originalMap.get(item.channelId);

            if (!original) {
                continue;
            }

            if (
                original.categoryId !== newCategoryId ||
                original.channelPosition !== newPosition
            ) {
                finalChanges.push({
                    channelId: item.channelId!,
                    categoryId: newCategoryId,
                    channelPosition: newPosition,


                });
            }
        }

        return finalChanges;
    };

    function calculateCategoryChanges(
        items: CommunitySideBarDto[],
        originalItems: CommunitySideBarDto[]
    ) {
        const originalMap = new Map(
            originalItems
                .filter(item => item.type === "CATEGORY")
                .map(item => [item.categoryId, item])
        );

        const finalChanges: {
            categoryId: string;
            categoryPosition: number;
        }[] = [];

        let categoryPosition = 1;

        for (const item of items) {
            if (item.type !== "CATEGORY") continue;

            const original = originalMap.get(item.categoryId);

            if (!original) continue;

            if (original.categoryPosition !== categoryPosition) {
                finalChanges.push({
                    categoryId: item.categoryId!,
                    categoryPosition,
                });
            }

            categoryPosition++;
        }

        return finalChanges;
    }
    const handleReorder = useCallback(
        (event: SortableReorderEvent<CommunitySideBarDto>) => {
            let reordered = event.data;

            if (
                (reorderType === "TEXT" || reorderType === "VOICE") &&
                reordered[0]?.type === "CHANNEL"

            ) {

                const draggedChannel = reordered[0];

                reordered = [
                    reordered[1],
                    draggedChannel,
                    ...reordered.slice(2),
                ];
            }

            setLocalItems(reordered)

        },
        [reorderType]
    );


    const handleDone = async () => {
        const changes = reorderType === "CATEGORY" ? calculateCategoryChanges(localItems, data!) : calculateChannelChanges(
            localItems,
            data!
        );

        if (changes.length === 0) {
            setReorderType(null);
            setLocalItems(data!)
            return;
        }
        const updatedState = await updatereorder({
            communityId: communityId as string,
            reorderType: reorderType === "CATEGORY" ? "CATEGORY" : "CHANNEL",
            payload: changes
        })

        setLocalItems(updatedState.data as CommunitySideBarDto[])
        setReorderType(null);
    };
    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-row items-center justify-between px-4 py-4">

                {reorderType !== null ? (
                    <View className="w-12" />
                ) : (
                    <Pressable
                        onPress={() => router.back()}
                        className="p-2"
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color="#FFFFFF"
                        />
                    </Pressable>
                )}


                <Text className="text-white font-bold text-xl">
                    Channels Settings
                </Text>


                {reorderType !== null ? (
                    <Pressable
                        className="w-20 justify-center items-center"
                        disabled={isLoading}
                        onPress={handleDone}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#5865F2" />
                        ) : (
                            <Text className="text-[#5865F2]">
                                Done
                            </Text>
                        )}
                    </Pressable>
                ) : (
                    <Pressable
                        className="justify-center items-center"
                        onPress={handleReorderClick}
                    >
                        <Text className="text-[#5865F2]">
                            Reorder
                        </Text>
                    </Pressable>
                )}

            </View>
            <View className='flex-1 px-4'>
                <DraxProvider key={`drax-${reorderType ?? "normal"}`}>
                    <DraxList listComponent={FlashList} key={`reorder-${reorderType ?? "normal"}`} data={reorderItems} estimatedItemSize={50} keyExtractor={keyExtractor}
                        renderItem={renderItem}

                        isItemDragDisabled={(item) => {
                            if (item.type === "CATEGORY") {
                                return reorderType !== "CATEGORY";
                            }

                            return item.channelType !== reorderType;
                        }}
                        onReorder={handleReorder}>


                    </DraxList>
                </DraxProvider>
            </View>


        </SafeAreaView>
    );
}
