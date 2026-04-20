// ─────────────────────────────────────────────
//  EmojiPicker.tsx
//  BottomSheetModal sized to last keyboard height.
//  Uses Keyboard.addListener — safe in Expo Go.
// ─────────────────────────────────────────────

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  forwardRef,
} from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Keyboard,
  useWindowDimensions,
  Platform,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

const FALLBACK_HEIGHT = 280;

const CATEGORIES = [
  { label: "😊", name: "Smileys", emojis: ["😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓"] },
  { label: "👋", name: "People", emojis: ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","💪","👶","🧒","👦","👧","🧑","👱","👨","🧔","👩","🧓","👴","👵","🧏","💆","💇","🚶","🧍","🧎","🏃","💃","🕺","🧖","🧗","🏋️","🤸","⛹️","🏊","🚴","🧘"] },
  { label: "🐶", name: "Animals", emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🦗","🐢","🐍","🦎","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🐊","🐆","🐅","🦓","🦍","🦧","🦣","🐘","🦛"] },
  { label: "🍕", name: "Food", emojis: ["🍏","🍎","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🥪","🥙","🌮","🌯","🥗","🥘","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍘","🍥"] },
  { label: "⚽", name: "Activity", emojis: ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🏓","🏸","🥊","🥋","🎽","🛹","🛼","🛷","⛸️","🥌","🎿","⛷️","🏂","🪂","🏋️","🤼","🤸","⛹️","🤺","🏇","🧘","🏄","🏊","🚴","🏆","🥇","🥈","🥉","🏅","🎖️","🎪","🤹","🎭","🩰","🎨","🎬","🎤","🎧","🎼","🎹","🥁","🪘","🎷","🎺","🎸","🪕","🎻","🎲","♟️","🎯"] },
  { label: "🚀", name: "Travel", emojis: ["🚗","🚕","🚙","🚌","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🏍️","🛵","🚲","🛴","🛹","⛽","🚨","🚥","🚦","🛑","🚧","⚓","🛟","⛵","🛶","🚤","🛳️","⛴️","🚢","✈️","🛩️","🛫","🛬","💺","🚁","🛰️","🚀","🛸","🌍","🌎","🌏","🗺️","🧭","🏔️","⛰️","🌋","🗻","🏕️","🏖️","🏜️","🏝️","🏟️","🏛️","🏗️","🧱","🏘️","🏚️","🏠"] },
  { label: "💡", name: "Objects", emojis: ["⌚","📱","💻","⌨️","🖥️","🖨️","🖱️","💽","💾","💿","📷","📸","📹","🎥","📞","☎️","📺","📻","⏰","🕰️","⌛","📡","🔋","🔌","💡","🔦","🕯️","🔑","🗝️","🔐","🔒","🔓","🔨","⛏️","⚒️","🛠️","🔧","🔩","⚙️","🔗","⛓️","🧲","🪜","🧪","🧫","🧬","🔭","🔬","🩺","💊","🩹","🩻","🚪","🪑","🚽","🪠","🚿","🛁","🪒","🧴"] },
  { label: "❤️", name: "Symbols", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❤️‍🔥","❤️‍🩹","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉️","✡️","🔯","☸️","☯️","🛐","⛎","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆔","⚛️","🉑","☢️","☣️","📴","📳","🈶","🈚","🈸","🈺","🈷️","✴️","🆚","💮","🉐","㊙️","㊗️","🈴"] },
];

const NUM_COLS = 8;

interface Props {
  onSelect: (emoji: string) => void;
  onChange?: (index: number) => void;
}

const EmojiPicker = forwardRef<BottomSheetModal, Props>(({ onSelect, onChange }, ref) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const { width, height: screenH } = useWindowDimensions();
  const cellSize = Math.floor((width - 32) / NUM_COLS);

  // Track keyboard height via JS listener — safe in Expo Go, no worklets
  const [snapHeight, setSnapHeight] = useState(FALLBACK_HEIGHT);
  const snapHeightRef = useRef(FALLBACK_HEIGHT);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const sub = Keyboard.addListener(showEvent, (e) => {
      const h = Math.round(e.endCoordinates.height);
      if (h > 100) {
        snapHeightRef.current = h;
        setSnapHeight(h);
      }
    });
    return () => sub.remove();
  }, []);

  // snapPoints as absolute pixel value so sheet = keyboard height exactly
  const snapPoints = useMemo(
    () => [snapHeight],
    [snapHeight]
  );

  const renderEmoji = useCallback(
    ({ item }: { item: string }) => (
      <Pressable
        onPress={() => onSelect(item)}
        style={[styles.cell, { width: cellSize, height: cellSize }]}
      >
        <Text style={styles.emoji}>{item}</Text>
      </Pressable>
    ),
    [onSelect, cellSize]
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.handle}
      onChange={onChange}
      // Don't let the sheet itself manage keyboard — we do it manually
      keyboardBehavior="extend"
      keyboardBlurBehavior="none"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView>
        <View style={styles.tabs}>
          {CATEGORIES.map((cat, i) => (
            <Pressable
              key={cat.name}
              onPress={() => setActiveCategory(i)}
              style={[styles.tab, activeCategory === i && styles.tabActive]}
            >
              <Text style={styles.tabLabel}>{cat.label}</Text>
            </Pressable>
          ))}
        </View>
      </BottomSheetView>

      <BottomSheetFlatList
        data={CATEGORIES[activeCategory].emojis}
        keyExtractor={(e, i) => `${e}${i}`}
        renderItem={renderEmoji}
        numColumns={NUM_COLS}
        contentContainerStyle={styles.grid}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      />
    </BottomSheetModal>
  );
});

export default EmojiPicker;

const styles = StyleSheet.create({
  sheet: { backgroundColor: "#1E1F22" },
  handle: { backgroundColor: "#4E5058" },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 6,
    gap: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2E3035",
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 5, borderRadius: 6 },
  tabActive: { backgroundColor: "#2B2D31" },
  tabLabel: { fontSize: 18 },
  grid: { paddingHorizontal: 8, paddingTop: 4, paddingBottom: 24 },
  cell: { alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 26 },
});