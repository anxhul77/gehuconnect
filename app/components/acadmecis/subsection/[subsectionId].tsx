import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    Text,
    View,
    Linking,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { MaterialDto, useAddLikeMutation, useGetMaterialsQuery, useMarkAsDownloadMutation, useMarkAsReadMutation } from "@/src/features/acadmecis.api";
import { SubsectionCategories } from "../[subjectId]";

export default function Subsection() {
    const [cursor, setCursor] = useState<string | undefined>();
    const [selectedMaterial, setSelectedMaterial] = useState<MaterialDto | null>(null);
    const [isViewerVisible, setIsViewerVisible] = useState(false);
    const [isWebViewLoading, setIsWebViewLoading] = useState(true);

    const router = useRouter();
    const { subsectionId, name, repoId } = useLocalSearchParams();

    const { data, isFetching } = useGetMaterialsQuery({
        subsectionId: subsectionId as string,
        cursor: cursor,
        limit: 25
    });
    const [toggleLike] = useAddLikeMutation()
    const [markasRead] = useMarkAsReadMutation()
    const [markAsDownload] = useMarkAsDownloadMutation()
    console.log(data)
    function loadMore() {
        if (isFetching || !data?.hasNext || !data?.nextCursor) return;
        setCursor(data?.nextCursor);
    }
    function handleLiked(materialId: string | number) {
        toggleLike({ materialId: materialId, subsectionId: subsectionId as string })
    }
    function handleMarkAsViewed(materialId: string | number) {
        markasRead({ materialId: materialId, subsectionId: subsectionId as string })
    }
    function handleMarkAsDownload(materialId: string | number) {
        markAsDownload({ materialId: materialId, subsectionId: subsectionId as string })
    }
    function handleOpenMaterial(material: MaterialDto) {
        if (material.fileUrl) {
            setSelectedMaterial(material);
            setIsWebViewLoading(true);
            setIsViewerVisible(true);
        }
        if (!material.viewed) {
            handleMarkAsViewed(material.studyMaterialId!)
        }

    }

    const getViewerUrl = (url: string, type?: string) => {
        const uppercaseType = (type || "").toUpperCase();
        const isDoc =
            uppercaseType === "PDF" ||
            uppercaseType === "DOCUMENT" ||
            uppercaseType === "PPT" ||
            url.endsWith(".pdf") ||
            url.endsWith(".doc") ||
            url.endsWith(".docx") ||
            url.endsWith(".ppt") ||
            url.endsWith(".pptx");

        if (isDoc) {
            return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
        }
        return url;
    };

    const getCategoryStyle = (subId?: string, pageName?: string, itemType?: string) => {
        const found = SubsectionCategories.find(
            (c) =>
                c.id.toLowerCase() === String(subId || "").toLowerCase() ||
                c.label.toLowerCase() === String(pageName || "").toLowerCase() ||
                c.id.toLowerCase() === String(itemType || "").toLowerCase()
        );
        if (found) {
            return { icon: found.icon, accent: found.accent };
        }
        return { icon: "file-document-multiple-outline" as const, accent: "#2dd4bf" };
    };

    const pageCategoryStyle = getCategoryStyle(subsectionId as string, name as string);

    const renderMaterialCard = ({ item }: { item: MaterialDto }) => {
        const materialType = item.type || (item as any).materialType || "OTHER";
        const uploaderName =
            typeof item.uploadedBy === "object"
                ? item.uploadedBy?.name || item.uploadedBy?.userName || item.uploadedBy?.email
                : item.uploadedBy;

        return (
            <View

                className="bg-[#121212] border border-neutral-800/80 rounded-2xl p-4 mb-3 mx-4 shadow-sm"
            >
                <Pressable className="flex-row items-center"
                    onPress={() => handleOpenMaterial(item)}>

                    <View
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            backgroundColor: pageCategoryStyle.accent + "18",
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: pageCategoryStyle.accent + "30",
                            marginRight: 12,
                        }}
                    >
                        <MaterialCommunityIcons
                            name={pageCategoryStyle.icon as any}
                            size={24}
                            color={pageCategoryStyle.accent}
                        />
                    </View>
                    <View className="flex-1 pr-2">
                        <Text className="text-white font-semibold text-base" numberOfLines={2}>
                            {item.title || "Untitled Material"}
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <Text className="text-neutral-400 text-xs font-medium uppercase mr-2">
                                {materialType}
                            </Text>
                            {uploaderName && (
                                <Text className="text-neutral-500 text-xs" numberOfLines={1}>
                                    • By {uploaderName}
                                </Text>
                            )}
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />

                </Pressable>

                <View className="flex-row items-center justify-between border-t border-neutral-800/80 mt-3 pt-3">
                    <View className="flex-row items-center space-x-4">
                        <View className="flex-row items-center mr-4">
                            <Pressable onPress={() => handleLiked(item.studyMaterialId!.toString())}>
                                <Ionicons
                                    name={item.liked || (item as any).liked ? "heart" : "heart-outline"}
                                    size={16}
                                    color={item.liked || (item as any).liked ? "#FFF" : "#9CA3AF"}
                                />
                            </Pressable>
                            <Text className="text-neutral-400 text-xs ml-1">{item.likes || 0}</Text>
                        </View>
                        <View className="flex-row items-center mr-4">
                            <Ionicons name="eye-outline" size={16} color="#9CA3AF" />
                            <Text className="text-neutral-400 text-xs ml-1">{item.views || 0}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="download-outline" size={16} color="#9CA3AF" />
                            <Text className="text-neutral-400 text-xs ml-1">{item.downloads || 0}</Text>
                        </View>
                    </View>

                    {item.createdAt && (
                        <Text className="text-neutral-500 text-xs">
                            {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-black">

            <View className="flex-row items-center justify-between px-4 py-4 border-b border-neutral-900">
                <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </Pressable>
                <Text className="text-white font-bold text-xl flex-1 text-center" numberOfLines={1}>
                    {name || "Materials"}
                </Text>
                <Pressable
                    onPress={() => {
                        router.push(`/components/acadmecis/upload/${subsectionId}?repoId=${repoId}`);
                    }}
                    className="bg-white px-4 py-2 rounded-xl flex-row items-center"
                >
                    <Ionicons name="add" size={18} color="#000000" className="mr-1" />
                    <Text className="text-black font-semibold text-sm">Add</Text>
                </Pressable>
            </View>

            <FlatList
                data={data?.content || []}
                keyExtractor={(item, index) =>
                    item.studyMaterialId?.toString() || index.toString()
                }
                renderItem={renderMaterialCard}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    !isFetching ? (
                        <View className="items-center justify-center py-20 px-4">
                            <Ionicons name="document-text-outline" size={60} color="#404040" />
                            <Text className="text-neutral-400 font-semibold text-lg mt-4 text-center">
                                No Materials Found
                            </Text>
                            <Text className="text-neutral-600 text-sm mt-1 text-center">
                                Tap the Add button above to upload new study materials.
                            </Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    isFetching ? (
                        <View className="py-6 items-center">
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        </View>
                    ) : null
                }
            />


            <Modal
                visible={isViewerVisible}
                animationType="slide"
                statusBarTranslucent
                onRequestClose={() => setIsViewerVisible(false)}
            >
                <View className="flex-1 bg-black relative">

                    <SafeAreaView style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20 }}>
                        <View className="flex-row items-center justify-between px-4 py-2">

                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => setIsViewerVisible(false)}
                                className="w-10 h-10 rounded-full bg-black/60 items-center justify-center border border-white/10"
                            >
                                <Ionicons name="close" size={24} color="#FFFFFF" />
                            </TouchableOpacity>


                            {selectedMaterial?.title ? (
                                <View className="bg-black/60 px-4 py-1.5 rounded-full border border-white/10 max-w-[60%]">
                                    <Text className="text-white font-medium text-xs text-center" numberOfLines={1}>
                                        {selectedMaterial.title}
                                    </Text>
                                </View>
                            ) : null}


                            {selectedMaterial?.fileUrl ? (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        if (selectedMaterial?.fileUrl) {
                                            Linking.openURL(selectedMaterial.fileUrl);
                                        }
                                        if (!selectedMaterial.downloaded) {
                                            handleMarkAsDownload(selectedMaterial.studyMaterialId!)
                                        }
                                    }}
                                    className="w-10 h-10 rounded-full bg-black/60 items-center justify-center border border-white/10"
                                >
                                    <Ionicons name="download-outline" size={22} color="#FFFFFF" />
                                </TouchableOpacity>
                            ) : (
                                <View className="w-10" />
                            )}
                        </View>
                    </SafeAreaView>


                    <View className="flex-1 bg-black">
                        {selectedMaterial?.fileUrl && (
                            <WebView
                                source={{
                                    uri: getViewerUrl(
                                        selectedMaterial.fileUrl,
                                        selectedMaterial.type || (selectedMaterial as any).materialType
                                    ),
                                }}
                                onLoadStart={() => setIsWebViewLoading(true)}
                                onLoadEnd={() => setIsWebViewLoading(false)}
                                startInLoadingState={true}
                                className="flex-1"
                            />
                        )}
                        {isWebViewLoading && (
                            <View className="absolute inset-0 bg-black justify-center items-center z-10">
                                <ActivityIndicator size="large" color="#FFFFFF" />
                                <Text className="text-neutral-400 text-sm mt-3">Loading Document...</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}