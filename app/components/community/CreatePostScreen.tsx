import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
 
  ScrollView,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

import { useAttachmentUpload } from "@/src/utils/UploadToR2";
import {
  getCategoryFromMime,
  LIMITS,
  LocalAttachment,
  validateAttachment,
} from "@/src/types/Attachment.types";
import { useGetCoursesQuery } from "@/src/features/acadmecis.api";
import { useLocalSearchParams } from "expo-router";
import { useAddCommunityPostMutation } from "@/src/features/community.api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormErrors {
  media?: string;
  title?: string;
  content?: string;
  tags?: string;
}

// Matches backend: { course: [{courseId, courseName}], cursor, hasNext }
interface Course {
  courseId: number;
  courseName: string;
}

interface CoursesResponse {
  course: Course[];
  cursor: string;
  hasNext: boolean;
}

const MAX_PHOTOS = 5;
const PAGE_LIMIT = "20";

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreatePostScreen({ navigation }: any) {
  // ── Media mode toggle ────────────────────────────────────────────────────
  const [mediaMode, setMediaMode] = useState<"photos" | "video">("photos");
  const params=useLocalSearchParams()
  // ── Text fields ──────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ── Course search + selection ────────────────────────────────────────────
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [cursor, setCursor] = useState("");

  // ── Form errors + publish state ──────────────────────────────────────────
  const [errors, setErrors] = useState<FormErrors>({});
  const [publishing, setPublishing] = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const scrollViewRef = useRef<ScrollView>(null);
  const tagSearchRef = useRef<TextInput>(null);
  const tagSectionY = useRef<number>(0);
 
  // ── Attachment upload hook (same as Channel.tsx) ──────────────────────────
  // channelId is not relevant for posts — pass a constant key so the hook
  // has a stable upload scope. Swap "community-post" for your post channel id
  // if your R2 upload path is channelId-scoped.
  
   const channelId = Array.isArray(params?.channelId) ? params.channelId[0] : params?.channelId || "";
    const communityId = Array.isArray(params?.communityId) ? params.communityId[0] : params?.communityId || "";
  const {
    attachments,
    addAttachments,
    removeAttachment,
    clearAttachments,
    isUploading,
  } = useAttachmentUpload(channelId);

  // Derived views of the flat attachments list
  const photoAttachments = attachments.filter((a) => a.category === "image");
  const videoAttachment = attachments.find((a) => a.category === "video") ?? null;

  // ── Debounced course search ──────────────────────────────────────────────
  const debouncedKeyword = useDebounce(tagSearch.trim(), 400);

  const {
    data: coursesData,
    isFetching: coursesFetching,
    isError: coursesError,
  } = useGetCoursesQuery(
    { keyword: debouncedKeyword, limit: PAGE_LIMIT, cursor },
    { refetchOnMountOrArgChange: true }
  );
const [addCommunityPost,{isLoading,error}]=useAddCommunityPostMutation();
 console.log("posterror",error)
  const courseList: Course[] = (coursesData as any)?.course ?? [];
  const nextCursor: string = (coursesData as any)?.cursor ?? "";
  const hasNext: boolean = (coursesData as any)?.hasNext ?? false;

  // ── Progress ─────────────────────────────────────────────────────────────
  const hasMedia =
    mediaMode === "photos" ? photoAttachments.length > 0 : videoAttachment !== null;

  const completedFields = [
    hasMedia,
    title.trim().length > 0,
    content.trim().length > 0,
    selectedCourses.length > 0,
  ].filter(Boolean).length;

  const progressPercent = (completedFields / 4) * 100;
  const isReady = completedFields === 4 && !isUploading;

  // ── Build a LocalAttachment from a picked asset ──────────────────────────
  const buildAttachment = useCallback(
    (
      uri: string,
      fileName: string,
      mimeType: string,
      fileSize: number,
      thumbUri?: string
    ): LocalAttachment | null => {
      const error = validateAttachment(mimeType, fileSize, attachments.length);
      if (error) { Alert.alert("Can't add file", error); return null; }
      const category = getCategoryFromMime(mimeType);
      if (!category) return null;
      return {
        localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        uri,
        fileName: fileName || "file",
        mimeType,
        fileSize,
        category,
        thumbUri,
        status: "pending",
        progress: 0,
      };
    },
    [attachments.length]
  );

  // ── Pick photos ──────────────────────────────────────────────────────────
  const pickPhotos = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Allow access to your photo library in Settings.");
      return;
    }
    const remaining = MAX_PHOTOS - photoAttachments.length;
    if (remaining <= 0) {
      Alert.alert("Limit reached", `Max ${MAX_PHOTOS} photos.`);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.85,
      orderedSelection: true,
    });
    if (result.canceled || !result.assets.length) return;

    const items: LocalAttachment[] = [];
    for (const asset of result.assets) {
      const mime = asset.mimeType ?? "image/jpeg";
      const item = buildAttachment(
        asset.uri,
        asset.fileName ?? `photo_${Date.now()}.jpg`,
        mime,
        asset.fileSize ?? 0,
        asset.uri // thumb = same uri for images
      );
      if (item) items.push(item);
    }
    if (items.length) {
      addAttachments(items);
      setErrors((e) => ({ ...e, media: undefined }));
    }
  }, [photoAttachments.length, buildAttachment, addAttachments]);

  // ── Pick video ───────────────────────────────────────────────────────────
  const pickVideo = useCallback(async () => {
    // Remove existing video first (one video at a time)
    if (videoAttachment) removeAttachment(videoAttachment.localId);

    const result = await DocumentPicker.getDocumentAsync({
      type: "video/*",
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset) return;

    const item = buildAttachment(
      asset.uri,
      asset.name ?? "video.mp4",
      asset.mimeType ?? "video/mp4",
      asset.size ?? 0
    );
    if (item) {
      addAttachments([item]);
      setErrors((e) => ({ ...e, media: undefined }));
    }
  }, [videoAttachment, removeAttachment, buildAttachment, addAttachments]);

  // ── Course selection ─────────────────────────────────────────────────────
  const toggleCourse = (course: Course) => {
    setSelectedCourses((prev) => {
      const exists = prev.find((c) => c.courseId === course.courseId);
      return exists
        ? prev.filter((c) => c.courseId !== course.courseId)
        : [...prev, course];
    });
    setErrors((e) => ({ ...e, tags: undefined }));
  };

  const isCourseSelected = (courseId: number) =>
    selectedCourses.some((c) => c.courseId === courseId);

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!hasMedia) newErrors.media = "Please add at least one photo or video.";
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!content.trim()) newErrors.content = "Content is required.";
    if (selectedCourses.length === 0) newErrors.tags = "Select at least one course.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const tags:string[] =["hellow"]
  // ── Publish ──────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!validate()) return;

    const uploadedAttachments = attachments.filter((a) => a.status === "uploaded");
    if (attachments.length > 0 && uploadedAttachments.length === 0) {
      Alert.alert("Still uploading", "Please wait for files to finish uploading.");
      return;
    }

    setPublishing(true);
   
    const payload = {
      title: title.trim(),
      channelId: channelId,
      communityId: communityId,
      content: content.trim(),
      tags: tags,
      uploadIds: uploadedAttachments.map((a) => a.uploadId!),
      courseId: selectedCourses.map((c) => c.courseId.toString()),
    };
    console.log("Post payload:", payload);
    // TODO: swap with your actual post mutation
    try{
     const {data}=await addCommunityPost(payload);
     
    setPublishing(false);
    clearAttachments();
    Alert.alert("Published!", "Your post has been shared with the community.", [
      { text: "OK", onPress: () => navigation?.goBack() },
    ]);}catch(e){
        console.log(e)
    }
  };

  // ── Scroll tag section into view on keyboard open ────────────────────────
  const scrollToTagSearch = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: tagSectionY.current - 16, animated: true });
    }, 120);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black"
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
    >
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-3 border-b border-white/10">
        <View className="flex-row items-center gap-3">
          <Pressable
            className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
            onPress={() => navigation?.goBack()}
          >
            <Ionicons name="close" size={18} color="#f0f0f0" />
          </Pressable>
          <View>
            <Text
              className="text-white font-bold text-base tracking-tight"
              style={{ fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium" }}
            >
              New Post
            </Text>
            <Text className="text-white/35 text-xs mt-0.5">
              {completedFields}/4 fields complete
            </Text>
          </View>
        </View>

        <Pressable
          disabled={!isReady || publishing}
          onPress={handlePublish}
          className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${
            isReady ? "bg-[#1ed760] border-[#1ed760]" : "bg-white/5 border-white/15"
          }`}
        >
          {publishing || isUploading ? (
            <ActivityIndicator size="small" color={isReady ? "#000" : "rgba(255,255,255,0.3)"} />
          ) : (
            <>
              <Ionicons
                name="checkmark"
                size={14}
                color={isReady ? "#000" : "rgba(255,255,255,0.3)"}
              />
              <Text className={`text-sm font-medium ${isReady ? "text-black" : "text-white/30"}`}>
                {isUploading ? "Uploading…" : "Publish"}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* ── Progress bar ── */}
      <View className="h-0.5 bg-white/8">
        <View
          className="h-full bg-[#1ed760] rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 300 }}
      >
        {/* ══ MEDIA ══ */}
        <View className="px-5 mt-5">
          <Text className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3">
            Media
          </Text>

          {/* Mode toggle */}
          <View className="flex-row gap-2 mb-4">
            {(["photos", "video"] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => {
                  setMediaMode(mode);
                  setErrors((e) => ({ ...e, media: undefined }));
                }}
                className={`px-4 py-1.5 rounded-full border ${
                  mediaMode === mode
                    ? "bg-[#1ed760] border-[#1ed760]"
                    : "bg-transparent border-white/15"
                }`}
              >
                <Text
                  className={`text-xs font-medium capitalize ${
                    mediaMode === mode ? "text-black" : "text-white/55"
                  }`}
                >
                  {mode}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ── Photos grid ── */}
          {mediaMode === "photos" && (
            <>
              <View className="flex-row flex-wrap gap-2">
                {photoAttachments.map((att, i) => (
                  <View key={att.localId} className="w-24 h-24 rounded-xl overflow-hidden bg-white/5">
                    <Image
                      source={{ uri: att.thumbUri ?? att.uri }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />

                    {/* Cover badge on first photo */}
                    {i === 0 && (
                      <View className="absolute bottom-1 left-1 bg-[#1ed760] px-1.5 py-0.5 rounded">
                        <Text className="text-black text-[9px] font-bold tracking-wide">COVER</Text>
                      </View>
                    )}

                    {/* Upload progress overlay */}
                    {att.status === "uploading" && (
                      <View className="absolute inset-0 bg-black/50 items-center justify-center">
                        <Text className="text-white text-xs font-bold">
                          {Math.round(att.progress ?? 0)}%
                        </Text>
                      </View>
                    )}

                    {/* Failed indicator */}
                    {att.status === "failed" && (
                      <View className="absolute inset-0 bg-red-900/60 items-center justify-center">
                        <Ionicons name="alert-circle" size={20} color="#fff" />
                      </View>
                    )}

                    <Pressable
                      onPress={() => removeAttachment(att.localId)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full items-center justify-center"
                    >
                      <Ionicons name="close" size={11} color="#fff" />
                    </Pressable>
                  </View>
                ))}

                {/* Add more button */}
                {photoAttachments.length < MAX_PHOTOS && (
                  <Pressable
                    onPress={pickPhotos}
                    className="w-24 h-24 rounded-xl border border-dashed border-white/20 bg-white/[0.03] items-center justify-center gap-1"
                  >
                    <View className="w-7 h-7 rounded-full bg-white/10 items-center justify-center">
                      <Ionicons name="add" size={18} color="rgba(255,255,255,0.55)" />
                    </View>
                    <Text className="text-white/35 text-[11px]">Add photo</Text>
                  </Pressable>
                )}
              </View>
              <Text className="text-white/30 text-xs mt-2">
                First photo is the cover · {photoAttachments.length}/{MAX_PHOTOS} photos
              </Text>
            </>
          )}

          {/* ── Video picker ── */}
          {mediaMode === "video" && (
            <>
              {!videoAttachment ? (
                <Pressable
                  onPress={pickVideo}
                  className="w-full h-28 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] items-center justify-center gap-2"
                >
                  <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                    <Ionicons name="play" size={20} color="rgba(255,255,255,0.55)" />
                  </View>
                  <Text className="text-white/35 text-xs">Tap to upload video</Text>
                </Pressable>
              ) : (
                <View className="w-full h-44 rounded-2xl overflow-hidden bg-white/5">
                  <Video
                    source={{ uri: videoAttachment.uri }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={false}
                    useNativeControls
                  />

                  {/* Upload progress overlay */}
                  {videoAttachment.status === "uploading" && (
                    <View className="absolute inset-0 bg-black/60 items-center justify-center gap-1">
                      <ActivityIndicator size="small" color="#1ed760" />
                      <Text className="text-white text-xs font-bold">
                        {Math.round(videoAttachment.progress ?? 0)}%
                      </Text>
                    </View>
                  )}

                  {/* Failed overlay */}
                  {videoAttachment.status === "failed" && (
                    <View className="absolute inset-0 bg-red-900/60 items-center justify-center gap-1">
                      <Ionicons name="alert-circle" size={24} color="#fff" />
                      <Text className="text-white text-xs">Upload failed</Text>
                    </View>
                  )}

                  {/* File size badge */}
                  {videoAttachment.fileSize > 0 && (
                    <View className="absolute bottom-2 left-2 bg-[#1ed760] px-2 py-0.5 rounded">
                      <Text className="text-black text-[10px] font-bold">
                        {(videoAttachment.fileSize / 1048576).toFixed(1)} MB
                      </Text>
                    </View>
                  )}

                  <Pressable
                    onPress={() => removeAttachment(videoAttachment.localId)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full items-center justify-center"
                  >
                    <Ionicons name="close" size={13} color="#fff" />
                  </Pressable>
                </View>
              )}

              <Text className="text-white/30 text-xs mt-2">
                Max {LIMITS.maxVideoMb ?? 50} MB · MP4, MOV, AVI
              </Text>
            </>
          )}

          {errors.media && (
            <Text className="text-red-500 text-xs mt-1">{errors.media}</Text>
          )}
        </View>

        <View className="h-px bg-white/6 mx-5 my-5" />

        {/* ══ POST DETAILS ══ */}
        <View className="px-5">
          <Text className="text-white/40 text-xs font-bold tracking-widest uppercase mb-4">
            Post Details
          </Text>

          {/* Title */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-white/55 text-sm font-medium">Title</Text>
              <Text className="text-white/25 text-xs">{title.length}/80</Text>
            </View>
            <TextInput
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (t.trim()) setErrors((e) => ({ ...e, title: undefined }));
              }}
              placeholder="What's this post about?"
              placeholderTextColor="rgba(255,255,255,0.22)"
              maxLength={80}
              className={`bg-white/[0.05] rounded-xl px-4 py-3 text-[15px] border ${
                errors.title ? "border-red-500" : "border-white/12"
              }`}
              style={{ color: "#f0f0f0" }}
            />
            {errors.title && (
              <Text className="text-red-500 text-xs mt-1">{errors.title}</Text>
            )}
          </View>

          {/* Content */}
          <View className="mb-2">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-white/55 text-sm font-medium">Content</Text>
              <Text className="text-white/25 text-xs">{content.length}/500</Text>
            </View>
            <TextInput
              value={content}
              onChangeText={(t) => {
                setContent(t);
                if (t.trim()) setErrors((e) => ({ ...e, content: undefined }));
              }}
              placeholder="Share more details — context, questions, or resources..."
              placeholderTextColor="rgba(255,255,255,0.22)"
              maxLength={500}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              className={`bg-white/[0.05] rounded-xl px-4 py-3 text-[15px] border ${
                errors.content ? "border-red-500" : "border-white/12"
              }`}
              style={{ minHeight: 120, color: "#f0f0f0" }}
            />
            {errors.content && (
              <Text className="text-red-500 text-xs mt-1">{errors.content}</Text>
            )}
          </View>
        </View>

        <View className="h-px bg-white/6 mx-5 my-5" />

        {/* ══ COURSE TAG ══ */}
        <View
          onLayout={(e) => { tagSectionY.current = e.nativeEvent.layout.y; }}
          className="px-5"
        >
          <Text className="text-white/40 text-xs font-bold tracking-widest uppercase mb-1">
            Course Tag
          </Text>
          <Text className="text-white/30 text-xs mb-3">
            Select the course this post belongs to
          </Text>

          {/* Search input */}
          <View
            className={`flex-row items-center bg-white/[0.05] rounded-xl border px-3 mb-3 ${
              errors.tags ? "border-red-500" : "border-white/12"
            }`}
          >
            {coursesFetching ? (
              <ActivityIndicator size="small" color="rgba(255,255,255,0.4)" style={{ width: 15, height: 15 }} />
            ) : (
              <Ionicons name="search" size={15} color="rgba(255,255,255,0.35)" />
            )}
            <TextInput
              ref={tagSearchRef}
              value={tagSearch}
              onChangeText={(t) => { setTagSearch(t); setCursor(""); }}
              onFocus={scrollToTagSearch}
              placeholder="Search course (e.g. CSE, MATH...)"
              placeholderTextColor="rgba(255,255,255,0.22)"
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              className="flex-1 py-3 pl-2.5 text-sm"
              style={{ color: "#f0f0f0" }}
            />
            {tagSearch.length > 0 && (
              <Pressable onPress={() => { setTagSearch(""); setCursor(""); }}>
                <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.3)" />
              </Pressable>
            )}
          </View>

          {/* Selected chips */}
          {selectedCourses.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
              contentContainerStyle={{ gap: 6, paddingRight: 4 }}
            >
              {selectedCourses.map((course) => (
                <Pressable
                  key={course.courseId}
                  onPress={() => toggleCourse(course)}
                  className="flex-row items-center gap-1.5 bg-[#1ed760]/15 border border-[#1ed760] px-3 py-1.5 rounded-full"
                >
                  <Text className="text-[#1ed760] text-xs font-semibold">{course.courseName}</Text>
                  <Ionicons name="close" size={11} color="#1ed760" />
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Course results */}
          {coursesError ? (
            <View className="items-center py-8 gap-2">
              <Ionicons name="wifi-outline" size={28} color="rgba(255,255,255,0.15)" />
              <Text className="text-white/25 text-sm text-center">Failed to load courses</Text>
              <Pressable
                onPress={() => setCursor("")}
                className="mt-1 px-4 py-1.5 rounded-full border border-white/15"
              >
                <Text className="text-white/40 text-xs">Retry</Text>
              </Pressable>
            </View>
          ) : coursesFetching && courseList.length === 0 ? (
            <View className="gap-2">
              {[0.9, 0.75, 0.6, 0.45, 0.3].map((op, i) => (
                <View key={i} className="h-12 rounded-xl bg-white/[0.04] border border-white/8" style={{ opacity: op }} />
              ))}
            </View>
          ) : courseList.length === 0 ? (
            <View className="items-center py-8 gap-2">
              <Ionicons name="search-outline" size={28} color="rgba(255,255,255,0.15)" />
              <Text className="text-white/25 text-sm text-center">
                {debouncedKeyword ? `No courses match "${debouncedKeyword}"` : "No courses available"}
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {courseList.map((course) => {
                const active = isCourseSelected(course.courseId);
                return (
                  <Pressable
                    key={course.courseId}
                    onPress={() => toggleCourse(course)}
                    activeOpacity={0.7}
                    className={`flex-row items-center justify-between px-4 py-3 rounded-xl border ${
                      active ? "bg-[#1ed760]/10 border-[#1ed760]" : "bg-white/[0.03] border-white/10"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium flex-1 ${active ? "text-white" : "text-white/70"}`}
                      numberOfLines={1}
                    >
                      {course.courseName}
                    </Text>
                    <View
                      className={`w-5 h-5 rounded-full items-center justify-center border ml-3 flex-shrink-0 ${
                        active ? "bg-[#1ed760] border-[#1ed760]" : "border-white/20 bg-transparent"
                      }`}
                    >
                      {active && <Ionicons name="checkmark" size={11} color="#000" />}
                    </View>
                  </Pressable>
                );
              })}

              {hasNext && (
                <Pressable
                  onPress={() => setCursor(nextCursor)}
                  disabled={coursesFetching}
                  className="flex-row items-center justify-center py-3 gap-1.5 mt-1"
                >
                  {coursesFetching ? (
                    <ActivityIndicator size="small" color="rgba(255,255,255,0.3)" />
                  ) : (
                    <>
                      <Text className="text-white/30 text-xs">Load more</Text>
                      <Ionicons name="chevron-down" size={12} color="rgba(255,255,255,0.3)" />
                    </>
                  )}
                </Pressable>
              )}
            </View>
          )}

          {errors.tags && (
            <Text className="text-red-500 text-xs mt-2">{errors.tags}</Text>
          )}
        </View>

        <View className="h-px bg-white/6 mx-5 my-5" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}