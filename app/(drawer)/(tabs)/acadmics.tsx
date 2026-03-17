import CategoryIcon, { RESOURCE_CATEGORIES } from "@/app/components/acadmics/CategoryBanner";
import { SUBJECTS_DATA, TRENDING_RESOURCES } from "@/app/components/acadmics/data";
import SubjectCard from "@/app/components/acadmics/SubjectCard";
import TrendingResourceCard from "@/app/components/acadmics/TrendingResources";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Keyboard, LayoutAnimation, Platform, Pressable, ScrollView, Text, TextInput, UIManager, View } from "react-native";

import { SafeAreaProvider } from "react-native-safe-area-context";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Academics() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Split subjects into two rows for the 2-row horizontal scroll layout
  const firstRowSubjects = SUBJECTS_DATA.filter((_, i) => i % 2 === 0);
  const secondRowSubjects = SUBJECTS_DATA.filter((_, i) => i % 2 === 1);
   
  // Filter subjects based on search
  const filteredFirstRow = useMemo(
    () =>
      firstRowSubjects.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery],
  );

  const filteredSecondRow = useMemo(
    () =>
      secondRowSubjects.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery],
  );

  // Filter trending resources based on search
  const filteredTrending = useMemo(
    () =>
      TRENDING_RESOURCES.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.subject.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery],
  );

 

  return (
    <SafeAreaProvider className="flex-1 ">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 100,
        }}
        keyboardShouldPersistTaps="handled"
      >
       
       

        
        <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4 px-4">
          Browse by Subject
        </Text>

      
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
          className="mb-6"
        >
          <View>
          
            <View className="flex-row mb-3">
              {(searchQuery ? filteredFirstRow : firstRowSubjects).map(
                (subject) => (
                  <SubjectCard key={subject.id} subject={subject} />
                ),
              )}
            </View>
          
            <View className="flex-row">
              {(searchQuery ? filteredSecondRow : secondRowSubjects).map(
                (subject) => (
                  <SubjectCard key={subject.id} subject={subject} />
                ),
              )}
            </View>
          </View>
        </ScrollView>

        {/* Quick Access Categories - Section Title */}
        <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3 px-4">
          Quick Access
        </Text>

        {/* Horizontally Scrollable Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
          className="mb-6"
        >
          {RESOURCE_CATEGORIES.map((category) => (
            <CategoryIcon key={category.id} category={category} />
          ))}
        </ScrollView>

        {/* Trending Resources - Section Title */}
        <View className="flex-row items-center justify-between mb-4 px-4">
          <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
            Trending Resources
          </Text>
          <Ionicons name="star" size={14} color="#facc15" />
        </View>

        {/* Trending List */}
        <View className="px-4">
          {(searchQuery ? filteredTrending : TRENDING_RESOURCES).map(
            (resource) => (
              <TrendingResourceCard key={resource.id} resource={resource} />
            ),
          )}
        </View>

        {/* Empty State */}
        {searchQuery &&
          filteredTrending.length === 0 &&
          filteredFirstRow.length === 0 && (
            <View className="items-center justify-center py-16 px-4">
              <Ionicons name="search-outline" size={48} color="#3f3f46" />
              <Text className="text-zinc-500 text-sm mt-4 text-center">
                No results found for "{searchQuery}"
              </Text>
            </View>
          )}
      </ScrollView>
    </SafeAreaProvider>
  );
}