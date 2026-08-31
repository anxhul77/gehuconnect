import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function EventContianer({ date, time, topic, description, location }: { date: string, time: string, topic: string, description: string, location: String }) {
    return (
        <View className="w-full rounded-2xl  bg-[#151515] p-4  " >
            <View className="flex justify-between flex-row mb-2">
                <View className="flex-row items-center gap-2">  <MaterialCommunityIcons name="calendar" size={24} color="#B5BAC1" /><Text className="text-[#B5BAC1]">Event Date</Text></View>
                <View className="flex-row items-center gap-2">  <MaterialIcons name="people-alt" size={20} color="#B5BAC1" /><Text className="text-[#B5BAC1]"> 0</Text></View>
            </View>

            <Text className="text-[#B5BAC1] font-bold text-md">{"dhaojhf daljf ojdoal fld "}</Text>
            <Text className="text-[#B5BAC1] text-sm">{"even localFrequency doesn't update the radio button, then the issue is no longer related to your bottom sheet provider—it would mean the component itself isn't re-rendering after its own local state changes, which is unusual. In that case, we'd look at the bottom sheet library or how the content is being mounted."}</Text>
            <View className="flex-row  items-center mt-2">
                <MaterialIcons name="location-pin" size={20} color="#B5BAC1" />
                <Text className="text-[#B5BAC1] text-sm">{"location"}</Text>
            </View>
        </View>
    )
}