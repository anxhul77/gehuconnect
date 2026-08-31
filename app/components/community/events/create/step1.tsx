import { View, Text, Pressable, } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';

import RadioSwitch from '@/app/components/Custom/RadioSwitch';
import ContainerwithSwitch from '@/app/components/Custom/ContainerwithSwitch';
import { TextInput } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateEventStep1() {
    const { communityId } = useLocalSearchParams();
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const insets = useSafeAreaInsets()
    const handleNext = () => {

        if (selectedType) {
            router.push({
                pathname: '/components/community/events/create/step2',
                params: { communityId, type: selectedType }
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (

        <SafeAreaView className="flex-1 bg-[#000000]">
            <View className="mt-4 flex-row items-center justify-center px-4 py-4">

                <Text className="text-white font-bold text-lg ">Step 1 of 3</Text>
                <Pressable onPress={handleBack} className="absolute right-4 p-2">
                    <MaterialIcons name="close" size={24} color="#B5BAC1" />
                </Pressable>
            </View>

            <View className="px-6">
                <Text className="text-white font-bold text-2xl mb-2 text-center">Where is your event?</Text>
                <Text className="text-[#B5BAC1] text-center mb-8">
                    Choose a location for your event so people know where to go.
                </Text>
            </View>
            <View className='px-4 '>
                <Pressable onPress={() => setSelectedType("Voice Channel")}>

                    <ContainerwithSwitch style={{ borderTopRightRadius: 16, borderTopLeftRadius: 16, borderBottomWidth: 1.5, borderBottomColor: "#1a1d20" }} icon={<FontAwesome6 name="volume-high" size={26} color="#c7c8ce" />} title="Voice Channel" description='Hang-out with voice,video,screenshare and go live' backgroundColor="#151515" customSwitch={<RadioSwitch selected={selectedType === "Voice Channel"}></RadioSwitch>} />

                </Pressable>
                <Pressable onPress={() => setSelectedType("Somewhere Else")}>
                    <ContainerwithSwitch style={{ borderBottomRightRadius: 16, borderBottomLeftRadius: 16 }} icon={<FontAwesome6 name="location-dot" size={26} color="#c7c8ce" />} title="Somewhere Else" description='Text channel,external link or inperson location' backgroundColor="#151515" customSwitch={<RadioSwitch selected={selectedType === "Somewhere Else"}></RadioSwitch>} />

                </Pressable>
            </View>

            <View className="px-4 mt-4 ">
                {selectedType === "Voice Channel" && <Text className="text-[#8F9199] font-semibold text-sm mb-2 ">
                    Select a channel
                </Text>

                }
                {selectedType === "Somewhere Else" && <><Text className="text-[#8F9199] font-semibold text-sm mb-2 ">
                    Enter a location
                </Text>
                    <TextInput className='p-4 w-full h-16 bg-[#151515] rounded-2xl text-white font-semibold text-sm' placeholderTextColor="#8F9199" placeholder='Add a location link or something'>

                    </TextInput>
                </>
                }



            </View>
            <View className='p-4'>
                <Text className='text-[#a4a5a7] text-sm'>
                    {" You can give other people to create events in server  Setting > Roles"}
                </Text>
            </View>

            <View className='w-full px-4 absolute bottom-0  ' style={{ marginBottom: insets.bottom + 10 }}>
                <Pressable className='flex justify-center items-center w-full h-12 bg-[#5a66f2] rounded-full' onPress={handleNext}>
                    <Text className='text-[#e4e5e7] font-bold text-md'>Next</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
