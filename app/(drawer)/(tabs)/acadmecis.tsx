
import { useGetSubjectQuery, useGetPullRequestsQuery, PullRequestDto, useLazyGetPullRequestsQuery, useLazyGetAuditLogsQuery } from "@/src/features/acadmecis.api";
import { AntDesign, Feather, FontAwesome, FontAwesome6, Fontisto, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { Subject } from "@/src/types/types";
import { CategoryItem } from "@/app/components/acadmecis/types";
import AcademicUploadForm from "@/app/components/acadmecis/upload/[AcademicUploadFormId]";
import PullRequestCard from "@/app/components/acadmecis/PullRequestCard";
import { FlashList } from "@shopify/flash-list";
import AcadRepoAuidLogCard from "@/app/components/acadmecis/AcadRepoAuidLogCard";


const RESOURCE_CATEGORIES: CategoryItem[] = [
  {
    id: "timetable",
    title: "Timetable",
    iconName: "calendar-clock",
    iconColor: "#06b6d4",
  },
  {
    id: "syllabus",
    title: "Syllabus",
    iconName: "format-list-bulleted",
    iconColor: "#a855f7",
  },

  {
    id: "assignments",
    title: "Assignments",
    iconName: "clipboard-text-outline",
    iconColor: "#f97316",
  },
  {
    id: "lab",
    title: "Lab Manual",
    iconName: "flask-outline",
    iconColor: "#3b82f6",
  },
]
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}



export default function Academics() {


  const [activeTab, setActiveTab] = useState(0)
  const [activeQuickTab, setActiveQuickTab] = useState<string | null>(null);

  const router = useRouter();

  const { data: subjects, isLoading: subjectLoading, error: subjectError } = useGetSubjectQuery("1");
  const [triggerGetPullRequest, { data: pullRequests, isLoading: pullRequestsLoading, error: pullRequestsError }] = useLazyGetPullRequestsQuery();
  const [triggerGetAuditLog, { data: auditLogs, isLoading: auditLogsLoading, error: auditLogsError }] = useLazyGetAuditLogsQuery();
  const [pullRequestCursor, setPullRequestCursor] = useState<string | undefined>(pullRequests?.nextCursor || undefined);
  const [auditLogsCursor, setAuditLogsCursor] = useState<string | undefined>(auditLogs?.nextCursor || undefined);




  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "ACCEPTED" | "DISCARDED">("ALL");
  const [filterModalVisible, setFilterModalVisible] = useState(false);



  const barOpacity = useRef(new Animated.Value(1)).current;
  const barTranslateY = useRef(new Animated.Value(0)).current;
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollOffset = useRef(0);

  const hideBar = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    Animated.parallel([
      Animated.timing(barOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(barTranslateY, {
        toValue: 120,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetBarTimer = () => {
    Animated.parallel([
      Animated.timing(barOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(barTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      hideBar();
    }, 3000);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          barTranslateY.setValue(gestureState.dy);
          const opacityVal = Math.max(0, 1 - gestureState.dy / 100);
          barOpacity.setValue(opacityVal);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 20 || gestureState.vy > 0.3) {
          hideBar();
        } else {
          resetBarTimer();
        }
      },
      onPanResponderTerminate: () => {
        resetBarTimer();
      },
    })
  ).current;

  useEffect(() => {
    resetBarTimer();
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  function handleSubjectCardPress(subjectId: string, name: string, repoId: string) {
    router.push(`/components/acadmecis/${subjectId}?name=${name}&repoId=${repoId}`);
  }

  console.log("pullrequests", pullRequests)


  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const diff = currentOffset - lastScrollOffset.current;
    if (diff > 15 && currentOffset > 10) {
      hideBar();
    } else if (diff < -15) {
      resetBarTimer();
    }
    lastScrollOffset.current = currentOffset;
  };
  async function triggerGetPullRequests() {
    await triggerGetPullRequest({ acadRepoId: "1", cursor: pullRequestCursor, limit: 15, pullRequestStatus: filterStatus });
  }

  const handleFilterChange = (
    status: "ALL" | "PENDING" | "ACCEPTED" | "DISCARDED"
  ) => {
    setFilterStatus(status);
    setPullRequestCursor("");

    triggerGetPullRequest({
      acadRepoId: "1",
      cursor: "",
      limit: 15,
      pullRequestStatus: status,
    });

    setFilterModalVisible(false);
  };
  async function triggerGetAuditLogs() {
    await triggerGetAuditLog({
      limit: 20,
      cursor: auditLogsCursor,
      acadRepoId: "1"
    });
  }
  return (
    <View
      style={{ flex: 1, backgroundColor: '#000000' }}
      onTouchStart={resetBarTimer}
    >
      <Animated.ScrollView
        className="flex-1"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <View
          style={{ flexDirection: "column", justifyContent: "center", gap: 20, marginBottom: 28, paddingLeft: 22, marginTop: 10, }}
        >
          <View className="flex-row ">
            <View className="flex-1 w-full flex-col  ">

              <View style={{ flex: 1, gap: 6, flexDirection: "row" }}>
                <MaterialCommunityIcons name="source-repository" size={24} color="#ccc" />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "600",
                    letterSpacing: -0.6,
                    lineHeight: 26,
                  }}

                >
                  {"Btech /sem:1"}
                </Text>

              </View>

              <Text className="text-white text-sm ">this is a dummy description just for testing and lets</Text>
            </View>
            <View className="flex-row gap-6 mr-3 ">
              <Pressable>
                <Fontisto name="bookmark-alt" size={20} color="#ccc" />
              </Pressable>
              <Pressable><MaterialCommunityIcons name="handshake" size={20} color="#ccc" /></Pressable>
              <Pressable><Feather name="settings" size={20} color="#ccc" /></Pressable>
            </View>
          </View>



          <View className="flex-row space-between gap-6 ">
            <Pressable onPress={() => setActiveTab(0)} className={`${activeTab === 0 ? 'border-b-2 pb-1  border-b border-white' : ''}   `}>
              <Text className="text-[#B3B3B3] text-sm font-semibold"> Resources</Text>
            </Pressable>
            <Pressable onPress={() => {
              triggerGetPullRequests()
              setActiveTab(1)
            }} className={`${activeTab === 1 ? 'border-b-2 pb-1 border-b border-white' : ''}   `}>
              <Text className="text-[#B3B3B3] text-sm font-semibold"> Pull requests</Text>
            </Pressable>
            <Pressable onPress={() => {
              triggerGetAuditLogs()
              setActiveTab(2)
            }} className={`${activeTab === 2 ? 'border-b-2 pb-1 border-b border-white' : ''}   `}>
              <Text className="text-[#B3B3B3] text-sm font-semibold ">Audit logs</Text>
            </Pressable>

          </View>
        </View>

        {activeTab === 0 && <View className="flex-1">
          <Text
            style={{
              color: "#B3B3B3",
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 2.5,
              textTransform: "uppercase",
              paddingLeft: 22,
              marginBottom: 8,
              marginTop: 2
            }}
          >
            Subjects
          </Text>

          <View className="flex-1 px-6 mb-6">
            {subjects?.map((item: Subject, index: number) => {
              const style1 = 'border-b border-white/10 rounded-t-2xl ';
              const style2 = ' rounded-b-2xl';
              return (
                <Pressable
                  key={index}
                  onPress={() => { handleSubjectCardPress(item.subjectId, item.subjectName, "1") }}

                  className={`flex-row gap-4 items-center py-6 px-6 w-full  ${index === 0
                    ? style1
                    : index === subjects!.length - 1
                      ? style2
                      : ' border-b border-white/10'
                    }`}
                >
                  <FontAwesome name="folder" size={24} color="#F4B800" />

                  <Text className="text-white text-base font-bold">{item.subjectName}</Text>
                </Pressable>
              );
            })}
          </View> </View>
        }
        {activeTab === 1 && (
          <View className="flex-1 px-5">
            <View className="flex-row items-center justify-between mb-4 px-1">
              <Text className="text-[#B3B3B3] text-xs font-bold tracking-widest uppercase">
                Pull Requests ({pullRequests?.content[0]?.prCount})
              </Text>
              <View className="flex-row items-center gap-2">
                {pullRequestsLoading && (
                  <ActivityIndicator size="small" color="#1ed760" />
                )}
                <Pressable
                  onPress={() => setFilterModalVisible(true)}
                  className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121212] border border-white/10 active:bg-white/15"
                >
                  <Ionicons name="filter" size={14} color="#B3B3B3" />
                  <Text className="text-xs text-[#B3B3B3] font-semibold capitalize">
                    {filterStatus === "ALL" ? "All" : filterStatus === "ACCEPTED" ? "Accepted" : filterStatus === "DISCARDED" ? "Discarded" : "Pending"}
                  </Text>
                  <Ionicons name="chevron-down" size={12} color="#888" />
                </Pressable>
              </View>
            </View>

            {pullRequests?.content.length === 0 ? (
              <View className="items-center justify-center py-12 px-4 bg-[#121212] rounded-2xl border border-white/5">
                <MaterialCommunityIcons name="git-pull-request" size={40} color="rgba(255,255,255,0.2)" />
                <Text className="text-white font-semibold text-base mt-3">
                  No {filterStatus === "ALL" ? "" : filterStatus.toLowerCase()} pull requests
                </Text>
                <Text className="text-white/40 text-xs text-center mt-1">
                  Contributions and study material pull requests submitted for review will appear here.
                </Text>
              </View>
            ) : (
              pullRequests?.content.map((pr: PullRequestDto, idx: number) => (
                <PullRequestCard
                  key={pr.id || idx}
                  acadRepoId="1"
                  pullRequest={pr}

                />
              ))
            )}
          </View>
        )}
        {
          activeTab === 2 &&

          <FlashList data={auditLogs?.content} renderItem={({ item }) => <AcadRepoAuidLogCard item={item}  ></AcadRepoAuidLogCard>}

          >

          </FlashList>



        }
      </Animated.ScrollView>



      <Animated.View
        {...panResponder.panHandlers}
        style={{
          position: "absolute",
          bottom: 24,
          left: 16,
          right: 16,
          borderRadius: 9999,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.12)",
          backgroundColor: "transparent",
          opacity: barOpacity,
          transform: [{ translateY: barTranslateY }],
        }}
      >
        <BlurView
          intensity={100}
          tint='dark'
          className="flex-row items-center justify-around py-2 px-2"
        >
          {RESOURCE_CATEGORIES.slice(0, 5).map((category) => {
            const isSelected = activeQuickTab === category.id;
            return (
              <Pressable
                key={category.id}
                onPress={() => {
                  resetBarTimer();
                  setActiveQuickTab(isSelected ? null : category.id);
                }}
                className="items-center justify-center py-1 px-2 rounded-2xl flex-1"
                style={{
                  backgroundColor: "transparent",
                }}
              >
                <View
                  style={{

                  }}
                  className="w-9 h-9 rounded-full items-center justify-center mb-1"
                >
                  <MaterialCommunityIcons
                    name={category.iconName}
                    size={20}
                    color={'#ccc'}
                  />
                </View>
                <Text
                  className={`text-[10px] font-semibold text-center ${isSelected ? "text-white font-bold" : "text-zinc-400"
                    }`}
                  numberOfLines={1}
                >
                  {category.title}
                </Text>
              </Pressable>
            );
          })}
        </BlurView>
      </Animated.View>

      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
        className="flex-1"
      >
        <Pressable onPress={() => setFilterModalVisible(false)} className="flex-1">
          <View className="self-end mr-4 mt-30 bg-[#212121] rounded-2xl w-40 overflow-hidden rounded-xl">
            <Pressable
              disabled={filterStatus === "ALL"}
              className="flex-row items-center justify-between p-4"
              onPress={() => {
                handleFilterChange("ALL");
              }}
            >

              <Text className="text-white font-bold">All</Text>
              {filterStatus === "ALL" && <FontAwesome name="check" size={15} color="white" />}
            </Pressable>
            <Pressable
              disabled={filterStatus === "ACCEPTED"}
              className="flex-row items-center justify-between p-4"
              onPress={() => {
                handleFilterChange("ACCEPTED");
              }}
            >

              <Text className="text-white font-bold">Accepted</Text>
              {filterStatus === "ACCEPTED" && <FontAwesome name="check" size={15} color="white" />}
            </Pressable>

            <Pressable
              disabled={filterStatus === "PENDING"}
              className="flex-row items-center justify-between p-4"
              onPress={() => {
                handleFilterChange("PENDING");
              }}
            >
              <Text className="text-white font-bold">Pending</Text>
              {filterStatus === "PENDING" && <FontAwesome name="check" size={15} color="white" />}
            </Pressable>
            <Pressable
              disabled={filterStatus === "DISCARDED"}
              className="flex-row items-center justify-between p-4"
              onPress={() => {
                handleFilterChange("DISCARDED");
              }}
            >
              <Text className="text-white font-bold">Discarded</Text>
              {filterStatus === "DISCARDED" && <FontAwesome name="check" size={15} color="white" />}
            </Pressable>
          </View>
        </Pressable>
      </Modal>

    </View>
  );
}