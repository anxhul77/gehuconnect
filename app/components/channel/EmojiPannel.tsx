// ─────────────────────────────────────────────
//  EmojiPanel.tsx
//  Plain animated View — NOT a BottomSheet.
//  Slides up from bottom, same height as keyboard.
// ─────────────────────────────────────────────

import React, { memo, useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Reanimated, { useAnimatedStyle, interpolate } from "react-native-reanimated";
import { FlashList, ListRenderItem } from "@shopify/flash-list";

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
  height: number;
  animValue: Reanimated.SharedValue<number>;
}

export default memo(function EmojiPanel({ onSelect, height, animValue }: Props) {
  const [activeCategory, setActiveCategory] = useState(0);
  const { width } = useWindowDimensions();
  const cellSize = Math.floor((width - 32) / NUM_COLS);

  const animStyle = useAnimatedStyle(() => ({
    height: height,
    transform: [
      { translateY: interpolate(animValue.value, [0, 1], [height, 0]) },
    ],
    opacity: interpolate(animValue.value, [0, 0.3, 1], [0, 1, 1]),
  }));

  const renderEmoji = useCallback<ListRenderItem<string>>(
    ({ item }) => (
      <Pressable
        onPress={() => onSelect(item)}
        style={[styles.emojiCell, { width: cellSize, height: cellSize }]}
      >
        <Text style={styles.emoji}>{item}</Text>
      </Pressable>
    ),
    [onSelect, cellSize]
  );

  const emojis = CATEGORIES[activeCategory].emojis;

  return (
    <Reanimated.View style={[styles.container, animStyle]}>
      {/* Category tabs */}
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

      {/* Emoji grid */}
      <FlashList
        data={emojis}
        keyExtractor={(e, i) => `${e}-${i}`}
        renderItem={renderEmoji}
        numColumns={NUM_COLS}
        estimatedItemSize={cellSize}
        contentContainerStyle={styles.grid}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      />
    </Reanimated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E1F22",
    overflow: "hidden",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2E3035",
    gap: 2,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 5,
    borderRadius: 6,
  },
  tabActive: { backgroundColor: "#2B2D31" },
  tabLabel: { fontSize: 18 },
  grid: { paddingHorizontal: 8, paddingTop: 4, paddingBottom: 16 },
  emojiCell: { alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 26 },
});