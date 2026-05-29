import { StyleSheet, Text, View, Pressable } from 'react-native'
import React, { useState } from 'react'
import BarContainer from './BarContainer'
import { ScrollView } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Settings() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const [selectedStatus, setSelectedStatus] = useState("public")

    const statusItems = [
        {
            title: "Public",
            iconName: "earth",
            iconColor: "#C7C8CE",
            selected: selectedStatus === "public",
            onPress: () => setSelectedStatus("public")
        },
        {
            title: "Private",
            iconName: "lock-closed",
            iconColor: "#C7C8CE",
            selected: selectedStatus === "private",
            onPress: () => setSelectedStatus("private")
        },
        {
            title: "Invite Only",
            iconName: "mail",
            iconColor: "#C7C8CE",
            selected: selectedStatus === "Invite Only",
            onPress: () => setSelectedStatus("Invite Only")
        },
    ]

    return (
        <View style={{ flex: 1, backgroundColor: '#000000' }}>

            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingTop: insets.top + 10,
                    paddingBottom: 16,
                }}
            >
                <Pressable
                    onPress={() => router.back()}
                    style={{
                        width: 36,
                        height: 36,

                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Ionicons name="arrow-back" size={20} color="white" />
                </Pressable>

                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Settings</Text>

                <View style={{ width: 36 }} />
            </View>

            <ScrollView className="flex bg-[#000000] px-3 mt-4" showsVerticalScrollIndicator={false}>
                <BarContainer
                    items={[
                        {
                            title: "Edit Profile",
                            iconName: "person",
                            iconColor: "#C7C8CE",
                            onPress: () => { }
                        },
                    ]}
                />

                <View className='mt-8'>
                    <Text className='text-[#C7C8CE] text-sm mb-3 font-bold px-1'>Status</Text>
                    <BarContainer items={statusItems} />
                </View>

                <View className='mt-8 mb-8'>
                    <Text className='text-[#C7C8CE] text-sm mb-3 font-bold px-1'>Role Permissions</Text>
                    <BarContainer
                        items={[
                            {
                                title: "Moderator Permissions",
                                iconName: "shield",
                                iconColor: "#C7C8CE",
                                onPress: () => router.push({
                                    pathname: '/components/community/RolePermission' as any,
                                    params: { role: 'moderator' }
                                })
                            },
                            {
                                title: "User Permissions",
                                iconName: "people",
                                iconColor: "#C7C8CE",
                                onPress: () => router.push({
                                    pathname: '/components/community/RolePermission' as any,
                                    params: { role: 'user' }
                                })
                            }
                        ]}
                    />
                </View>
                <View>
                    <BarContainer items={[{
                        title: "Delete Community",
                        iconName: "trash-outline", iconColor: "red", onPress: () => { }
                    }]} />
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({})