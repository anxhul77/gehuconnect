import { SubsectionDto } from "@/src/types/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
;

export default function SubsectionRow({
  cat,
  index,
  onPress,
}: {
  cat: any;
  index: number;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() =>
        Animated.spring(scale, {
          toValue: 0.97,
          useNativeDriver: true,
          speed: 60,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 40,
        }).start()
      }
    >
      <Animated.View
        style={{
          transform: [{ scale }],
          flexDirection: "row",
          alignItems: "center",

          borderRadius: 16,
          padding: 16,
          marginBottom: 10,
          gap: 16,
          borderWidth: 1,
          borderColor: "#ffffff08",

        }}
      >
        0
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: cat.accent + "18",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: cat.accent + "30",
          }}
        >
          <MaterialCommunityIcons name={cat.icon} size={24} color={cat.accent} />
        </View>


        <View style={{ flex: 1, gap: 3 }}>
          <Text
            style={{
              color: "#f5f5f5",
              fontSize: 15,
              fontWeight: "700",
              letterSpacing: -0.3,
            }}
          >
            {cat.label}
          </Text>
          <Text style={{ color: "#6b6b6b", fontSize: 12 }}>{cat.sublabel}</Text>
        </View>


        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <View
            style={{
              backgroundColor: cat.accent + "18",
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 20,
            }}
          >
            <Text
              style={{ color: cat.accent, fontSize: 11, fontWeight: "700" }}
            >
              {cat.count}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color="#3a3a3a" />
        </View>
      </Animated.View>
    </Pressable>
  );
}
