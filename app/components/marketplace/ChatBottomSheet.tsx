import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, StyleSheet, Pressable, View, Keyboard, Animated, BackHandler } from "react-native";
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SELLER = { name: "Rohan", initial: "R", rating: "4.8" }

// Spotify-style vibrant palette on black
const C = {
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  surface2: '#242424',
  border: '#2A2A2A',
  accent: '#FF6B35',       // your brand orange
  neonPink: '#FF2D78',     // spotify-style vibrant
  neonGreen: '#1DB954',
  white: '#FFFFFF',
  muted: '#535353',
  textSec: '#B3B3B3',
}

const ChatFooter = ({
  props, footerPadding, onChangeText, onSend,
}: {
  props: BottomSheetFooterProps;
  footerPadding: Animated.Value;
  onChangeText: (t: string) => void;
  onSend: () => void;
}) => (
  <BottomSheetFooter {...props}>
    <Animated.View style={[styles.footer, { paddingBottom: footerPadding }]}>
      <BottomSheetTextInput
        onChangeText={onChangeText}
        placeholder="Type a message..."
        placeholderTextColor={C.muted}
        style={styles.input}
      />
      <Pressable onPress={onSend} style={styles.sendBtn}>
        <Ionicons name="send" size={17} color={C.white} />
      </Pressable>
    </Animated.View>
  </BottomSheetFooter>
)

const ChatBottomSheet = forwardRef<BottomSheet>((_props, ref) => {
  const insets = useSafeAreaInsets()
  const [messages, setMessages] = useState([
    { id: "1", text: "Hi is this available?", from: "them" },
    { id: "2", text: "Yes! Barely used, battery at 95%.", from: "me" },
    { id: "3", text: "Can you do ₹58,000?", from: "them" },
  ])

  const chatMsgRef = useRef("")
  const footerPadding = useRef(new Animated.Value(insets.bottom)).current
  const sheetIndexRef = useRef(-1)
  const snapPoints = useMemo(() => ['60%', '95%'], [])

  const handleChangeText = useCallback((t: string) => { chatMsgRef.current = t }, [])

  const handleSend = useCallback(() => {
    if (!chatMsgRef.current.trim()) return
    setMessages((prev) => [...prev, { id: Date.now().toString(), text: chatMsgRef.current, from: "me" }])
    chatMsgRef.current = ""
  }, [])

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      Animated.timing(footerPadding, { toValue: 8, duration: 0, useNativeDriver: false }).start()
    })
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(footerPadding, { toValue: insets.bottom, duration: 0, useNativeDriver: false }).start()
      if (ref && typeof ref !== "function" && ref?.current) ref.current.snapToIndex(0)
    })
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (sheetIndexRef.current >= 0 && ref && typeof ref !== "function" && ref?.current) {
        ref.current.close()
        return true
      }
      return false
    })
    return () => { showSub.remove(); hideSub.remove(); backHandler.remove() }
  }, [])

  const footerComponent = useCallback(
    (props: BottomSheetFooterProps) => (
      <ChatFooter props={props} footerPadding={footerPadding} onChangeText={handleChangeText} onSend={handleSend} />
    ), []
  )

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      animateOnMount={false}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      enableContentPanningGesture={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onChange={(index) => { sheetIndexRef.current = index }}
      backgroundStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: C.bg }}
      handleStyle={{ paddingTop: 12 }}
      handleIndicatorStyle={{ backgroundColor: C.surface2, width: 36, height: 4, borderRadius: 2 }}
      footerComponent={footerComponent}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        {/* Avatar with neon pink ring */}
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{SELLER.initial}</Text>
          </View>
          <View style={styles.onlineDot} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-white font-bold text-base">{SELLER.name}</Text>
            {/* Verified badge */}
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
    </BottomSheet>
  )
})

ChatBottomSheet.displayName = 'ChatBottomSheet'

const styles = StyleSheet.create({
  // Header
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

  // Bubbles
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

  // Footer
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

export default ChatBottomSheet