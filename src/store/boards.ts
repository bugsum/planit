"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";
import {
  createBoard as buildBoard,
  createCard,
  createColumn,
  moveInArray,
} from "@/helpers/board";
import { newId } from "@/helpers/id";
import { planitStorage } from "@/helpers/storage";
import type { Board, Card, Label, LabelColor } from "@/types/kanban";

type BoardsState = {
  boards: Record<string, Board>;
  boardOrder: string[];
  createBoard: (name: string) => string;
  renameBoard: (boardId: string, name: string) => void;
  deleteBoard: (boardId: string) => void;
  duplicateBoard: (boardId: string) => string | null;
  importBoard: (board: Board) => string;
  addColumn: (boardId: string, title: string) => void;
  renameColumn: (boardId: string, columnId: string, title: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  moveColumn: (boardId: string, columnId: string, toIndex: number) => void;
  setWipLimit: (boardId: string, columnId: string, limit: number | null) => void;
  addCard: (boardId: string, columnId: string, title: string) => void;
  updateCard: (boardId: string, cardId: string, patch: Partial<Card>) => void;
  deleteCard: (boardId: string, cardId: string) => void;
  moveCard: (
    boardId: string,
    cardId: string,
    toColumnId: string,
    toIndex: number,
  ) => void;
  addLabel: (boardId: string, name: string, color: LabelColor) => void;
  updateLabel: (boardId: string, labelId: string, patch: Partial<Label>) => void;
  deleteLabel: (boardId: string, labelId: string) => void;
};

function touch(board: Board | undefined) {
  if (board) board.updatedAt = new Date().toISOString();
}

export const useBoardsStore = create<BoardsState>()(
  persist(
    immer<BoardsState>((set, get) => ({
      boards: {},
      boardOrder: [],

      createBoard: (name) => {
        const board = buildBoard(name.trim() || "Untitled board");
        set((state) => {
          state.boards[board.id] = board;
          state.boardOrder.unshift(board.id);
        });
        return board.id;
      },

      renameBoard: (boardId, name) =>
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return;
          board.name = name.trim() || board.name;
          touch(board);
        }),

      deleteBoard: (boardId) =>
        set((state) => {
          delete state.boards[boardId];
          state.boardOrder = state.boardOrder.filter((id) => id !== boardId);
        }),

      duplicateBoard: (boardId) => {
        const source = get().boards[boardId];
        if (!source) return null;
        const copy = cloneBoard(source, `${source.name} (copy)`);
        set((state) => {
          state.boards[copy.id] = copy;
          state.boardOrder.unshift(copy.id);
        });
        return copy.id;
      },

      importBoard: (board) => {
        const copy = cloneBoard(board, board.name);
        set((state) => {
          state.boards[copy.id] = copy;
          state.boardOrder.unshift(copy.id);
        });
        return copy.id;
      },

      addColumn: (boardId, title) =>
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return;
          board.columns.push(createColumn(title.trim() || "New column"));
          touch(board);
        }),

      renameColumn: (boardId, columnId, title) =>
        set((state) => {
          const board = state.boards[boardId];
          const column = board?.columns.find((c) => c.id === columnId);
          if (!column) return;
          column.title = title.trim() || column.title;
          touch(board);
        }),

      deleteColumn: (boardId, columnId) =>
        set((state) => {
          const board = state.boards[boardId];
          const column = board?.columns.find((c) => c.id === columnId);
          if (!board || !column) return;
          for (const cardId of column.cardIds) delete board.cards[cardId];
          board.columns = board.columns.filter((c) => c.id !== columnId);
          touch(board);
        }),

      moveColumn: (boardId, columnId, toIndex) =>
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return;
          const from = board.columns.findIndex((c) => c.id === columnId);
          if (from < 0 || from === toIndex) return;
          board.columns = moveInArray(board.columns, from, toIndex);
          touch(board);
        }),

      setWipLimit: (boardId, columnId, limit) =>
        set((state) => {
          const board = state.boards[boardId];
          const column = board?.columns.find((c) => c.id === columnId);
          if (!column) return;
          column.wipLimit = limit && limit > 0 ? limit : null;
          touch(board);
        }),

      addCard: (boardId, columnId, title) =>
        set((state) => {
          const board = state.boards[boardId];
          const column = board?.columns.find((c) => c.id === columnId);
          if (!board || !column) return;
          const card = createCard(title.trim());
          board.cards[card.id] = card;
          column.cardIds.push(card.id);
          touch(board);
        }),

      updateCard: (boardId, cardId, patch) =>
        set((state) => {
          const board = state.boards[boardId];
          const card = board?.cards[cardId];
          if (!board || !card) return;
          Object.assign(card, patch, { updatedAt: new Date().toISOString() });
          touch(board);
        }),

      deleteCard: (boardId, cardId) =>
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return;
          delete board.cards[cardId];
          for (const column of board.columns) {
            column.cardIds = column.cardIds.filter((id) => id !== cardId);
          }
          touch(board);
        }),

      moveCard: (boardId, cardId, toColumnId, toIndex) =>
        set((state) => {
          const board = state.boards[boardId];
          const target = board?.columns.find((c) => c.id === toColumnId);
          if (!board || !target) return;
          const source = board.columns.find((c) => c.cardIds.includes(cardId));
          if (!source) return;

          source.cardIds.splice(source.cardIds.indexOf(cardId), 1);
          const index = Math.max(0, Math.min(toIndex, target.cardIds.length));
          target.cardIds.splice(index, 0, cardId);
          touch(board);
        }),

      addLabel: (boardId, name, color) =>
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return;
          board.labels.push({ id: newId("label"), name: name.trim() || "Label", color });
          touch(board);
        }),

      updateLabel: (boardId, labelId, patch) =>
        set((state) => {
          const board = state.boards[boardId];
          const label = board?.labels.find((l) => l.id === labelId);
          if (!label) return;
          Object.assign(label, patch);
          touch(board);
        }),

      deleteLabel: (boardId, labelId) =>
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return;
          board.labels = board.labels.filter((l) => l.id !== labelId);
          for (const card of Object.values(board.cards)) {
            card.labelIds = card.labelIds.filter((id) => id !== labelId);
          }
          touch(board);
        }),
    })),
    {
      name: "planit.kanban.v1",
      version: 1,
      storage: createJSONStorage(() => planitStorage),
      skipHydration: true,
      partialize: (state) =>
        ({ boards: state.boards, boardOrder: state.boardOrder }) as BoardsState,
      migrate: (persisted) => persisted as BoardsState,
    },
  ),
);

/** Re-issues every id so imported or duplicated boards can never collide. */
function cloneBoard(source: Board, name: string): Board {
  const now = new Date().toISOString();
  const cardIds = new Map<string, string>();
  const labelIds = new Map<string, string>();

  for (const id of Object.keys(source.cards)) cardIds.set(id, newId("card"));
  for (const label of source.labels) labelIds.set(label.id, newId("label"));

  const remap = (map: Map<string, string>, ids: string[]) =>
    ids.map((id) => map.get(id)).filter((id): id is string => Boolean(id));

  const cards: Record<string, Card> = {};
  for (const [oldId, card] of Object.entries(source.cards)) {
    const id = cardIds.get(oldId) as string;
    cards[id] = { ...card, id, labelIds: remap(labelIds, card.labelIds) };
  }

  return {
    id: newId("board"),
    name,
    columns: source.columns.map((column) => ({
      ...column,
      id: newId("col"),
      cardIds: remap(cardIds, column.cardIds),
    })),
    cards,
    labels: source.labels.map((label) => ({
      ...label,
      id: labelIds.get(label.id) as string,
    })),
    createdAt: now,
    updatedAt: now,
  };
}

export function useBoard(boardId: string) {
  return useBoardsStore((state) => state.boards[boardId]);
}

export function useBoardList() {
  return useBoardsStore(
    useShallow((state) =>
      state.boardOrder.map((id) => state.boards[id]).filter(Boolean),
    ),
  );
}

export function useColumn(boardId: string, columnId: string) {
  return useBoardsStore((state) =>
    state.boards[boardId]?.columns.find((column) => column.id === columnId),
  );
}

export function useCard(boardId: string, cardId: string) {
  return useBoardsStore((state) => state.boards[boardId]?.cards[cardId]);
}

/**
 * Actions never change identity, so components can call them without
 * subscribing to the whole store (which would re-render on every edit).
 */
export function useBoardActions() {
  return useBoardsStore.getState();
}
