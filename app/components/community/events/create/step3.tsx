import { View, Text, Pressable, ScrollView } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EventContianer from '../EventContainer';

export default function CreateEventStep3() {
    const { communityId, type, topic, startDate, startTime, description } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets()
    const handleBack = () => {
        router.back();
    };
    return (
        <SafeAreaView className='flex-1 bg-[#000000]'>
            <View className="mt-4 flex-row items-center justify-center px-4 py-4">
                <Pressable onPress={handleBack} className="absolute left-4 p-2">
                    <MaterialIcons name="arrow-back" size={24} color="#B5BAC1" />
                </Pressable>
                <Text className="text-white font-bold text-lg ">Step 3 of 3</Text>
                <Pressable onPress={handleBack} className="absolute right-4 p-2">
                    <MaterialIcons name="close" size={24} color="#B5BAC1" />
                </Pressable>
            </View>
            <View className='flex-1 justify-center items-center px-3'>
                <EventContianer date={startDate as string} time={startTime as string} topic={topic as string} description={description as string} location="location" />
                <Text className='font-bold text-2xl text-center text-white mt-8'>Here's  the preview of the event</Text>
                <Text className="text-[#B5BAC1]"> Make sure everything is correct</Text>
            </View>
            <View className='w-full px-4 absolute bottom-0  ' style={{ marginBottom: insets.bottom + 10 }}>
                <Pressable className='flex justify-center items-center w-full h-12 bg-[#5a66f2] rounded-full' onPress={() => { }}>
                    <Text className='text-[#e4e5e7] font-bold text-md'>Next</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
