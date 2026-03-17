import { View, Text, Pressable, LayoutAnimation, Keyboard } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { TextInput } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

export default function AcadmicsHeader() {
    const insets=useSafeAreaInsets();
    const router=useRouter()
      const [searchQuery, setSearchQuery] = useState("");
      const [isSearchOpen, setIsSearchOpen] = useState(false);
     const toggleSearch = () => {
        LayoutAnimation.configureNext({
          duration: 300,
          create: {
            type: LayoutAnimation.Types.spring,
            property: LayoutAnimation.Properties.opacity,
            springDamping: 0.7,
          },
          update: {
            type: LayoutAnimation.Types.spring,
            springDamping: 0.7,
          },
          delete: {
            type: LayoutAnimation.Types.spring,
            property: LayoutAnimation.Properties.opacity,
            springDamping: 0.7,
          },
        });
    
        if (isSearchOpen) {
          Keyboard.dismiss();
          setSearchQuery("");
        }
        setIsSearchOpen(!isSearchOpen);
      };
      const SearchBarheight=isSearchOpen?50:40
      const handleBackArrow=()=>{
       router.back()
      }
  return (
    <View
  className=" px-4 flex-row items-center  "
  style={{ paddingTop: insets.top + 8 ,height:90 }}
>

  {!isSearchOpen && <Pressable onPress={handleBackArrow}  className="mb-4 mr-4">
    <Ionicons name="arrow-back" color="gray" size={22} />
  </Pressable>}

  <View className="flex-1 flex-row items-center justify-between mb-4">
    {!isSearchOpen && (
      <View style={{ flex: 1 }}>
        <Text className="text-white text-2xl font-black">
          Academics
        </Text>
        <Text className="text-zinc-500 text-xs">
          Community-driven resources
        </Text>
      </View>
    )}

    <View
      style={{
        flex: isSearchOpen ? 1 : undefined,
        height:SearchBarheight,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        backgroundColor: "rgba(24,24,27,1)",
        flexDirection: "row",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {isSearchOpen && (
        <View style={{ flex: 1, paddingLeft: 16, paddingRight: 4 }}>
          <TextInput
            autoFocus
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search resources..."
            placeholderTextColor="#71717a"
            style={{ color: "white", fontSize: 14 }}
            returnKeyType="search"
          />
        </View>
      )}

      <Pressable
        onPress={toggleSearch}
        style={{
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name={isSearchOpen ? "close" : "search"}
          size={20}
          color={isSearchOpen ? "#FF4D4D" : "#999"}
        />
      </Pressable>
    </View>
  </View>
</View>

  )
}