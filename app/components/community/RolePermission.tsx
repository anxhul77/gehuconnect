import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface PermissionConfig {
    manageServer: boolean;
    managePosts: boolean;
    kickMembers: boolean;
    createPosts: boolean;
    sendInvites: boolean;
}

function CustomSwitch({ value, onValueChange }: { value: boolean; onValueChange: (val: boolean) => void }) {
    return (
        <Pressable
            onPress={() => onValueChange(!value)}
            style={{
                width: 46,
                height: 24,
                borderRadius: 12,
                backgroundColor: value ? '#5865F2' : '#2E3035',
                justifyContent: 'center',
                padding: 0,
                position: 'relative',
                borderWidth: 1,
                borderColor: value ? '#5865F2' : '#3F4248'
            }}
        >
            <View
                style={{
                    width: 22,
                    height: 20,
                    borderRadius: 11,
                    backgroundColor: '#FFFFFF',
                    position: 'absolute',
                    left: value ? 22 : 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 2,
                }}
            />
        </Pressable>
    )
}

function PermissionRow({
    title,
    description,
    value,
    onValueChange
}: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (val: boolean) => void
}) {
    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#131318',
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 16,
            marginBottom: 12,

        }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>{title}</Text>
                <Text style={{ color: '#8F9199', fontSize: 13, marginTop: 4, lineHeight: 18 }}>{description}</Text>
            </View>
            <CustomSwitch value={value} onValueChange={onValueChange} />
        </View>
    )
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
                <PermissionRow
                    title="Manage Server"
                    description={`Allow ${isModerator ? 'moderators' : 'regular users'} to customize community settings, status, or description.`}
                    value={perms.manageServer}
                    onValueChange={() => togglePerm('manageServer')}
                />
                <PermissionRow
                    title="Manage Posts"
                    description={`Allow ${isModerator ? 'moderators' : 'regular users'} to delete or pin other members' posts.`}
                    value={perms.managePosts}
                    onValueChange={() => togglePerm('managePosts')}
                />
                <PermissionRow
                    title="Moderate Members"
                    description={`Allow ${isModerator ? 'moderators' : 'regular users'} to kick or ban troublesome members from this server.`}
                    value={perms.kickMembers}
                    onValueChange={() => togglePerm('kickMembers')}
                />
                <PermissionRow
                    title="Create Posts"
                    description={`Allow ${isModerator ? 'moderators' : 'regular users'} to write and publish new posts in the community.`}
                    value={perms.createPosts}
                    onValueChange={() => togglePerm('createPosts')}
                />
                <PermissionRow
                    title="Send Invites"
                    description={`Allow ${isModerator ? 'moderators' : 'regular users'} to generate invite codes for new members.`}
                    value={perms.sendInvites}
                    onValueChange={() => togglePerm('sendInvites')}
                />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({})
