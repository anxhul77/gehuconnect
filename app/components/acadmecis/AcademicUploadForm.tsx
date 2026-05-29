import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import {
  useGetAcadmicsPresignedMutation,
  useAddStudyMaterialMutation,
  MaterialType,
} from "@/src/features/acadmecis.api";
import { uploadAcademicMaterial } from "@/src/utils/AcadmicMediaUplaodService";

interface UploadFormProps {
  visible: boolean;
  onClose: () => void;
  subjectId: number;
  subjectName?: string;
}

const MATERIAL_TYPES: { label: string; value: MaterialType }[] = [
  { label: "PDF", value: "PDF" },
  { label: "Video", value: "VIDEO" },
  { label: "Document", value: "DOCUMENT" },
  { label: "PPT", value: "PPT" },
  { label: "Image", value: "IMAGE" },
  { label: "Other", value: "OTHER" },
];

const MIME_TO_TYPE: Record<string, MaterialType> = {
  "application/pdf": "PDF",
  "application/vnd.ms-powerpoint": "PPT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPT",
  "video/mp4": "VIDEO",
  "video/quicktime": "VIDEO",
  "video/webm": "VIDEO",
  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
  "application/msword": "DOCUMENT",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCUMENT",
};

export default function AcademicUploadForm({
  visible,
  onClose,
  subjectId,
  subjectName,
}: UploadFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [materialType, setMaterialType] = useState<MaterialType>("PDF");
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [getPresigned] = useGetAcadmicsPresignedMutation();
  const [addMaterial] = useAddStudyMaterialMutation();

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        setSelectedFile(file);

        // Auto-detect material type from mime
        const detected = MIME_TO_TYPE[file.mimeType || ""];
        if (detected) {
          setMaterialType(detected);
        }
      }
    } catch (error) {
      console.error("File pick error:", error);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }
    if (!selectedFile) {
      Alert.alert("Error", "Please select a file");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadAcademicMaterial(
        {
          title: title.trim(),
          description: description.trim(),
          type: materialType,
          subjectId,
          fileUri: selectedFile.uri,
          mimeType: selectedFile.mimeType || "application/octet-stream",
          fileSize: selectedFile.size || 0,
        },
        async (args) => {
          const res = await getPresigned(args).unwrap();
          return res;
        },
        async (args) => {
          const res = await addMaterial(args).unwrap();
          return res;
        }
      );

      if (result.success) {
        Alert.alert("Success", "Material uploaded successfully!");
        resetForm();
        onClose();
      } else {
        Alert.alert("Error", result.error || "Upload failed");
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
    setMaterialType("PDF");
    setSelectedFile(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-[#121212]">
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4 border-b border-white/10"
          style={{ paddingTop: 16, paddingBottom: 16 }}
        >
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-lg font-semibold">Upload Material</Text>
          <Pressable
            onPress={handleSubmit}
            disabled={isUploading}
            className="bg-orange-500 px-4 py-2 rounded-full"
            style={{ opacity: isUploading ? 0.5 : 1 }}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-sm">Upload</Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Subject Info */}
          {subjectName && (
            <View className="bg-white/5 rounded-xl p-3 mt-4 flex-row items-center">
              <Ionicons name="book-outline" size={18} color="#FF6B35" />
              <Text className="text-zinc-300 ml-2 text-sm">
                Uploading to: <Text className="text-white font-medium">{subjectName}</Text>
              </Text>
            </View>
          )}

          {/* Title */}
          <Text className="text-zinc-400 text-xs uppercase tracking-wider mt-6 mb-2 font-semibold">
            Title *
          </Text>
          <TextInput
            className="bg-white/5 text-white p-4 rounded-xl border border-white/10 text-[15px]"
            placeholder="e.g. Chapter 5 Notes"
            placeholderTextColor="#555"
            value={title}
            onChangeText={setTitle}
          />

          {/* Description */}
          <Text className="text-zinc-400 text-xs uppercase tracking-wider mt-5 mb-2 font-semibold">
            Description
          </Text>
          <TextInput
            className="bg-white/5 text-white p-4 rounded-xl border border-white/10 text-[15px]"
            placeholder="Brief description of the material..."
            placeholderTextColor="#555"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{ textAlignVertical: "top", minHeight: 80 }}
          />

          {/* Material Type */}
          <Text className="text-zinc-400 text-xs uppercase tracking-wider mt-5 mb-2 font-semibold">
            Material Type
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {MATERIAL_TYPES.map((type) => (
              <Pressable
                key={type.value}
                onPress={() => setMaterialType(type.value)}
                className={`px-4 py-2 rounded-full border ${materialType === type.value
                    ? "bg-orange-500/20 border-orange-500"
                    : "bg-white/5 border-white/10"
                  }`}
              >
                <Text
                  className={`text-sm font-medium ${materialType === type.value ? "text-orange-400" : "text-zinc-400"
                    }`}
                >
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* File Picker */}
          <Text className="text-zinc-400 text-xs uppercase tracking-wider mt-5 mb-2 font-semibold">
            File *
          </Text>
          <Pressable
            onPress={handleFilePick}
            className="bg-white/5 border border-dashed border-white/20 rounded-xl p-6 items-center justify-center"
          >
            {selectedFile ? (
              <View className="items-center">
                <MaterialIcons name="insert-drive-file" size={40} color="#FF6B35" />
                <Text className="text-white mt-2 text-sm font-medium" numberOfLines={1}>
                  {selectedFile.name}
                </Text>
                <Text className="text-zinc-500 text-xs mt-1">
                  {((selectedFile.size || 0) / 1024 / 1024).toFixed(2)} MB
                </Text>
                <Text className="text-orange-400 text-xs mt-2">Tap to change</Text>
              </View>
            ) : (
              <View className="items-center">
                <Ionicons name="cloud-upload-outline" size={40} color="#666" />
                <Text className="text-zinc-400 mt-2 text-sm">Tap to select a file</Text>
                <Text className="text-zinc-600 text-xs mt-1">
                  PDF, PPT, DOC, Images, Videos
                </Text>
              </View>
            )}
          </Pressable>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}
