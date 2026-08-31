import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Entypo, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useGetCommunityPostsQuery, useGetCommunityProfileQuery } from "@/src/features/community/community.api";
import { CommunityPostsRes } from "@/src/types/types";
import { FlashList } from "@shopify/flash-list";
import Feedpostcard from "@/app/components/CommunityPosts/Feedpostcard";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { RotateInDownLeft } from "react-native-reanimated";


const BANNER_H = 210;
const HEADER_H = 68;
const SCROLL_DIST = BANNER_H - HEADER_H;




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
const MENU_ITEMS = (communityProfileId: string) => [
  { icon: 'pricetag', label: 'Create Channel', route: '/components/community/CreateChannel' },
  { icon: 'calendar', label: 'Create Event', route: `/components/community/settings/Settings/${communityProfileId}` },
  { icon: 'folder-open-sharp', label: 'Create Category', route: `/components/community/settings/Settings/${communityProfileId}` },
  { icon: 'settings-sharp', label: 'Settings', route: `/components/community/settings/Settings/${communityProfileId}` },
  { icon: 'warning-sharp', label: 'Report', route: '/components/marketplace/OfferPage' },
  { icon: 'help-circle-outline', label: 'Help & Support', route: '/components/HelpSupport' },
]
export default function CommunityProfileScreen() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabKey>("posts");
  const [menuVisible, setMenuVisible] = useState(false)
  const handleMenuPress = (route: string | null) => {
    setMenuVisible(false)

    if (route) {
      router.push({
        pathname: route as any,
        params: { communityId: communityProfileId }
      })
    }
  }
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

  const iconActivityOpacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);

    Animated.timing(iconActivityOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();

    hideTimer.current = setTimeout(() => {
      Animated.timing(iconActivityOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 2500);
  }, [iconActivityOpacity]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  console.log(communityData)
  const isLoading = false;

  const headerBgOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DIST],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const combinedIconOpacity = useMemo(() => {
    return Animated.add(iconActivityOpacity, headerBgOpacity).interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0, 1, 1],
      extrapolate: "clamp",
    });
  }, [iconActivityOpacity, headerBgOpacity]);

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
  const tags = communityData?.tags || [];
  return (
    <View style={styles.container} onTouchStart={resetHideTimer} onTouchMove={resetHideTimer}>

      <Animated.View style={styles.header}>

        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              opacity: headerBgOpacity,
              overflow: "hidden",
              backgroundColor: "#000",
            },
          ]}
        >
          {communityData?.bannerUrl ? (
            <Image
              source={{ uri: communityData.bannerUrl }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
              blurRadius={25}
            />
          ) : null}
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: "rgba(0, 0, 0, 0.5)" },
            ]}
          />
        </Animated.View>

        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>

            <Animated.View style={{ opacity: combinedIconOpacity }}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </Animated.View>

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


            <Animated.View style={{ opacity: combinedIconOpacity }}>
              <Pressable style={styles.headerBtn} onPress={() => setMenuVisible(true)}>
                <Entypo
                  name="dots-three-vertical"
                  size={18}
                  color="white"
                />
              </Pressable>
            </Animated.View>
          </View>
        </SafeAreaView>
      </Animated.View>

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
            listener: () => {
              resetHideTimer();
            },
          }
        )}
      >

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


        <View style={styles.profileSection}>

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


            </Animated.View>
            <View style={styles.actionsRow}>
              {isJoinedParam ?
                <TouchableOpacity style={styles.joinBtn}>
                  <Text style={styles.joinBtnText}>Joined</Text>
                </TouchableOpacity>
                : <TouchableOpacity style={styles.joinBtn}>
                  <Text style={styles.joinBtnText}>Join</Text>
                </TouchableOpacity>}

              <View style={styles.iconWrapper}>
                <Entypo name="share" size={20} color="#fff" />
              </View>


            </View>

          </View>


          <View style={{ marginTop: 16 }}>
            <View style={styles.titleRow}>
              <Text style={styles.communityTitle}>
                {name}
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
                c/{name}
              </Text>




            </View>
            <View style={styles.statsRow}>
              <View style={styles.statsItem}>
                <Text style={styles.statsNumber}>4.8k Members</Text>

              </View>
              <View style={{ borderRadius: 100, backgroundColor: "#888", width: 4, height: 4 }}></View>
              <View style={styles.statsItem}>
                <Text style={styles.statsNumber}>123 Posts</Text>

              </View>
              <View style={{ borderRadius: 100, backgroundColor: "#888", width: 4, height: 4 }}></View>
              <View style={styles.statsItem}>
                <Text style={styles.statsNumber}>4.5k Views </Text>

              </View>
            </View>
          </View>





          <View style={{}}>
            <Text style={styles.description}>
              {communityData?.description}
            </Text>


            <ScrollView contentContainerStyle={styles.tagsWrap} horizontal={true}>
              {tags?.map((tag, i) => (
                <View key={tag?.id ?? i} style={styles.tag}>
                  <Text style={styles.tagText}># {tag?.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

        </View>



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
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setMenuVisible(false)}>
            <View
              style={{
                position: 'absolute',

                right: 5,
                backgroundColor: '#121212',
                borderRadius: 16,
                borderWidth: 1,
                paddingVertical: 6,
                minWidth: 180,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              {MENU_ITEMS(communityProfileId).map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => handleMenuPress(item.route)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 13,

                  }}
                >
                  <Ionicons name={item.icon as any} size={18} color={item.route ? "#FFFFFF" : '#B3B3B3'} style={{ marginRight: 12 }} />
                  <Text style={{ color: '#B3B3B3', fontSize: 14, fontWeight: item.route ? '700' : '600' }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
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
    paddingHorizontal: 6,
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
    flex: 1, flexDirection: "row",

    height: 98,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 100,

  },



  actionsRow: {


    flexDirection: "row",
    alignItems: "center",
    gap: 14

  },

  joinBtn: {


    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 3,
    borderWidth: 1,
    borderColor: "#2d2d2d"
  },
  iconWrapper: {
    borderRadius: 100,
    backgroundColor: "#0a0a0a",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#2d2d2d",
    alignItems: "center",
    justifyContent: "center",

  },
  joinBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  joinBtnText2: {
    color: "#fff",
    fontWeight: "700",
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
    marginTop: 2,
  },

  communityHandle: {
    color: "#888",
    fontSize: 14,
  },



  verifiedBadge: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#222",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },



  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingRight: 25



  },
  statsItem: {

    flexDirection: "column",


  },
  statsNumber: {
    color: "#ccc",
    fontSize: 14,
    fontWeight: "700",
  },

  statsLabel: {
    color: "#666",
    fontSize: 12,

    fontWeight: "700",
  },



  description: {
    color: "#ccc",
    lineHeight: 22,
  },

  tagsWrap: {
    flexDirection: "row",

    marginVertical: 16,
    gap: 8,

  },

  tag: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#212121",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,


  },

  tagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  contentSection: {



    overflow: "hidden",
    backgroundColor: "black",
  },

  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.6,
    borderColor: "#303030",

    paddingTop: 10,

  },

  tabItem: {
    flex: 1,
    paddingBottom: 14,
    alignItems: "center",

  },

  tabLabel: {
    color: "#555",
    fontSize: 14,
    fontWeight: "800",

  },

  tabLabelActive: {
    color: "#fff",

  },

  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#fff",
    borderRadius: 999,
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