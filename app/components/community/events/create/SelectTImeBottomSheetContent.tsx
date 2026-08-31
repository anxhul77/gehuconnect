import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
    Alert,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";

type Props = {
    selectedTime: Date;
    setSelectedTime: (time: Date) => void;
    handleClose: () => void;
    onConfirm: (date: Date) => void;
};

export default function SelectTimeBottomSheetContent({
    selectedTime,
    setSelectedTime,
    handleClose,
    onConfirm,
}: Props) {
    const hours = useMemo(
        () =>
            Array.from({ length: 12 }, (_, i) => ({
                label: `${i + 1}`,
                value: i + 1,
            })),
        []
    );

    const minutes = useMemo(
        () =>
            Array.from({ length: 60 }, (_, i) => ({
                label: i.toString().padStart(2, "0"),
                value: i,
            })),
        []
    );

    const periods = [
        {
            label: "AM",
            value: "AM",
        },
        {
            label: "PM",
            value: "PM",
        },
    ];

    const hour24 = selectedTime.getHours();
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const minute = selectedTime.getMinutes();
    const period = hour24 >= 12 ? "PM" : "AM";

    const updateHour = (newHour12: number) => {
        let newHour24 = newHour12;

        if (period === "AM") {
            if (newHour12 === 12) newHour24 = 0;
        } else {
            if (newHour12 !== 12) newHour24 += 12;
        }

        const next = new Date(selectedTime);
        next.setHours(newHour24);

        setSelectedTime(next);
    };

    const updateMinute = (newMinute: number) => {
        const next = new Date(selectedTime);
        next.setMinutes(newMinute);

        setSelectedTime(next);
    };

    const updatePeriod = (newPeriod: "AM" | "PM") => {
        let newHour = selectedTime.getHours();

        if (newPeriod === "AM" && newHour >= 12) {
            newHour -= 12;
        }

        if (newPeriod === "PM" && newHour < 12) {
            newHour += 12;
        }

        const next = new Date(selectedTime);
        next.setHours(newHour);

        setSelectedTime(next);
    };

    const handleConfirm = () => {
        if (selectedTime.getTime() < Date.now()) {
            Alert.alert(
                "Invalid Time",
                "Please choose a future time."
            );
            return;
        }

        onConfirm(selectedTime);
        handleClose();
    };

    return (
        <View className="flex-1 justify-center items-center">
            <View className="flex-row items-center justify-center w-full mb-3">
                <Text className="text-white font-bold text-2xl">
                    Select Time
                </Text>

                <TouchableOpacity
                    onPress={handleClose}
                    className="absolute right-2"
                >
                    <MaterialIcons
                        name="close"
                        size={24}
                        color="#B5BAC1"
                    />
                </TouchableOpacity>
            </View>

            <View className="flex-row">
                <WheelPickerExpo
                    items={hours}
                    initialSelectedIndex={hour12 - 1}
                    onChange={({ item }) => updateHour(item.value)}
                    backgroundColor="#000000"
                />

                <WheelPickerExpo
                    items={minutes}
                    initialSelectedIndex={minute}
                    onChange={({ item }) => updateMinute(item.value)}
                    backgroundColor="#000000"
                />

                <WheelPickerExpo
                    items={periods}
                    initialSelectedIndex={period === "AM" ? 0 : 1}
                    onChange={({ item }) =>
                        updatePeriod(item.value as "AM" | "PM")
                    }
                    backgroundColor="#000000"
                />
            </View>

            <View className="flex-row justify-end w-full gap-4 pr-6 mt-5">
                <Pressable
                    className="rounded-full h-12 w-20 bg-[#424244] justify-center items-center"
                    onPress={handleClose}
                >
                    <Text className="text-white font-semibold">
                        Cancel
                    </Text>
                </Pressable>

                <Pressable
                    className="rounded-full h-12 w-20 bg-[#5A66F2] justify-center items-center"
                    onPress={handleConfirm}
                >
                    <Text className="text-white font-semibold">
                        Confirm
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}