import { StyleSheet, Text, View, FlatList, Pressable, StatusBar } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const C = {
    bg: '#0A0A0A',
    surface: '#1A1A1A',
    surface2: '#242424',
    border: '#2A2A2A',
    accent: '#FF6B35',
    neonPink: '#FF2D78',
    green: '#1DB954',
    white: '#FFFFFF',
    muted: '#535353',
    textSec: '#B3B3B3',
}

import { useState, useEffect } from 'react'
import { ActivityIndicator } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useGetChatListsQuery, marketplaceChatApi, sortChats } from '@/src/features/chat/marketplace-chat.api'
import { ChatListItemDto, ChatRole, ChatListItemUpdateDto } from '@/src/types/types'
import { publishWhenReady, subscribeTopic, connectChatSocket } from '@/src/features/chat/chat.socket'

export default function OfferPage() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const dispatch = useDispatch()
    const [activeTab, setActiveTab] = useState<'ALL' | 'BUYING' | 'SELLING'>('ALL')
    const [cursor, setCursor] = useState('0')

    const chatRoleParam = activeTab === 'ALL' ? undefined : (activeTab === 'BUYING' ? ChatRole.BUYER : ChatRole.SELLER);

    const { data, isLoading, isFetching } = useGetChatListsQuery({
        chatRole: chatRoleParam,
        cursor,
        limit: 20
    })

    const [getChatListItem] = marketplaceChatApi.endpoints.getChatListItem.useLazyQuery();
    const auth = useSelector((state: any) => state.auth);

    useEffect(() => {
        if (auth?.accessToken) {
            connectChatSocket(auth.accessToken);
        }

        publishWhenReady("/app/marketplace/chatList.open", JSON.stringify({}));

        const unsubChatList = subscribeTopic("/user/queue/marketplace/chat-list", (msg) => {
            try {
                const update: ChatListItemUpdateDto = JSON.parse(msg.body);
                const roles: (ChatRole | undefined)[] = [undefined, ChatRole.BUYER, ChatRole.SELLER];
                let found = false;

                roles.forEach(role => {
                    dispatch(
                        marketplaceChatApi.util.updateQueryData('getChatLists', { chatRole: role }, (draft) => {
                            if (!draft.chats) return;
                            const idx = draft.chats.findIndex(c => c.chatId === update.chatId);
                            if (idx !== -1) {
                                found = true;
                                draft.chats[idx].lastMessage = update.lastMessage;
                                draft.chats[idx].lastMessageTime = update.lastMessageTime;
                                draft.chats[idx].unreadCount += 1;
                                draft.chats = sortChats(draft.chats);
                            }
                        })
                    );
                });

                if (!found) {
                    getChatListItem({ chatId: update.chatId }).unwrap().then(newItem => {
                        roles.forEach(role => {
                            dispatch(
                                marketplaceChatApi.util.updateQueryData('getChatLists', { chatRole: role }, (draft) => {
                                    if (!draft.chats) draft.chats = [];
                                    if (!draft.chats.find(c => c.chatId === newItem.chatId)) {
                                        draft.chats.unshift(newItem);
                                        draft.chats = sortChats(draft.chats);
                                    }
                                })
                            );
                        });
                    }).catch(err => console.error("Failed to fetch new chat item", err));
                }
            } catch (e) {
                console.error("Error handling chat list update", e);
            }
        });

        const unsubUserStatus = subscribeTopic("/user/queue/user-status", (msg) => {
            try {
                const statusUpdate = JSON.parse(msg.body);
                const roles: (ChatRole | undefined)[] = [undefined, ChatRole.BUYER, ChatRole.SELLER];
                roles.forEach(role => {
                    dispatch(
                        marketplaceChatApi.util.updateQueryData('getChatLists', { chatRole: role }, (draft) => {
                            if (!draft.chats) return;
                            draft.chats.forEach(chat => {
                                if (Number(chat.otherUserId) === statusUpdate.id) {
                                    chat.isOnline = statusUpdate.online;
                                }
                            });
                        })
                    );
                });
            } catch (e) {
                console.error("Error handling user status update", e);
            }
        });

        return () => {
            publishWhenReady("/app/marketplace/chatList.close", JSON.stringify({}));
            unsubChatList();
            unsubUserStatus();
        };
    }, [dispatch, getChatListItem, auth?.accessToken]);

    const handleTabChange = (tab: 'ALL' | 'BUYING' | 'SELLING') => {
        if (tab !== activeTab) {
            setActiveTab(tab);
            setCursor('0');
        }
    }

    const loadMore = () => {
        if (data?.hasNext && !isFetching) {
            setCursor(data.cursor);
        }
    }
    console.log("item", data)
    const renderItem = ({ item }: { item: ChatListItemDto }) => (
        <Pressable
            onPress={() => router.push({ pathname: '/components/marketplace/ChatPage', params: { chatId: item.chatId, userName: item.otherUserName, productName: item.productName, role: item.role, productPrice: item.productPrice, productId: item.productId } })}
            className="flex-row items-center px-4 py-3"
            style={({ pressed }) => [{ backgroundColor: pressed ? C.surface : 'transparent' }]}
        >
            <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ color: C.white, fontSize: 24, fontWeight: 'bold' }}>{item.otherUserName?.charAt(0) || '?'}</Text>
                </View>
                {item.isOnline && <View style={styles.onlineDot} />}
            </View>

            <View className="flex-1 ml-3 mr-2">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-white font-bold text-[15px]">{item.otherUserName}</Text>
                    <Text style={{ color: item.unreadCount > 0 ? C.white : C.muted, fontSize: 12, fontWeight: item.unreadCount > 0 ? '700' : '500' }}>
                        {/* We could format item.lastMessageTime properly here if needed */}
                        {item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </Text>
                </View>

                <View className="flex-row items-center">
                    <Text style={{ color: item.unreadCount > 0 ? C.white : C.textSec }} className="text-[13px] flex-1" numberOfLines={1}>
                        {item.lastMessage}
                    </Text>
                </View>
                <Text style={{ color: C.accent, fontSize: 11, fontWeight: '600', marginTop: 2 }}>{item.productName}</Text>
            </View>

            <View className="items-end justify-center pl-2">
                <Image source={{ uri: item.productImage }} style={styles.productThumb} contentFit="cover" />
                {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unreadCount}</Text>
                    </View>
                )}
            </View>
        </Pressable>
    )


    return (
        <View style={[styles.container, { paddingTop: insets.top }]} className="flex-1">
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="mr-3 p-1">
                        <Ionicons name="arrow-back" size={24} color={C.white} />
                    </Pressable>
                    <Text className="text-white text-xl font-bold tracking-wide">Messages</Text>
                </View>
                <Pressable className="p-1">
                    <Ionicons name="options-outline" size={24} color={C.white} />
                </Pressable>
            </View>

            {/* Tabs */}
            <View className="flex-row px-4 py-3 gap-3">
                <Pressable onPress={() => handleTabChange('ALL')} className={`px-4 py-1.5 rounded-full border ${activeTab === 'ALL' ? 'bg-[#FFFFFF20] border-[#FFFFFF30]' : 'bg-transparent border-[#2A2A2A]'}`}>
                    <Text className={`font-semibold ${activeTab === 'ALL' ? 'text-white' : 'text-[#B3B3B3]'}`}>All</Text>
                </Pressable>
                <Pressable onPress={() => handleTabChange('BUYING')} className={`px-4 py-1.5 rounded-full border ${activeTab === 'BUYING' ? 'bg-[#FFFFFF20] border-[#FFFFFF30]' : 'bg-transparent border-[#2A2A2A]'}`}>
                    <Text className={`font-semibold ${activeTab === 'BUYING' ? 'text-white' : 'text-[#B3B3B3]'}`}>Buying</Text>
                </Pressable>
                <Pressable onPress={() => handleTabChange('SELLING')} className={`px-4 py-1.5 rounded-full border ${activeTab === 'SELLING' ? 'bg-[#FFFFFF20] border-[#FFFFFF30]' : 'bg-transparent border-[#2A2A2A]'}`}>
                    <Text className={`font-semibold ${activeTab === 'SELLING' ? 'text-white' : 'text-[#B3B3B3]'}`}>Selling</Text>
                </Pressable>
            </View>

            {/* List */}
            {isLoading && !data?.chats ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={C.accent} />
                </View>
            ) : (
                <FlatList
                    data={data?.chats || []}
                    keyExtractor={(item) => item.chatId.toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: C.border, marginLeft: 76 }} />}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() => isFetching && data?.chats?.length ? (
                        <View className="py-4 items-center">
                            <ActivityIndicator size="small" color={C.accent} />
                        </View>
                    ) : null}
                    ListEmptyComponent={() => (
                        <View className="flex-1 justify-center items-center mt-20">
                            <Text style={{ color: C.muted, fontSize: 16 }}>No chats found.</Text>
                        </View>
                    )}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: C.bg,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        padding: 2,
        borderWidth: 2,
        borderColor: C.surface2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 26,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: C.green,
        borderWidth: 2,
        borderColor: C.bg,
    },
    productThumb: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: C.surface,
    },
    unreadBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: C.neonPink,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: C.bg,
    },
    unreadText: {
        color: C.white,
        fontSize: 10,
        fontWeight: 'bold',
    }
})