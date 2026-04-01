import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import FileCard from "./FileCard";
import { AcademicFile, FolderType, SubjectFolder } from "./types";

interface FolderDetailScreenProps {
  folder: SubjectFolder;
  subjectName: string;
  subjectColor: string;
  onBack: () => void;
  onUpload: () => void;
}

export default function FolderDetailScreen({
  folder,
  subjectName,
  subjectColor,
  onBack,
  onUpload,
}: FolderDetailScreenProps) {
  const [search, setSearch] = useState("");

  const filtered: AcademicFile[] = search.trim()
    ? folder.files.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          (f.year && f.year.includes(search)),
      )
    : folder.files;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* ── Header ── */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.05)",
        }}
      >
        {/* Top row */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              marginRight: 10,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.06)",
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
          </Pressable>

          {/* Folder icon */}
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: `${folder.color}18`,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <MaterialCommunityIcons
              name={folder.iconName as any}
              size={20}
              color={folder.color}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 17 }}>
              {folder.label}
            </Text>
            <Text style={{ color: "#71717a", fontSize: 11, marginTop: 1 }}>
              {subjectName} · {folder.fileCount} files
            </Text>
          </View>

          {/* Upload icon button */}
          <Pressable
            onPress={onUpload}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#FF6B35",
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <MaterialCommunityIcons name="upload" size={18} color="#fff" />
          </Pressable>
        </View>

        {/* Search bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#18181b",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.07)",
            paddingHorizontal: 12,
            height: 38,
          }}
        >
          <MaterialCommunityIcons name="magnify" size={16} color="#52525b" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={`Search ${folder.label.toLowerCase()}...`}
            placeholderTextColor="#52525b"
            style={{ flex: 1, color: "#fff", fontSize: 13, marginLeft: 8 }}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <MaterialCommunityIcons name="close-circle" size={16} color="#52525b" />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── File List ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Count + contribute row */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <Text style={{ color: "#52525b", fontSize: 11, fontWeight: "600" }}>
            {filtered.length} {filtered.length === 1 ? "file" : "files"}
            {search ? ` for "${search}"` : ""}
          </Text>
          <Pressable
            onPress={onUpload}
            style={({ pressed }) => ({
              opacity: pressed ? 0.75 : 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "rgba(255,107,53,0.10)",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "rgba(255,107,53,0.2)",
            })}
          >
            <MaterialCommunityIcons name="plus" size={13} color="#FF6B35" />
            <Text style={{ color: "#FF6B35", fontSize: 11, fontWeight: "700" }}>
              Contribute
            </Text>
          </Pressable>
        </View>

        {filtered.length > 0 ? (
          filtered.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              folderType={folder.id as FolderType}
              accentColor={folder.color}
            />
          ))
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <MaterialCommunityIcons name="file-search-outline" size={48} color="#27272a" />
            <Text style={{ color: "#52525b", fontSize: 13, marginTop: 12, textAlign: "center" }}>
              {search ? `No files found for "${search}"` : "No files yet. Be the first to contribute!"}
            </Text>
            {!search && (
              <Pressable
                onPress={onUpload}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  marginTop: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: "#FF6B35",
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 20,
                })}
              >
                <MaterialCommunityIcons name="upload" size={15} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                  Upload Now
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}