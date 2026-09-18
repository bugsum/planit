import { menuItem, menuLabel, menuSeparator } from "@/helpers/menu";
import { SHORTCUTS } from "@/helpers/shortcuts";
import { downloadBoard } from "@/helpers/transfer";
import { boardActions, useBoardsStore } from "@/store/boards";
import { openShortcuts } from "@/store/ui";
import type { Board } from "@/types/kanban";
import type { MenuEntry } from "@/types/ui";

const hint = (shortcut: { keys: string[] }) => shortcut.keys[0];

export function cardMenu(
  board: Board,
  cardId: string,
  handlers: { onOpen: () => void; onSelect: (cardId: string) => void },
): MenuEntry[] {
  const actions = boardActions();
  const column = board.columns.find((c) => c.cardIds.includes(cardId));
  if (!column) return [];
  const index = column.cardIds.indexOf(cardId);
  const others = board.columns.filter((c) => c.id !== column.id);

  return [
    menuItem("Open card", handlers.onOpen, { shortcut: hint(SHORTCUTS.open) }),
    menuItem(
      "Duplicate",
      () => {
        const copy = actions.duplicateCard(board.id, cardId);
        if (copy) handlers.onSelect(copy);
      },
      { shortcut: hint(SHORTCUTS.duplicate) },
    ),
    menuSeparator,
    menuItem("Move up", () => actions.moveCard(board.id, cardId, column.id, index - 1), {
      disabled: index === 0,
      shortcut: hint(SHORTCUTS.moveUp),
    }),
    menuItem("Move down", () => actions.moveCard(board.id, cardId, column.id, index + 1), {
      disabled: index === column.cardIds.length - 1,
      shortcut: hint(SHORTCUTS.moveDown),
    }),
    ...(others.length > 0
      ? [
          menuLabel("Move to"),
          ...others.map((target) =>
            menuItem(target.title, () =>
              actions.moveCard(board.id, cardId, target.id, target.cardIds.length),
            ),
          ),
        ]
      : []),
    menuSeparator,
    menuItem("Delete card", () => actions.deleteCard(board.id, cardId), {
      danger: true,
      shortcut: hint(SHORTCUTS.remove),
    }),
  ];
}

export function columnMenu(
  board: Board,
  columnId: string,
  handlers: { onAddCard: () => void; onEdit: () => void },
): MenuEntry[] {
  const actions = boardActions();
  const index = board.columns.findIndex((c) => c.id === columnId);
  const column = board.columns[index];
  if (!column) return [];

  return [
    menuItem("Add card", handlers.onAddCard, { shortcut: hint(SHORTCUTS.newCard) }),
    menuItem("Edit column…", handlers.onEdit),
    menuSeparator,
    menuItem("Move left", () => actions.moveColumn(board.id, columnId, index - 1), {
      disabled: index === 0,
    }),
    menuItem("Move right", () => actions.moveColumn(board.id, columnId, index + 1), {
      disabled: index === board.columns.length - 1,
    }),
    menuSeparator,
    menuItem(
      "Delete column",
      () => {
        const count = column.cardIds.length;
        if (count === 0 || confirm(`Delete "${column.title}" and its ${count} cards?`)) {
          actions.deleteColumn(board.id, columnId);
        }
      },
      { danger: true },
    ),
  ];
}

export function boardMenu(
  board: Board,
  handlers: {
    onNewColumn: () => void;
    onSearch: () => void;
    onRename: () => void;
    onDeleted: () => void;
  },
): MenuEntry[] {
  const actions = boardActions();
  const history = useBoardsStore.getState().history[board.id];

  return [
    menuItem("New column", handlers.onNewColumn, { shortcut: hint(SHORTCUTS.newColumn) }),
    menuItem("Search cards", handlers.onSearch, { shortcut: hint(SHORTCUTS.search) }),
    menuItem("Rename board", handlers.onRename),
    menuSeparator,
    menuItem("Undo", () => actions.undo(board.id), {
      disabled: !history?.past.length,
      shortcut: hint(SHORTCUTS.undo),
    }),
    menuItem("Redo", () => actions.redo(board.id), {
      disabled: !history?.future.length,
      shortcut: hint(SHORTCUTS.redo),
    }),
    menuSeparator,
    menuItem("Export as JSON", () => downloadBoard(board), {
      shortcut: hint(SHORTCUTS.exportBoard),
    }),
    menuItem("Duplicate board", () => actions.duplicateBoard(board.id)),
    menuItem("Keyboard shortcuts", openShortcuts, { shortcut: hint(SHORTCUTS.help) }),
    menuSeparator,
    menuItem(
      "Delete board",
      () => {
        if (confirm(`Delete "${board.name}"? This cannot be undone.`)) {
          actions.deleteBoard(board.id);
          handlers.onDeleted();
        }
      },
      { danger: true },
    ),
  ];
}

export function boardTileMenu(
  board: Board,
  handlers: { onOpen: () => void; onRename: () => void },
): MenuEntry[] {
  const actions = boardActions();

  return [
    menuItem("Open", handlers.onOpen),
    menuItem("Open in new tab", () => {
      window.open(`/kanban/${board.id}`, "_blank", "noopener");
    }),
    menuItem("Rename", handlers.onRename),
    menuItem("Duplicate", () => actions.duplicateBoard(board.id)),
    menuItem("Export as JSON", () => downloadBoard(board)),
    menuSeparator,
    menuItem(
      "Delete board",
      () => {
        if (confirm(`Delete "${board.name}"? This cannot be undone.`)) {
          actions.deleteBoard(board.id);
        }
      },
      { danger: true },
    ),
  ];
}

export function boardListMenu(handlers: {
  onNewBoard: () => void;
  onImport: () => void;
}): MenuEntry[] {
  return [
    menuItem("New board", handlers.onNewBoard, { shortcut: hint(SHORTCUTS.newBoard) }),
    menuItem("Import from JSON", handlers.onImport, { shortcut: hint(SHORTCUTS.importBoard) }),
    menuSeparator,
    menuItem("Keyboard shortcuts", openShortcuts, { shortcut: hint(SHORTCUTS.help) }),
  ];
}
