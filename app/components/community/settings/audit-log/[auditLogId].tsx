import { View, Text, Pressable, ScrollView, Image, Platform } from 'react-native';
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { AuditLogBottomSheet } from '../AuditLogActionBottomSheet';
import SearchMemberBottomSheet from '../MembersBottomSheet'


const AUDIT_DATA = [
    {
        date: 'Yesterday',
        events: [
            { id: '1', user: 'John', action: 'Deleted Post', time: '2:15 PM', avatar: 'https://i.pravatar.cc/150?u=john' },
            { id: '2', user: 'Sarah', action: 'Banned Mike', time: '11:03 AM', avatar: 'https://i.pravatar.cc/150?u=sarah' },
        ]
    },
    {
        date: 'Last Week',
        events: [
            { id: '3', user: 'Admin', action: 'Changed Community Banner', time: '10:00 AM', avatar: 'https://i.pravatar.cc/150?u=admin' },
        ]
    }
];
const C = {

    surface2: 'black',
    surface3: '#242424',
    border: '#2A2A2A',
    white: '#FFFFFF',
    textSec: '#B3B3B3',

}



export default function AuditLogSettings() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { auditLogId: communityId } = useLocalSearchParams()
    const [showSort, setShowSort] = React.useState(false);
    const [sortBy, setSortBy] = useState<string>('Filter by Community Member')
    const [openFilterByActionBottomSheet, setOpenFilterByActionBottomSheet] = useState(false)
    const [searchMemberBottomSheet, setSearchMemberBottomSheet] = useState(false)
    function handleOpenAuditLogSheet() {
        console.log("rann")
        setOpenFilterByActionBottomSheet(true)
    }

    function handleOpenSearchMemberSheet() {
        setSearchMemberBottomSheet(true)
    }






    const SORT_OPTIONS = [{ label: 'Filter by Community Member', onPress: handleOpenSearchMemberSheet }, { label: 'Filter by action', onPress: handleOpenAuditLogSheet }] as const
    return (
        <SafeAreaView className="flex-1 bg-black">
            <KeyboardAvoidingView className="flex-1 bg-black"
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}>
                <View className="flex-row items-center justify-between px-4 py-4">
                    <View className='flex-1 flex-row gap-2 items-center'>
                        <Pressable onPress={() => router.back()} className="p-2">
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </Pressable>
                        <Text className="text-white font-bold text-xl">Audit Log</Text>
                    </View>



                    <Pressable
                        onPress={() => setShowSort(v => !v)}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.surface2, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: showSort ? C.white : C.border }}
                    >
                        <Ionicons name="funnel-outline" size={13} color={showSort ? C.white : C.textSec} />
                        <Text style={{ color: showSort ? C.white : C.textSec, fontWeight: '700', fontSize: 12 }}>Sort</Text>
                    </Pressable>


                </View>
                {showSort && (
                    <View style={{ backgroundColor: C.surface3, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginBottom: 14, overflow: 'hidden', marginHorizontal: 10 }}>
                        {SORT_OPTIONS.map((opt, i) => (
                            <Pressable
                                key={opt.label}
                                onPress={() => { opt.onPress(); }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    borderBottomWidth: i < SORT_OPTIONS.length - 1 ? 1 : 0,
                                    borderBottomColor: C.border,
                                }}
                            >
                                <Text style={{ color: sortBy === opt.label ? C.white : C.textSec, fontWeight: sortBy === opt.label ? '800' : '600', fontSize: 13 }}>
                                    {opt.label}
                                </Text>
                                {sortBy === opt.label && <Ionicons name="checkmark" size={16} color={C.white} />}
                            </Pressable>
                        ))}
                    </View>
                )}
                <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>

                    {AUDIT_DATA.map((group) => (
                        <View key={group.date} className="mb-8">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-white/55 text-sm font-medium">{group.date}</Text>
                            </View>

                            <View className="bg-white/[0.05] rounded-xl border border-white/12 overflow-hidden">
                                {group.events.map((event, idx) => (
                                    <View key={event.id}>
                                        <View className="flex-row items-start justify-between p-4 bg-transparent">
                                            <View className="flex-row flex-1">
                                                <Image source={{ uri: event.avatar }} className="w-10 h-10 rounded-full bg-white/10 mr-4 mt-0.5" />
                                                <View className="flex-1">
                                                    <Text className="text-white font-bold text-base mb-1">{event.user}</Text>
                                                    <Text className="text-white/55 text-sm leading-5">{event.action}</Text>
                                                </View>
                                            </View>
                                            <Text className="text-white/30 text-xs font-medium">{event.time}</Text>
                                        </View>

                                        {idx < group.events.length - 1 && (
                                            <View className="h-px bg-white/6 mx-4" />
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}

                    <View style={{ paddingBottom: Math.max(insets.bottom + 20, 40) }} />
                </ScrollView>
                <AuditLogBottomSheet open={openFilterByActionBottomSheet} onClose={() => { setOpenFilterByActionBottomSheet(false) }}></AuditLogBottomSheet>
                < SearchMemberBottomSheet open={searchMemberBottomSheet} onClose={() => { { setSearchMemberBottomSheet(false) } }} communityId={communityId as string}></SearchMemberBottomSheet>
            </KeyboardAvoidingView>



        </SafeAreaView>
    );
}
