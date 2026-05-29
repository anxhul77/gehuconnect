import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
type BarContainerProps = {
    title: string;
    onPress?: () => void;
    iconName?: string;
    iconColor?: string;
    selected?: boolean;
}
export default function BarContainer({ items }: { items: BarContainerProps[] }) {

    return (
        <View className="bg-[#131318] rounded-2xl px-4">
            <FlashList
                data={items}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => {
                    const isLastItem = index == items.length - 1
                    return (
                        <Pressable
                            onPress={item.onPress}
                            className={`flex-row items-center justify-between ${isLastItem ? "" : "border-b border-[#1F2027]"} h-16 `}
                        >
                            <View className="flex-row items-center">
                                {item.iconName && (
                                    <Ionicons
                                        name={item.iconName as any}
                                        size={20}
                                        color={item.iconColor || "#C7C8CE"}
                                        style={{ marginRight: 12 }}
                                    />
                                )}
                                <Text className="text-white font-semibold text-[16px]">{item.title}</Text>
                            </View>

                            {item.selected !== undefined && (
                                item.selected ? (
                                    <View className="w-6 h-6 rounded-full bg-[#5865F2] items-center justify-center">
                                        <View className="w-2.5 h-2.5 rounded-full bg-white" />
                                    </View>
                                ) : (
                                    <View className="w-6 h-6 rounded-full border-2 border-[#4E5058] bg-transparent" />
                                )
                            )}
                        </Pressable>
                    )
                }}
                estimatedItemSize={64}
            />
        </View>
    )
}

const styles = StyleSheet.create({})