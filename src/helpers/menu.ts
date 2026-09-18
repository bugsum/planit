import type { MenuEntry, MenuItemEntry } from "@/types/ui";

export function menuItem(
  label: string,
  onSelect: () => void,
  options: Partial<Omit<MenuItemEntry, "kind" | "label" | "onSelect">> = {},
): MenuEntry {
  return { kind: "item", label, onSelect, ...options };
}

export function menuLabel(label: string): MenuEntry {
  return { kind: "label", label };
}

export const menuSeparator: MenuEntry = { kind: "separator" };
