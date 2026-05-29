import { View, Text, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'

export default function CommunityLogo({
  imageUrl,
  onPress,
  isSelected
}: {
  imageUrl: any;
  onPress?: () => void;
  isSelected?: boolean;
}) {
  return (
    <View className="flex-row items-center mb-4 relative">

      <View
        className={`absolute left-0 w-1 bg-white rounded-r-md transition-all duration-200 ${isSelected ? 'h-10' : 'h-0'}`}
      />

      <Pressable
        onPress={onPress}
        className={`ml-3 rounded-2xl overflow-hidden ${isSelected ? 'rounded-xl' : 'rounded-3xl'}`}
        style={{ height: 55, width: 55 }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={[StyleSheet.absoluteFillObject, isSelected ? styles.imageStyleSelected : styles.imageStyle]}
          contentFit="cover"
        />
      </Pressable>
    </View>
  )
}
const styles = StyleSheet.create({
  imageStyle: {
    borderRadius: 24,
  },
  imageStyleSelected: {
    borderRadius: 16,
  }
})