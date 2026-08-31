import React, { useState } from "react";
import { View, Text, Pressable, Image, Linking } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { PullRequestDto, MaterialType } from "@/src/features/acadmecis.api";
import PullRequestReviewModal from "./PullRequestReviewModal";
import { useBottomSheet } from "@/app/contexts/BottomSheetContext";


interface PullRequestCardProps {
  acadRepoId: string;
  pullRequest: PullRequestDto;
  onPress?: () => void;

}

const getStatusBadge = (status?: string) => {
  const normalized = (status || "PENDING").toUpperCase();

  switch (normalized) {
    case "APPROVED":
    case "MERGED":
      return {
        label: normalized === "MERGED" ? "Merged" : "Approved",
        bg: "bg-emerald-500/15",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        icon: "git-merge" as const,
        iconColor: "#34d399",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        bg: "bg-rose-500/15",
        border: "border-rose-500/30",
        text: "text-rose-400",
        icon: "close-circle-outline" as const,
        iconColor: "#f87171",
      };
    case "PENDING":
    default:
      return {
        label: "Pending Review",
        bg: "bg-amber-500/15",
        border: "border-amber-500/30",
        text: "text-amber-400",
        icon: "time-outline" as const,
        iconColor: "#fbbf24",
      };
  }
};

const getMaterialIcon = (type?: MaterialType) => {
  switch (type) {
    case "PDF":
      return { name: "file-pdf-box" as const, color: "#ef4444", bg: "bg-red-500/10" };
    case "DOCUMENT":
      return { name: "file-word-box" as const, color: "#3b82f6", bg: "bg-blue-500/10" };
    case "PPT":
      return { name: "file-powerpoint-box" as const, color: "#f97316", bg: "bg-orange-500/10" };
    case "IMAGE":
      return { name: "file-image-outline" as const, color: "#10b981", bg: "bg-emerald-500/10" };
    case "VIDEO":
      return { name: "file-video-outline" as const, color: "#8b5cf6", bg: "bg-purple-500/10" };
    default:
      return { name: "file-document-outline" as const, color: "#06b6d4", bg: "bg-cyan-500/10" };
  }
};


export default function PullRequestCard({
  acadRepoId,
  pullRequest,
  onPress,

}: PullRequestCardProps) {



  const { openActionSheet, closeActionSheet } = useBottomSheet()

  const {
    id,
    note,
    materialDto,
    author,
    subsectionDto,
    reviewer,
    createdAt,
    reviewedAt,
    reviewComment,
    pullRequestStatus,
    subjectName,
    hasMoreReviewer
  } = pullRequest;
  console.log(reviewer, "reviewer")
  const statusBadge = getStatusBadge(pullRequestStatus);
  const materialIcon = getMaterialIcon(materialDto?.materialType);
  const authorName = author?.name || "Anonymous Contributor";
  const authorAvatar = author?.avatarUrl;

  const handleOpenFile = () => {
    if (materialDto?.fileUrl) {
      Linking.openURL(materialDto.fileUrl).catch((err) =>
        console.error("Error opening URL:", err)
      );
    }
  };

  function handleOpenReviewSheet(acadRepoId: string, prData: PullRequestDto) {
    openActionSheet({
      content: () => <PullRequestReviewModal
        acadRepoId={acadRepoId}
        pullRequest={prData}
        onClose={() => closeActionSheet()}

      ></PullRequestReviewModal>

      , color: "#000000"
    })
  }
  return (
    <>
      <Pressable
        onPress={onPress}
        className="w-full bg-[#060606] border border-white/10 rounded-2xl p-4 mb-3.5 overflow-hidden shadow-md"
      >

        <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-white/5">
          <View className="flex-row items-center gap-2.5 flex-1 mr-2">
            {authorAvatar ? (
              <Image
                source={{ uri: authorAvatar }}
                className="w-8 h-8 rounded-full bg-white/10"
              />
            ) : (
              <View className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/30 items-center justify-center">
                <Text className="text-indigo-300 font-bold text-xs">
                  {authorName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5 flex-wrap">
                <Text className="text-zinc-100 text-sm font-semibold" numberOfLines={1}>
                  {authorName}
                </Text>
              </View>
              <Text className="text-zinc-400 text-[11px]">
                {createdAt}
              </Text>
            </View>
          </View>

          <View
            className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full border ${statusBadge.bg} ${statusBadge.border}`}
          >
            {statusBadge.icon === "git-merge" ? (
              <MaterialCommunityIcons name="git-merge" size={13} color={statusBadge.iconColor} />
            ) : (
              <Ionicons name={statusBadge.icon} size={13} color={statusBadge.iconColor} />
            )}
            <Text className={`text-xs font-medium ${statusBadge.text}`}>
              {statusBadge.label}
            </Text>
          </View>
        </View>

        <View className="mb-3">
          <Text className="text-zinc-100 font-bold text-base tracking-tight mb-1" numberOfLines={2}>
            {materialDto?.title || "Academic Material Pull Request"}
          </Text>
          {subsectionDto?.subsectionType && (
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Ionicons name="folder-open-outline" size={13} color="#a1a1aa" />
              <Text className="text-zinc-400 text-xs font-medium">
                {subsectionDto?.subsectionType}{subjectName ? ` / ${subjectName}` : ""}
              </Text>
            </View>
          )}
        </View>


        {materialDto && (
          <View className="flex-row items-center justify-between  border border-white/5 rounded-xl p-3 mb-3">
            <View className="flex-row items-center gap-3 flex-1 mr-2">
              <View className={`w-10 h-10 rounded-lg items-center justify-center ${materialIcon.bg}`}>
                <MaterialCommunityIcons name={materialIcon.name} size={22} color={materialIcon.color} />
              </View>
              <View className="flex-1">
                <Text className="text-zinc-200 text-xs font-medium" numberOfLines={1}>
                  {materialDto.fileName || materialDto.title}
                </Text>
                <View className="flex-row items-center gap-2 mt-0.5">
                  <Text className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                    {materialDto.materialType || "FILE"}
                  </Text>
                </View>
              </View>
            </View>

            {materialDto.fileUrl ? (
              <Pressable
                onPress={handleOpenFile}
                className="p-2 rounded-lg bg-white/[0.06] border border-white/10 active:bg-white/15"
              >
                <Feather name="external-link" size={14} color="#e4e4e7" />
              </Pressable>
            ) : null}
          </View>
        )}


        {note ? (
          <View className="bg-[#121212] rounded-xl p-3 mb-3">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Ionicons name="chatbubble-ellipses-outline" size={13} color="#a1a1aa" />
              <Text className="text-zinc-400 text-xs font-medium">Contributor Note</Text>
            </View>
            <Text className="text-zinc-300 text-xs leading-relaxed" numberOfLines={3}>
              {note}
            </Text>
          </View>
        ) : null}


        {(reviewer || reviewComment || reviewedAt) && (
          <View>
            <View className="bg-[#121212] border border-white/5 rounded-xl p-3 mb-3">
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons
                    name={pullRequestStatus === "REJECTED" ? "close-circle-outline" : "checkmark-circle-outline"}
                    size={14}
                    color="#a1a1aa"
                  />
                  <Text className="text-zinc-400 text-xs font-semibold">
                    Reviewer note
                  </Text>
                </View>
                {reviewedAt && (
                  <Text className="text-zinc-500 text-[11px]">
                    {reviewedAt}
                  </Text>
                )}
              </View>
              {reviewComment && (
                <View className="mt-1.5 pt-1.5 border-t border-white/5 flex-row items-start gap-1.5">
                  <Feather name="corner-down-right" size={12} color="#71717a" className="mt-0.5" />
                  <Text className="text-zinc-300 text-xs leading-relaxed flex-1 italic">
                    "{reviewComment}"
                  </Text>
                </View>
              )}

            </View>
            {reviewer && reviewer.length > 0 && <Text className="text-zinc-500 text-xs font-semibold">Reviewed by {reviewer?.map((r) => r.name).join(", ")}{hasMoreReviewer ? 'and others' : ''}</Text>}
          </View>
        )}


        <View className="flex-row justify-end pt-1">
          <Pressable
            onPress={() => handleOpenReviewSheet(acadRepoId, pullRequest)}
            className="flex-row items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E883E] active:bg-[#155f2c] shadow-sm"
          >
            <MaterialCommunityIcons
              name="comment-edit-outline"
              size={15}
              color={"white"}
            />
            <Text className="text-xs font-semibold text-white">
              Review PR
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </>
  );
}

