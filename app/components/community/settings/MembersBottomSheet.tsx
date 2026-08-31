import { useGetCommunityMembersQuery } from "@/src/features/community/community.api";
import useDebounce from "@/src/hooks/useDebouncingHook";
import { CommunityMemberDto } from "@/src/types/types";


import { FontAwesome } from "@expo/vector-icons";

import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlashList,
} from "@gorhom/bottom-sheet";

import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Image,
    Pressable,
    Text,
    View,
} from "react-native";

import { TextInput } from "react-native-gesture-handler";


const statusColors: Record<string, string> = {
    ACTIVE: "#43b581",
    BANNED: "#f04747",
    PENDING: "#faa61a",
};


type SearchMemberBottomSheetProps = {
    communityId: string;


    open: boolean;


    onClose?: () => void;


    onSelectMember?: (member: CommunityMemberDto) => void;


    selectedMemberId?: string | number;

    snapPoints?: string[];

    initialSnapIndex?: number;


    status?: string;

    roleId?: string;

    limit?: number;


    title?: string;

    description?: string;

    searchPlaceholder?: string;
};


export default function SearchMemberBottomSheet({
    communityId,

    open,
    onClose,

    selectedMemberId,
    onSelectMember,

    snapPoints = ["90%"],
    initialSnapIndex = 0,

    status,
    roleId,

    limit = 20,

    title = "Select Member",

    description = "(whose permission you want to override)",

    searchPlaceholder = "Search members",
}: SearchMemberBottomSheetProps) {

    const sheetRef = useRef<BottomSheet>(null);

    const [search, setSearch] = useState("");


    const debouncedSearch = useDebounce(
        search,
        300
    );


    const {
        data: communityMembers,
        isFetching,
        isLoading,
    } = useGetCommunityMembersQuery({
        communityId,

        keyword: debouncedSearch.trim() || undefined,

        status: status || undefined,

        roleId: roleId || undefined,

        limit,
    });


    useEffect(() => {
        if (open) {
            sheetRef.current?.snapToIndex(
                initialSnapIndex
            );
        } else {
            sheetRef.current?.close();
        }
    }, [
        open,
        initialSnapIndex,
    ]);



    const handleClose = useCallback(() => {
        onClose?.();
    }, [
        onClose,
    ]);


    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
            />
        ),
        []
    );


    const renderItem = useCallback(
        ({
            item,
        }: {
            item: CommunityMemberDto;
        }) => {

            const isSelected =
                selectedMemberId != null &&
                String(selectedMemberId) ===
                String(item.id);


            return (
                <Pressable
                    onPress={() =>
                        onSelectMember?.(item)
                    }
                >
                    <View className="flex-row items-center bg-[#121212] rounded-xl border border-white/8 px-3 py-3 mb-2 mx-2">

                        <Image
                            source={{
                                uri: item.avatarUrl,
                            }}
                            className="w-11 h-11 rounded-full bg-white/10"
                        />


                        <View className="flex-1 ml-3">

                            <View className="flex-row items-center gap-2">

                                <Text
                                    className="text-white font-semibold text-[15px]"
                                    numberOfLines={1}
                                >
                                    {item.name}
                                </Text>


                                <View
                                    className="rounded-full px-2 py-0.5"
                                    style={{
                                        backgroundColor:
                                            (
                                                statusColors[
                                                item.status
                                                ] ?? "#888"
                                            ) + "22",
                                    }}
                                >

                                    <Text
                                        className="text-[10px] font-bold"
                                        style={{
                                            color:
                                                statusColors[
                                                item.status
                                                ] ?? "#888",
                                        }}
                                    >
                                        {item.status}
                                    </Text>

                                </View>

                            </View>


                            {item.roles &&
                                item.roles.length > 0 && (
                                    <View className="flex-row flex-wrap gap-1 mt-1">

                                        {item.roles.map(
                                            (role) => (
                                                <View
                                                    key={role.id}
                                                    className="bg-white/8 rounded-full px-2 py-0.5"
                                                >
                                                    <Text className="text-white/50 text-[10px] font-medium">
                                                        {
                                                            role.name
                                                        }
                                                    </Text>
                                                </View>
                                            )
                                        )}

                                    </View>
                                )}


                            {item.joinedAt && (
                                <Text className="text-white/25 text-[11px] mt-1">
                                    Joined{" "}
                                    {new Date(
                                        item.joinedAt
                                    ).toLocaleDateString()}
                                </Text>
                            )}

                        </View>

                    </View>
                </Pressable>
            );
        },
        [
            selectedMemberId,
            onSelectMember,
        ]
    );



    const renderHeader = useCallback(
        () => (
            <View className="px-4 pt-4 pb-3">

                <View className="items-center justify-center">

                    <Text className="text-white text-lg font-semibold">
                        {title}
                    </Text>

                    <Text className="text-white/40 text-sm mt-1 mb-3">
                        {description}
                    </Text>

                </View>


                <View
                    className="flex-row items-center bg-[#121212] rounded-2xl px-4 gap-2 py-1 text-[15px] border border-white/12"
                    style={{
                        minHeight: 46,
                    }}
                >

                    <FontAwesome
                        name="search"
                        size={20}
                        color="rgba(255,255,255,0.22)"
                    />


                    <TextInput
                        style={{
                            color: "#f0f0f0",
                            flex: 1,
                        }}
                        placeholderTextColor="rgba(255,255,255,0.22)"
                        placeholder={
                            searchPlaceholder
                        }
                        value={search}
                        onChangeText={setSearch}

                        autoCorrect={false}
                        autoCapitalize="none"
                        returnKeyType="search"
                    />

                </View>


                <Text className="text-white/55 text-sm font-medium mt-8">
                    Community Members
                </Text>

            </View>
        ),
        [
            title,
            description,
            searchPlaceholder,
            search,
        ]
    );


    return (
        <BottomSheet
            ref={sheetRef}

            index={-1}

            snapPoints={snapPoints}

            enableDynamicSizing={false}

            enablePanDownToClose

            onClose={handleClose}
            backgroundStyle={{ backgroundColor: "#000000" }}
            backdropComponent={
                renderBackdrop
            }
        >

            <View className="flex-1">

                <BottomSheetFlashList
                    data={
                        communityMembers?.content ??
                        []
                    }

                    renderItem={
                        renderItem
                    }

                    keyExtractor={(item) =>
                        String(item.id)
                    }

                    estimatedItemSize={72}

                    ListHeaderComponent={
                        renderHeader
                    }

                    keyboardShouldPersistTaps="handled"

                    contentContainerStyle={{
                        paddingBottom: 24,
                    }}


                    showsVerticalScrollIndicator={
                        false
                    }
                />


                {/* 
                    You can add a loading indicator here
                    later if needed.
                    
                    isLoading = first request
                    isFetching = search/refetch/etc.
                */}

            </View>

        </BottomSheet>
    );
}