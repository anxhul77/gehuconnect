import ContainerwithSwitch from "@/app/components/Custom/ContainerwithSwitch";
import RadioSwitch from "@/app/components/Custom/RadioSwitch";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingBottomSheetTemplate({
    title,
    options,
    selected,
    onSelect,
}: {
    options: any[]
    title: string
    selected: any;
    onSelect: (value: any) => void;
}) {
    const insets = useSafeAreaInsets();
    const [currentVal, setCurrentVal] = useState(selected.value);



    return (
        <View style={{ flex: 1, paddingBottom: insets.bottom + 10 }}>
            <Text className="text-white font-bold text-lg mb-4 text-center">{title}</Text>
            <View className='flex-1 bg-black px-4'>
                {options.map((opt, idx) => (
                    <Pressable key={idx} onPress={() => {
                        setCurrentVal(opt.value);
                        onSelect(opt);
                    }}>
                        <ContainerwithSwitch
                            title={opt.label}
                            style={{
                                borderTopLeftRadius: idx === 0 ? 16 : 0,
                                borderTopRightRadius: idx === 0 ? 16 : 0,
                                borderBottomLeftRadius: idx === options.length - 1 ? 16 : 0,
                                borderBottomRightRadius: idx === options.length - 1 ? 16 : 0,
                                borderBottomWidth: idx === options.length - 1 ? 0 : 1.5,
                                borderBottomColor: "#1a1d20",
                            }}
                            customSwitch={<RadioSwitch selected={currentVal === opt.value} />}
                        />
                    </Pressable>
                ))}
            </View>
        </View>
    )
}