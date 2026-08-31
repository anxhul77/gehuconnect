import { TouchableOpacity, View, Text } from "react-native";
import { Image } from "expo-image";
type ShareItemProps = {
    icon: React.ReactNode | null;
    title: string;
    image: any;
    onPress: () => void;
};

export default function ShareItem({ icon, title, image, onPress }: ShareItemProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            className="items-center "
            onPress={onPress}
        >
            {image ? <Image
                source={image}
                style={{ width: 55, height: 55 }} />
                : <View className="h-16 w-16 rounded-full bg-[#2A2A2D] items-center justify-center">
                    {icon}
                </View>}

            <Text className="text-white text-xs mt-2 ">{title}</Text>
        </TouchableOpacity>
    );
}