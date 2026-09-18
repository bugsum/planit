"use client";

import { create } from "zustand";
import type { MenuRequest, OpenMenu } from "@/types/ui";

type UiState = {
  menu: OpenMenu | null;
  shortcutsOpen: boolean;
  openMenu: (menu: MenuRequest) => void;
  closeMenu: () => void;
  setShortcutsOpen: (open: boolean) => void;
};

let menuCount = 0;

export const useUiStore = create<UiState>()((set) => ({
  menu: null,
  shortcutsOpen: false,
  openMenu: (menu) => set({ menu: { ...menu, id: ++menuCount } }),
  closeMenu: () => set({ menu: null }),
  setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen, menu: null }),
}));

export function openMenu(menu: MenuRequest) {
  useUiStore.getState().openMenu(menu);
}

export function closeMenu() {
  useUiStore.getState().closeMenu();
}

export function openShortcuts() {
  useUiStore.getState().setShortcutsOpen(true);
}
