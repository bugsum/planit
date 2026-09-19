import type { Command, MenuEntry, MenuItemEntry } from "@/types/ui";

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

/** Menu actions double as palette commands, so both surfaces stay in sync. */
export function commandsFromMenu(entries: MenuEntry[], group: string): Command[] {
  return entries.flatMap((entry) =>
    entry.kind === "item"
      ? [
          {
            id: `${group}:${entry.label}`,
            title: entry.label.replace(/…$/, ""),
            group,
            shortcut: entry.shortcut,
            disabled: entry.disabled,
            run: entry.onSelect,
          },
        ]
      : [],
  );
}
