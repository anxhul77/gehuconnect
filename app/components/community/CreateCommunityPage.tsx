import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { uploadToR2 } from '@/src/utils/UploadToR2';
import { useGetPresignedForProductsMutation } from '@/src/features/media.api';
import { useCreateCommunityMutation } from '@/src/features/community/community.api';
import Toast from 'react-native-toast-message';

export default function CreateCommunityPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const tagSectionY = React.useRef<number>(0);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [btnLoader, setBtnLoader] = useState<boolean>(false);

  const [getPresigned] = useGetPresignedForProductsMutation();
  const [createCommunity] = useCreateCommunityMutation();

  const completionScore = [
    avatarUrl !== null,
    bannerUrl !== null,
    name.trim().length > 3,
    description.trim().length >= 10,
    tags.length >= 4,
  ].filter(Boolean).length;

  const canPublish = completionScore === 5;
  const progressPct = Math.round((completionScore / 5) * 100);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const pickBanner = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      setBannerUrl(result.assets[0].uri);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 6) {
      setTags((prev) => [...prev, t]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  const handlePublish = async () => {
    if (!canPublish || btnLoader) return;
    setBtnLoader(true);
    try {
      // 1. Prepare image metadata
      const imagesToUpload = [avatarUrl, bannerUrl];
      const metadata = await Promise.all(
        imagesToUpload.map(async (uri) => {
          try {
            const res = await fetch(uri!);
            const blob = await res.blob();
            return { mimeType: blob.type || 'image/jpeg', fileSize: blob.size };
          } catch (e) {
            throw new Error(`Failed to process image: ${uri}`);
          }
        })
      );

      // 2. Get presigned URLs
      const presignedList = await getPresigned({ data: metadata }).unwrap();
      if (!presignedList || presignedList.length < 2) {
        throw new Error('Failed to get upload authorization');
      }

      // 3. Upload to R2
      await Promise.all(
        presignedList.map(async (item, i) => {
          try {
            await uploadToR2(item.presignedUrl, imagesToUpload[i]!, metadata[i].mimeType);
          } catch (e) {
            throw new Error(`Failed to upload ${i === 0 ? 'avatar' : 'banner'} to storage`);
          }
        })
      );

      const keys = presignedList.map((item) => item.key);
      const uploadedAvatarKey = keys[0];
      const uploadedBannerKey = keys[1];

      // 4. Hit backend API
      await createCommunity({
        name: name.trim(),
        description: description.trim(),
        profileAvatar: uploadedAvatarKey,
        profileBanner: uploadedBannerKey,
        tags: tags,
      }).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Community Created Successfully',
        position: 'top',
        visibilityTime: 4000,
      });

      router.back();
    } catch (err: any) {
      console.error('Publish Error:', err);
      Toast.show({
        type: 'error',
        text1: err.message || 'Something went wrong while publishing',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setBtnLoader(false);
    }
  };

  const scrollToTagSearch = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: tagSectionY.current - 16, animated: true });
    }, 120);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0A0A0A]"
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <View
        className="bg-[#0A0A0A] border-b border-[#2A2A2A] px-4 pb-[14px]"
        style={{ paddingTop: insets.top + 10 }}
      >
        <View className="flex-row items-center mb-[14px]">
          <Pressable
            className="w-9 h-9 rounded-full bg-[#1A1A1A] items-center justify-center mr-3"
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={18} color="#B3B3B3" />
          </Pressable>
          <View className="flex-1">
            <Text
              className="text-white font-bold text-[17px] tracking-tight"
              style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium' }}
            >
              Create Community
            </Text>
            <Text className="text-[#535353] text-[11px] font-semibold mt-px">
              {completionScore}/5 fields complete
            </Text>
          </View>

          <Pressable
            disabled={!canPublish || btnLoader}
            onPress={handlePublish}
            className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${canPublish ? 'bg-[#1DB954] border-[#1DB954]' : 'bg-[#242424] border-[#2A2A2A]'
              }`}
          >
            {btnLoader ? (
              <ActivityIndicator size="small" color={canPublish ? '#000' : '#535353'} />
            ) : (
              <>
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={canPublish ? '#000' : '#535353'}
                />
                <Text className={`text-[13px] font-extrabold ${canPublish ? 'text-black' : 'text-[#535353]'}`}>
                  Publish
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <View className="h-[3px] bg-[#242424] rounded-full overflow-hidden">
          <View
            className={`h-full rounded-full ${completionScore === 5 ? 'bg-[#1DB954]' : 'bg-[#3B82F6]'}`}
            style={{ width: `${progressPct}%` }}
          />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Media Block */}
        <View className="px-5 mt-5">
          <Text className="text-[#535353] text-[11px] font-bold tracking-widest uppercase mb-3">
            Community Images
          </Text>

          <View className="flex-row space-x-4 mb-4" style={{ gap: 16 }}>
            {/* Avatar */}
            <View>
              <Text className="text-[#B3B3B3] text-[12px] font-semibold mb-2">Avatar</Text>
              <Pressable
                onPress={pickAvatar}
                className="w-24 h-24 rounded-full border border-dashed border-[#2A2A2A] bg-[#1A1A1A] items-center justify-center overflow-hidden relative"
              >
                {avatarUrl ? (
                  <>
                    <Image source={{ uri: avatarUrl }} className="w-full h-full" resizeMode="cover" />
                    <View className="absolute inset-0 bg-black/40 items-center justify-center">
                      <Ionicons name="camera" size={24} color="#fff" />
                    </View>
                  </>
                ) : (
                  <>
                    <Ionicons name="image-outline" size={24} color="#535353" />
                    <Text className="text-[#535353] text-[10px] mt-1">Upload</Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* Banner */}
            <View className="flex-1">
              <Text className="text-[#B3B3B3] text-[12px] font-semibold mb-2">Banner</Text>
              <Pressable
                onPress={pickBanner}
                className="w-full h-24 rounded-2xl border border-dashed border-[#2A2A2A] bg-[#1A1A1A] items-center justify-center overflow-hidden relative"
              >
                {bannerUrl ? (
                  <>
                    <Image source={{ uri: bannerUrl }} className="w-full h-full" resizeMode="cover" />
                    <View className="absolute inset-0 bg-black/40 items-center justify-center">
                      <Ionicons name="camera" size={24} color="#fff" />
                    </View>
                  </>
                ) : (
                  <>
                    <Ionicons name="image-outline" size={24} color="#535353" />
                    <Text className="text-[#535353] text-[10px] mt-1">Upload</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>

        <View className="h-px bg-[#2A2A2A] mx-5 my-5" />

        {/* Details Block */}
        <View className="px-5">
          <Text className="text-[#535353] text-[11px] font-bold tracking-widest uppercase mb-4">
            Community Details
          </Text>

          {/* Name */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-[#B3B3B3] text-[13px] font-medium">Name</Text>
              <Text className="text-[#535353] text-[11px]">{name.length}/20</Text>
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="E.g., Chess Club"
              placeholderTextColor="#535353"
              maxLength={20}
              className="bg-[#1A1A1A] rounded-xl px-4 py-3 text-[15px] border border-[#2A2A2A] text-white"
            />
          </View>

          {/* Description */}
          <View className="mb-5">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-[#B3B3B3] text-[13px] font-medium">Description</Text>
              <Text className="text-[#535353] text-[11px]">{description.length}/400 (Min 10)</Text>
            </View>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What is this community about?"
              placeholderTextColor="#535353"
              maxLength={400}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-[#1A1A1A] rounded-xl px-4 py-3 text-[15px] border border-[#2A2A2A] text-white"
              style={{ minHeight: 100 }}
            />
          </View>
        </View>

        <View className="h-px bg-[#2A2A2A] mx-5 my-5" />

        {/* Tags Block */}
        <View
          className="px-5"
          onLayout={(e) => { tagSectionY.current = e.nativeEvent.layout.y; }}
        >
          <Text className="text-[#535353] text-[11px] font-bold tracking-widest uppercase mb-1">
            Tags
          </Text>
          <Text className="text-[#535353] text-[11px] font-medium mt-1.5 mb-3">
            Tags help people discover your community · Add 4 to 6 tags
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-2.5">
            {tags.map((t) => (
              <Pressable
                key={t}
                onPress={() => removeTag(t)}
                className="flex-row items-center bg-[#8B5CF622] rounded-full px-3 py-1.5 gap-1.5 border border-[#8B5CF655]"
              >
                <Text className="text-[#8B5CF6] font-bold text-[12px]">#{t}</Text>
                <Ionicons name="close-circle" size={13} color="#8B5CF6" />
              </Pressable>
            ))}
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                onFocus={scrollToTagSearch}
                placeholder="Add a tag..."
                placeholderTextColor="#535353"
                returnKeyType="done"
                className="text-white text-[14px] px-3.5 py-[12px]"
              />
            </View>
            <Pressable
              onPress={addTag}
              className="w-[46px] h-[46px] rounded-xl bg-[#242424] items-center justify-center border border-[#2A2A2A]"
            >
              <Ionicons name="add" size={20} color="#B3B3B3" />
            </Pressable>
          </View>
        </View>

        <View className="h-px bg-transparent mx-5 my-5" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}