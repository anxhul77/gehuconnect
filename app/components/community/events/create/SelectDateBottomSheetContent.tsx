import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import { useMemo, useState } from "react";
import WheelPickerExpo from "react-native-wheel-picker-expo";

export default function SelectDateBottomSheetContent({
    selectedDate,
    setSelectedDate,
    handleClose,
}: {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    handleClose: () => void;
}) {


    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ].map((m, i) => ({
        label: m,
        value: i,
    }));
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 2 }, (_, i) => ({
        label: `${currentYear + i}`,
        value: currentYear + i,
    }));

    const daysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const days = useMemo(() => {
        const count = daysInMonth(
            selectedDate.getFullYear(),
            selectedDate.getMonth()
        );

        return Array.from({ length: count }, (_, i) => ({
            label: `${i + 1}`,
            value: i + 1,
        }));
    }, [selectedDate]);

    const updateMonth = (month: number) => {
        const year = selectedDate.getFullYear();

        const maxDay = daysInMonth(year, month);

        const day = Math.min(selectedDate.getDate(), maxDay);

        setSelectedDate(new Date(year, month, day));
    };

    const updateDay = (day: number) => {
        setSelectedDate(
            new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                day
            )
        );
    };

    const updateYear = (year: number) => {
        const maxDay = daysInMonth(year, selectedDate.getMonth());

        const day = Math.min(selectedDate.getDate(), maxDay);

        setSelectedDate(
            new Date(
                year,
                selectedDate.getMonth(),
                day
            )
        );
    };

    return (
        <View className="flex-1 justify-center items-center">

            <View className="flex-row items-center justify-center w-full">
                <Text className="text-white font-bold text-2xl">
                    Select Date
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
                    items={months}
                    initialSelectedIndex={selectedDate.getMonth()}
                    onChange={({ item }) => updateMonth(item.value)}
                    backgroundColor="#000000"
                />

                <WheelPickerExpo
                    items={days}
                    initialSelectedIndex={selectedDate.getDate() - 1}
                    onChange={({ item }) => updateDay(item.value)}
                    backgroundColor="#000000"
                />

                <WheelPickerExpo
                    items={years}
                    initialSelectedIndex={0}
                    onChange={({ item }) => updateYear(item.value)}
                    backgroundColor="#000000"
                />

            </View>

            <View className="flex-row justify-end w-full gap-4 pr-6">
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
                    onPress={() => {
                        console.log(selectedDate);
                        handleClose();
                    }}
                >
                    <Text className="text-white font-semibold">
                        Confirm
                    </Text>
                </Pressable>
            </View>

        </View>
    );
}