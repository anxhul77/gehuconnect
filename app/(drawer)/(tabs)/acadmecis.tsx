import CategoryIcon, { RESOURCE_CATEGORIES } from "@/app/components/acadmecis/CategoryBanner";
import { TRENDING_RESOURCES } from "@/app/components/acadmecis/data";
import SubjectCard from "@/app/components/acadmecis/SubjectCard";
import SubjectLoader from "@/app/components/acadmecis/SubjectLoader";
import TrendingResourceCard from "@/app/components/acadmecis/TrendingResources";
import AcademicUploadForm from "@/app/components/acadmecis/AcademicUploadForm";
import { useGetSubjectQuery } from "@/src/features/acadmecis.api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
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
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedSubjectForUpload, setSelectedSubjectForUpload] = useState<{ id: number; name: string } | null>(null);
  const router = useRouter();

  const { data: subjects, isLoading: subjectLoading, error: subjectError } = useGetSubjectQuery("1");

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

       {  !subjectLoading ? <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
          style={{ marginBottom: 20 }}
        >
          <View style={{ flexDirection: "column", gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 1 }}>
              {topRow.map((subject) => (
                <View key={subject.subjectId} style={{ width: 128 }}>
                  <SubjectCard
                    subject={subject}
                    onPress={handleSubjectCardPress}
                  />
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 1 }}>
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
        </ScrollView>:<>
          <View className="flex-1  flex-wrap h-72 gap-2 items-center justify-center pl-4 ">
           {[...Array(6)].map((_, i)=>(<SubjectLoader key={i}></SubjectLoader>))}
          </View>
        
        </>
        
    }

       
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

      {/* FAB Upload Button */}
      <Pressable
        onPress={() => {
          const firstSubject = subjects?.[0];
          if (firstSubject) {
            setSelectedSubjectForUpload({ id: Number(firstSubject.subjectId), name: firstSubject.subjectName });
          } else {
            setSelectedSubjectForUpload({ id: 1, name: "General" });
          }
          setShowUploadForm(true);
        }}
        className="absolute bottom-20 right-5 bg-orange-500 w-14 h-14 rounded-full items-center justify-center"
        style={{
          elevation: 8,
          shadowColor: "#FF6B35",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Upload Form Modal */}
      <AcademicUploadForm
        visible={showUploadForm}
        onClose={() => setShowUploadForm(false)}
        subjectId={selectedSubjectForUpload?.id ?? 1}
        subjectName={selectedSubjectForUpload?.name}
      />
    </View>
  );
}