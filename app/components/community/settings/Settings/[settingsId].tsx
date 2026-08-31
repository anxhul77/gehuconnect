import { Text, View, Pressable, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'


export default function Settings() {
    const router = useRouter()
    const { settingsId } = useLocalSearchParams<{ settingsId: string }>()

    const settingsOptions = [
        { id: 'general', title: 'General', icon: 'settings-outline', group: 'App preferences' },
        { id: 'appearance', title: 'Appearance', icon: 'color-palette-outline', group: 'App preferences' },

        { id: 'members', title: 'Members', icon: 'people-outline', group: 'Community management' },
        { id: 'roles', title: 'Roles', icon: 'shield-checkmark-outline', group: 'Community management' },
        { id: 'channels', title: 'Channels', icon: 'chatbubbles-outline', group: 'Community management' },

        { id: 'feed', title: 'Feed', icon: 'newspaper-outline', group: 'Content & interactions' },
        { id: 'events', title: 'Events', icon: 'calendar-outline', group: 'Content & interactions' },

        { id: 'moderation', title: 'Moderation', icon: 'hammer-outline', group: 'Administration' },
        { id: 'invites', title: 'Invites', icon: 'person-add-outline', group: 'Administration' },
        { id: 'audit-log', title: 'Audit Log', icon: 'document-text-outline', group: 'Administration' },

        { id: 'danger-zone', title: 'Danger Zone', icon: 'warning-outline', danger: true, group: 'Danger zone' },
    ]

    const groupedOptions = settingsOptions.reduce((acc, curr) => {
        if (!acc[curr.group]) {
            acc[curr.group] = []
        }
        acc[curr.group].push(curr)
        return acc
    }, {} as Record<string, typeof settingsOptions>)

    return (
        <SafeAreaView className="flex-1 bg-[#000000]" edges={['top', 'bottom']}>
            <View className="flex-row items-center justify-between px-4 py-4">
                <Pressable onPress={() => router.back()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </Pressable>
                <Text className="text-white font-bold text-xl">Settings</Text>
                <View className="w-10" />
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingTop: 4, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {Object.entries(groupedOptions).map(([group, options]) => (
                    <View key={group} className="mb-2 px-4">
                        <View className="flex-row justify-between mb-1.5 mt-4">
                            <Text className="text-white/55 text-sm font-medium">{group}</Text>
                        </View>

                        <View className="bg-white/[0.05] rounded-xl border border-white/12 overflow-hidden">
                            {options.map((option, idx) => (
                                <View key={option.id}>
                                    <Pressable
                                        className="flex-row items-center justify-between py-3.5 px-4 active:bg-white/[0.08]"
                                        onPress={() => router.push(`/components/community/settings/${option.id}/${settingsId}` as any)}
                                    >
                                        <View className="flex-row items-center">
                                            <Ionicons
                                                name={option.icon as any}
                                                size={22}
                                                color={option.danger ? '#ED4956' : 'rgba(255,255,255,0.55)'}
                                            />
                                            <Text
                                                className={`text-base ml-4 font-medium ${option.danger ? 'text-[#ED4956]' : 'text-white'}`}
                                            >
                                                {option.title}
                                            </Text>
                                        </View>
                                        {!option.danger && <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />}
                                    </Pressable>
                                    {idx < options.length - 1 && (
                                        <View className="h-px bg-white/6 mx-4" />
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>

        </SafeAreaView>
    )
}