"use client";

import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/extract-closest-edge";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { CardDialog } from "@/components/kanban/CardDialog";
import { ColumnView } from "@/components/kanban/ColumnView";
import { FilterBar, NO_FILTERS } from "@/components/kanban/FilterBar";
import { boardMenu, cardMenu } from "@/components/kanban/menus";
import { useBoardKeys, type Lane } from "@/components/kanban/useBoardKeys";
import { Button, IconButton } from "@/components/ui/Button";
import { MenuButton, openContextMenu, openMenuAtElement } from "@/components/ui/ContextMenu";
import { Input } from "@/components/ui/Field";
import { MouseIcon, PlusIcon, RedoIcon, UndoIcon } from "@/components/ui/Icons";
import { Kbd } from "@/components/ui/Kbd";
import { countCards, formatRelative, isFilterActive, matchesFilters } from "@/helpers/board";
import { isCardData, isColumnData, isColumnDropData } from "@/helpers/dnd";
import { commandsFromMenu } from "@/helpers/menu";
import { SHORTCUTS, formatCombo } from "@/helpers/shortcuts";
import { useHydrated } from "@/helpers/use-hydrated";
import { useIsMac, wantsNativeMenu } from "@/helpers/use-hotkeys";
import {
  getBoard,
  useBoard,
  useBoardActions,
  useBoardsStore,
  useUndoState,
} from "@/store/boards";
import { useRegisterCardOpener, useRegisterCommands } from "@/store/ui";
import type { BoardFilters } from "@/types/kanban";

function cardElement(cardId: string) {
  return document.querySelector(`[data-card-id="${CSS.escape(cardId)}"]`);
}

type Props = {
  boardId: string;
  /** From `?card=`, set when the command palette jumps to a card on another board. */
  initialCardId?: string;
};

export function BoardView({ boardId, initialCardId }: Props) {
  const router = useRouter();
  const hydrated = useHydrated(useBoardsStore);
  const board = useBoard(boardId);
  const actions = useBoardActions();
  const { canUndo, canRedo } = useUndoState(boardId);
  const mac = useIsMac();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const columnInputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState<BoardFilters>(NO_FILTERS);
  const [openCardId, setOpenCardId] = useState<string | null>(initialCardId ?? null);
  const [selectedId, setSelectedId] = useState<string | null>(initialCardId ?? null);
  const [composerColumnId, setComposerColumnId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState("");
  const [addingColumn, setAddingColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState("");

  const lanes: Lane[] = useMemo(() => {
    if (!board) return [];
    return board.columns.map((column) => ({
      columnId: column.id,
      cardIds: column.cardIds.filter((cardId) => {
        const card = board.cards[cardId];
        return card !== undefined && matchesFilters(card, filters);
      }),
    }));
  }, [board, filters]);

  // A selection that got filtered out, deleted or undone simply stops existing.
  const selected =
    selectedId && lanes.some((lane) => lane.cardIds.includes(selectedId)) ? selectedId : null;
  const selectedSpot = selected
    ? lanes.map((lane) => lane.cardIds.indexOf(selected)).join(",")
    : "";

  useEffect(() => {
    if (selected) cardElement(selected)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selected, selectedSpot]);

  // The scroller only exists once the store has hydrated and the board was found.
  const ready = hydrated && board !== undefined;

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!ready || !scroller) return;

    return combine(
      autoScrollForElements({ element: scroller }),
      monitorForElements({
        onDrop: ({ source, location }) => {
          const target = location.current.dropTargets[0];
          const current = getBoard(boardId);
          if (!target || !current) return;

          if (isCardData(source.data)) {
            const cardId = source.data.cardId;
            const from = current.columns.find((column) => column.cardIds.includes(cardId));
            if (!from) return;

            const targetData = target.data;
            let toColumnId: string;
            let toIndex: number;

            if (isCardData(targetData)) {
              const to = current.columns.find((column) =>
                column.cardIds.includes(targetData.cardId),
              );
              if (!to) return;
              toColumnId = to.id;
              toIndex =
                to.cardIds.indexOf(targetData.cardId) +
                (extractClosestEdge(targetData) === "bottom" ? 1 : 0);
            } else if (isColumnDropData(targetData)) {
              const to = current.columns.find((column) => column.id === targetData.columnId);
              if (!to) return;
              toColumnId = to.id;
              toIndex = to.cardIds.length;
            } else {
              return;
            }

            const fromIndex = from.cardIds.indexOf(cardId);
            if (from.id === toColumnId && fromIndex < toIndex) toIndex -= 1;
            actions.moveCard(boardId, cardId, toColumnId, toIndex);
            setSelectedId(cardId);
            return;
          }

          if (isColumnData(source.data) && isColumnDropData(target.data)) {
            const columnId = source.data.columnId;
            const targetId = target.data.columnId;
            const fromIndex = current.columns.findIndex((column) => column.id === columnId);
            const targetIndex = current.columns.findIndex((column) => column.id === targetId);
            if (fromIndex < 0 || targetIndex < 0) return;

            let toIndex = targetIndex + (extractClosestEdge(target.data) === "right" ? 1 : 0);
            if (fromIndex < toIndex) toIndex -= 1;
            actions.moveColumn(boardId, columnId, toIndex);
          }
        },
      }),
    );
  }, [boardId, actions, ready]);

  function openCard(cardId: string) {
    setSelectedId(cardId);
    setOpenCardId(cardId);
  }

  function focusSearch() {
    searchRef.current?.focus();
    searchRef.current?.select();
  }

  function startNewColumn() {
    if (addingColumn) columnInputRef.current?.focus();
    else setAddingColumn(true);
  }

  function startRename() {
    const current = getBoard(boardId);
    if (!current) return;
    setName(current.name);
    setRenaming(true);
  }

  function addColumn() {
    actions.addColumn(boardId, columnTitle);
    setColumnTitle("");
    setAddingColumn(false);
  }

  function openCardMenu(cardId: string) {
    const element = cardElement(cardId);
    const current = getBoard(boardId);
    if (!element || !current) return;
    openMenuAtElement(
      element,
      cardMenu(current, cardId, { onOpen: () => openCard(cardId), onSelect: setSelectedId }),
    );
  }

  function boardEntries() {
    const current = getBoard(boardId);
    return current
      ? boardMenu(current, {
          onNewColumn: startNewColumn,
          onSearch: focusSearch,
          onRename: startRename,
          onDeleted: () => router.push("/kanban"),
        })
      : [];
  }

  function onCanvasMenu(event: MouseEvent<HTMLDivElement>) {
    const fromKeyboard = event.clientX === 0 && event.clientY === 0;
    if (fromKeyboard && selected && !wantsNativeMenu(event.target)) {
      event.preventDefault();
      openCardMenu(selected);
      return;
    }
    openContextMenu(event, boardEntries());
  }

  useBoardKeys({
    boardId,
    lanes,
    selected,
    select: setSelectedId,
    onOpenCard: openCard,
    onCardMenu: openCardMenu,
    onNewCard: setComposerColumnId,
    onNewColumn: startNewColumn,
    onSearch: focusSearch,
  });

  useRegisterCommands(() => [
    {
      id: "board:new-card",
      title: "New card",
      group: "This board",
      shortcut: SHORTCUTS.newCard.keys[0],
      run: () => {
        const lane = lanes.find((l) => selected && l.cardIds.includes(selected)) ?? lanes[0];
        if (lane) setComposerColumnId(lane.columnId);
      },
    },
    ...commandsFromMenu(boardEntries(), "This board"),
  ]);
  useRegisterCardOpener(boardId, openCard);

  // The card id only needs to seed state once; drop it so reloads and shares stay clean.
  useEffect(() => {
    if (initialCardId) router.replace(`/kanban/${boardId}`, { scroll: false });
  }, [initialCardId, boardId, router]);

  if (!hydrated) {
    return (
      <div className="px-4 pt-8 sm:px-6">
        <div className="h-3 w-24 animate-pulse rounded bg-raised" />
        <div className="mt-3 h-8 w-64 animate-pulse rounded-lg bg-raised" />
        <div className="mt-8 flex gap-3">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-72 w-72 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-24 text-center">
        <p className="text-2xl font-extrabold tracking-tight">Board not found</p>
        <p className="mt-2 text-sm text-zinc-400">
          It may have been deleted, or it lives in another browser.
        </p>
        <Link
          href="/kanban"
          className="mt-6 inline-block text-sm font-semibold text-accent-light hover:text-white"
        >
          ← Back to boards
        </Link>
      </div>
    );
  }

  const filtering = isFilterActive(filters);
  const visibleCount = lanes.reduce((sum, lane) => sum + lane.cardIds.length, 0);
  const openCardData = openCardId ? board.cards[openCardId] : undefined;
  const modKey = mac ? "⌘" : "Ctrl";
  const shiftKey = mac ? "⇧" : "Shift";

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col" onContextMenu={onCanvasMenu}>
      <header className="shrink-0 px-4 pt-6 pb-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href="/kanban"
              className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase transition-colors hover:text-zinc-300"
            >
              ← All boards
            </Link>
            {renaming ? (
              <Input
                autoFocus
                aria-label="Board name"
                value={name}
                className="mt-1 h-10 w-72 max-w-full text-xl font-extrabold tracking-tight"
                onChange={(event) => setName(event.target.value)}
                onBlur={() => {
                  actions.renameBoard(boardId, name);
                  setRenaming(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                  if (event.key === "Escape") setRenaming(false);
                }}
              />
            ) : (
              <h1 className="mt-1">
                <button
                  type="button"
                  onClick={startRename}
                  title="Rename board"
                  className="max-w-full truncate text-left text-2xl font-extrabold tracking-tight transition-colors hover:text-white sm:text-3xl"
                >
                  {board.name}
                </button>
              </h1>
            )}
            <p className="mt-1 text-[13px] font-medium text-zinc-500">
              {board.columns.length} columns · {countCards(board)} cards
              {filtering ? ` · ${visibleCount} shown` : ""} · edited{" "}
              {formatRelative(board.updatedAt)}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <IconButton
              aria-label="Undo"
              title={`Undo (${formatCombo(SHORTCUTS.undo.keys[0], mac)})`}
              disabled={!canUndo}
              onClick={() => actions.undo(boardId)}
            >
              <UndoIcon />
            </IconButton>
            <IconButton
              aria-label="Redo"
              title={`Redo (${formatCombo(SHORTCUTS.redo.keys[0], mac)})`}
              disabled={!canRedo}
              onClick={() => actions.redo(boardId)}
            >
              <RedoIcon />
            </IconButton>
            <span className="mx-1.5 h-5 w-px bg-line" />
            <Button size="sm" onClick={startNewColumn}>
              <PlusIcon width={14} height={14} />
              Column
            </Button>
            <MenuButton label="Board actions" entries={boardEntries} />
          </div>
        </div>

        <div className="mt-5">
          <FilterBar
            labels={board.labels}
            filters={filters}
            onChange={setFilters}
            searchRef={searchRef}
          />
        </div>
      </header>

      <div
        ref={scrollerRef}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedId(null);
        }}
        className="flex min-h-0 flex-1 snap-x snap-mandatory items-start gap-3 overflow-x-auto px-4 pb-4 sm:snap-none sm:px-6"
      >
        {board.columns.map((column, index) => (
          <ColumnView
            key={column.id}
            boardId={boardId}
            column={column}
            labels={board.labels}
            filtered={filtering}
            cards={lanes[index].cardIds.map((cardId) => board.cards[cardId])}
            selectedId={selected}
            composerOpen={composerColumnId === column.id}
            onComposerChange={(open) => setComposerColumnId(open ? column.id : null)}
            onSelectCard={setSelectedId}
            onOpenCard={openCard}
          />
        ))}

        <div className="w-[85vw] shrink-0 snap-start sm:w-[18.5rem]">
          {addingColumn ? (
            <div className="space-y-2 rounded-xl border border-line bg-surface/80 p-2.5">
              <Input
                ref={columnInputRef}
                autoFocus
                placeholder="Column title"
                value={columnTitle}
                onChange={(event) => setColumnTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addColumn();
                  if (event.key === "Escape") setAddingColumn(false);
                }}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={addColumn}>
                  Add column
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setAddingColumn(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={startNewColumn}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line px-3 py-3 text-[13px] font-semibold text-zinc-500 transition-colors hover:border-line-strong hover:text-zinc-200"
            >
              <PlusIcon width={14} height={14} />
              Add column
            </button>
          )}
        </div>
      </div>

      <footer className="hidden shrink-0 flex-wrap items-center gap-x-5 gap-y-1 border-t border-line px-6 py-2 text-[11px] font-medium text-zinc-500 md:flex">
        <Hint keys={["↑", "↓", "←", "→"]} label="Select" />
        <Hint keys={[shiftKey, "↑↓←→"]} label="Move" />
        <Hint keys={["Enter"]} label="Open" />
        <Hint keys={["N"]} label="New card" />
        <Hint keys={[modKey, "Z"]} label="Undo" />
        <span className="inline-flex items-center gap-1.5">
          <MouseIcon width={13} height={13} />
          Right-click for actions
        </span>
        <span className="ml-auto">
          <Hint keys={["?"]} label="All shortcuts" />
        </span>
      </footer>

      {openCardData ? (
        <CardDialog
          boardId={boardId}
          card={openCardData}
          labels={board.labels}
          onClose={() => setOpenCardId(null)}
        />
      ) : null}
    </div>
  );
}

function Hint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-0.5">
        {keys.map((key) => (
          <Kbd key={key}>{key}</Kbd>
        ))}
      </span>
      {label}
    </span>
  );
}
