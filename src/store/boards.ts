"use client";

import { useEffect } from "react";
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
import { planitStorage, subscribeToExternalChanges } from "@/helpers/storage";
import type { Board, Card, ChecklistItem, Label, LabelColor } from "@/types/kanban";

const STORAGE_KEY = "planit.kanban.v1";
const HISTORY_LIMIT = 100;
const COALESCE_MS = 1000;

type History = {
  past: Board[];
  future: Board[];
  lastKey: string | null;
  lastAt: number;
};

type BoardsState = {
  boards: Record<string, Board>;
  boardOrder: string[];
  history: Record<string, History>;
  createBoard: (name: string) => string;
  renameBoard: (boardId: string, name: string) => void;
  deleteBoard: (boardId: string) => void;
  duplicateBoard: (boardId: string) => string | null;
  importBoard: (board: Board) => string;
  addColumn: (boardId: string, title: string) => string;
  renameColumn: (boardId: string, columnId: string, title: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  moveColumn: (boardId: string, columnId: string, toIndex: number) => void;
  setWipLimit: (boardId: string, columnId: string, limit: number | null) => void;
  addCard: (boardId: string, columnId: string, title: string) => string;
  updateCard: (boardId: string, cardId: string, patch: Partial<Card>) => void;
  duplicateCard: (boardId: string, cardId: string) => string | null;
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
  addChecklistItem: (boardId: string, cardId: string, text: string, index?: number) => string;
  updateChecklistItem: (
    boardId: string,
    cardId: string,
    itemId: string,
    patch: Partial<Pick<ChecklistItem, "text" | "done">>,
  ) => void;
  removeChecklistItem: (boardId: string, cardId: string, itemId: string) => void;
  moveChecklistItem: (boardId: string, cardId: string, itemId: string, toIndex: number) => void;
  undo: (boardId: string) => void;
  redo: (boardId: string) => void;
};

/** Return `false` to signal "nothing changed": no history entry, no timestamp bump. */
type Recipe = (board: Board) => void | false;

export const useBoardsStore = create<BoardsState>()(
  persist(
    immer<BoardsState>((set, get) => {
      /**
       * Every board edit goes through here so it lands in undo history. Edits
       * sharing a `key` within a second (typing into a card field) collapse
       * into one undo step instead of one per keystroke.
       */
      const edit = (boardId: string, recipe: Recipe, key?: string) => {
        const before = get().boards[boardId];
        if (!before) return;

        set((state) => {
          const board = state.boards[boardId];
          if (recipe(board) === false) return;
          board.updatedAt = new Date().toISOString();

          const history = (state.history[boardId] ??= {
            past: [],
            future: [],
            lastKey: null,
            lastAt: 0,
          });
          const now = Date.now();
          const coalesce =
            key !== undefined && key === history.lastKey && now - history.lastAt < COALESCE_MS;
          if (!coalesce) {
            history.past.push(before);
            if (history.past.length > HISTORY_LIMIT) history.past.shift();
          }
          history.future = [];
          history.lastKey = key ?? null;
          history.lastAt = now;
        });
      };

      const addBoard = (board: Board) => {
        set((state) => {
          state.boards[board.id] = board;
          state.boardOrder.unshift(board.id);
        });
        return board.id;
      };

      return {
        boards: {},
        boardOrder: [],
        history: {},

        createBoard: (name) => addBoard(buildBoard(name.trim() || "Untitled board")),

        renameBoard: (boardId, name) =>
          edit(boardId, (board) => {
            const next = name.trim();
            if (!next || next === board.name) return false;
            board.name = next;
          }),

        deleteBoard: (boardId) =>
          set((state) => {
            delete state.boards[boardId];
            delete state.history[boardId];
            state.boardOrder = state.boardOrder.filter((id) => id !== boardId);
          }),

        duplicateBoard: (boardId) => {
          const source = get().boards[boardId];
          return source ? addBoard(cloneBoard(source, `${source.name} (copy)`)) : null;
        },

        importBoard: (board) => addBoard(cloneBoard(board, board.name)),

        addColumn: (boardId, title) => {
          const column = createColumn(title.trim() || "New column");
          edit(boardId, (board) => {
            board.columns.push(column);
          });
          return column.id;
        },

        renameColumn: (boardId, columnId, title) =>
          edit(boardId, (board) => {
            const column = board.columns.find((c) => c.id === columnId);
            const next = title.trim();
            if (!column || !next || next === column.title) return false;
            column.title = next;
          }),

        deleteColumn: (boardId, columnId) =>
          edit(boardId, (board) => {
            const column = board.columns.find((c) => c.id === columnId);
            if (!column) return false;
            for (const cardId of column.cardIds) delete board.cards[cardId];
            board.columns = board.columns.filter((c) => c.id !== columnId);
          }),

        moveColumn: (boardId, columnId, toIndex) =>
          edit(boardId, (board) => {
            const from = board.columns.findIndex((c) => c.id === columnId);
            const to = Math.max(0, Math.min(toIndex, board.columns.length - 1));
            if (from < 0 || from === to) return false;
            board.columns = moveInArray(board.columns, from, to);
          }),

        setWipLimit: (boardId, columnId, limit) =>
          edit(boardId, (board) => {
            const column = board.columns.find((c) => c.id === columnId);
            const next = limit && limit > 0 ? limit : null;
            if (!column || column.wipLimit === next) return false;
            column.wipLimit = next;
          }),

        addCard: (boardId, columnId, title) => {
          const card = createCard(title.trim());
          edit(boardId, (board) => {
            const column = board.columns.find((c) => c.id === columnId);
            if (!column) return false;
            board.cards[card.id] = card;
            column.cardIds.push(card.id);
          });
          return card.id;
        },

        updateCard: (boardId, cardId, patch) =>
          edit(
            boardId,
            (board) => {
              const card = board.cards[cardId];
              if (!card) return false;
              Object.assign(card, patch, { updatedAt: new Date().toISOString() });
            },
            `card:${cardId}:${Object.keys(patch).sort().join(",")}`,
          ),

        duplicateCard: (boardId, cardId) => {
          const source = get().boards[boardId]?.cards[cardId];
          if (!source) return null;
          const now = new Date().toISOString();
          const copy: Card = {
            ...source,
            id: newId("card"),
            labelIds: [...source.labelIds],
            checklist: source.checklist.map((item) => ({ ...item, id: newId("item") })),
            createdAt: now,
            updatedAt: now,
          };
          edit(boardId, (board) => {
            const column = board.columns.find((c) => c.cardIds.includes(cardId));
            if (!column) return false;
            board.cards[copy.id] = copy;
            column.cardIds.splice(column.cardIds.indexOf(cardId) + 1, 0, copy.id);
          });
          return copy.id;
        },

        deleteCard: (boardId, cardId) =>
          edit(boardId, (board) => {
            if (!board.cards[cardId]) return false;
            delete board.cards[cardId];
            for (const column of board.columns) {
              column.cardIds = column.cardIds.filter((id) => id !== cardId);
            }
          }),

        moveCard: (boardId, cardId, toColumnId, toIndex) =>
          edit(boardId, (board) => {
            const target = board.columns.find((c) => c.id === toColumnId);
            const source = board.columns.find((c) => c.cardIds.includes(cardId));
            if (!target || !source) return false;

            const from = source.cardIds.indexOf(cardId);
            const sameColumn = source.id === target.id;
            const limit = target.cardIds.length - (sameColumn ? 1 : 0);
            const index = Math.max(0, Math.min(toIndex, limit));
            if (sameColumn && index === from) return false;

            source.cardIds.splice(from, 1);
            target.cardIds.splice(index, 0, cardId);
          }),

        addLabel: (boardId, name, color) =>
          edit(boardId, (board) => {
            board.labels.push({ id: newId("label"), name: name.trim() || "Label", color });
          }),

        updateLabel: (boardId, labelId, patch) =>
          edit(boardId, (board) => {
            const label = board.labels.find((l) => l.id === labelId);
            if (!label) return false;
            Object.assign(label, patch);
          }),

        deleteLabel: (boardId, labelId) =>
          edit(boardId, (board) => {
            if (!board.labels.some((l) => l.id === labelId)) return false;
            board.labels = board.labels.filter((l) => l.id !== labelId);
            for (const card of Object.values(board.cards)) {
              card.labelIds = card.labelIds.filter((id) => id !== labelId);
            }
          }),

        addChecklistItem: (boardId, cardId, text, index) => {
          const item: ChecklistItem = { id: newId("item"), text, done: false };
          edit(boardId, (board) => {
            const card = board.cards[cardId];
            if (!card) return false;
            const at = Math.max(0, Math.min(index ?? card.checklist.length, card.checklist.length));
            card.checklist.splice(at, 0, item);
            card.updatedAt = new Date().toISOString();
          });
          return item.id;
        },

        updateChecklistItem: (boardId, cardId, itemId, patch) =>
          edit(
            boardId,
            (board) => {
              const card = board.cards[cardId];
              const item = card?.checklist.find((i) => i.id === itemId);
              if (!card || !item) return false;
              const unchanged =
                (patch.text === undefined || patch.text === item.text) &&
                (patch.done === undefined || patch.done === item.done);
              if (unchanged) return false;
              Object.assign(item, patch);
              card.updatedAt = new Date().toISOString();
            },
            patch.text !== undefined ? `item:${itemId}:text` : undefined,
          ),

        removeChecklistItem: (boardId, cardId, itemId) =>
          edit(boardId, (board) => {
            const card = board.cards[cardId];
            if (!card?.checklist.some((i) => i.id === itemId)) return false;
            card.checklist = card.checklist.filter((i) => i.id !== itemId);
            card.updatedAt = new Date().toISOString();
          }),

        moveChecklistItem: (boardId, cardId, itemId, toIndex) =>
          edit(boardId, (board) => {
            const card = board.cards[cardId];
            if (!card) return false;
            const from = card.checklist.findIndex((i) => i.id === itemId);
            const to = Math.max(0, Math.min(toIndex, card.checklist.length - 1));
            if (from < 0 || from === to) return false;
            card.checklist = moveInArray(card.checklist, from, to);
            card.updatedAt = new Date().toISOString();
          }),

        undo: (boardId) => {
          const current = get().boards[boardId];
          const past = get().history[boardId]?.past;
          const previous = past?.[past.length - 1];
          if (!current || !previous) return;
          set((state) => {
            const history = state.history[boardId];
            history.past.pop();
            history.future.push(current);
            history.lastKey = null;
            state.boards[boardId] = previous;
          });
        },

        redo: (boardId) => {
          const current = get().boards[boardId];
          const future = get().history[boardId]?.future;
          const next = future?.[future.length - 1];
          if (!current || !next) return;
          set((state) => {
            const history = state.history[boardId];
            history.future.pop();
            history.past.push(current);
            history.lastKey = null;
            state.boards[boardId] = next;
          });
        },
      };
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => planitStorage),
      skipHydration: true,
      partialize: (state) =>
        ({ boards: state.boards, boardOrder: state.boardOrder }) as BoardsState,
      migrate: (persisted, version) => {
        const state = persisted as Pick<BoardsState, "boards" | "boardOrder">;
        // v2 added card checklists.
        if (version < 2) {
          for (const board of Object.values(state.boards ?? {})) {
            for (const card of Object.values(board.cards)) card.checklist ??= [];
          }
        }
        return state as BoardsState;
      },
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

export function useUndoState(boardId: string) {
  return useBoardsStore(
    useShallow((state) => ({
      canUndo: (state.history[boardId]?.past.length ?? 0) > 0,
      canRedo: (state.history[boardId]?.future.length ?? 0) > 0,
    })),
  );
}

/**
 * Reloads boards when another tab saves, so two tabs never silently overwrite
 * each other. Undo history is dropped: its snapshots predate the other tab's
 * edits, and undoing would quietly revert them.
 */
export function useBoardsSync() {
  useEffect(
    () =>
      subscribeToExternalChanges(STORAGE_KEY, () => {
        void Promise.resolve(useBoardsStore.persist.rehydrate()).then(() =>
          useBoardsStore.setState({ history: {} }),
        );
      }),
    [],
  );
}

/**
 * Actions never change identity, so components can call them without
 * subscribing to the whole store (which would re-render on every edit).
 */
export function useBoardActions() {
  return useBoardsStore.getState();
}

export function boardActions() {
  return useBoardsStore.getState();
}

/** Latest board at call time, for event handlers that build menus lazily. */
export function getBoard(boardId: string): Board | undefined {
  return useBoardsStore.getState().boards[boardId];
}
