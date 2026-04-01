import { Subject } from "@/src/types/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";


interface SubjectCardProps {
  subject: Subject;
  onPress?: () => void;
}

export default function SubjectCard({ subject, onPress }: SubjectCardProps) {
  console.log(subject)
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      className="w-32 bg-zinc-800/50 rounded-2xl p-2  mr-2 border "
    >
      
      <View
       
        className=" flex-1 gap-2 justify-center "
      >
     <Ionicons  name="folder-open-sharp" size={40} color="yellow" />
      

    
      <Text className="text-white font-bold text-sm mb-1" numberOfLines={1}>
        {subject?.subjectName}
      </Text>
  </View>
   
      <View className="flex-row items-center">
        <Ionicons name="folder-outline" size={10} color="#71717a" />
        <Text className="text-zinc-500 text-[10px] ml-1">
          {"10"} files
        </Text>
      </View>
    </Pressable>
  );
}