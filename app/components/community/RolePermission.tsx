import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'


import ContainerwithSwitch from '../Custom/ContainerwithSwitch'
import CustomSwitch from '../Custom/CustomSwitch'

interface PermissionConfig {
    manageServer: boolean;
    managePosts: boolean;
    kickMembers: boolean;
    createPosts: boolean;
    sendInvites: boolean;
}


export default function RolePermission() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { role } = useLocalSearchParams<{ role: 'moderator' | 'user' }>()

    const isModerator = role === 'moderator'
    const roleTitle = isModerator ? 'Moderator' : 'User'

    const [perms, setPerms] = useState<PermissionConfig>({
        manageServer: isModerator ? true : false,
        managePosts: isModerator ? true : false,
        kickMembers: isModerator ? true : false,
        createPosts: true,
        sendInvites: true,
    })

    const togglePerm = (key: keyof PermissionConfig) => {
        setPerms(prev => ({ ...prev, [key]: !prev[key] }))
    }

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

                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{roleTitle} Permissions</Text>

                <View style={{ width: 36 }} />
            </View>

            <ScrollView className="flex bg-[#000000] px-3 mt-4" showsVerticalScrollIndicator={false}>
                <ContainerwithSwitch
                    backgroundColor="#131318"
                    title="Manage Server"
                    description={`Allow ${isModerator ? 'moderators' : 'regular users'} to customize community settings, status, or description.`}

                    customSwitch={<CustomSwitch value={perms.manageServer} onValueChange={() => togglePerm('manageServer')} />}
                />
                <ContainerwithSwitch
                    backgroundColor="#131318"
                    title="Manage Posts"
                    description={`Allow ${isModerator ? 'moderators' : 'regular users'} to delete or pin other members' posts.`}

                    customSwitch={<CustomSwitch value={perms.managePosts} onValueChange={() => togglePerm('managePosts')} />}
                />
                <ContainerwithSwitch
                    backgroundColor="#131318"
                    title="Moderate Members"
                    description={`Allow ${isModerator ? 'moderators' : 'regular users'} to kick or ban troublesome members from this server.`}

                    customSwitch={<CustomSwitch value={perms.kickMembers} onValueChange={() => togglePerm('kickMembers')} />}

                />
                <ContainerwithSwitch
                    backgroundColor="#131318"
                    title="Create Posts"
                    description={`Allow ${isModerator ? 'moderators' : 'regular users'} to write and publish new posts in the community.`}

                    customSwitch={<CustomSwitch value={perms.createPosts} onValueChange={() => togglePerm('createPosts')} />}
                />
                <ContainerwithSwitch
                    backgroundColor="#131318"
                    title="Send Invites"
                    description={`Allow ${isModerator ? 'moderators' : 'regular users'} to generate invite codes for new members.`}

                    customSwitch={<CustomSwitch value={perms.sendInvites} onValueChange={() => togglePerm('sendInvites')} />}
                />

            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({})
