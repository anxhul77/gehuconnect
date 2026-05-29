import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import ApplicationHeader from '@/app/components/ApplicationHeader'


export default function _layout() {
    return (
        <Stack >
            <Stack.Screen name="index" options={{
                headerShown: false
            }}></Stack.Screen>
            <Stack.Screen name="search" options={{
                headerShown: false
            }}></Stack.Screen>
        </Stack>
    )
}