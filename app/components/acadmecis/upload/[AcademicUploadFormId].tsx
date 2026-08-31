import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  Modal,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

import {
  useGetAcadmicsPresignedMutation,
  useAddStudyMaterialMutation,
  MaterialType,
  useMakePullRequestMutation,
} from "@/src/features/acadmecis.api";
import { uploadAcademicMaterial } from "@/src/utils/AcadmicMediaUplaodService";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormErrors {
  title?: string;
  description?: string;
  file?: string;
}

const MATERIAL_TYPES: { label: string; value: MaterialType; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { label: "PDF", value: "PDF", icon: "file-pdf-box" },
  { label: "Document", value: "DOCUMENT", icon: "file-word-box" },
  { label: "PPT", value: "PPT", icon: "file-powerpoint-box" },

  { label: "Image", value: "IMAGE", icon: "file-image-outline" },

];

const MIME_TO_TYPE: Record<string, MaterialType> = {
  "application/pdf": "PDF",
  "application/vnd.ms-powerpoint": "PPT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPT",

  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
  "application/msword": "DOCUMENT",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCUMENT",
};

export default function AcademicUploadForm() {
  const router = useRouter();
  const { AcademicUploadFormId: subsectionId, repoId } = useLocalSearchParams();






  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reviewerNote, setReviewerNote] = useState("");
  const [materialType, setMaterialType] = useState<MaterialType>("PDF");
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState(false);

  const [getPresigned] = useGetAcadmicsPresignedMutation();
  const [addMaterial] = useAddStudyMaterialMutation();
  const [makePullRequest] = useMakePullRequestMutation();
  function handleClose() {
    router.back()
  }
  console.log(subsectionId)
  console.log(repoId)
  const handleFilePick = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        setSelectedFile(file);
        setErrors((e) => ({ ...e, file: undefined }));

        const detected = MIME_TO_TYPE[file.mimeType || ""];
        if (detected) {
          setMaterialType(detected);
        }
      }
    } catch (error) {
      console.error("File pick error:", error);
    }
  }, []);


  const completedFields = [
    Boolean(selectedFile),
    title.trim().length > 0,
    description.trim().length > 0,
  ].filter(Boolean).length;

  const isReady = completedFields === 3 && !isUploading;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!selectedFile) newErrors.file = "Please select a file to upload.";
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    if (!validate()) return;
    if (!selectedFile) return;

    setIsUploading(true);
    try {

      const fullDescription = reviewerNote.trim()
        ? `${description.trim()}\n\n[Note for Reviewers]: ${reviewerNote.trim()}`
        : description.trim();

      const result = await uploadAcademicMaterial(
        {
          title: title.trim(),

          type: materialType,
          note: reviewerNote,
          repoId: repoId as string,
          subsectionId: subsectionId as string,
          fileUri: selectedFile.uri,
          mimeType: selectedFile.mimeType || "application/octet-stream",
          fileSize: selectedFile.size || 0,
        },
        async (args) => {
          const res = await getPresigned(args).unwrap();
          return res;
        },
        async (args) => {
          const res = await makePullRequest(args).unwrap();
          return res;
        }
      );

      if (result.success) {
        Alert.alert("PR Submitted!", "Your academic upload contribution was submitted for review.", [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              handleClose();
            },
          },
        ]);
      } else {
        Alert.alert("Upload Failed", result.error || "Something went wrong.");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Something went wrong");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setReviewerNote("");
    setMaterialType("PDF");
    setSelectedFile(null);
    setErrors({});
  };


  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        className="flex-1 bg-black"
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >

        <View className="flex-row items-center justify-between px-5 pt-1  pb-3 border-b border-white/10">
          <View className="flex-row items-center gap-3">
            <Pressable
              className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
              onPress={handleClose}
            >
              <Ionicons name="close" size={18} color="#f0f0f0" />
            </Pressable>
            <View>
              <Text
                className="text-white font-bold text-base tracking-tight"
                style={{ fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium" }}
              >
                Academic Upload PR
              </Text>
              <Text className="text-white/35 text-xs mt-0.5">
                {completedFields}/3 required fields complete
              </Text>
            </View>
          </View>

          <Pressable
            disabled={!isReady || isUploading}
            onPress={handleSubmit}
            className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${isReady ? "bg-[#1ed760] border-[#1ed760]" : "bg-white/5 border-white/15"
              }`}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={isReady ? "#000" : "rgba(255,255,255,0.3)"} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="git-pull-request"
                  size={15}
                  color={isReady ? "#000" : "rgba(255,255,255,0.3)"}
                />
                <Text className={`text-sm font-medium ${isReady ? "text-black" : "text-white/30"}`}>
                  Submit PR
                </Text>
              </>
            )}
          </Pressable>
        </View>



        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 200 }}
        >




          <View className="px-5 mt-5">
            <Text className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3">
              Resource Document
            </Text>

            {selectedFile ? (
              <View className="w-full rounded-2xl border border-white/15 bg-white/[0.05] p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1 mr-2">
                  <View className="w-12 h-12 rounded-xl bg-[#1ed760]/15 items-center justify-center">
                    <MaterialCommunityIcons name="file-document" size={24} color="#1ed760" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                    <Text className="text-white/35 text-xs mt-0.5">
                      {((selectedFile.size || 0) / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={handleFilePick}
                  className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 mr-2"
                >
                  <Text className="text-white/70 text-xs font-medium">Change</Text>
                </Pressable>

                <Pressable
                  onPress={() => setSelectedFile(null)}
                  className="w-7 h-7 rounded-full bg-white/10 items-center justify-center"
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handleFilePick}
                className="w-full h-32 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] items-center justify-center gap-2"
              >
                <View className="w-11 h-11 rounded-full bg-white/10 items-center justify-center">
                  <Ionicons name="cloud-upload-outline" size={22} color="rgba(255,255,255,0.6)" />
                </View>
                <Text className="text-white/60 text-xs font-medium">Tap to select document or file</Text>
                <Text className="text-white/30 text-[11px]">PDF, DOC, PPT, Images</Text>
              </Pressable>
            )}

            {errors.file && (
              <Text className="text-red-500 text-xs mt-1.5">{errors.file}</Text>
            )}
          </View>

          <View className="h-px bg-white/6 mx-5 my-5" />


          <View className="px-5">
            <Text className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3">
              Material Category
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {MATERIAL_TYPES.map((type) => {
                const active = materialType === type.value;
                return (
                  <Pressable
                    key={type.value}
                    onPress={() => setMaterialType(type.value)}
                    className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border ${active ? "bg-white " : "bg-white/[0.03] border-white/15"
                      }`}
                  >
                    <MaterialCommunityIcons
                      name={type.icon}
                      size={15}
                      color={active ? "#000" : "rgba(255,255,255,0.5)"}
                    />
                    <Text className={`text-xs font-medium ${active ? "text-black" : "text-white/60"}`}>
                      {type.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="h-px bg-white/6 mx-5 my-5" />


          <View className="px-5">
            <Text className="text-white/40 text-xs font-bold tracking-widest uppercase mb-4">
              Contribution Details
            </Text>


            <View className="mb-4">
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-white/55 text-sm font-medium">Title *</Text>
                <Text className="text-white/25 text-xs">{title.length}/80</Text>
              </View>
              <TextInput
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  if (t.trim()) setErrors((e) => ({ ...e, title: undefined }));
                }}
                placeholder="e.g., Mid-Term 2024 Question Paper with Solutions"
                placeholderTextColor="rgba(255,255,255,0.22)"
                maxLength={80}
                className={`bg-white/[0.05] rounded-xl px-4 py-3 text-[15px] border ${errors.title ? "border-red-500" : "border-white/12"
                  }`}
                style={{ color: "#f0f0f0" }}
              />
              {errors.title && (
                <Text className="text-red-500 text-xs mt-1">{errors.title}</Text>
              )}
            </View>


            <View className="mb-4">
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-white/55 text-sm font-medium">Description *</Text>
                <Text className="text-white/25 text-xs">{description.length}/500</Text>
              </View>
              <TextInput
                value={description}
                onChangeText={(t) => {
                  setDescription(t);
                  if (t.trim()) setErrors((e) => ({ ...e, description: undefined }));
                }}
                placeholder="Provide context, topics covered, or summary of the material..."
                placeholderTextColor="rgba(255,255,255,0.22)"
                maxLength={500}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className={`bg-white/[0.05] rounded-xl px-4 py-3 text-[15px] border ${errors.description ? "border-red-500" : "border-white/12"
                  }`}
                style={{ minHeight: 100, color: "#f0f0f0" }}
              />
              {errors.description && (
                <Text className="text-red-500 text-xs mt-1">{errors.description}</Text>
              )}
            </View>


            <View className="mb-2">
              <View className="flex-row justify-between mb-1.5">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="information-circle-outline" size={15} color="rgba(255,255,255,0.5)" />
                  <Text className="text-white/55 text-sm font-medium">Note for Reviewers</Text>
                </View>
                <Text className="text-white/25 text-xs">{reviewerNote.length}/300</Text>
              </View>
              <TextInput
                value={reviewerNote}
                onChangeText={setReviewerNote}
                placeholder="Optional PR comments (e.g., 'Verified against official 2024 syllabus module 3')..."
                placeholderTextColor="rgba(255,255,255,0.22)"
                maxLength={300}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="bg-white/[0.05] rounded-xl px-4 py-3 text-[15px] border border-white/12"
                style={{ minHeight: 80, color: "#f0f0f0" }}
              />
            </View>
          </View>

          <View className="h-px bg-white/6 mx-5 my-5" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

}
