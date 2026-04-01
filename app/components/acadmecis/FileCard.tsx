import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { AcademicFile, FolderType } from "./types";

interface FileCardProps {
  file: AcademicFile;
  folderType: FolderType;
  accentColor: string;
}

// Map folder type → file icon
const FILE_ICON: Record<FolderType, string> = {
  PYQs: "file-document-outline",
  Notes: "note-text-outline",
  Syllabus: "book-outline",
  Assignments: "clipboard-outline",
  "Lab Manual": "flask-outline",
};

export default function FileCard({
  file,
  folderType,
  accentColor,
}: FileCardProps) {
  return (
    <Pressable
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
        backgroundColor: "#18181b",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      })}
    >
      {/* File icon */}
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          backgroundColor: `${accentColor}18`,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <MaterialCommunityIcons
          name={FILE_ICON[folderType] as any}
          size={20}
          color={accentColor}
        />
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "#fff",
            fontWeight: "600",
            fontSize: 13,
            marginBottom: 3,
          }}
          numberOfLines={2}
        >
          {file.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {/* Year badge for PYQs */}
          {file.year && (
            <View
              style={{
                backgroundColor: "rgba(239,68,68,0.12)",
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{ color: "#ef4444", fontSize: 10, fontWeight: "700" }}
              >
                {file.year}
              </Text>
            </View>
          )}
          <Text style={{ color: "#52525b", fontSize: 11 }}>{file.size}</Text>
          <Text style={{ color: "#3f3f46", fontSize: 11 }}>·</Text>
          <Text style={{ color: "#52525b", fontSize: 11 }} numberOfLines={1}>
            {file.uploadedBy}
          </Text>
        </View>
      </View>

      {/* Download button */}
      <Pressable
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#FF6B35",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        })}
      >
        <MaterialCommunityIcons name="download" size={18} color="#fff" />
      </Pressable>
    </Pressable>
  );
}