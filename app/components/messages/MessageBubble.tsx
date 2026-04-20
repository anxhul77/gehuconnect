import React, { useCallback, useState, memo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  Dimensions,
  ScrollView,
  StatusBar,
  PanResponder,
  Share,
  Linking,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import * as VideoThumbnails from "expo-video-thumbnails";
import { Message, Attachment } from "@/src/features/chat/chat.types";
import { useAppSelector } from "@/src/store/Hooks";
import { formatBytes } from "@/src/types/Attachment.types";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const MAX_CONTENT_LENGTH = 2000;
const TRUNCATE_AT = 300;
const GRID_GAP = 3;
const SINGLE_IMG_MAX_H = 280;
const THUMB_SIZE = (SCREEN_W - 48 - 44 - GRID_GAP) / 2;

const COLORS = {
  bg: "#313338",
  surface: "#2B2D31",
  border: "#1E1F22",
  text: "#DCDDDE",
  textMuted: "#72767D",
  textDimmer: "#4E5058",
  own: "#00AFF4",
  error: "#ED4245",
  pending: "#8E9297",
  success: "#3BA55C",
  accent: "#5865F2",
  overlay: "rgba(0,0,0,0.92)",
  thumbBg: "#1E1F22",
};

const isMedia = (c?: string) => c === "IMAGE" || c === "VIDEO";
const isAudio = (c?: string) => c === "AUDIO";

function formatFullDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString([], {
      weekday: "long", month: "long", day: "numeric",
    });
  } catch { return ""; }
}

// ── Video thumbnail with lazy generation ─────────────────────────────────────
const VideoThumb = memo(({ uri, size, small }: { uri: string; size: number; small?: boolean }) => {
  const [thumbUri, setThumbUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { uri: thumb } = await VideoThumbnails.getThumbnailAsync(uri, {
          time: 1000, // 1 second into video
          quality: 0.7,
        });
        if (!cancelled) setThumbUri(thumb);
      } catch {
        // thumbnail generation failed — show black frame with play button
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [uri]);

  return (
    <View style={{ width: size, height: size, backgroundColor: "#000" }}>
      {thumbUri ? (
        <Image source={{ uri: thumbUri }} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <View style={{ width: size, height: size, backgroundColor: "#111", alignItems: "center", justifyContent: "center" }}>
          {loading && <ActivityIndicator size="small" color={COLORS.textMuted} />}
        </View>
      )}
    </View>
  );
});

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = memo(({ uri, name }: { uri?: string; name?: string }) => {
  const [errored, setErrored] = useState(false);
  const initial = (name ?? "?")[0].toUpperCase();
  const hue = [...(name ?? "U")].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (uri && !errored)
    return <Image source={{ uri }} style={styles.avatar} onError={() => setErrored(true)} />;
  return (
    <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: `hsl(${hue},55%,38%)` }]}>
      <Text style={styles.avatarInitial}>{initial}</Text>
    </View>
  );
});

// ── Status ────────────────────────────────────────────────────────────────────
const MessageStatus = memo(({ item }: { item: Message }) => {
  if (item.failed) return <Ionicons name="alert-circle" size={13} color={COLORS.error} />;
  if (item.pending) return <ActivityIndicator size={10} color={COLORS.textMuted} />;
  if (item.seen) return <Ionicons name="checkmark-done" size={13} color={COLORS.success} />;
  if (item.delivered) return <Ionicons name="checkmark-done" size={13} color={COLORS.textMuted} />;
  return <Ionicons name="checkmark" size={13} color={COLORS.textMuted} />;
});

// ── Video player ──────────────────────────────────────────────────────────────
const VideoPlayer = memo(({ uri }: { uri: string }) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const isPlaying = status?.isLoaded && status.isPlaying;
  const isLoaded  = status?.isLoaded ?? false;

  const togglePlay = useCallback(async () => {
    if (!videoRef.current || !isLoaded) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      // If finished, replay from start
      if (status?.isLoaded && status.didJustFinish) {
        await videoRef.current.replayAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  }, [isPlaying, isLoaded, status]);

  return (
    <View style={vp.container}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={vp.video}
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls={false}
        onPlaybackStatusUpdate={(s) => {
          setStatus(s);
          if (s.isLoaded) setLoading(false);
        }}
        onReadyForDisplay={() => setLoading(false)}
      />

      {/* Custom play/pause overlay — hides when playing */}
      {(!isPlaying || loading) && (
        <Pressable style={vp.overlay} onPress={togglePlay}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <View style={vp.playBtn}>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={34}
                color="#fff"
                style={isPlaying ? undefined : { marginLeft: 4 }}
              />
            </View>
          )}
        </Pressable>
      )}

      {/* Tap to pause when playing */}
      {isPlaying && !loading && (
        <Pressable style={vp.tapArea} onPress={togglePlay} />
      )}
    </View>
  );
});

const vp = StyleSheet.create({
  container: {
    width: SCREEN_W,
    height: SCREEN_H * 0.55,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: SCREEN_W,
    height: SCREEN_H * 0.55,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  tapArea: {
    ...StyleSheet.absoluteFillObject,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
});

// ── Fullscreen viewer ─────────────────────────────────────────────────────────
const FullscreenViewer = memo(({
  attachments,
  initialIndex,
  onClose,
}: {
  attachments: Attachment[];
  initialIndex: number;
  onClose: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState(initialIndex);
  const [downloading, setDownloading] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(true);

  const item = attachments[current];
  if (!item) { onClose(); return null; }

  const isVideo = item.category === "VIDEO";

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
      onPanResponderRelease: (_, g) => {
        const dx = g.dx;
        const dy = Math.abs(g.dy);
        if (Math.abs(dx) > 50 && dy < 80) {
          if (dx < 0) setCurrent(c => Math.min(c + 1, attachments.length - 1));
          else        setCurrent(c => Math.max(c - 1, 0));
        } else if (Math.abs(dx) < 8 && dy < 8) {
          // Only toggle toolbar on tap when it's an image (video has its own tap handler)
          if (!isVideo) setToolbarVisible(v => !v);
        }
      },
    })
  ).current;

  const handleDownload = async () => {
    if (!item.fileUrl) return;
    try {
      setDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") return;
      const filename = item.fileName ?? `attachment_${Date.now()}${isVideo ? ".mp4" : ".jpg"}`;
      const localUri = FileSystem.documentDirectory + filename;
      const { uri } = await FileSystem.downloadAsync(item.fileUrl, localUri);
      await MediaLibrary.saveToLibraryAsync(uri);
    } catch (e) {
      console.error("[Viewer] download failed", e);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!item.fileUrl) return;
    try {
      await Share.share(
        Platform.OS === "ios"
          ? { url: item.fileUrl }
          : { message: item.fileUrl, title: item.fileName ?? "Attachment" }
      );
    } catch (e) {
      console.error("[Viewer] share failed", e);
    }
  };

  const fileName    = item.fileName ?? item.key?.split("/").pop() ?? (isVideo ? "Video" : "Image");
  const displayName = fileName.length > 32 ? fileName.slice(0, 29) + "…" : fileName;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={fs.root} {...panResponder.panHandlers}>

        {/* Top toolbar */}
        {toolbarVisible && (
          <View style={[fs.topBar, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={onClose} style={fs.topBtn} hitSlop={12}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <View style={fs.topCenter}>
              <Text style={fs.topTitle} numberOfLines={1}>{displayName}</Text>
              {attachments.length > 1 && (
                <Text style={fs.topSub}>{current + 1} of {attachments.length}</Text>
              )}
            </View>
            <View style={fs.topActions}>
              <Pressable onPress={handleShare} style={fs.topBtn} hitSlop={12}>
                <Ionicons name="share-outline" size={22} color="#fff" />
              </Pressable>
              <Pressable onPress={handleDownload} style={fs.topBtn} hitSlop={12} disabled={downloading}>
                {downloading
                  ? <ActivityIndicator size={18} color="#fff" />
                  : <Ionicons name="download-outline" size={22} color="#fff" />
                }
              </Pressable>
            </View>
          </View>
        )}

        {/* Main content area */}
        <View style={fs.imageArea}>
          {isVideo ? (
            // Video gets its own player — PanResponder swipe still works on the container
            <VideoPlayer uri={item.fileUrl!} />
          ) : (
            <Image
              source={{ uri: item.fileUrl }}
              style={fs.image}
              resizeMode="contain"
            />
          )}

          {/* Navigation arrows — hidden for video to avoid conflict with player controls */}
          {!isVideo && current > 0 && (
            <Pressable style={[fs.arrow, fs.arrowLeft]} onPress={() => setCurrent(c => c - 1)}>
              <Ionicons name="chevron-back" size={28} color="rgba(255,255,255,0.85)" />
            </Pressable>
          )}
          {!isVideo && current < attachments.length - 1 && (
            <Pressable style={[fs.arrow, fs.arrowRight]} onPress={() => setCurrent(c => c + 1)}>
              <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.85)" />
            </Pressable>
          )}
        </View>

        {/* Bottom strip */}
        {toolbarVisible && attachments.length > 1 && (
          <View style={[fs.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
            {/* Dot indicators for ≤ 8 items */}
            {attachments.length <= 8 && (
              <View style={fs.dots}>
                {attachments.map((_, i) => (
                  <Pressable key={i} onPress={() => setCurrent(i)}>
                    <View style={[fs.dot, i === current && fs.dotActive]} />
                  </Pressable>
                ))}
              </View>
            )}

            {/* Thumbnail strip */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={fs.stripContent}
              style={fs.strip}
            >
              {attachments.map((a, i) => (
                <Pressable
                  key={a.uploadId ?? i}
                  onPress={() => setCurrent(i)}
                  style={[fs.thumb, i === current && fs.thumbActive]}
                >
                  {a.category === "VIDEO" ? (
                    // Video thumb uses the generator
                    <VideoThumb uri={a.fileUrl!} size={56} small />
                  ) : (
                    <Image source={{ uri: a.fileUrl }} style={fs.thumbImg} resizeMode="cover" />
                  )}
                  {i === current && <View style={fs.thumbHighlight} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
});

const fs = StyleSheet.create({
  root:       { flex: 1, backgroundColor: COLORS.overlay },
  topBar:     { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingBottom: 12, backgroundColor: "rgba(0,0,0,0.6)" },
  topBtn:     { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  topCenter:  { flex: 1, alignItems: "center", paddingHorizontal: 8 },
  topTitle:   { color: "#fff", fontSize: 15, fontWeight: "600" },
  topSub:     { color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 1 },
  topActions: { flexDirection: "row", gap: 8 },
  imageArea:  { flex: 1, alignItems: "center", justifyContent: "center" },
  image:      { width: SCREEN_W, height: SCREEN_H * 0.72 },
  arrow:      { position: "absolute", top: "50%", marginTop: -24, width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" },
  arrowLeft:  { left: 12 },
  arrowRight: { right: 12 },
  bottomBar:  { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, backgroundColor: "rgba(0,0,0,0.6)", paddingTop: 10, alignItems: "center" },
  dots:       { flexDirection: "row", gap: 6, marginBottom: 10 },
  dot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" },
  dotActive:  { backgroundColor: "#fff", width: 18, borderRadius: 3 },
  strip:      { maxHeight: 72 },
  stripContent: { paddingHorizontal: 12, gap: 6, flexDirection: "row", paddingBottom: 4 },
  thumb:      { width: 58, height: 58, borderRadius: 8, overflow: "hidden", borderWidth: 2, borderColor: "transparent" },
  thumbActive:{ borderColor: "#fff" },
  thumbImg:   { width: "100%", height: "100%" },
  thumbHighlight: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.1)" },
});

// ── Audio attachment ──────────────────────────────────────────────────────────
const AudioAttachment = memo(({ attachment }: { attachment: Attachment }) => {
  const name = attachment.fileName ?? "Audio file";
  const displayName = name.length > 36 ? name.slice(0, 33) + "…" : name;
  const size = attachment.fileSize ? formatBytes(Number(attachment.fileSize)) : null;
  return (
    <Pressable onPress={() => attachment.fileUrl && Linking.openURL(attachment.fileUrl)} style={styles.audioRow}>
      <View style={styles.audioIconWrap}>
        <Ionicons name="musical-notes" size={22} color={COLORS.accent} />
      </View>
      <View style={styles.audioMeta}>
        <Text style={styles.audioName} numberOfLines={1}>{displayName}</Text>
        {size && <Text style={styles.audioSize}>{size}</Text>}
      </View>
      <View style={styles.audioPlayBtn}>
        <Ionicons name="play" size={16} color="#fff" style={{ marginLeft: 2 }} />
      </View>
    </Pressable>
  );
});

// ── Doc attachment ────────────────────────────────────────────────────────────
const DocAttachment = memo(({ attachment }: { attachment: Attachment }) => {
  function DocIcon() {
    const m = attachment.mimeType;
    if (m === "application/pdf") return <MaterialCommunityIcons name="file-pdf-box" size={28} color="#ED4245" />;
    if (m?.includes("word")) return <MaterialCommunityIcons name="file-word-box" size={28} color="#4E7EFF" />;
    if (m?.includes("excel") || m?.includes("spreadsheet")) return <MaterialCommunityIcons name="file-excel-box" size={28} color="#3BA55C" />;
    if (m?.includes("powerpoint") || m?.includes("presentation")) return <MaterialCommunityIcons name="file-powerpoint-box" size={28} color="#ED7525" />;
    if (m === "application/zip" || m?.includes("rar")) return <MaterialCommunityIcons name="zip-box" size={28} color="#FAA81A" />;
    return <MaterialCommunityIcons name="file-document-outline" size={28} color={COLORS.textMuted} />;
  }
  const name = attachment.fileName ?? attachment.key?.split("/").pop() ?? "File";
  const size = attachment.fileSize ? formatBytes(Number(attachment.fileSize)) : null;
  const displayName = name.length > 40 ? name.slice(0, 37) + "…" : name;
  return (
    <View style={styles.docRow}>
      <View style={styles.docIconWrap}><DocIcon /></View>
      <View style={styles.docMeta}>
        <Text style={styles.docName} numberOfLines={1}>{displayName}</Text>
        {size && <Text style={styles.docSize}>{size}</Text>}
      </View>
      <Ionicons name="download-outline" size={18} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
    </View>
  );
});

// ── Image grid ────────────────────────────────────────────────────────────────
const ImageGrid = memo(({ images, onPress }: { images: Attachment[]; onPress: (i: number) => void }) => {
  const count = images.length;

  if (count === 1) {
    const isVideo = images[0].category === "VIDEO";
    return (
      <Pressable onPress={() => onPress(0)} style={styles.singleWrap}>
        {isVideo ? (
          <VideoThumb uri={images[0].fileUrl!} size={Math.round(SCREEN_W * 0.65)} />
        ) : (
          <Image source={{ uri: images[0].fileUrl }} style={styles.singleImg} resizeMode="cover" />
        )}
        <View style={styles.playOverlay}>
          <View style={isVideo ? styles.playCircle : styles.playCircleHidden}>
            {isVideo && <Ionicons name="play" size={24} color="#fff" style={{ marginLeft: 3 }} />}
          </View>
        </View>
      </Pressable>
    );
  }

  const MAX_SHOW = 4;
  const shown  = images.slice(0, MAX_SHOW);
  const hidden = count - MAX_SHOW;

  return (
    <View style={styles.grid}>
      {shown.map((img, i) => {
        const isLast  = i === MAX_SHOW - 1 && hidden > 0;
        const isVideo = img.category === "VIDEO";
        return (
          <Pressable
            key={img.uploadId ?? i}
            onPress={() => onPress(i)}
            style={[styles.gridCell, count === 3 && i === 0 && styles.gridCellWide]}
          >
            {isVideo ? (
              <VideoThumb uri={img.fileUrl!} size={THUMB_SIZE} small />
            ) : (
              <Image source={{ uri: img.fileUrl }} style={styles.gridImg} resizeMode="cover" />
            )}
            {isVideo && !isLast && (
              <View style={styles.playOverlay}>
                <View style={styles.playCircleSmall}>
                  <Ionicons name="play" size={14} color="#fff" style={{ marginLeft: 2 }} />
                </View>
              </View>
            )}
            {isLast && (
              <View style={styles.moreOverlay}>
                <Text style={styles.moreText}>+{hidden + 1}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
});

// ── Attachment section ────────────────────────────────────────────────────────
const AttachmentSection = memo(({
  attachments, onImagePress,
}: { attachments: Attachment[]; onImagePress: (i: number) => void }) => {
  if (!attachments?.length) return null;
  const media = attachments.filter(a => isMedia(a.category));
  const audio = attachments.filter(a => isAudio(a.category));
  const docs  = attachments.filter(a => !isMedia(a.category) && !isAudio(a.category));
  return (
    <View style={styles.attachSection}>
      {media.length > 0 && <ImageGrid images={media} onPress={onImagePress} />}
      {audio.length > 0 && (
        <View style={styles.attachList}>
          {audio.map((a, i) => <AudioAttachment key={a.uploadId ?? i} attachment={a} />)}
        </View>
      )}
      {docs.length > 0 && (
        <View style={styles.attachList}>
          {docs.map((d, i) => <DocAttachment key={d.uploadId ?? i} attachment={d} />)}
        </View>
      )}
    </View>
  );
});

// ── MessageBubble ─────────────────────────────────────────────────────────────
export default function MessageBubble({
  item, isGrouped, onRetry,
}: { item: Message; isGrouped: boolean; onRetry?: (clientId: string) => void }) {
  const currentUserId = useAppSelector(s => s.auth?.user?.id?.toString());
  const isOwn = item.senderId === currentUserId;

  const [expanded, setExpanded]   = useState(false);
  const [fsVisible, setFsVisible] = useState(false);
  const [fsIndex, setFsIndex]     = useState(0);

  const handleRetry    = useCallback(() => onRetry?.(item.clientId), [item.clientId, onRetry]);
  const handleImgPress = useCallback((i: number) => { setFsIndex(i); setFsVisible(true); }, []);

  const displayName    = item.senderName ?? item.senderId ?? "Unknown";
  const rawContent     = item.content ?? "";
  const isTooLong      = rawContent.length > MAX_CONTENT_LENGTH;
  const needsTrunc     = rawContent.length > TRUNCATE_AT && !expanded;
  const displayContent = needsTrunc ? rawContent.slice(0, TRUNCATE_AT).trimEnd() + "…" : rawContent;

  const attachments      = item.attachments ?? [];
  const hasAttachments   = attachments.length > 0;
  const hasContent       = rawContent.trim().length > 0;
  const mediaAttachments = attachments.filter(a => isMedia(a.category));

  return (
    <>
      <View style={[styles.row, isGrouped ? styles.rowGrouped : styles.rowFirst]}>
        <View style={styles.avatarCol}>
          {!isGrouped
            ? <Avatar uri={item.senderAvatar} name={displayName} />
            : <Text style={styles.groupedTime}>{item.formattedTime}</Text>
          }
        </View>

        <View style={styles.contentCol}>
          {!isGrouped && (
            <View style={styles.header}>
              <Text style={[styles.senderName, isOwn && styles.senderNameOwn]} numberOfLines={1}>
                {isOwn ? "You" : displayName}
              </Text>
              <Text style={styles.timestamp}>{item.formattedDate}</Text>
              <Text style={styles.timestamp}>{item.formattedTime}</Text>
            </View>
          )}

          {/* Attachments above text */}
          {hasAttachments && (
            <AttachmentSection attachments={attachments} onImagePress={handleImgPress} />
          )}

          {/* Text below attachments */}
          {hasContent && (
            <View style={[styles.contentRow, hasAttachments && { marginTop: 4 }]}>
              <Text
                selectable
                style={[
                  styles.contentText,
                  item.failed && styles.contentFailed,
                  item.pending && styles.contentPending,
                ]}
              >
                {isTooLong
                  ? rawContent.slice(0, MAX_CONTENT_LENGTH) + "\n\n[Message truncated]"
                  : displayContent}
              </Text>
              {isOwn && !hasAttachments && (
                <View style={styles.statusInline}><MessageStatus item={item} /></View>
              )}
            </View>
          )}

          {rawContent.length > TRUNCATE_AT && !isTooLong && (
            <Pressable onPress={() => setExpanded(v => !v)} style={styles.expandBtn} hitSlop={6}>
              <Text style={styles.expandText}>{expanded ? "Show less" : "Show more"}</Text>
            </Pressable>
          )}

          {isOwn && hasAttachments && (
            <View style={styles.statusBelow}><MessageStatus item={item} /></View>
          )}

          {item.failed && (
            <View style={styles.failedRow}>
              <Ionicons name="alert-circle-outline" size={13} color={COLORS.error} />
              <Text style={styles.failedText}>Failed to send.</Text>
              <TouchableOpacity onPress={handleRetry} hitSlop={6}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {fsVisible && mediaAttachments.length > 0 && (
        <FullscreenViewer
          attachments={mediaAttachments}
          initialIndex={Math.min(fsIndex, mediaAttachments.length - 1)}
          onClose={() => setFsVisible(false)}
        />
      )}
    </>
  );
}

// ── Date separator ────────────────────────────────────────────────────────────
export const DateSeparator = memo(({ date }: { date: string }) => (
  <View style={styles.dateSep}>
    <View style={styles.dateLine} />
    <Text style={styles.dateText}>{formatFullDate(date)}</Text>
    <View style={styles.dateLine} />
  </View>
));

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  row:          { flexDirection: "row", paddingHorizontal: 12 },
  rowFirst:     { paddingTop: 14, paddingBottom: 2 },
  rowGrouped:   { paddingTop: 2, paddingBottom: 2 },
  avatarCol:    { width: 44, marginRight: 12, alignItems: "center" },
  avatar:       { width: 40, height: 40, borderRadius: 20 },
  avatarFallback:  { alignItems: "center", justifyContent: "center" },
  avatarInitial:   { color: "#fff", fontSize: 15, fontWeight: "700" },
  groupedTime:  { fontSize: 10, color: COLORS.textDimmer, marginTop: 6, width: 40, textAlign: "center" },
  contentCol:   { flex: 1, minWidth: 0 },
  header:       { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 3 },
  senderName:      { fontSize: 15, fontWeight: "600", color: "#fff", flexShrink: 1 },
  senderNameOwn:   { color: COLORS.own },
  timestamp:    { fontSize: 11, color: COLORS.textDimmer, flexShrink: 0 },
  contentRow:   { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", gap: 5 },
  contentText:  { fontSize: 15, lineHeight: 22, color: COLORS.text, flexShrink: 1, flexGrow: 1 },
  contentFailed:   { color: COLORS.error },
  contentPending:  { color: COLORS.pending },
  statusInline: { marginBottom: 2, flexShrink: 0 },
  statusBelow:  { flexDirection: "row", justifyContent: "flex-end", marginTop: 4 },
  expandBtn:    { marginTop: 4, alignSelf: "flex-start" },
  expandText:   { fontSize: 12, color: COLORS.own, fontWeight: "600" },
  failedRow:    { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 },
  failedText:   { fontSize: 12, color: COLORS.error },
  retryText:    { fontSize: 12, color: COLORS.own, fontWeight: "600" },
  attachSection: { gap: 4 },
  attachList:    { gap: 4, marginTop: 2 },
  singleWrap:   { borderRadius: 10, overflow: "hidden", maxWidth: SCREEN_W * 0.65, alignSelf: "flex-start" },
  singleImg:    { width: SCREEN_W * 0.65, height: SINGLE_IMG_MAX_H, backgroundColor: COLORS.thumbBg },
  grid:         { flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP, borderRadius: 10, overflow: "hidden", alignSelf: "flex-start" },
  gridCell:     { width: THUMB_SIZE, height: THUMB_SIZE, overflow: "hidden", backgroundColor: COLORS.thumbBg },
  gridCellWide: { width: THUMB_SIZE * 2 + GRID_GAP },
  gridImg:      { width: "100%", height: "100%" },
  playOverlay:     { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.25)" },
  playCircle:      { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" },
  playCircleHidden:{ width: 0, height: 0 },
  playCircleSmall: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" },
  moreOverlay:  { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.62)", alignItems: "center", justifyContent: "center" },
  moreText:     { color: "#fff", fontSize: 22, fontWeight: "700" },
  audioRow:     { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  audioIconWrap:{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${COLORS.accent}22`, alignItems: "center", justifyContent: "center" },
  audioMeta:    { flex: 1, minWidth: 0 },
  audioName:    { fontSize: 13, fontWeight: "500", color: COLORS.text },
  audioSize:    { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  audioPlayBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  docRow:       { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  docIconWrap:  { width: 36, height: 36, borderRadius: 6, backgroundColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  docMeta:      { flex: 1, minWidth: 0 },
  docName:      { fontSize: 13, fontWeight: "500", color: COLORS.text },
  docSize:      { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  dateSep:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginVertical: 16, gap: 10 },
  dateLine:     { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "#3F4147" },
  dateText:     { fontSize: 12, fontWeight: "600", color: COLORS.textMuted, letterSpacing: 0.3 },
});