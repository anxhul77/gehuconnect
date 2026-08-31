import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { Entypo, } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

export default function EventBottomSheetContent({ communityId, closeActionSheet }: { communityId: string, closeActionSheet: () => void }) {
    const router = useRouter();

    const handleCreateEvent = () => {
        closeActionSheet();
        router.push({
            pathname: '/components/community/events/create/step1',
            params: { communityId }
        });
    };

    return (
        <View className=" p-2 items-center">
            <View className="flex-row ">
                <Pressable onPress={closeActionSheet} className='items-center absolute right-1/2 translate-x-1/2 rounded-full bg-black'>
                    <Entypo name="cross" size={26} color="white" />
                </Pressable>

                <Text className='text-[#ecedef] text-center  font-bold text-xl ' >Events</Text>
                <Pressable
                    className=" items-center absolute left-1/2 -translate-x-1/2"
                    onPress={handleCreateEvent}
                >
                    <Text className="text-[#7984f5] text-base">Create </Text>
                </Pressable>
            </View>
            <View className='w-40 h-40'>
                <Image
                    source={require("../../../assets/images/mascotevent.png")}
                    contentFit="cover"
                    transition={200}
                    style={{ width: "100%", aspectRatio: 9 / 9, paddingHorizontal: 12, borderRadius: 10 }}
                />
            </View>


            <Text className="text-white font-bold text-2xl mb-2 italic ">No upcoming events</Text>
            <Text className="text-white/55 text-center mb-6">
                Schedule an event to keep your community engaged.
            </Text>

        </View>
    );
}
