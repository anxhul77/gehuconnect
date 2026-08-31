import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Animated,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useGetCommunityPostsQuery, useGetCommunityProfileQuery } from "@/src/features/community/community.api";
import { CommunityPostsRes } from "@/src/types/types";
import { FlashList } from "@shopify/flash-list";
import Feedpostcard from "../CommunityPosts/Feedpostcard";

const { width } = Dimensions.get("window");

const BANNER_H = 220;
const HEADER_H = 56;
const SCROLL_DIST = BANNER_H - HEADER_H;

const GRID_GAP = 1.5;
const GRID_SIZE = (width - GRID_GAP * 2) / 3;

const TABS = [
    {
        key: "posts",
        icon: <MaterialIcons name="post-add" size={20} color="white" />,
        label: "Posts",
    },
    {
        key: "members",
        icon: <Ionicons name="people-sharp" size={20} color="white" />,
        label: "Members",
    },
    {
        key: "events",
        icon: <MaterialIcons name="event-note" size={20} color="white" />,
        label: "Events",
    },
    {
        key: "about",
        icon: <Ionicons name="information-circle" size={20} color="white" />,
        label: "About",
    },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type ProfilePostsCardDto = {
    postId: string;
    thumbUrl: string;
};

function PostSection({ items, communityId }: { items: CommunityPostsRes; communityId: string }) {
    const initialPosts = items.communityPosts ?? [];
    const [cursor, setCursor] = useState("");

    const { data, isLoading, isFetching, isError } =
        useGetCommunityPostsQuery(
            {
                communityId,
                cursor,
                limit: "10",
            },
            {
                skip: !communityId,
                refetchOnMountOrArgChange: true,
            }
        );




    const handleLoadMore = useCallback(() => {
        if (
            isFetching ||
            isLoading ||
            !data?.hasNext ||
            !data?.nextCursor ||
            data.nextCursor === cursor
        ) {
            return;
        }

        setCursor(data.nextCursor);
    }, [
        isFetching,
        isLoading,
        data?.hasNext,
        data?.nextCursor,
        cursor,
    ]);

    const paginatedPosts =
        data?.communityPosts ?? [];

    const posts = useMemo(() => {
        const merged = [
            ...initialPosts,
            ...paginatedPosts,
        ];

        return Array.from(
            new Map(merged.map((p) => [p.postId, p])).values()
        );
    }, [initialPosts, paginatedPosts]);
    if (!initialPosts) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No posts yet</Text>
            </View>
        );
    }

    return (
        <FlashList
            data={posts}
            keyExtractor={(item) => item.postId.toString()}
            renderItem={({ item }) => <Feedpostcard post={item} />}
            estimatedItemSize={180}
            inverted
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}


            contentContainerStyle={style.listContent}
            showsVerticalScrollIndicator={false}
        />
    );
}

const style = StyleSheet.create({
    listContent: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
})

function TabBar({
    active,
    onChange,
}: {
    active: TabKey;
    onChange: (k: TabKey) => void;
}) {
    return (
        <View style={styles.tabBar}>
            {TABS.map((tab) => {
                const isActive = active === tab.key;

                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={styles.tabItem}
                        onPress={() => onChange(tab.key)}
                        activeOpacity={0.8}
                    >


                        <Text
                            style={[
                                styles.tabLabel,
                                isActive && styles.tabLabelActive,
                            ]}
                        >
                            {tab.label}
                        </Text>

                        {isActive && <View style={styles.tabUnderline} />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default function CommunityProfileScreen() {
    const [activeTab, setActiveTab] = useState<TabKey>("posts");
    const { communityProfileId, name, avatar, isJoined: isJoinedParam, tags: tagsParam } = useLocalSearchParams<{
        communityProfileId: string;
        name: string;
        avatar: string;
        isJoined: string;
        tags: string[];
    }>();
    const communityId = Number(communityProfileId);
    const { data: communityData, isLoading: isCommunityDataLoading } = useGetCommunityProfileQuery(communityId);
    const scrollY = useRef(new Animated.Value(0)).current;


    const isLoading = false;

    const headerBgOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DIST],
        outputRange: [0, 1],
        extrapolate: "clamp",
    });

    const titleOpacity = scrollY.interpolate({
        inputRange: [SCROLL_DIST - 40, SCROLL_DIST],
        outputRange: [0, 1],
        extrapolate: "clamp",
    });

    const bannerScale = scrollY.interpolate({
        inputRange: [-200, 0],
        outputRange: [1.4, 1],
        extrapolateRight: "clamp",
    });

    const bannerTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DIST],
        outputRange: [0, -40],
        extrapolate: "clamp",
    });

    const avatarScale = scrollY.interpolate({
        inputRange: [0, SCROLL_DIST],
        outputRange: [1, 0.7],
        extrapolate: "clamp",
    });

    const avatarTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DIST],
        outputRange: [0, -10],
        extrapolate: "clamp",
    });

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        backgroundColor: headerBgOpacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [
                                "rgba(0,0,0,0)",
                                "rgba(0,0,0,0.95)",
                            ],
                        }),
                    },
                ]}
            >
                <SafeAreaView edges={["top"]}>
                    <View style={styles.headerContent}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <TouchableOpacity style={styles.headerBtn}>
                                <Ionicons
                                    name="arrow-back"
                                    size={22}
                                    color="#fff"
                                />
                            </TouchableOpacity>

                            <Animated.Text
                                style={[
                                    styles.headerTitle,
                                    {
                                        opacity: titleOpacity,
                                    },
                                ]}
                            >
                                {name}
                            </Animated.Text>
                        </View>

                        <TouchableOpacity style={styles.headerBtn}>
                            <Entypo
                                name="dots-three-vertical"
                                size={18}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Animated.View>

            {/* CONTENT */}
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                contentContainerStyle={{
                    paddingBottom: 100,
                }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    {
                        useNativeDriver: true,
                    }
                )}
            >
                {/* BANNER */}
                <Animated.View
                    style={{
                        transform: [
                            { scale: bannerScale },
                            { translateY: bannerTranslateY },
                        ],
                    }}
                >
                    <Image
                        source={{
                            uri: communityData?.bannerUrl,
                        }}
                        style={styles.banner}
                        resizeMode="cover"
                    />

                    <View style={styles.bannerOverlay} />
                </Animated.View>

                {/* PROFILE CONTENT */}
                <View style={styles.profileSection}>
                    {/* AVATAR + ACTIONS */}
                    <View style={styles.profileTop}>
                        <Animated.View
                            style={{
                                transform: [
                                    { scale: avatarScale },
                                    { translateY: avatarTranslateY },
                                ],
                            }}
                        >
                            <Image
                                source={{
                                    uri: avatar,
                                }}
                                style={styles.avatar}
                            />

                            <View style={styles.onlineDot} />
                        </Animated.View>

                        <View style={styles.actionsRow}>
                            {isJoinedParam ?
                                <TouchableOpacity style={styles.joinBtn}>
                                    <Text style={styles.joinBtnText}>Joined</Text>
                                </TouchableOpacity>
                                : <TouchableOpacity style={styles.joinBtn}>
                                    <Text style={styles.joinBtnText}>Join</Text>
                                </TouchableOpacity>}


                            <TouchableOpacity style={styles.iconBtn}>
                                <Feather
                                    name="bell"
                                    size={18}
                                    color="#F2F3F5"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.iconBtn}>
                                <Feather
                                    name="share-2"
                                    size={18}
                                    color="#F2F3F5"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* TITLE */}
                    <View style={{ marginTop: 16 }}>
                        <View style={styles.titleRow}>
                            <Text style={styles.communityTitle}>
                                name
                            </Text>

                            <MaterialCommunityIcons
                                name="check-decagram"
                                size={20}
                                color="#5865F2"
                                style={{ marginLeft: 6 }}
                            />
                        </View>

                        <View style={styles.subRow}>
                            <Text style={styles.communityHandle}>
                                c/name
                            </Text>

                            <View style={styles.dot} />

                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>
                                    VERIFIED COMMUNITY
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* STATS */}
                    <View style={styles.statsRow}>
                        <View>
                            <Text style={styles.statsNumber}>{communityData?.memberCount}</Text>
                            <Text style={styles.statsLabel}>MEMBERS</Text>
                        </View>

                        <View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <View style={styles.greenDot} />
                                <Text style={styles.statsNumber}>1.2k</Text>
                            </View>

                            <Text style={styles.statsLabel}>ONLINE</Text>
                        </View>

                        <View>
                            <Text style={styles.statsNumber}>{communityData?.postCount}</Text>
                            <Text style={styles.statsLabel}>POSTS</Text>
                        </View>
                    </View>

                    {/* DESCRIPTION */}
                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.description}>
                            {communityData?.description}
                        </Text>

                        {/* TAGS */}
                        <View style={styles.tagsWrap}>
                            {communityData?.tags.map((tag) => (
                                <View key={tag} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* CONTENT */}
                    <View style={styles.contentSection}>
                        <TabBar
                            active={activeTab}
                            onChange={setActiveTab}
                        />

                        {isLoading ? (
                            <View style={styles.loadingWrap}>
                                <ActivityIndicator color="#3b82f6" />
                            </View>
                        ) : (
                            <>
                                {activeTab === "posts" && (
                                    <PostSection
                                        items={communityData?.posts ?? []}
                                        communityId={String(communityId)}


                                    />
                                )}

                                {activeTab === "events" && (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>
                                            No events scheduled
                                        </Text>
                                    </View>
                                )}

                                {activeTab === "members" && (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>
                                            Member list is private
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },

    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
    },

    headerContent: {
        height: HEADER_H,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
    },

    headerBtn: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },

    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginLeft: 8,
    },

    banner: {
        width: "100%",
        height: BANNER_H,
    },

    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.25)",
    },

    profileSection: {
        paddingHorizontal: 20,
        marginTop: -50,
    },

    profileTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },

    avatar: {
        width: 86,
        height: 90,
        borderRadius: 28,
        borderWidth: 4,
        borderColor: "#000",
    },

    onlineDot: {
        position: "absolute",
        bottom: 4,
        right: 4,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#23A559",
        borderWidth: 4,
        borderColor: "#000",
    },

    actionsRow: {
        flexDirection: "row",
        alignItems: "center",


    },

    joinBtn: {
        backgroundColor: "#5865F2",
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 999,
        marginRight: 7,
    },

    joinBtnText: {
        color: "#fff",
        fontWeight: "700",
    },

    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1a1a1a",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },

    titleRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    communityTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "800",
    },

    subRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },

    communityHandle: {
        color: "#888",
        fontSize: 14,
    },

    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#555",
        marginHorizontal: 8,
    },

    verifiedBadge: {
        backgroundColor: "#151515",
        borderWidth: 1,
        borderColor: "#222",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },

    verifiedText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "700",
    },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 28,
    },

    statsNumber: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "800",
    },

    statsLabel: {
        color: "#666",
        fontSize: 11,
        marginTop: 4,
        fontWeight: "700",
    },

    greenDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#23A559",
        marginRight: 6,
    },

    description: {
        color: "#ccc",
        lineHeight: 22,
    },

    tagsWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 14,
    },

    tag: {
        backgroundColor: "#151515",
        borderWidth: 1,
        borderColor: "#222",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,

    },

    tagText: {
        color: "#888",
        fontSize: 12,
        fontWeight: "600",
    },

    contentSection: {
        marginTop: 28,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
        backgroundColor: "#050505",
    },

    tabBar: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#161616",
    },

    tabItem: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 14,
    },

    tabLabel: {
        color: "#555",
        fontSize: 13,
        fontWeight: "700",
        marginTop: 6,
    },

    tabLabelActive: {
        color: "#fff",
    },

    tabUnderline: {
        position: "absolute",
        bottom: 0,
        left: "20%",
        right: "20%",
        height: 2,
        backgroundColor: "#fff",
        borderRadius: 999,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: GRID_GAP,
    },

    gridCell: {
        width: GRID_SIZE,
        height: GRID_SIZE,
        backgroundColor: "#111",
    },

    gridImg: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },

    loadingWrap: {
        paddingVertical: 60,
    },

    emptyContainer: {
        paddingVertical: 80,
        alignItems: "center",
        justifyContent: "center",
    },

    emptyText: {
        color: "#555",
        fontWeight: "600",
    },
});