import CategoryIcon, { RESOURCE_CATEGORIES } from "@/app/components/acadmecis/CategoryBanner";
import { TRENDING_RESOURCES } from "@/app/components/acadmecis/data";
import SubjectCard from "@/app/components/acadmecis/SubjectCard";
import TrendingResourceCard from "@/app/components/acadmecis/TrendingResources";
import { useGetSubjectQuery } from "@/src/features/acadmecis.api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Academics() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const { data: subjects } = useGetSubjectQuery("1");

  function handleSubjectCardPress() {
    router.push(`/components/acadmecis/[subjectId]`);
  }

  const topRow = useMemo(
    () => subjects?.filter((_, i) => i % 2 === 0) ?? [],
    [subjects]
  );

  const bottomRow = useMemo(
    () => subjects?.filter((_, i) => i % 2 === 1) ?? [],
    [subjects]
  );

  const filteredTrending = useMemo(
    () =>
      TRENDING_RESOURCES.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.subject.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
       
        <Text className="text-white text-lg font-bold mb-3 px-4">
          Browse by Subject
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
          style={{ marginBottom: 20 }}
        >
          <View style={{ flexDirection: "column", gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {topRow.map((subject) => (
                <View key={subject.subjectId} style={{ width: 128 }}>
                  <SubjectCard
                    subject={subject}
                    onPress={handleSubjectCardPress}
                  />
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {bottomRow.map((subject) => (
                <View key={subject.subjectId} style={{ width: 128 }}>
                  <SubjectCard
                    subject={subject}
                    onPress={handleSubjectCardPress}
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

       
        <Text className="text-white text-lg font-bold mb-3 px-4">
          Quick Access
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
          style={{ marginBottom: 20 }}
        >
          {RESOURCE_CATEGORIES.map((category) => (
            <CategoryIcon key={category.id} category={category} />
          ))}
        </ScrollView>

     
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            paddingHorizontal: 16,
          }}
        >
          <Text className="text-white text-lg font-bold">
            Trending Resources
          </Text>
          <Ionicons name="star" size={14} color="#facc15" />
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {(searchQuery ? filteredTrending : TRENDING_RESOURCES).map(
            (resource) => (
              <TrendingResourceCard key={resource.id} resource={resource} />
            )
          )}
        </View>

        {searchQuery && filteredTrending.length === 0 && (
          <View
            style={{ alignItems: "center", justifyContent: "center", paddingVertical: 64, paddingHorizontal: 16 }}
          >
            <Ionicons name="search-outline" size={48} color="#3f3f46" />
            <Text className="text-zinc-500 text-sm mt-4 text-center">
              No results found for "{searchQuery}"
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}