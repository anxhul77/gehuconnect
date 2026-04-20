// ─────────────────────────────────────────────
//  AttachmentPreviewBar.tsx
// ─────────────────────────────────────────────
 
import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { formatBytes, LocalAttachment } from "@/src/types/Attachment.types";

 
interface Props {
  attachments: LocalAttachment[];
  onRemove: (localId: string) => void;
}
 
function DocIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === "application/pdf")
    return <MaterialCommunityIcons name="file-pdf-box" size={32} color="#ED4245" />;
  if (mimeType.includes("word"))
    return <MaterialCommunityIcons name="file-word-box" size={32} color="#4E7EFF" />;
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
    return <MaterialCommunityIcons name="file-excel-box" size={32} color="#3BA55C" />;
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
    return <MaterialCommunityIcons name="file-powerpoint-box" size={32} color="#ED7525" />;
  if (mimeType === "application/zip" || mimeType.includes("rar"))
    return <MaterialCommunityIcons name="zip-box" size={32} color="#FAA81A" />;
  return <MaterialCommunityIcons name="file-document" size={32} color="#B5BAC1" />;
}
 
const AttachmentPreviewItem = memo(
  ({
    item,
    onRemove,
  }: {
    item: LocalAttachment;
    onRemove: (id: string) => void;
  }) => {
    const handleRemove = useCallback(() => onRemove(item.localId), [item.localId, onRemove]);
 
    const isMedia = item.category === "image" || item.category === "video";
 
    return (
      <View style={styles.item}>
        {/* ── Thumbnail ── */}
        {isMedia ? (
          <View style={styles.mediaThumb}>
            <Image
              source={{ uri: item.thumbUri ?? item.uri }}
              style={styles.mediaThumbImg}
              resizeMode="cover"
            />
            {item.category === "video" && (
              <View style={styles.videoOverlay}>
                <Ionicons name="play" size={16} color="white" />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.docThumb}>
            <DocIcon mimeType={item.mimeType} />
          </View>
        )}
 
        {/* ── Progress overlay ── */}
        {item.status === "uploading" && (
          <View style={styles.progressOverlay}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.progressText}>{item.progress}%</Text>
          </View>
        )}
 
        {/* ── Error badge ── */}
        {item.status === "error" && (
          <View style={styles.errorBadge}>
            <Ionicons name="alert-circle" size={14} color="white" />
          </View>
        )}
 
        {/* ── File name + size (documents only) ── */}
        {!isMedia && (
          <View style={styles.docMeta}>
            <Text style={styles.docName} numberOfLines={1}>
              {item.fileName}
            </Text>
            <Text style={styles.docSize}>{formatBytes(item.fileSize)}</Text>
          </View>
        )}
 
        {/* ── Remove button ── */}
        <Pressable
          onPress={handleRemove}
          style={styles.removeBtn}
          hitSlop={8}
        >
          <Ionicons name="close-circle" size={18} color="#B5BAC1" />
        </Pressable>
      </View>
    );
  }
);
 
export default function AttachmentPreviewBar({ attachments, onRemove }: Props) {
  if (attachments.length === 0) return null;
 
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {attachments.map((a) => (
          <AttachmentPreviewItem key={a.localId} item={a} onRemove={onRemove} />
        ))}
      </ScrollView>
    </View>
  );
}
 
const THUMB = 72;
 
const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2E3035",
    paddingVertical: 8,
    backgroundColor: "#111111",
  },
  scroll: {
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  item: {
    position: "relative",
    alignItems: "center",
  },
  mediaThumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#2E3035",
  },
  mediaThumbImg: {
    width: THUMB,
    height: THUMB,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  docThumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: 8,
    backgroundColor: "#2E3035",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  docMeta: {
    marginTop: 4,
    width: THUMB,
    alignItems: "center",
  },
  docName: {
    color: "#DCDDDE",
    fontSize: 10,
    textAlign: "center",
  },
  docSize: {
    color: "#72767D",
    fontSize: 9,
    marginTop: 1,
  },
  progressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  progressText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  errorBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "#ED4245",
    borderRadius: 8,
    padding: 2,
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#111111",
    borderRadius: 12,
  },
});