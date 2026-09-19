export type MenuItemEntry = {
  kind: "item";
  label: string;
  onSelect: () => void;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
};

export type MenuEntry =
  | MenuItemEntry
  | { kind: "separator" }
  | { kind: "label"; label: string };

export type MenuRequest = {
  x: number;
  y: number;
  entries: MenuEntry[];
  /** "end" right-aligns the menu to x, used for menus opened from a button. */
  align?: "start" | "end";
  /** Where to flip to when the menu would overflow the bottom of the viewport. */
  flipY?: number;
  anchor?: string;
};

export type OpenMenu = MenuRequest & { id: number };

export type Command = {
  id: string;
  title: string;
  group: string;
  subtitle?: string;
  /** Extra words that should match in the palette but are not shown. */
  keywords?: string;
  shortcut?: string;
  disabled?: boolean;
  run: () => void;
};
