"use client";

import { useEffect, useRef } from "react";
import { create } from "zustand";
import type { Command, MenuRequest, OpenMenu } from "@/types/ui";

type CardOpener = { boardId: string; open: (cardId: string) => void };

type UiState = {
  menu: OpenMenu | null;
  shortcutsOpen: boolean;
  paletteOpen: boolean;
  /** Commands contributed by the current page (a board, the boards list, later a mindmap). */
  commandProvider: (() => Command[]) | null;
  /** Lets the palette open a card on the board that is already on screen. */
  cardOpener: CardOpener | null;
  /** Set by the palette's "New board" when it has to navigate to the boards list first. */
  pendingNewBoard: boolean;
  openMenu: (menu: MenuRequest) => void;
  closeMenu: () => void;
  setShortcutsOpen: (open: boolean) => void;
  setPaletteOpen: (open: boolean) => void;
};

let menuCount = 0;

export const useUiStore = create<UiState>()((set) => ({
  menu: null,
  shortcutsOpen: false,
  paletteOpen: false,
  commandProvider: null,
  cardOpener: null,
  pendingNewBoard: false,
  openMenu: (menu) => set({ menu: { ...menu, id: ++menuCount } }),
  closeMenu: () => set({ menu: null }),
  setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen, menu: null }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen, menu: null }),
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

export function openPalette() {
  useUiStore.getState().setPaletteOpen(true);
}

/**
 * Registers the current page's commands for the palette. The builder runs when
 * the palette opens, so commands always reflect the latest page state.
 */
export function useRegisterCommands(build: () => Command[]) {
  const latest = useRef(build);
  useEffect(() => {
    latest.current = build;
  });

  useEffect(() => {
    const provider = () => latest.current();
    useUiStore.setState({ commandProvider: provider });
    return () => {
      if (useUiStore.getState().commandProvider === provider) {
        useUiStore.setState({ commandProvider: null });
      }
    };
  }, []);
}

export function useRegisterCardOpener(boardId: string, open: (cardId: string) => void) {
  const latest = useRef(open);
  useEffect(() => {
    latest.current = open;
  });

  useEffect(() => {
    const opener: CardOpener = { boardId, open: (cardId) => latest.current(cardId) };
    useUiStore.setState({ cardOpener: opener });
    return () => {
      if (useUiStore.getState().cardOpener === opener) {
        useUiStore.setState({ cardOpener: null });
      }
    };
  }, [boardId]);
}
