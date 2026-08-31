import { View, Text, Pressable, Modal, StyleSheet } from 'react-native'
import React from 'react'
import { Entypo, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { CommunityPost, CommentSortType } from '@/src/types/types';
import { useRouter } from 'expo-router';

interface CommentHeaderProps {
    showCompactHeader: boolean;
    post?: CommunityPost;
    sortType: CommentSortType;
    setSortType: (sortType: CommentSortType) => void;
    setMenuVisible: (menuVisible: boolean) => void;
    menuVisible: boolean;
}
export default function CommentHeader({ showCompactHeader, post, sortType, setSortType, setMenuVisible, menuVisible }: CommentHeaderProps) {
    const router = useRouter();
    return (
        <>
            <View style={styles.headerBar}>
                <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
                    <Ionicons name="chevron-down" size={28} color="white" />
                </Pressable>
                <Text style={styles.headerTitle}>
                    {post?.communityName ? `r/${post.communityName}` : "Comments"}
                </Text>


                <Pressable onPress={() => setMenuVisible(true)}>
                    <MaterialCommunityIcons name="tune-vertical-variant" size={24} color="white" />
                </Pressable>

            </View>
            {<View pointerEvents={showCompactHeader ? "auto" : "none"} style={[styles.compactHeader, { opacity: showCompactHeader ? 1 : 0 }]}>
                <View style={styles.compactHeaderContainer}>
                    <Text style={{ fontSize: 14, fontWeight: 500, color: "#fff", width: "85%" }}>{post?.title}</Text>
                    <Text style={{ fontSize: 11, fontWeight: 400, color: "#fff", width: "85%" }}>{post?.content}</Text>
                </View>
                <View style={{ width: 70, height: 60 }}>
                    <Image
                        source={{ uri: post?.attachments[0].url }}
                        contentFit="contain"
                        transition={200}
                        style={{ width: "100%", aspectRatio: 9 / 9, paddingHorizontal: 12, borderRadius: 10 }}
                    />
                </View>

            </View>}
            <Modal
                visible={menuVisible}


                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable onPress={() => setMenuVisible(false)} className="flex-1">
                    <View className="self-end mr-4 mt-4 bg-[#212121] rounded-2xl w-40 overflow-hidden rounded-xl">
                        <Pressable
                            className="flex-row items-center justify-between p-4"
                            onPress={() => {
                                setSortType(CommentSortType.TOP);
                                setMenuVisible(false);
                            }}
                        >
                            <Text className="text-white font-bold">TOP</Text>
                            {sortType === "TOP" && <FontAwesome name="check" size={15} color="white" />}
                        </Pressable>
                        <Pressable
                            className="flex-row items-center justify-between p-4"
                            onPress={() => {
                                setSortType(CommentSortType.LATEST);
                                setMenuVisible(false);
                            }}
                        >
                            <Text className="text-white font-bold">LATEST</Text>
                            {sortType === "LATEST" && <FontAwesome name="check" size={15} color="white" />}
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({

    compactHeader: {
        flexDirection: "row",
        position: "absolute",
        top: 80,
        left: 0,
        right: 0,
        zIndex: 100,
        elevation: 100,

        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 60,


        backgroundColor: "#000",
    },
    compactHeaderContainer: {
        flexDirection: "column",
        flex: 1
    },
    rightAction: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginRight: 10
    },
    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#1F2937",
        backgroundColor: "#000",
    },
    backBtn: {
        padding: 2,
    },
    headerTitle: {
        color: "white",
        fontWeight: "700",
        fontSize: 15,
    },
});
