import { View, Text, StatusBar, Pressable } from 'react-native'
import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import SubsectionRow from './SubsectionRow';
import { useGetSubsectionsQuery } from '@/src/features/acadmecis.api';


export const SubsectionCategories = [
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
]

export default function SubjectPage() {
  const { subjectId, name, repoId } = useLocalSearchParams();
  const router = useRouter();


  const { data: subsectionRowData } = useGetSubsectionsQuery(subjectId! as string)



  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
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
          <Ionicons name="arrow-back" size={24} color="#FFF" />
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


            <Ionicons name="folder-open-sharp" size={60} color="#F4B800" />




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
                {name}
              </Text>
              <Text style={{ color: "#B3B3B3", fontSize: 12 }}>
                {subsectionRowData?.length} resource types
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


          {subsectionRowData?.map((cat, index) => (
            <SubsectionRow
              key={cat.id}
              cat={cat}
              index={index}
              onPress={() =>
                router.push(`/components/acadmecis/subsection/${cat.id}?name=${cat.label}&repoId=${repoId}`)
              }
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}


