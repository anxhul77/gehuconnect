import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, BackHandler, Keyboard, Animated } from "react-native";
import { useRouter } from "expo-router";
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";

const SELLER = { name: "Rohan", initial: "R", rating: "4.8" }

const C = {
  bg: '#0A0A0A', surface: '#1A1A1A', surface2: '#242424', border: '#2A2A2A',
  accent: '#FF6B35', neonPink: '#FF2D78', neonGreen: '#1DB954',
  white: '#FFFFFF', muted: '#535353', textSec: '#B3B3B3',
}

const DISCOUNTS = [
  { label: '-5%', multiplier: 0.95 },
  { label: '-10%', multiplier: 0.9 },
  { label: '-15%', multiplier: 0.85 },
]

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

import { useSendChatMessageRESTMutation, useCreateOfferRESTMutation } from "@/src/features/chat/marketplace-chat.api";

const MarketplaceActionSheet = forwardRef<BottomSheet, any>(({ activeSheet, onClose, listedPrice = 45000, productId,chatId, insets }, ref) => {
  const [sendChatMessageREST] = useSendChatMessageRESTMutation();
  const [createOfferREST] = useCreateOfferRESTMutation();

  const [messages, setMessages] = useState([
    { id: "1", text: "Hi is this available?", from: "them" },
    { id: "2", text: "Yes! Barely used, battery at 95%.", from: "me" },
    { id: "3", text: "Can you do ₹58,000?", from: "them" },
  ])
  const router = useRouter()
  const chatMsgRef = useRef("Is this still available?")
  const footerPadding = useRef(new Animated.Value(insets.bottom)).current
  const sheetIndexRef = useRef(-1)

  const [offer, setOffer] = useState('')
  const [note, setNote] = useState('')

  const num = parseInt(offer, 10)
  const valid = !isNaN(num) && num > 0
  const saving = valid && num < listedPrice ? listedPrice - num : null

  const chatSnapPoints = useMemo(() => ['60%', '95%'], [])
  const offerSnapPoints = useMemo(() => ['62%'], [])
  const snapPoints = activeSheet === 'chat' ? chatSnapPoints : offerSnapPoints

  const handleChangeText = useCallback((t: string) => { chatMsgRef.current = t }, [])

  const handleSend = useCallback(async () => {
    if (!chatMsgRef.current.trim() || !productId) return
    const content = chatMsgRef.current;

    try {
      const chatId = await sendChatMessageREST({ productId, content }).unwrap();

      import('@/src/features/chat/chat.socket').then(({ publishWhenReady }) => {
        publishWhenReady(
          `/app/marketplace/chat.sendMessage`,
          JSON.stringify({
            type: "NEW_MESSAGE",
            chatId: Number(chatId),
            payload: { content }
          })
        );
      });

      if (typeof ref !== 'function') ref?.current?.close()

      router.push({
        pathname: '/components/marketplace/ChatPage',
        params: { product: 'Product', price: listedPrice.toString(), chatId: chatId.toString(), userName: SELLER.name, fromActionSheet: 'true', productId: productId.toString() }
      })
    } catch (e) {
      console.error("Failed to send message", e);
    }
  }, [router, listedPrice, ref, productId, sendChatMessageREST])

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      Animated.timing(footerPadding, { toValue: 8, duration: 0, useNativeDriver: false }).start()
    })
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(footerPadding, { toValue: insets.bottom, duration: 0, useNativeDriver: false }).start()
      if (sheetIndexRef.current >= 0 && typeof ref !== "function" && ref?.current) {
        ref.current.snapToIndex(0)
      }
    })
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (sheetIndexRef.current >= 0 && typeof ref !== "function" && ref?.current) {
        ref.current.close()
        return true
      }
      return false
    })
    return () => { showSub.remove(); hideSub.remove(); backHandler.remove() }
  }, [insets.bottom, ref])

  const footerComponent = useCallback(
    (props: BottomSheetFooterProps) => {
      if (activeSheet !== 'chat') return null;
      return (
        <BottomSheetFooter {...props}>
          <Animated.View style={[styles.footer, { paddingBottom: footerPadding }]}>
            <BottomSheetTextInput
              onChangeText={handleChangeText}
              defaultValue="Is this still available?"
              placeholder="Type a message..."
              placeholderTextColor={C.muted}
              style={styles.input}
            />
            <Pressable onPress={handleSend} style={styles.sendBtn}>
              <Ionicons name="send" size={17} color={C.white} />
            </Pressable>
          </Animated.View>
        </BottomSheetFooter>
      )
    }, [activeSheet, footerPadding, handleChangeText, handleSend]
  )

  const renderBackdrop = useCallback((p: BottomSheetBackdropProps) => {
    if (activeSheet !== 'offer') return <></>;
    return <BottomSheetBackdrop {...p} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} pressBehavior="close" />;
  }, [activeSheet])

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      animateOnMount={false}
      backdropComponent={renderBackdrop}
      onClose={onClose}
      onChange={(i) => { sheetIndexRef.current = i }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      enableContentPanningGesture={false}
      containerStyle={{ backgroundColor: 'transparent' }}
      handleIndicatorStyle={{ backgroundColor: activeSheet === 'chat' ? C.surface2 : '#535353', width: 36, height: 4, borderRadius: 2 }}
      backgroundStyle={{ backgroundColor: activeSheet === 'chat' ? C.bg : '#121212', borderTopLeftRadius: activeSheet === 'chat' ? 20 : 16, borderTopRightRadius: activeSheet === 'chat' ? 20 : 16 }}
      handleStyle={activeSheet === 'chat' ? { paddingTop: 12 } : undefined}
      footerComponent={footerComponent}
    >
      {activeSheet === 'chat' ? (
        <>
          <View className="flex-row items-center px-4 py-3 gap-3">
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{SELLER.initial}</Text>
              </View>
              <View style={styles.onlineDot} />
            </View>

            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-white font-bold text-base">{SELLER.name}</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={9} color={C.white} />
                </View>
              </View>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Ionicons name="star" size={10} color={C.accent} />
                <Text style={{ color: C.textSec, fontSize: 11 }}>{SELLER.rating} · Usually replies in 1hr</Text>
              </View>
            </View>

            <Pressable
              style={styles.closeBtn}
              onPress={() => { if (typeof ref !== 'function') ref?.current?.close() }}
            >
              <Ionicons name="close" size={16} color={C.textSec} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <BottomSheetScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="self-center mb-5">
              <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>TODAY</Text>
            </View>

            {messages.map((m, i) => {
              const isMe = m.from === 'me'
              return (
                <View
                  key={m.id}
                  className={`flex-row items-end mb-2 gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <View style={styles.miniAvatar}>
                      <Text style={styles.miniAvatarText}>{SELLER.initial}</Text>
                    </View>
                  )}
                  <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                    <Text style={{ color: isMe ? C.white : C.white, fontSize: 14, lineHeight: 20 }}>
                      {m.text}
                    </Text>
                  </View>
                  {isMe && (
                    <Ionicons
                      name="checkmark-done"
                      size={14}
                      color={C.neonGreen}
                      style={{ marginBottom: 4 }}
                    />
                  )}
                </View>
              )
            })}
          </BottomSheetScrollView>
        </>
      ) : activeSheet === 'offer' ? (
        <BottomSheetView className="px-6 pt-2 pb-8">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-white text-2xl font-bold">Make an Offer</Text>
              <Text className="text-[#B3B3B3] text-sm mt-0.5">
                Listed at <Text className="text-white font-semibold">{fmt(listedPrice)}</Text>
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
              value={offer}
              onChangeText={setOffer}
              placeholder="Enter amount"
              placeholderTextColor="#535353"
              keyboardType="numeric"
              returnKeyType="done"
            />
            {offer.length > 0 && (
              <Pressable onPress={() => setOffer('')} className="p-1">
                <Text className="text-[#535353] text-sm">✕</Text>
              </Pressable>
            )}
          </View>

          {saving ? (
            <Text className="text-[#1DB954] text-xs font-semibold mt-1.5 ml-0.5">
              You save {fmt(saving)} ({((saving / listedPrice) * 100).toFixed(0)}% off)
            </Text>
          ) : null}

          <View className="flex-row gap-2 mt-3">
            {DISCOUNTS.map(({ label, multiplier }) => {
              const amt = Math.round(listedPrice * multiplier)
              const selected = offer === String(amt)
              return (
                <Pressable
                  key={label}
                  onPress={() => setOffer(String(amt))}
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
            value={note}
            onChangeText={setNote}
            placeholder="E.g. I can pick up today..."
            placeholderTextColor="#535353"
            multiline
          />

          <Pressable
            onPress={async () => {
              if (valid && productId) {
                try {
                  const chatId = await createOfferREST({ productId, price: num, note }).unwrap();

                  if (chatId) {
                    // Broadcast the offer creation to the socket
                    import('@/src/features/chat/chat.socket').then(({ publishWhenReady }) => {
                      publishWhenReady(
                        `/app/marketplace/chat.sendMessage`,
                        JSON.stringify({
                          type: "NEW_OFFER",
                          chatId: Number(chatId),
                          payload: { content: note || `Made an offer of ₹${num}` }
                        })
                      );
                    });

                    if (typeof ref !== 'function') ref?.current?.close();

                    router.push({
                      pathname: '/components/marketplace/ChatPage',
                      params: { product: 'Product', price: listedPrice.toString(), chatId: chatId.toString(), fromActionSheet: 'true', productId: productId.toString() }
                    })
                  }
                } catch (e) {
                  console.error("Failed to send offer", e);
                }
              }
            }}
            disabled={!valid}
            className={`h-14 rounded-full justify-center items-center mt-5 bg-[#1DB954] ${!valid ? 'opacity-35' : ''}`}
          >
            <Text className="text-black text-[15px] font-bold tracking-wide">
              {valid ? `Send Offer · ${fmt(num)}` : 'Send Offer'}
            </Text>
          </Pressable>

          <Text className="text-[#535353] text-[11px] text-center mt-3 leading-4">
            The seller can accept, decline, or counter your offer.
          </Text>
        </BottomSheetView>
      ) : null}
    </BottomSheet>
  )
})

MarketplaceActionSheet.displayName = 'MarketplaceActionSheet'

const styles = StyleSheet.create({
  avatarRing: {
    width: 46, height: 46, borderRadius: 23,
    padding: 2,
    borderWidth: 2, borderColor: C.neonPink,
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.neonPink + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: C.neonPink, fontWeight: '800', fontSize: 16 },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: C.neonGreen,
    borderWidth: 2, borderColor: C.bg,
  },
  verifiedBadge: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: C.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: C.border },
  miniAvatar: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.neonPink + '22',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  miniAvatarText: { color: C.neonPink, fontSize: 10, fontWeight: '800' },
  bubble: {
    maxWidth: '72%',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleMe: {
    backgroundColor: C.accent,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: C.surface2,
    borderBottomLeftRadius: 4,
  },
  footer: {
    paddingTop: 10, paddingHorizontal: 12,
    backgroundColor: C.bg,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  input: {
    flex: 1, height: 44, borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: C.surface2,
    color: C.white, fontSize: 14,
    borderWidth: 1, borderColor: C.border,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.accent,
    justifyContent: 'center', alignItems: 'center',
  },
})

export default MarketplaceActionSheet
