import { View } from "react-native";

export default function RadioSwitch({ selected }: { selected: boolean }) {
    return selected ? (
        <View className="w-6 h-6 rounded-full bg-[#5865F2] items-center justify-center">
            <View className="w-2.5 h-2.5 rounded-full bg-white" />
        </View>
    ) : (
        <View className="w-6 h-6 rounded-full border-2 border-[#B5BAC1] bg-transparent" />
    );
}