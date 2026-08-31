import React from 'react';
import { Pressable, Text, View } from 'react-native';
import RadioSwitch from './RadioSwitch';

interface SelectionOptionCardProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    selected: boolean;
    onPress: () => void;
    isLast?: boolean;
}

export default function SelectionOptionCard({
    title,
    description,
    icon,
    selected,
    onPress,
    isLast = false,
}: SelectionOptionCardProps) {
    return (
        <Pressable
            onPress={onPress}
            activeOpacity={0.7}
            className={`flex-row items-center justify-between p-4 ${!isLast ? 'border-b border-white/10' : ''}`}
        >
            <View className="flex-row items-center flex-1 pr-3">
                {icon && <View className="mr-3">{icon}</View>}
                <View className="flex-1">
                    <Text className={`text-base font-semibold ${selected ? 'text-white' : 'text-white/80'}`}>
                        {title}
                    </Text>
                    {description ? (
                        <Text className="text-white/40 text-xs mt-0.5 leading-4">
                            {description}
                        </Text>
                    ) : null}
                </View>
            </View>
            <RadioSwitch selected={selected} />
        </Pressable>
    );
}
