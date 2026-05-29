import { StyleSheet, Text, View, Pressable, TextInput, Keyboard, FlatList } from 'react-native'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { KeyboardStickyView } from 'react-native-keyboard-controller'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet'
import { publishWhenReady, subscribeTopic } from '@/src/features/chat/chat.socket'

const C = {
  bg: '#0A0A0A', surface: '#1A1A1A', surface2: '#242424', border: '#2A2A2A',
  accent: '#FF6B35', neonPink: '#FF2D78', green: '#1DB954',
  white: '#FFFFFF', muted: '#535353', textSec: '#B3B3B3',
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

const DISCOUNTS = [
  { label: '-5%', multiplier: 0.95 },
  { label: '-10%', multiplier: 0.9 },
  { label: '-15%', multiplier: 0.85 },
]

const LOCATIONS = ["Main Library", "Cafeteria", "Hostel Gate", "Main Gate", "Custom"];

import { MarketplaceChatDto, MarketplaceMessageType, OfferStatus, DealStatus, ReviewStatus, useGetChatListsQuery } from '@/src/features/chat/marketplace-chat.api'

type Message = {
  id: string;
  type: MarketplaceMessageType | 'system';
  text?: string;
  amount?: number;
  from: 'me' | 'them' | 'system';
  timestamp: string;
  status?: string;
  location?: string;
  date?: string;
  expiresAt?: string;
  offer?: MarketplaceChatDto['offer'];
  deal?: MarketplaceChatDto['deal'];
  review?: MarketplaceChatDto['review'];
  createdAtMs?: number;
}

const INITIAL_MESSAGES: Message[] = [
  { id: '1', type: 'text', text: 'Hi, is this still available?', from: 'them', timestamp: '10:00 AM' },
  { id: '2', type: 'text', text: 'Yes, it is! Let me know if you want to check it out.', from: 'me', timestamp: '10:05 AM' },
  {
    id: '3', type: 'offer', amount: 58000, from: 'them', timestamp: '10:06 AM',
    status: 'pending', offerType: 'offer', expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
  },
]

import { useGetMarketplaceChatMessagesQuery, useOpenMarketplaceChatMutation, useMarkMarketplaceChatReadMutation, useCloseMarketplaceChatMutation, useCreateOfferRESTMutation, useGetPinnedMessageQuery } from '@/src/features/chat/marketplace-chat.api'
import { useSelector } from 'react-redux'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { connectChatSocket, disconnectChatSocket } from '@/src/features/chat/chat.socket'
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated'

export default function ChatPage() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams()
  const auth = useSelector((state: any) => state.auth)
  const currentUserId = auth?.user?.id

  const userName = params.user as string || params.userName as string || 'Unknown User'
  const userAvatar = params.avatar as string || params.userAvatar as string || 'https://i.pravatar.cc/150'
  const productName = params.product as string || params.productName as string || 'Product'
  const listedPriceRaw = params.price as string || params.productPrice as string || '0'
  const listedPriceNum = parseInt(String(listedPriceRaw).replace(/\D/g, ''), 10) || 0

  const chatIdStr = params.chatId as string;
  const parsedChatId = chatIdStr ? parseInt(chatIdStr, 10) : null;
  const fromActionSheet = params.fromActionSheet === 'true';

  const { data: chatData } = useGetMarketplaceChatMessagesQuery(
    { chatId: parsedChatId! },
    { skip: !parsedChatId }
  );
  const { data: pinnedData } = useGetPinnedMessageQuery(
    { chatId: parsedChatId! },
    { skip: !parsedChatId }
  );

  const [isPinnedExpanded, setIsPinnedExpanded] = useState(false);
  const pinnedHeight = useSharedValue(0);

  const togglePinned = () => {
    setIsPinnedExpanded(!isPinnedExpanded);
    pinnedHeight.value = withTiming(isPinnedExpanded ? 0 : 1, { duration: 300 });
  };

  const pinnedStyle = useAnimatedStyle(() => {
    return {
      maxHeight: pinnedHeight.value * 200,
      opacity: pinnedHeight.value,
      overflow: 'hidden',
    };
  });

  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const flashListRef = useRef<FlashList<Message>>(null)
  const offerSheetRef = useRef<BottomSheetModal>(null)

  const [openChat] = useOpenMarketplaceChatMutation()
  const [markRead] = useMarkMarketplaceChatReadMutation()
  const [closeChat] = useCloseMarketplaceChatMutation()
  const [createOfferREST] = useCreateOfferRESTMutation()
  const { data: chatLists } = useGetChatListsQuery({}, { skip: !parsedChatId });
  const currentChat = chatLists?.chats?.find(c => c.chatId === parsedChatId);
  const isSellerParam = params.role === 'SELLER';
  const isSeller = isSellerParam || currentChat?.role === 'SELLER';

  const productIdStr = params.productId as string;
  const productId = productIdStr ? parseInt(productIdStr, 10) : currentChat?.productId;

  const [offerAmt, setOfferAmt] = useState('')
  const [offerNote, setOfferNote] = useState('')
  const [offerContext, setOfferContext] = useState<{ type: 'new' | 'counter' | 'deal', originalId?: string, previousAmount?: number }>({ type: 'new' })

  const meetupSheetRef = useRef<BottomSheetModal>(null)
  const [meetupLocation, setMeetupLocation] = useState('')
  const [meetupDate, setMeetupDate] = useState('')
  const [selectedLocChip, setSelectedLocChip] = useState("Main Library")
  const [meetupContext, setMeetupContext] = useState<{ originalId?: string }>({})

  useEffect(() => {
    if (chatData?.messages) {
      const mapped = chatData.messages.map((m) => ({
        id: String(m.messageId),
        type: m.type as any,
        text: m.content,
        amount: m.offer?.offerPrice || m.deal?.dealFinalPrice,
        from: String(m.senderId) === String(currentUserId) ? 'me' : 'them',
        timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAtMs: new Date(m.createdAt).getTime(),
        status: m.offer?.offerStatus || m.deal?.dealStatus || m.review?.reviewStatus,
        expiresAt: m.offer?.expiresAt || m.deal?.expiresAt || m.review?.expiresAt,
        offer: m.offer,
        deal: m.deal,
        review: m.review
      })) as Message[];
      setMessages(mapped.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0)));
    }
  }, [chatData, currentUserId]);

  useEffect(() => {
    const chatId = parsedChatId;
    if (!chatId) return;

    if (fromActionSheet && auth?.accessToken) {
      connectChatSocket(auth.accessToken);
    }

    let unsubTopic = () => { };
    let unsubRead = () => { };

    openChat({ chatId });
    markRead({ chatId });

    unsubTopic = subscribeTopic(`/topic/marketplace/chat/${chatId}`, (event) => {
      try {
        const data = JSON.parse(event.body);
        if ((data.type === 'NEW_MESSAGE' || data.type === 'NEW_OFFER') && data.payload) {
          setMessages(prev => {
            if (prev.some(m => m.id === String(data.payload.messageId))) return prev;
            const m = data.payload as MarketplaceChatDto;
            const isMe = String(m.senderId) === String(currentUserId);

            if (isMe) {
              const isTempMatch = m.type === 'TEXT'
                ? (msg: Message) => msg.id.startsWith('temp-') && msg.text === m.content
                : (msg: Message) => msg.id.startsWith('temp-') && msg.type === m.type;

              const tempIndex = prev.findIndex(isTempMatch);
              if (tempIndex !== -1) {
                const newPrev = [...prev];
                const createdAtMs = new Date(m.createdAt || m.offer?.createdAt || m.deal?.createdAt || m.review?.createdAt || Date.now()).getTime();
                newPrev[tempIndex] = {
                  ...newPrev[tempIndex],
                  id: String(m.messageId || Date.now()),
                  timestamp: new Date(createdAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  createdAtMs,
                  status: m.offer?.offerStatus || m.deal?.dealStatus || m.review?.reviewStatus,
                  expiresAt: m.offer?.expiresAt || m.deal?.expiresAt || m.review?.expiresAt,
                  offer: m.offer,
                  deal: m.deal,
                  review: m.review
                };
                return newPrev.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
              }
            }

            const createdAtMs = new Date(m.createdAt || m.offer?.createdAt || m.deal?.createdAt || m.review?.createdAt || Date.now()).getTime();
            const newMessage: Message = {
              id: String(m.messageId || Date.now()),
              type: m.type as any,
              text: m.content,
              amount: m.offer?.offerPrice || m.deal?.dealFinalPrice,
              from: isMe ? 'me' : 'them',
              timestamp: new Date(createdAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              createdAtMs,
              status: m.offer?.offerStatus || m.deal?.dealStatus || m.review?.reviewStatus,
              expiresAt: m.offer?.expiresAt || m.deal?.expiresAt || m.review?.expiresAt,
              offer: m.offer,
              deal: m.deal,
              review: m.review
            };
            return [newMessage, ...prev].sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
          });
        }
      } catch (e) {
        console.error(e);
      }
    });

    unsubRead = subscribeTopic(`/queue/marketplace/read`, (event) => {
      try {
        const data = JSON.parse(event.body);
        console.log('[ChatPage] Read receipt:', data);
      } catch (e) {
        console.error(e);
      }
    });

    return () => {
      unsubTopic();
      unsubRead();
      closeChat({ chatId });
      if (fromActionSheet) {
        disconnectChatSocket();
      }
    };
  }, [parsedChatId, fromActionSheet, auth?.accessToken]);

  const handleSend = () => {
    if (!inputText.trim()) return
    const text = inputText.trim()
    setInputText('')

    const tempId = `temp-${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      type: MarketplaceMessageType.TEXT as any,
      text: text,
      from: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, newMessage])

    publishWhenReady(
      `/app/marketplace/chat.sendMessage`,
      JSON.stringify({
        chatId: parsedChatId,
        payload: { content: text }
      })
    );
  }

  const handleSendOffer = async () => {
    const num = parseInt(offerAmt, 10)
    if (isNaN(num) || num <= 0 || !productId) return
    const tempId = `temp-${Date.now()}`;
    const createdAtMs = Date.now();
    const newMessage: Message = {
      id: tempId,
      type: MarketplaceMessageType.OFFER,
      amount: num,
      from: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAtMs,
      status: OfferStatus.PENDING,
      offer: {
        offerId: 0,
        offerPrice: num,
        offerStatus: OfferStatus.PENDING,
        isExpired: false,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        isScheduled: false,
        createdAt: new Date().toISOString()
      }
    }
    if (offerNote.trim()) {
      newMessage.text = offerNote.trim()
    }
    setMessages(prev => [newMessage, ...prev].sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0)))
    const noteToSend = offerNote.trim()
    setOfferAmt('')
    setOfferNote('')
    offerSheetRef.current?.dismiss()
    setOfferContext({ type: 'new' })

    try {
      await createOfferREST({ productId, price: num, note: noteToSend }).unwrap();
    } catch (e) {
      console.error("Failed to send offer", e);
      setMessages(prev => prev.filter(m => m.id !== tempId))
    }
  }

  const handleAcceptOffer = (id: string, amount: number) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'accepted' } : m))
    setMessages(prev => [{
      id: Date.now().toString(),
      type: 'system',
      text: `Offer of ${fmt(amount)} was accepted. You can now schedule a meetup.`,
      from: 'system',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...prev])
  }

  const handleCancelOffer = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'REJECTED', offer: m.offer ? { ...m.offer, offerStatus: OfferStatus.REJECTED as any } : m.offer } : m))
  }

  const handleRejectOffer = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'REJECTED', offer: m.offer ? { ...m.offer, offerStatus: OfferStatus.REJECTED as any } : m.offer } : m))
  }

  const handleCounterOffer = (id: string, prevAmt: number) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'countered' } : m))
    setOfferContext({ type: 'counter', originalId: id, previousAmount: prevAmt });
    setOfferAmt(String(prevAmt));
    offerSheetRef.current?.present()
  }

  const handleSendDeal = () => {
    setOfferContext({ type: 'deal' });
    setOfferAmt(String(listedPriceNum));
    offerSheetRef.current?.present();
  }

  const handleScheduleMeetup = () => {
    const loc = selectedLocChip === 'Custom' ? meetupLocation.trim() : selectedLocChip;
    if (!loc || !meetupDate.trim()) return

    if (meetupContext.originalId) {
      setMessages(prev => prev.map(m => m.id === meetupContext.originalId ? { ...m, meetupStatus: 'modified' } : m))
    }

    setMessages(prev => {
      return [{
        id: Date.now().toString(),
        type: 'meetup',
        location: loc,
        date: meetupDate.trim(),
        from: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        meetupStatus: 'proposed',
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        originalOfferId: meetupContext.originalId
      }, ...prev]
    })
    meetupSheetRef.current?.dismiss()
    setMeetupContext({})
  }

  const handleAcceptMeetup = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, meetupStatus: 'accepted' } : m))
    setMessages(prev => [{
      id: Date.now().toString(),
      type: 'system',
      text: `Meetup accepted. See you there!`,
      from: 'system',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...prev])
  }

  const handleDeclineMeetup = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, meetupStatus: 'declined' } : m))
  }

  const handleModifyMeetup = (id: string, prevLoc: string) => {
    setMeetupContext({ originalId: id });
    if (LOCATIONS.includes(prevLoc)) {
      setSelectedLocChip(prevLoc);
    } else {
      setSelectedLocChip("Custom");
      setMeetupLocation(prevLoc);
    }
    meetupSheetRef.current?.present();
  }

  const handleReviewMeetup = () => {
    setMessages(prev => [{
      id: Date.now().toString(),
      type: 'system',
      text: `Meetup marked as completed. Please leave a review for ${userName}.`,
      from: 'system',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...prev])
  }


  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.from === 'me'
    const isExpired = item.expiresAt && new Date(item.expiresAt).getTime() < Date.now();
    console.log(item)
    if (item.type === 'system') {
      return (
        <View style={styles.systemBubble}>
          <Text style={styles.systemText}>{item.text}</Text>
        </View>
      )
    }

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowThem]}>
        {!isMe && <Image source={{ uri: userAvatar }} style={styles.miniAvatar} />}

        <View style={{ maxWidth: '85%', width: (item.type === MarketplaceMessageType.OFFER || item.type === MarketplaceMessageType.SCHEDULE || item.type === MarketplaceMessageType.DEAL) ? '85%' : undefined }}>
          {item.type === MarketplaceMessageType.OFFER && item.offer && (
            <View style={[styles.offerCard, isMe ? { borderColor: C.accent } : { borderColor: C.green }]}>
              <View style={styles.offerHeader}>
                <Ionicons name="pricetag" size={16} color={isMe ? C.accent : C.green} />
                <Text style={[styles.offerTitle, { color: isMe ? C.accent : C.green }]}>
                  {isMe ? 'Your Offer' : `${userName}'s Offer`}
                </Text>
              </View>

              <Text style={styles.offerAmount}>{fmt(item.offer.offerPrice || 0)}</Text>

              {item.text && item.type === MarketplaceMessageType.OFFER && (
                <View style={styles.noteContainer}>
                  <Text style={styles.noteLabel}>NOTE</Text>
                  <Text style={styles.offerNote}>{item.text}</Text>
                </View>
              )}

              <View style={[styles.offerStatusBox, { backgroundColor: item.offer.offerStatus === OfferStatus.ACCEPTED ? '#1DB95422' : item.offer.offerStatus === OfferStatus.REJECTED ? '#FF2D7822' : item.offer.offerStatus === OfferStatus.COUNTERED ? '#FF6B3522' : C.surface2 }]}>
                <Text style={[styles.offerStatusText, { color: item.offer.offerStatus === OfferStatus.ACCEPTED ? C.green : item.offer.offerStatus === OfferStatus.REJECTED ? C.neonPink : item.offer.offerStatus === OfferStatus.COUNTERED ? C.accent : C.textSec }]}>
                  {isExpired && item.offer.offerStatus === OfferStatus.PENDING ? 'EXPIRED' : item.offer.offerStatus}
                </Text>
              </View>

              {!isExpired && item.offer.offerStatus === OfferStatus.PENDING && item.offer.expiresAt && (
                <Text style={{ color: C.muted, fontSize: 10, marginTop: 4, marginBottom: 8, fontWeight: '600' }}>
                  Expires at {new Date(item.offer.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}

              {item.offer.offerStatus === OfferStatus.ACCEPTED && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    {isSeller ? 'Offer accepted! Please schedule a meetup.' : 'Offer accepted! Waiting for seller to schedule a meet.'}
                  </Text>
                </View>
              )}

              {item.offer.offerStatus === OfferStatus.PENDING && !isExpired && (
                <View style={styles.offerActions}>
                  {!isMe ? (
                    <>
                      <Pressable style={styles.acceptBtn} onPress={() => handleAcceptOffer(item.id, item.offer?.offerPrice || 0)}>
                        <Text style={styles.btnTextBlack}>Accept Offer</Text>
                      </Pressable>
                      <View style={styles.secondaryActions}>
                        <Pressable style={styles.counterBtn} onPress={() => handleCounterOffer(item.id, item.offer?.offerPrice || 0)}>
                          <Text style={styles.btnTextWhite}>Counter</Text>
                        </Pressable>
                        <Pressable style={styles.rejectBtn} onPress={() => handleRejectOffer(item.id)}>
                          <Text style={styles.btnTextWhite}>Decline</Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <View style={styles.secondaryActions}>
                      <Pressable style={styles.counterBtn} onPress={() => handleCounterOffer(item.id, item.offer?.offerPrice || 0)}>
                        <Text style={styles.btnTextWhite}>Edit</Text>
                      </Pressable>
                      <Pressable style={styles.rejectBtn} onPress={() => handleCancelOffer(item.id)}>
                        <Text style={styles.btnTextWhite}>Cancel</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {item.type === MarketplaceMessageType.DEAL && item.deal && (
            <View style={[styles.offerCard, { borderColor: C.accent }]}>
              <View style={styles.offerHeader}>
                <MaterialCommunityIcons name="handshake" size={18} color={C.accent} />
                <Text style={[styles.offerTitle, { color: C.accent }]}>Final Deal</Text>
              </View>
              <Text style={styles.offerAmount}>{fmt(item.deal.dealFinalPrice || 0)}</Text>
              <View style={[styles.offerStatusBox, { backgroundColor: '#FF6B3522' }]}>
                <Text style={[styles.offerStatusText, { color: C.accent }]}>STATUS: {item.deal.dealStatus}</Text>
              </View>
            </View>
          )}

          {item.type === MarketplaceMessageType.SCHEDULE && (
            <View style={[styles.meetupCard, { borderColor: C.neonPink }]}>
              <View style={styles.offerHeader}>
                <Ionicons name="calendar" size={16} color={C.neonPink} />
                <Text style={[styles.offerTitle, { color: C.neonPink }]}>Meetup Scheduled</Text>
              </View>
              <Text style={styles.meetupDetail}><Text style={{ color: C.white, fontWeight: '700' }}>Where:</Text> University Library</Text>
              <Text style={styles.meetupDetail}><Text style={{ color: C.white, fontWeight: '700' }}>When:</Text> Tomorrow, 5:00 PM</Text>
            </View>
          )}

          {item.type === MarketplaceMessageType.TEXT && (
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}

          {item.type === MarketplaceMessageType.Review && (
            <View style={[styles.bubble, { backgroundColor: '#FF2D7810', borderColor: '#FF2D7830', borderWidth: 1 }]}>
              <Text style={{ color: C.neonPink, fontSize: 13, fontWeight: '700' }}>Review Requested</Text>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}

          <Text style={[styles.timestamp, isMe ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    )
  }

  const renderBackdrop = useCallback((p: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...p} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} pressBehavior="close" />
  ), [])

  const isOfferAccepted = messages.some(m => m.type === MarketplaceMessageType.OFFER && m.status === OfferStatus.ACCEPTED)
  const isMeetupScheduled = messages.some(m => m.type === MarketplaceMessageType.SCHEDULE && m.status !== 'CANCELLED')

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={C.white} />
        </Pressable>

        <View style={styles.headerInfo}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: userAvatar }} style={styles.headerAvatar} />
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{userName}</Text>
            <Text style={styles.headerProduct}>{productName}</Text>
          </View>
        </View>
        <Pressable style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={C.white} />
        </Pressable>
      </View>


      <View style={styles.divider} />

      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >

        {pinnedData && pinnedData.pinnedActivity && (
          <View style={styles.pinnedContainer}>
            <Pressable onPress={togglePinned} style={styles.pinnedHeaderRow}>
              <View style={styles.pinnedLeft}>
                <Ionicons name="pin" size={14} color={C.accent} style={{ transform: [{ rotate: '45deg' }] }} />
                <Text style={styles.pinnedLabel}>
                  Pinned {pinnedData.pinnedMessageType.charAt(0) + pinnedData.pinnedMessageType.slice(1).toLowerCase()}
                </Text>
              </View>
              <Ionicons name={isPinnedExpanded ? "chevron-up" : "chevron-down"} size={16} color={C.textSec} />
            </Pressable>

            <Animated.View style={[styles.pinnedBody, pinnedStyle]}>
              <View style={styles.pinnedCardInner}>
                <View style={styles.pinnedInfoRow}>
                  <Text style={styles.pinnedStatusText}>
                    STATUS: <Text style={{ color: C.white, fontWeight: 'bold' }}>{pinnedData.pinnedActivity.offerStatus || pinnedData.pinnedActivity.dealStatus || pinnedData.pinnedActivity.reviewStatus || pinnedData.pinnedActivity.scheduledStatus}</Text>
                  </Text>
                  {(pinnedData.pinnedActivity.offerPrice || pinnedData.pinnedActivity.dealFinalPrice) && (
                    <Text style={styles.pinnedAmount}>{fmt(pinnedData.pinnedActivity.offerPrice || pinnedData.pinnedActivity.dealFinalPrice)}</Text>
                  )}
                </View>
                {(pinnedData.pinnedActivity.scheduledMeeting || pinnedData.pinnedActivity.scheduledLocation) && (
                  <View style={styles.pinnedMeetingBox}>
                    <Ionicons name="calendar" size={14} color={C.white} />
                    <Text style={styles.pinnedMeetingText}>
                      Meeting scheduled
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          </View>
        )}





        <View style={{ flex: 1 }}>
          <FlashList
            ref={flashListRef}
            data={messages}
            inverted={true}
            keyExtractor={item => item.id}
            renderItem={renderMessage}

            contentContainerStyle={styles.listContent}
            estimatedItemSize={80}
            keyboardShouldPersistTaps="handled"

          />
        </View>

        {/* Action Banner (Schedule Meetup) - Only for Seller when offer is accepted */}
        {isOfferAccepted && !isMeetupScheduled && isSeller && (
          <View style={styles.actionBanner}>
            <Text style={styles.actionBannerText}>Offer accepted! Ready to trade?</Text>
            <Pressable style={styles.scheduleBtn} onPress={() => meetupSheetRef.current?.present()}>
              <Ionicons name="calendar-outline" size={16} color="#000" />
              <Text style={styles.btnTextBlack}>Schedule Meetup</Text>
            </Pressable>
          </View>
        )}

        {/* Input Footer */}
        <View style={[styles.footer]}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Pressable style={styles.offerAttachBtn} onPress={() => { console.log('Attachment pressed') }}>
              <Ionicons name="add" size={24} color={C.white} />
            </Pressable>
            <Pressable style={[styles.offerAttachBtn, { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border }]} onPress={() => {
              if (isSeller) {
                handleSendDeal();
              } else {
                setOfferContext({ type: 'new' });
                offerSheetRef.current?.present();
              }
            }}>
              <MaterialCommunityIcons name="handshake-outline" size={20} color={C.accent} />
            </Pressable>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Message..."
              placeholderTextColor={C.muted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
          </View>

          {inputText.trim().length > 0 ? (
            <Pressable onPress={handleSend} style={styles.sendBtn}>
              <Ionicons name="send" size={18} color={C.white} />
            </Pressable>
          ) : (
            <Pressable style={styles.micBtn}>
              <Ionicons name="mic-outline" size={22} color={C.textSec} />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Make Offer / Counter Bottom Sheet */}
      <BottomSheetModal
        ref={offerSheetRef}
        snapPoints={['62%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backgroundStyle={{ backgroundColor: '#121212', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        handleIndicatorStyle={{ backgroundColor: '#535353', width: 36 }}
      >
        <BottomSheetView className="px-6 pt-2 pb-8">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-white text-2xl font-bold">
                {offerContext.type === 'counter' ? 'Counter Offer' : offerContext.type === 'deal' ? 'Send a Deal' : 'Make an Offer'}
              </Text>
              <Text className="text-[#B3B3B3] text-sm mt-0.5">
                {offerContext.type === 'counter' ? `Countering offer of ${fmt(offerContext.previousAmount || 0)}` : `Listed at `}
                {offerContext.type !== 'counter' && <Text className="text-white font-semibold">{fmt(listedPriceNum)}</Text>}
              </Text>
            </View>
            <View className="bg-[#1DB95422] border border-[#1DB95455] rounded-full px-3 py-1">
              <Text className="text-[#1DB954] text-[10px] font-bold tracking-widest">NEGOTIATE</Text>
            </View>
          </View>

          <View className="h-px bg-[#2A2A2A] mb-5" />

          <Text className="text-[#535353] text-[10px] font-bold tracking-widest mb-2">YOUR OFFER (₹)</Text>
          <View className="flex-row items-center bg-[#242424] rounded-lg border border-[#2A2A2A] px-4 h-14">
            <Text className="text-[#B3B3B3] text-lg font-semibold mr-1.5">₹</Text>
            <BottomSheetTextInput
              style={{ flex: 1, color: 'white', fontSize: 20, fontWeight: '600' }}
              value={offerAmt}
              onChangeText={setOfferAmt}
              placeholder="Enter amount"
              placeholderTextColor="#535353"
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>

          <View className="flex-row gap-2 mt-4">
            {DISCOUNTS.map(({ label, multiplier }) => {
              const amt = Math.round(listedPriceNum * multiplier)
              const selected = offerAmt === String(amt)
              return (
                <Pressable
                  key={label}
                  onPress={() => setOfferAmt(String(amt))}
                  className={`flex-1 rounded-lg border py-2.5 items-center ${selected ? 'bg-[#1DB9541A] border-[#1DB954]' : 'bg-[#242424] border-[#2A2A2A]'}`}
                >
                  <Text className={`text-xs font-bold ${selected ? 'text-[#1DB954]' : 'text-[#B3B3B3]'}`}>{label}</Text>
                  <Text className={`text-[11px] mt-0.5 ${selected ? 'text-[#1DB954CC]' : 'text-[#535353]'}`}>{fmt(amt)}</Text>
                </Pressable>
              )
            })}
          </View>

          <Text className="text-[#535353] text-[10px] font-bold tracking-widest mt-5 mb-2">
            ADD A NOTE <Text className="font-normal">(OPTIONAL)</Text>
          </Text>
          <BottomSheetTextInput
            style={{ backgroundColor: '#242424', borderRadius: 8, borderWidth: 1, borderColor: '#2A2A2A', color: 'white', fontSize: 14, padding: 12, minHeight: 80, textAlignVertical: 'top' }}
            value={offerNote}
            onChangeText={setOfferNote}
            placeholder="E.g. I can pick up today..."
            placeholderTextColor="#535353"
            multiline
          />

          <Pressable
            onPress={handleSendOffer}
            disabled={!parseInt(offerAmt, 10)}
            className={`h-14 rounded-full justify-center items-center mt-5 bg-[#1DB954] ${!parseInt(offerAmt, 10) ? 'opacity-35' : ''}`}
          >
            <Text className="text-black text-[15px] font-bold tracking-wide">
              {offerContext.type === 'deal' ? 'Send Deal' : 'Send Offer'}
            </Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>

      {/* Schedule Meetup Bottom Sheet */}
      <BottomSheetModal
        ref={meetupSheetRef}
        snapPoints={['55%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backgroundStyle={{ backgroundColor: '#121212', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        handleIndicatorStyle={{ backgroundColor: '#535353', width: 36 }}
      >
        <BottomSheetView className="px-6 pt-2 pb-8">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-white text-2xl font-bold">Schedule Meetup</Text>
              <Text className="text-[#B3B3B3] text-sm mt-0.5">
                Agree on a time and place to trade.
              </Text>
            </View>
            <View className="bg-[#FF2D7822] border border-[#FF2D7855] rounded-full px-3 py-1">
              <Text className="text-[#FF2D78] text-[10px] font-bold tracking-widest">MEETUP</Text>
            </View>
          </View>

          <View className="h-px bg-[#2A2A2A] mb-5" />

          <Text className="text-[#535353] text-[10px] font-bold tracking-widest mb-2">LOCATION</Text>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={LOCATIONS}
            keyExtractor={item => item}
            style={{ marginBottom: 12, flexGrow: 0 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setSelectedLocChip(item)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8,
                  backgroundColor: selectedLocChip === item ? '#FF2D7822' : C.surface2,
                  borderWidth: 1, borderColor: selectedLocChip === item ? '#FF2D78' : C.border
                }}>
                <Text style={{ color: selectedLocChip === item ? C.neonPink : C.textSec, fontSize: 13, fontWeight: '600' }}>{item}</Text>
              </Pressable>
            )}
          />

          {selectedLocChip === 'Custom' && (
            <BottomSheetTextInput
              style={{ backgroundColor: '#242424', borderRadius: 8, borderWidth: 1, borderColor: '#2A2A2A', color: 'white', fontSize: 16, padding: 14, marginBottom: 16 }}
              value={meetupLocation}
              onChangeText={setMeetupLocation}
              placeholder="e.g. Main Library Cafe"
              placeholderTextColor="#535353"
            />
          )}

          <Text className="text-[#535353] text-[10px] font-bold tracking-widest mb-2 mt-2">DATE & TIME</Text>
          <BottomSheetTextInput
            style={{ backgroundColor: '#242424', borderRadius: 8, borderWidth: 1, borderColor: '#2A2A2A', color: 'white', fontSize: 16, padding: 14 }}
            value={meetupDate}
            onChangeText={setMeetupDate}
            placeholder="e.g. Tomorrow at 5:00 PM"
            placeholderTextColor="#535353"
          />

          <Pressable
            onPress={handleScheduleMeetup}
            disabled={(selectedLocChip === 'Custom' && !meetupLocation.trim()) || !meetupDate.trim()}
            className={`h-14 rounded-full justify-center items-center mt-8 bg-[#FF2D78] ${((selectedLocChip === 'Custom' && !meetupLocation.trim()) || !meetupDate.trim()) ? 'opacity-35' : ''}`}
          >
            <Text className="text-white text-[15px] font-bold tracking-wide">
              {meetupContext.originalId ? 'Propose New Time' : 'Confirm Meetup'}
            </Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    </View >
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  backButton: { padding: 6, marginRight: 4 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { marginRight: 10 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: C.green, borderWidth: 2, borderColor: C.bg },
  headerTextContainer: { flex: 1 },
  headerName: { color: C.white, fontSize: 16, fontWeight: 'bold' },
  headerProduct: { color: C.accent, fontSize: 12, fontWeight: '600', marginTop: 2 },
  moreButton: { padding: 8 },
  divider: { height: 1, backgroundColor: C.border },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  systemBubble: { alignSelf: 'center', backgroundColor: C.surface2, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginVertical: 12, borderWidth: 1, borderColor: C.border },
  systemText: { color: C.textSec, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, width: '100%' },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowThem: { justifyContent: 'flex-start' },
  miniAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8, backgroundColor: C.surface, marginBottom: 16 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  bubbleMe: { backgroundColor: C.surface2, borderBottomRightRadius: 4, borderWidth: 1, borderColor: C.border },
  bubbleThem: { backgroundColor: '#1DB95415', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#1DB95430' },
  messageText: { color: C.white, fontSize: 15, lineHeight: 20 },
  timestamp: { fontSize: 10, marginTop: 6, color: C.muted },
  offerCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, width: '100%' },
  offerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  offerTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  offerAmount: { color: C.white, fontSize: 32, fontWeight: '900', marginBottom: 16, letterSpacing: -0.5 },
  noteContainer: { backgroundColor: '#FFFFFF08', padding: 12, borderRadius: 10, marginBottom: 16 },
  noteLabel: { color: C.muted, fontSize: 10, fontWeight: '800', marginBottom: 4, letterSpacing: 1 },
  offerNote: { color: C.textSec, fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  offerStatusBox: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 4 },
  offerStatusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  offerActions: { gap: 10, marginTop: 16 },
  acceptBtn: { backgroundColor: C.green, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  secondaryActions: { flexDirection: 'row', gap: 10 },
  counterBtn: { flex: 1, backgroundColor: C.surface2, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  rejectBtn: { flex: 1, backgroundColor: 'transparent', paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  btnTextBlack: { color: '#000', fontSize: 14, fontWeight: 'bold' },
  btnTextWhite: { color: C.white, fontSize: 14, fontWeight: 'bold' },
  meetupCard: { backgroundColor: '#FF2D7815', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FF2D7830', minWidth: 240 },
  meetupDetail: { color: C.textSec, fontSize: 14, marginBottom: 4 },
  reviewBtn: { backgroundColor: C.neonPink, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  actionBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.surface, padding: 12, borderTopWidth: 1, borderTopColor: C.border },
  actionBannerText: { color: C.white, fontSize: 14, fontWeight: '600' },
  scheduleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.green, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  footer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bg },
  offerAttachBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  inputContainer: { flex: 1, backgroundColor: C.surface, borderRadius: 20, minHeight: 40, maxHeight: 100, marginHorizontal: 10, justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  input: { color: C.white, fontSize: 15, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2, justifyContent: 'center', alignItems: 'center', marginBottom: 2, paddingLeft: 4, borderWidth: 1, borderColor: C.border },
  micBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  infoBox: { marginTop: 12, padding: 12, backgroundColor: '#1DB95410', borderRadius: 8, borderWidth: 1, borderColor: '#1DB95430' },
  infoText: { color: C.green, fontSize: 13, fontWeight: '700' },
  pinnedContainer: { top: 0, left: 0, right: 0, backgroundColor: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: C.border, paddingHorizontal: 16, paddingVertical: 10 },
  pinnedHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pinnedLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pinnedLabel: { color: C.accent, fontSize: 12, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  pinnedBody: { marginTop: 8 },
  pinnedCardInner: { backgroundColor: '#242424', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  pinnedInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pinnedStatusText: { color: C.textSec, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  pinnedAmount: { color: C.white, fontSize: 18, fontWeight: 'bold' },
  pinnedMeetingBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: '#FFFFFF10', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start' },
  pinnedMeetingText: { color: C.white, fontSize: 12, fontWeight: '600' },
})
