import ContainerwithSwitch from "@/app/components/Custom/ContainerwithSwitch";
import RadioSwitch from "@/app/components/Custom/RadioSwitch";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SelectFrequencyBottomSheet({
    selectedFrequency,
    setSelectedFrequency,
}: {
    selectedFrequency: string;
    setSelectedFrequency: (value: string) => void;
}) {
    const [localFrequency, setLocalFrequency] = useState(selectedFrequency);

    const insets = useSafeAreaInsets()

    return (
        <View style={{ flex: 1, marginBottom: insets.bottom }}>
            <Text>Select Frequency</Text>

            <Pressable
                onPress={() => {
                    console.log("Pressed no repeat");
                    setLocalFrequency("no repeat");
                    setSelectedFrequency("noRepeat")
                }}
            >
                <ContainerwithSwitch
                    title="no repeat"
                    style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                    customSwitch={
                        <RadioSwitch
                            selected={localFrequency === "no repeat"}
                        />
                    }
                />
            </Pressable>

            <Pressable
                onPress={() => {
                    console.log("Pressed daily");
                    setLocalFrequency("daily");
                    setSelectedFrequency("daily")
                }}
            >
                <ContainerwithSwitch
                    title="daily"
                    style={{
                        borderBottomWidth: 1.5,
                        borderBottomColor: "#1a1d20",
                    }}
                    customSwitch={
                        <RadioSwitch
                            selected={localFrequency === "daily"}
                        />
                    }
                />
            </Pressable>

            <Pressable
                onPress={() => {
                    setLocalFrequency("every week")
                    setSelectedFrequency("everyWeek")
                }

                }

            >
                <ContainerwithSwitch
                    title="every week"
                    style={{
                        borderBottomWidth: 1.5,
                        borderBottomColor: "#1a1d20",
                    }}
                    customSwitch={
                        <RadioSwitch
                            selected={localFrequency === "every week"}
                        />
                    }
                />
            </Pressable>

            <Pressable
                onPress={() => {
                    setLocalFrequency("every 2 weeks")
                    setSelectedFrequency("every2Weeks")
                }
                }
            >
                <ContainerwithSwitch
                    title="every 2 weeks"
                    style={{
                        borderBottomWidth: 1.5,
                        borderBottomColor: "#1a1d20",
                    }}
                    customSwitch={
                        <RadioSwitch
                            selected={localFrequency === "every 2 weeks"}
                        />
                    }
                />
            </Pressable>

            <Pressable
                onPress={() => {
                    setLocalFrequency("every month")
                    setSelectedFrequency("everyMonth")
                }}
            >
                <ContainerwithSwitch
                    title="every month"
                    style={{
                        borderBottomWidth: 1.5,
                        borderBottomColor: "#1a1d20",
                    }}
                    customSwitch={
                        <RadioSwitch
                            selected={localFrequency === "every month"}
                        />
                    }
                />
            </Pressable>

            <Pressable
                onPress={() => {
                    setLocalFrequency("every year")
                    setSelectedFrequency("everyYear")

                }}
            >
                <ContainerwithSwitch
                    title="every year"
                    style={{
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
                    }}
                    customSwitch={
                        <RadioSwitch
                            selected={localFrequency === "every year"}
                        />
                    }
                />
            </Pressable>


        </View>
    );
}