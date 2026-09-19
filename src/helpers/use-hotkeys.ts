"use client";

import { useEffect, useEffectEvent, useSyncExternalStore } from "react";
import { isMac, matchesCombo } from "@/helpers/shortcuts";

export type Hotkey = {
  keys: string[];
  handler: (event: KeyboardEvent) => void;
  /** Also fire while a text field has focus (for app-wide shortcuts like the palette). */
  inFields?: boolean;
};

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

/** Text fields and open dialogs keep the browser's native context menu. */
export function wantsNativeMenu(target: EventTarget | null) {
  return (
    isEditableTarget(target) ||
    (target instanceof Element && target.closest("dialog[open]") !== null)
  );
}

/**
 * Binds shortcuts on window. They stay silent while the user types in a field
 * or while a modal is open, so they never fight native text editing. Handlers
 * always see the latest props without re-binding the listener.
 */
export function useHotkeys(hotkeys: Hotkey[]) {
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing) return;
    if (document.querySelector("dialog[open]")) return;

    const editing = isEditableTarget(event.target);
    const mac = isMac();
    const hotkey = hotkeys.find(
      (entry) =>
        (!editing || entry.inFields) &&
        entry.keys.some((combo) => matchesCombo(event, combo, mac)),
    );
    if (!hotkey) return;
    event.preventDefault();
    hotkey.handler(event);
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKeyDown(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
}

const noopSubscribe = () => () => {};

/** Platform-aware without a hydration mismatch: the server always renders "not mac". */
export function useIsMac() {
  return useSyncExternalStore(noopSubscribe, isMac, () => false);
}
