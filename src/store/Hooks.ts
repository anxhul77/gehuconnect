// ─────────────────────────────────────────────
//  src/store/hooks.ts
//  Typed wrappers around plain Redux hooks.
//  Import these everywhere instead of the raw
//  useDispatch / useSelector from react-redux.
// ─────────────────────────────────────────────

import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { AppDispatch, RootState } from "./Store";

/**
 * Pre-typed dispatch — includes thunk middleware types.
 * Usage: const dispatch = useAppDispatch()
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * Pre-typed selector — gives full autocomplete on state shape.
 * Usage: const userId = useAppSelector(s => s.auth.userId)
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;