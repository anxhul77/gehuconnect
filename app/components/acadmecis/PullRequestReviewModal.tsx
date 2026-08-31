import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { PullRequestDto, useUpdatePullRequestMutation, MaterialType } from "@/src/features/acadmecis.api";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";


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

interface PullRequestReviewModalProps {

  acadRepoId: string,
  pullRequest: PullRequestDto | null;
  onClose: () => void;

}

export default function PullRequestReviewModal({
  acadRepoId,
  pullRequest,
  onClose,

}: PullRequestReviewModalProps) {
  const [reviewNote, setReviewNote] = useState("");
  const [submittingAction, setSubmittingAction] = useState<"APPROVED" | "REJECTED" | "SAVE_NOTE" | null>(null);

  const [updatePullRequest] = useUpdatePullRequestMutation();


  if (!pullRequest) return null;

  const handleSaveNote = async () => {
    if (!pullRequest?.id || !reviewNote.trim()) return;
    setSubmittingAction("SAVE_NOTE");
    try {
      await updatePullRequest({
        acadRepoId: acadRepoId,
        pullRequestDto: {
          id: pullRequest.id,
          reviewComment: reviewNote.trim(),
        },

      }).unwrap();



      Alert.alert("Note Saved", "Reviewer note has been updated successfully.");


    } catch (err: any) {
      console.log("API update note error", err);
      Alert.alert("Error", err?.data?.message || err?.message || "Failed to update note.");
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleReviewAction = async (status: "APPROVED" | "REJECTED") => {
    setSubmittingAction(status);
    try {
      if (pullRequest.id) {
        try {
          await updatePullRequest({
            acadRepoId: acadRepoId,
            pullRequestDto: {
              id: pullRequest.id,
              pullRequestStatus: status,
              reviewComment: reviewNote.trim() || undefined,

            },
            filterStatus: filterStatus
          }).unwrap();
        } catch (apiErr) {
          console.log("API update endpoint returned error or mock fallback, performing client update", apiErr);
        }
      }
    } catch (e) {
      console.log(e, "error")

    }


  }

  return (


    <View className="flex-1  border-t border-white/10  ">

      <View className="flex-row items-center justify-between  border-b border-white/10 px-5 h-20"
      >

        <View className="flex-row items-center gap-2">

          <Feather name="git-pull-request" size={24} color="grey" />

          <Text className="text-white font-bold text-lg">Review Pull Request</Text>
        </View>

        <Pressable
          onPress={onClose}
          className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
        >
          <Ionicons name="close" size={18} color="#ccc" />
        </Pressable>
      </View>

      <ScrollView className="mt-4 px-5" showsVerticalScrollIndicator={false}>


        <View className="flex-row items-center gap-3 pb-3 border-b border-white/5 mb-3">
          {pullRequest.author?.avatarUrl ? (
            <Image
              source={{ uri: pullRequest.author.avatarUrl }}
              className="w-9 h-9 rounded-full bg-white/10"
            />
          ) : (
            <View className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/40 items-center justify-center">
              <Text className="text-indigo-300 font-bold text-xs">
                {(pullRequest.author?.name || "C").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-white text-sm font-semibold" numberOfLines={1}>
              {pullRequest.author?.name || "Anonymous Contributor"}
            </Text>
            <Text className="text-white/40 text-[11px]">
              {pullRequest.createdAt}
            </Text>
          </View>
        </View>


        <View className="mb-3">
          <Text className="text-white font-bold text-base mb-2" numberOfLines={2}>
            {pullRequest.materialDto?.title || "Academic Contribution"}
          </Text>
          <Text className="text-white/40 text-sm mb-3">{pullRequest.subsectionDto?.subsectionType}/{pullRequest.subjectName}</Text>
          {pullRequest.materialDto && (
            <View className="flex-row items-center justify-between bg-black/40 border border-white/10 rounded-xl p-3">
              <View className="flex-row items-center gap-3 flex-1 mr-2">
                <View className={`w-9 h-9 rounded-lg items-center justify-center ${getMaterialIcon(pullRequest.materialDto.materialType).bg}`}>
                  <MaterialCommunityIcons
                    name={getMaterialIcon(pullRequest.materialDto.materialType).name}
                    size={20}
                    color={getMaterialIcon(pullRequest.materialDto.materialType).color}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white/90 text-xs font-medium" numberOfLines={1}>
                    {pullRequest.materialDto.fileName || pullRequest.materialDto.title}
                  </Text>
                  <Text className="text-white/40 text-[10px] uppercase font-bold tracking-wider mt-0.5">
                    {pullRequest.materialDto.materialType || "FILE"}
                  </Text>
                </View>
              </View>
              {pullRequest.materialDto.fileUrl ? (
                <Pressable
                  onPress={() => Linking.openURL(pullRequest.materialDto!.fileUrl)}
                  className="p-1.5 rounded-lg bg-white/10 border-1 border-white/10"
                >
                  <Feather name="external-link" size={14} color="#e4e4e7" />
                </Pressable>
              ) : null}
            </View>
          )}



          {pullRequest.note ? (
            <View className="bg-[#121212] rounded-xl p-3.5 mt-3 mb-1">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Ionicons name="chatbubble-ellipses-outline" size={14} color="#a1a1aa" />
                <Text className="text-white/35 text-xs font-semibold">Contributor Note</Text>
              </View>
              <Text className="text-zinc-300 text-xs leading-relaxed">
                {pullRequest.note}
              </Text>
            </View>
          ) : null}
        </View>


        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white/35 font-semibold text-xs">
              Add Reviewer Note (Optional)
            </Text>
            <Text className="text-white/35 text-xs">{reviewNote.length}/300</Text>
          </View>
          <BottomSheetTextInput
            value={reviewNote}
            onChangeText={setReviewNote}
            placeholder="Write feedback, reasons for approval/rejection, or instructions..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            maxLength={300}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="bg-[#121212] border border-white/5 text-white rounded-xl p-3 text-sm"
            style={{ minHeight: 100 }}
          />
          {reviewNote.trim().length > 0 && (
            <Pressable
              disabled={submittingAction !== null}
              onPress={handleSaveNote}
              className="mt-2.5 self-end flex-row items-center gap-2 py-2 px-4 rounded-xl bg-indigo-600 active:bg-indigo-500"
            >
              {submittingAction === "SAVE_NOTE" ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="bookmark-outline" size={15} color="white" />
                  <Text className="text-white font-semibold text-xs">Save Note</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        <View className="flex-row items-center gap-3 mb-6">

          <Pressable
            disabled={submittingAction !== null}
            onPress={() => handleReviewAction("REJECTED")}
            className="flex-1 flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 active:bg-rose-600"
          >
            {submittingAction === "REJECTED" ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={18} color="white" />
                <Text className="text-white font-bold text-sm">Discard PR</Text>
              </>
            )}
          </Pressable>


          <Pressable
            disabled={submittingAction !== null}
            onPress={() => handleReviewAction("APPROVED")}
            className="flex-1 flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl  bg-[#1E883E]"
          >
            {submittingAction === "APPROVED" ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                <Text className="text-white font-bold text-sm">Accept PR</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>

    </View>


  );
}
