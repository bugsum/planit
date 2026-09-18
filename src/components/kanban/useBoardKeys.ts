"use client";

import { SHORTCUTS } from "@/helpers/shortcuts";
import { downloadBoard } from "@/helpers/transfer";
import { useHotkeys } from "@/helpers/use-hotkeys";
import { boardActions, useBoardsStore } from "@/store/boards";
import type { Priority } from "@/types/kanban";

export type Lane = { columnId: string; cardIds: string[] };

type Options = {
  boardId: string;
  lanes: Lane[];
  selected: string | null;
  select: (cardId: string | null) => void;
  onOpenCard: (cardId: string) => void;
  onCardMenu: (cardId: string) => void;
  onNewCard: (columnId: string) => void;
  onNewColumn: () => void;
  onSearch: () => void;
};

const PRIORITY_BY_DIGIT: Priority[] = ["none", "low", "medium", "high", "urgent"];

/**
 * Keyboard control for a board. Selection walks the visible lanes, so it
 * follows the active filter; moves are translated back into stored order by
 * anchoring on the neighbouring visible card.
 */
export function useBoardKeys({
  boardId,
  lanes,
  selected,
  select,
  onOpenCard,
  onCardMenu,
  onNewCard,
  onNewColumn,
  onSearch,
}: Options) {
  const actions = boardActions();

  function locate() {
    if (!selected) return null;
    for (let lane = 0; lane < lanes.length; lane++) {
      const row = lanes[lane].cardIds.indexOf(selected);
      if (row >= 0) return { lane, row };
    }
    return null;
  }

  function navigate(laneStep: number, rowStep: number) {
    const at = locate();
    if (!at) {
      const first = lanes.find((lane) => lane.cardIds.length > 0)?.cardIds[0];
      if (first) select(first);
      return;
    }
    if (rowStep !== 0) {
      const ids = lanes[at.lane].cardIds;
      select(ids[Math.max(0, Math.min(at.row + rowStep, ids.length - 1))]);
      return;
    }
    for (let lane = at.lane + laneStep; lane >= 0 && lane < lanes.length; lane += laneStep) {
      const ids = lanes[lane].cardIds;
      if (ids.length > 0) {
        select(ids[Math.min(at.row, ids.length - 1)]);
        return;
      }
    }
  }

  function move(laneStep: number, rowStep: number) {
    const at = locate();
    const board = useBoardsStore.getState().boards[boardId];
    if (!at || !selected || !board) return;

    if (rowStep !== 0) {
      const lane = lanes[at.lane];
      const neighbour = lane.cardIds[at.row + rowStep];
      const column = board.columns.find((c) => c.id === lane.columnId);
      if (!neighbour || !column) return;
      actions.moveCard(boardId, selected, column.id, column.cardIds.indexOf(neighbour));
      return;
    }

    const target = lanes[at.lane + laneStep];
    const column = target && board.columns.find((c) => c.id === target.columnId);
    if (!target || !column) return;
    const anchor = target.cardIds[at.row];
    const index = anchor ? column.cardIds.indexOf(anchor) : column.cardIds.length;
    actions.moveCard(boardId, selected, column.id, index);
  }

  function remove(cardId: string) {
    const at = locate();
    const ids = at ? lanes[at.lane].cardIds : [];
    const next = at ? (ids[at.row + 1] ?? ids[at.row - 1] ?? null) : null;
    actions.deleteCard(boardId, cardId);
    select(next);
  }

  const withSelected = (run: (cardId: string) => void) => () => {
    if (selected) run(selected);
  };

  useHotkeys([
    { keys: SHORTCUTS.up.keys, handler: () => navigate(0, -1) },
    { keys: SHORTCUTS.down.keys, handler: () => navigate(0, 1) },
    { keys: SHORTCUTS.left.keys, handler: () => navigate(-1, 0) },
    { keys: SHORTCUTS.right.keys, handler: () => navigate(1, 0) },
    { keys: SHORTCUTS.moveUp.keys, handler: () => move(0, -1) },
    { keys: SHORTCUTS.moveDown.keys, handler: () => move(0, 1) },
    { keys: SHORTCUTS.moveLeft.keys, handler: () => move(-1, 0) },
    { keys: SHORTCUTS.moveRight.keys, handler: () => move(1, 0) },
    { keys: SHORTCUTS.open.keys, handler: withSelected(onOpenCard) },
    { keys: SHORTCUTS.menu.keys, handler: withSelected(onCardMenu) },
    {
      keys: SHORTCUTS.duplicate.keys,
      handler: withSelected((cardId) => {
        const copy = actions.duplicateCard(boardId, cardId);
        if (copy) select(copy);
      }),
    },
    { keys: SHORTCUTS.remove.keys, handler: withSelected(remove) },
    ...SHORTCUTS.priority.keys.map((key, digit) => ({
      keys: [key],
      handler: withSelected((cardId) =>
        actions.updateCard(boardId, cardId, { priority: PRIORITY_BY_DIGIT[digit] }),
      ),
    })),
    {
      keys: SHORTCUTS.newCard.keys,
      handler: () => {
        const at = locate();
        const columnId = at ? lanes[at.lane].columnId : lanes[0]?.columnId;
        if (columnId) onNewCard(columnId);
      },
    },
    { keys: SHORTCUTS.newColumn.keys, handler: onNewColumn },
    { keys: SHORTCUTS.search.keys, handler: onSearch },
    { keys: SHORTCUTS.undo.keys, handler: () => actions.undo(boardId) },
    { keys: SHORTCUTS.redo.keys, handler: () => actions.redo(boardId) },
    {
      keys: SHORTCUTS.exportBoard.keys,
      handler: () => {
        const board = useBoardsStore.getState().boards[boardId];
        if (board) downloadBoard(board);
      },
    },
    { keys: SHORTCUTS.escape.keys, handler: () => select(null) },
  ]);
}
