// ─────────────────────────────────────────────
//  useInputPanel.ts
//
//  Manages the WhatsApp-style toggle between:
//  - Keyboard open, no panel
//  - Panel open (attachment or emoji), no keyboard
//  - Both closed
//
//  The "panel height" is locked to the keyboard height
//  so the input bar never jumps when switching modes.
// ─────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, Platform } from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import { useSharedValue, withTiming, runOnJS } from "react-native-reanimated";

export type PanelMode = "none" | "attachment" | "emoji";

const PANEL_HEIGHT_FALLBACK = 280; // used before keyboard has been opened once
const ANIM_DURATION = 250;

export function useInputPanel() {
  const [mode, setMode] = useState<PanelMode>("none");
  const modeRef = useRef<PanelMode>("none"); // worklet-safe ref

  // Height the panel should occupy — locked to keyboard height once known
  const [panelHeight, setPanelHeight] = useState(PANEL_HEIGHT_FALLBACK);
  const lastKeyboardHeight = useRef(PANEL_HEIGHT_FALLBACK);

  // Animated value driving the panel slide (0 = hidden, 1 = visible)
  const panelAnim = useSharedValue(0);

  // ── Track keyboard height ─────────────────────────────────────────────
  useKeyboardHandler(
    {
      onEnd: (e) => {
        "worklet";
        if (e.height > 0) {
          // Keyboard opened — save its height for panel sizing
          runOnJS(setLastKbHeight)(e.height);
        }
      },
    },
    []
  );

  const setLastKbHeight = useCallback((h: number) => {
    lastKeyboardHeight.current = h;
    // Only update panelHeight if no panel is open (avoid jump mid-animation)
    if (modeRef.current === "none") {
      setPanelHeight(h);
    }
  }, []);

  // ── Internal helpers ──────────────────────────────────────────────────
  const showPanel = useCallback((next: PanelMode) => {
    modeRef.current = next;
    setMode(next);
    setPanelHeight(lastKeyboardHeight.current);
    panelAnim.value = withTiming(1, { duration: ANIM_DURATION });
  }, [panelAnim]);

  const hidePanel = useCallback(() => {
    panelAnim.value = withTiming(0, { duration: ANIM_DURATION });
    // Wait for animation before clearing mode so it doesn't flicker
    setTimeout(() => {
      modeRef.current = "none";
      setMode("none");
    }, ANIM_DURATION);
  }, [panelAnim]);

  // ── Public API ────────────────────────────────────────────────────────

  /** Open the attachment panel, closing keyboard if open */
  const openAttachment = useCallback(() => {
    Keyboard.dismiss();
    showPanel("attachment");
  }, [showPanel]);

  /** Open the emoji panel, closing keyboard if open */
  const openEmoji = useCallback(() => {
    Keyboard.dismiss();
    showPanel("emoji");
  }, [showPanel]);

  /**
   * Called when the TextInput is focused.
   * If a panel is open, close it — keyboard will open naturally.
   */
  const onInputFocus = useCallback(() => {
    if (modeRef.current !== "none") {
      hidePanel();
    }
  }, [hidePanel]);

  /** Close whatever is open */
  const closeAll = useCallback(() => {
    Keyboard.dismiss();
    hidePanel();
  }, [hidePanel]);

  /** True when a panel OR keyboard is providing bottom space */
  const isOpen = mode !== "none";

  return {
    mode,
    panelHeight,
    panelAnim,
    openAttachment,
    openEmoji,
    onInputFocus,
    closeAll,
    isOpen,
  };
}