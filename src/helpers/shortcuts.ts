export type ShortcutGroup = "General" | "Board" | "Navigate" | "Cards" | "Boards list";

type Shortcut = {
  keys: string[];
  label: string;
  group: ShortcutGroup;
  /** Overrides how the keys are shown in the guide, for ranges like 0–4. */
  display?: string[];
};

/**
 * Single source of truth for every keybinding. Combos are written as
 * `mod+shift+z`, where `mod` is ⌘ on macOS and Ctrl elsewhere.
 */
export const SHORTCUTS = {
  help: { keys: ["?"], label: "Show keyboard shortcuts", group: "General" },
  escape: { keys: ["Escape"], label: "Close menu or clear selection", group: "General" },
  menu: {
    keys: ["shift+F10", "ContextMenu"],
    label: "Open actions for the selected card",
    group: "General",
  },

  search: { keys: ["/", "mod+f"], label: "Search cards", group: "Board" },
  newCard: { keys: ["n"], label: "New card in current column", group: "Board" },
  newColumn: { keys: ["shift+n"], label: "New column", group: "Board" },
  undo: { keys: ["mod+z"], label: "Undo", group: "Board" },
  redo: { keys: ["mod+shift+z", "mod+y"], label: "Redo", group: "Board" },
  exportBoard: { keys: ["mod+shift+e"], label: "Export board as JSON", group: "Board" },

  up: { keys: ["ArrowUp", "k"], label: "Select card above", group: "Navigate" },
  down: { keys: ["ArrowDown", "j"], label: "Select card below", group: "Navigate" },
  left: { keys: ["ArrowLeft", "h"], label: "Select in previous column", group: "Navigate" },
  right: { keys: ["ArrowRight", "l"], label: "Select in next column", group: "Navigate" },

  open: { keys: ["Enter"], label: "Open selected card", group: "Cards" },
  moveUp: { keys: ["shift+ArrowUp"], label: "Move card up", group: "Cards" },
  moveDown: { keys: ["shift+ArrowDown"], label: "Move card down", group: "Cards" },
  moveLeft: { keys: ["shift+ArrowLeft"], label: "Move card to previous column", group: "Cards" },
  moveRight: { keys: ["shift+ArrowRight"], label: "Move card to next column", group: "Cards" },
  duplicate: { keys: ["mod+d"], label: "Duplicate card", group: "Cards" },
  remove: { keys: ["Delete", "Backspace"], label: "Delete card", group: "Cards" },
  priority: {
    keys: ["0", "1", "2", "3", "4"],
    display: ["0 – 4"],
    label: "Set priority, none to urgent",
    group: "Cards",
  },

  newBoard: { keys: ["n"], label: "New board", group: "Boards list" },
  importBoard: { keys: ["mod+o"], label: "Import board from JSON", group: "Boards list" },
} satisfies Record<string, Shortcut>;

export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  "General",
  "Board",
  "Navigate",
  "Cards",
  "Boards list",
];

export function shortcutsIn(group: ShortcutGroup): Shortcut[] {
  return Object.values(SHORTCUTS as Record<string, Shortcut>).filter(
    (shortcut) => shortcut.group === group,
  );
}

export function isMac() {
  if (typeof navigator === "undefined") return false;
  const data = (navigator as Navigator & { userAgentData?: { platform?: string } })
    .userAgentData;
  return /mac|iphone|ipad/i.test(data?.platform || navigator.userAgent);
}

function parseCombo(combo: string) {
  const parts = combo.split("+");
  const key = parts.pop() ?? "";
  return {
    key,
    mod: parts.includes("mod"),
    shift: parts.includes("shift"),
    alt: parts.includes("alt"),
  };
}

export function matchesCombo(event: KeyboardEvent, combo: string, mac: boolean) {
  const { key, mod, shift, alt } = parseCombo(combo);
  const modPressed = mac ? event.metaKey : event.ctrlKey;
  const otherPressed = mac ? event.ctrlKey : event.metaKey;
  if (modPressed !== mod || otherPressed || event.altKey !== alt) return false;

  // Symbols like "?" already imply Shift on most layouts, so Shift is not compared.
  const symbol = key.length === 1 && !/[a-z0-9]/i.test(key);
  if (!symbol && event.shiftKey !== shift) return false;

  return event.key.toLowerCase() === key.toLowerCase();
}

const KEY_NAMES: Record<string, string> = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Escape: "Esc",
  Backspace: "⌫",
  Delete: "Del",
  ContextMenu: "Menu",
};

export function comboParts(combo: string, mac: boolean) {
  const { key, mod, shift, alt } = parseCombo(combo);
  const parts: string[] = [];
  if (mod) parts.push(mac ? "⌘" : "Ctrl");
  if (alt) parts.push(mac ? "⌥" : "Alt");
  if (shift) parts.push(mac ? "⇧" : "Shift");
  parts.push(KEY_NAMES[key] ?? (key.length === 1 ? key.toUpperCase() : key));
  return parts;
}

export function formatCombo(combo: string, mac: boolean) {
  return comboParts(combo, mac).join(mac ? "" : "+");
}
