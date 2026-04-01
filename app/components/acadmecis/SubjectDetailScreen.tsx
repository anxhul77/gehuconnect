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

const CATEGORIES = [
  {
    id: "pyq",
    label: "Previous Year Papers",
    sublabel: "Exam prep",
    icon: "file-document-multiple-outline" as const,
    accent: "#ff4d6d",
    count: "24",
  },
  {
    id: "notes",
    label: "Notes",
    sublabel: "Study material",
    icon: "notebook-edit-outline" as const,
    accent: "#2dd4bf",
    count: "38",
  },
  {
    id: "syllabus",
    label: "Syllabus",
    sublabel: "Official curriculum",
    icon: "format-list-checkbox" as const,
    accent: "#818cf8",
    count: "1",
  },
  {
    id: "assignments",
    label: "Assignments",
    sublabel: "Tasks & deadlines",
    icon: "clipboard-edit-outline" as const,
    accent: "#fb923c",
    count: "12",
  },
  {
    id: "lab",
    label: "Lab Manual",
    sublabel: "Practicals",
    icon: "flask-round-bottom-outline" as const,
    accent: "#a78bfa",
    count: "8",
  },
];

function CategoryRow({
  cat,
  index,
  onPress,
}: {
  cat: (typeof CATEGORIES)[0];
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
        {/* Icon box */}
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

        {/* Text */}
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

        {/* Count + arrow */}
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

export default function SubjectDetail() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const router = useRouter();

  const subjectName = "C Programming"; // replace with API

  const initials = subjectName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: "#0d0d0d" }}>
      <StatusBar barStyle="light-content" />

      <View
        style={{
          paddingTop: 54,
          paddingHorizontal: 20,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#1c1c1e",
            borderWidth: 1,
            borderColor: "#2a2a2a",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
    
        <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
         
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 20, marginBottom: 28 }}
          >
      
         
                  <Ionicons  name="folder-open-sharp" size={60} color="yellow" />
                   
         

          
            <View style={{ flex: 1, gap: 6 }}>
              <Text
                style={{
                  color: "#B3B3B3",
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Subject
              </Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: "900",
                  letterSpacing: -0.6,
                  lineHeight: 26,
                }}
                numberOfLines={2}
              >
                {subjectName}
              </Text>
              <Text style={{ color: "#B3B3B3", fontSize: 12 }}>
                {CATEGORIES.length} resource types
              </Text>
            </View>
          </View>

        
          <Text
            style={{
              color: "#B3B3B3",
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 2.5,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Resources
          </Text>

   
          {CATEGORIES.map((cat, index) => (
            <CategoryRow
              key={cat.id}
              cat={cat}
              index={index}
              onPress={() =>
                router.push(`/components/acadmecis/${subjectId}/${cat.id}`)
              }
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}