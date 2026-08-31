import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Fontisto, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomSheet } from '@/app/contexts/BottomSheetContext';
import SelectDateBottomSheetContent from './SelectDateBottomSheetContent';
import SelectFrequencyBottomSheet from './SelectFrequencyBottomSheet';
import SelectTImeBottomSheetContent from './SelectTImeBottomSheetContent';

export default function CreateEventStep2() {
    const { communityId, type } = useLocalSearchParams();
    const { openActionSheet, closeActionSheet } = useBottomSheet()
    const router = useRouter();
    const date = new Date();

    const [selectedDate, setSelectedDate] = useState(date);
    const [topic, setTopic] = useState('');
    ;
    const [selectedTime, setSelectedTime] = useState(date);
    const [selectedFrequency, setFrequency] = useState("no repeat")
    const [description, setDescription] = useState('');
    const insets = useSafeAreaInsets()
    const handleNext = () => {
        if (selectedDate.toDateString() && selectedTime) {
            router.push({
                pathname: '/components/community/events/create/step3',
                params: {
                    communityId, type, topic, selectedDate: selectedDate.toLocaleDateString(), selectedTime: selectedTime.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                    }), description
                }
            });

        }
    };

    const handleBack = () => {
        router.back();
    };
    const handleSelectDateClick = () => {
        openActionSheet({ content: () => (<SelectDateBottomSheetContent selectedDate={selectedDate} setSelectedDate={setSelectedDate} handleClose={closeActionSheet}></SelectDateBottomSheetContent>), snapPoints: ["40%"], enablePanDownToClose: true, handleComponent: null, color: "#000000", enableContentPanningGesture: false, onDismiss: closeActionSheet })
    }
    const handleSelectTime = () => {
        openActionSheet({ content: () => (<SelectTImeBottomSheetContent selectedTime={selectedTime} handleClose={closeActionSheet} setSelectedTime={setSelectedTime}></SelectTImeBottomSheetContent>), snapPoints: ["40%"], enablePanDownToClose: true, handleComponent: null, color: "#000000", enableContentPanningGesture: false, onDismiss: closeActionSheet })
    }
    const handleSelectFrequency = () => {
        openActionSheet({ content: () => (<SelectFrequencyBottomSheet selectedFrequency={selectedFrequency} setSelectedFrequency={setFrequency}></SelectFrequencyBottomSheet>), snapPoints: ["55%"], enablePanDownToClose: true, handleComponent: null, color: "#000000", enableContentPanningGesture: false, onDismiss: closeActionSheet })
    }
    const isValid = topic.trim().length > 0 && selectedDate.toDateString().length > 0 && selectedTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).trim().length > 0;

    return (
        <SafeAreaView className="flex-1 bg-[#000000]">
            <View className="mt-4 flex-row items-center justify-center px-4 py-4">
                <Pressable onPress={handleBack} className="absolute left-4 p-2">
                    <MaterialIcons name="arrow-back" size={24} color="#B5BAC1" />
                </Pressable>
                <Text className="text-white font-bold text-lg ">Step 2 of 3</Text>
                <Pressable onPress={handleBack} className="absolute right-4 p-2">
                    <MaterialIcons name="close" size={24} color="#B5BAC1" />
                </Pressable>
            </View>
            <View className="px-6">
                <Text className="text-white font-bold text-2xl mb-2 text-center">What is your event about?</Text>
                <Text className="text-[#B5BAC1] text-center mb-8">
                    Fill the event details
                </Text>
            </View>
            <View className='px-6'>
                <View className=" mt-4 gap-4">
                    <View className='w-full'>
                        <Text className="text-[#B5BAC1] font-bold text-md mb-2">Event Topic</Text>
                        <TextInput className='p-4 w-full h-16 bg-[#151515] rounded-2xl text-white  text-md' placeholderTextColor="#8F9199" placeholder='Whats your event topic ?' >

                        </TextInput>
                    </View>
                    <View className='flex-row gap-4'>
                        <View className='w-[55%]'>
                            <Text className="text-[#B5BAC1] font-bold text-md mb-2">Event Date</Text>
                            <Pressable className='p-4 w-full h-16 bg-[#151515] rounded-2xl text-white font-semibold text-sm' onPress={handleSelectDateClick}>
                                <Text className="text-[#B5BAC1] font-bold text-md mb-2">{selectedDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</Text>
                            </Pressable>
                        </View>
                        <View className='w-[40%]'>
                            <Text className="text-[#B5BAC1] font-bold text-md mb-2">Start Time</Text>
                            <Pressable className='p-4 w-full h-16 bg-[#151515] rounded-2xl text-white font-semibold text-sm' onPress={handleSelectTime}><Text className='text-[#B5BAC1] font-bold text-md mb-2'>{selectedTime.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            })}</Text></Pressable>
                        </View>


                    </View>

                    <View >
                        <Text className="text-[#B5BAC1] font-bold text-md mb-2">Event Frequency</Text>
                        <Pressable className='p-4 w-full h-16 bg-[#151515] rounded-2xl text-white font-semibold text-sm flex-row items-center justify-between' onPress={handleSelectFrequency}>

                            <Text className="text-[#B5BAC1] font-bold text-md mb-2">{selectedFrequency}</Text>
                            <Fontisto name="angle-down" size={16} color="#B5BAC1" />
                        </Pressable>
                    </View>
                    <View>
                        <Text className="text-[#B5BAC1] font-bold text-md mb-2">Event description</Text>
                        <ScrollView className=' w-full h-32 bg-[#151515] rounded-2xl font-semibold  p-2'>
                            <TextInput className='text-white  text-md' multiline placeholderTextColor="#8F9199" placeholder='Write  event description ' >

                            </TextInput>
                        </ScrollView>

                    </View>
                </View>

            </View>
            <View className='w-full px-4 absolute bottom-0  ' style={{ marginBottom: insets.bottom + 10 }}>
                <Pressable className='flex justify-center items-center w-full h-12 bg-[#5a66f2] rounded-full' onPress={handleNext}>
                    <Text className='text-[#e4e5e7] font-bold text-md'>Next</Text>
                </Pressable>
            </View>




        </SafeAreaView >
    );

}

