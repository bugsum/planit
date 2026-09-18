"use client";

import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/extract-closest-edge";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CardDialog } from "@/components/kanban/CardDialog";
import { ColumnView } from "@/components/kanban/ColumnView";
import { FilterBar } from "@/components/kanban/FilterBar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Menu, MenuItem, MenuSeparator } from "@/components/ui/Menu";
import { isFilterActive, matchesFilters } from "@/helpers/board";
import { isCardData, isColumnData, isColumnDropData } from "@/helpers/dnd";
import { downloadBoard } from "@/helpers/transfer";
import { useHydrated } from "@/helpers/use-hydrated";
import { useBoard, useBoardActions, useBoardsStore } from "@/store/boards";
import type { BoardFilters } from "@/types/kanban";

const NO_FILTERS: BoardFilters = { query: "", labelIds: [], priority: "all" };

export function BoardView({ boardId }: { boardId: string }) {
  const router = useRouter();
  const hydrated = useHydrated(useBoardsStore);
  const board = useBoard(boardId);
  const actions = useBoardActions();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<BoardFilters>(NO_FILTERS);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState("");
  const [addingColumn, setAddingColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState("");

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    return combine(
      autoScrollForElements({ element: scroller }),
      monitorForElements({
        onDrop: ({ source, location }) => {
          const target = location.current.dropTargets[0];
          if (!target) return;

          const current = useBoardsStore.getState().boards[boardId];
          if (!current) return;

          if (isCardData(source.data)) {
            const from = current.columns.find((column) =>
              column.cardIds.includes(source.data.cardId as string),
            );
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

            const fromIndex = from.cardIds.indexOf(source.data.cardId as string);
            if (from.id === toColumnId && fromIndex < toIndex) toIndex -= 1;
            actions.moveCard(boardId, source.data.cardId as string, toColumnId, toIndex);
            return;
          }

          if (isColumnData(source.data)) {
            if (!isColumnDropData(target.data)) return;
            const targetId = target.data.columnId;
            const fromIndex = current.columns.findIndex(
              (column) => column.id === source.data.columnId,
            );
            const targetIndex = current.columns.findIndex(
              (column) => column.id === targetId,
            );
            if (fromIndex < 0 || targetIndex < 0) return;

            let toIndex =
              targetIndex + (extractClosestEdge(target.data) === "right" ? 1 : 0);
            if (fromIndex < toIndex) toIndex -= 1;
            actions.moveColumn(boardId, source.data.columnId as string, toIndex);
          }
        },
      }),
    );
  }, [boardId, actions]);

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-900" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-20 text-center sm:px-6">
        <p className="text-zinc-300">That board does not exist.</p>
        <Link
          href="/kanban"
          className="mt-4 inline-block text-sm text-indigo-400 hover:underline"
        >
          Back to boards
        </Link>
      </div>
    );
  }

  const filtering = isFilterActive(filters);
  const openCard = openCardId ? board.cards[openCardId] : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link href="/kanban" className="text-sm text-zinc-500 hover:text-zinc-300">
              Boards
            </Link>
            <span className="text-zinc-700">/</span>
            {renaming ? (
              <Input
                autoFocus
                value={name}
                className="h-8 w-56"
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
              <button
                type="button"
                onClick={() => {
                  setName(board.name);
                  setRenaming(true);
                }}
                className="truncate text-lg font-semibold tracking-tight"
              >
                {board.name}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setAddingColumn(true)}>
              Add column
            </Button>
            <Menu label="Board options">
              {(close) => (
                <>
                  <MenuItem
                    onClick={() => {
                      downloadBoard(board);
                      close();
                    }}
                  >
                    Export JSON
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      actions.duplicateBoard(boardId);
                      close();
                    }}
                  >
                    Duplicate board
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem
                    danger
                    onClick={() => {
                      if (confirm(`Delete "${board.name}"? This cannot be undone.`)) {
                        actions.deleteBoard(boardId);
                        router.push("/kanban");
                      }
                      close();
                    }}
                  >
                    Delete board
                  </MenuItem>
                </>
              )}
            </Menu>
          </div>
        </div>

        <div className="mt-4">
          <FilterBar labels={board.labels} filters={filters} onChange={setFilters} />
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex min-h-0 flex-1 snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-8 sm:snap-none sm:px-6"
      >
        {board.columns.map((column, index) => (
          <ColumnView
            key={column.id}
            boardId={boardId}
            column={column}
            columns={board.columns}
            labels={board.labels}
            index={index}
            filtered={filtering}
            cards={column.cardIds
              .map((cardId) => board.cards[cardId])
              .filter((card) => card && matchesFilters(card, filters))}
            onOpenCard={setOpenCardId}
          />
        ))}

        <div className="w-[85vw] shrink-0 snap-start sm:w-72">
          {addingColumn ? (
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
              <Input
                autoFocus
                className="w-full"
                placeholder="Column title"
                value={columnTitle}
                onChange={(event) => setColumnTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    actions.addColumn(boardId, columnTitle);
                    setColumnTitle("");
                    setAddingColumn(false);
                  }
                  if (event.key === "Escape") setAddingColumn(false);
                }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    actions.addColumn(boardId, columnTitle);
                    setColumnTitle("");
                    setAddingColumn(false);
                  }}
                >
                  Add
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setAddingColumn(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingColumn(true)}
              className="w-full rounded-lg border border-dashed border-zinc-800 px-3 py-3 text-sm text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300"
            >
              + Add column
            </button>
          )}
        </div>
      </div>

      {openCard ? (
        <CardDialog
          boardId={boardId}
          card={openCard}
          labels={board.labels}
          onClose={() => setOpenCardId(null)}
        />
      ) : null}
    </div>
  );
}
