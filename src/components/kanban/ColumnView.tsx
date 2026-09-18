"use client";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/attach-closest-edge";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/extract-closest-edge";
import type { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/types";
import { useEffect, useRef, useState } from "react";
import { AddCardForm } from "@/components/kanban/AddCardForm";
import { CardItem } from "@/components/kanban/CardItem";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Menu, MenuItem, MenuSeparator } from "@/components/ui/Menu";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/helpers/cn";
import { columnDragData, columnDropData, isCardData, isColumnData } from "@/helpers/dnd";
import { useBoardActions } from "@/store/boards";
import type { Card, Column, Label } from "@/types/kanban";

type Props = {
  boardId: string;
  column: Column;
  cards: Card[];
  labels: Label[];
  columns: Column[];
  index: number;
  filtered: boolean;
  onOpenCard: (cardId: string) => void;
};

export function ColumnView({
  boardId,
  column,
  cards,
  labels,
  columns,
  index,
  filtered,
  onOpenCard,
}: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const actions = useBoardActions();

  const [dragging, setDragging] = useState(false);
  const [edge, setEdge] = useState<Edge | null>(null);
  const [cardOver, setCardOver] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [wipLimit, setWipLimit] = useState(column.wipLimit?.toString() ?? "");

  useEffect(() => {
    const element = rootRef.current;
    const handle = headerRef.current;
    if (!element || !handle) return;

    return combine(
      draggable({
        element,
        dragHandle: handle,
        getInitialData: () => ({ ...columnDragData(column.id) }),
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
      }),
      dropTargetForElements({
        element,
        getData: ({ input, source }) =>
          isColumnData(source.data)
            ? attachClosestEdge(
                { ...columnDropData(column.id) },
                { element, input, allowedEdges: ["left", "right"] },
              )
            : { ...columnDropData(column.id) },
        canDrop: ({ source }) =>
          isCardData(source.data) ||
          (isColumnData(source.data) && source.data.columnId !== column.id),
        onDrag: ({ self, source }) => {
          setEdge(isColumnData(source.data) ? extractClosestEdge(self.data) : null);
          setCardOver(isCardData(source.data));
        },
        onDragLeave: () => {
          setEdge(null);
          setCardOver(false);
        },
        onDrop: () => {
          setEdge(null);
          setCardOver(false);
        },
      }),
    );
  }, [column.id]);

  const overLimit = column.wipLimit !== null && column.cardIds.length > column.wipLimit;

  function saveSettings() {
    actions.renameColumn(boardId, column.id, title);
    const parsed = Number.parseInt(wipLimit, 10);
    actions.setWipLimit(boardId, column.id, Number.isNaN(parsed) ? null : parsed);
    setSettingsOpen(false);
  }

  return (
    <section
      ref={rootRef}
      className={cn(
        "relative flex h-full w-[85vw] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/60 sm:w-72",
        dragging && "opacity-40",
        cardOver && "border-zinc-600",
      )}
    >
      {edge === "left" ? <DropLine position="-left-1.5" /> : null}
      {edge === "right" ? <DropLine position="-right-1.5" /> : null}

      <div
        ref={headerRef}
        className="flex cursor-grab items-center justify-between gap-2 border-b border-zinc-800 px-3 py-2.5 active:cursor-grabbing"
      >
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-sm font-medium">{column.title}</h2>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[11px]",
              overLimit ? "bg-amber-500/15 text-amber-300" : "bg-zinc-800 text-zinc-400",
            )}
          >
            {column.cardIds.length}
            {column.wipLimit !== null ? `/${column.wipLimit}` : ""}
          </span>
        </div>
        <Menu label={`Column options for ${column.title}`}>
          {(close) => (
            <>
              <MenuItem
                onClick={() => {
                  setTitle(column.title);
                  setWipLimit(column.wipLimit?.toString() ?? "");
                  setSettingsOpen(true);
                  close();
                }}
              >
                Edit column
              </MenuItem>
              <MenuItem
                disabled={index === 0}
                onClick={() => {
                  actions.moveColumn(boardId, column.id, index - 1);
                  close();
                }}
              >
                Move left
              </MenuItem>
              <MenuItem
                disabled={index === columns.length - 1}
                onClick={() => {
                  actions.moveColumn(boardId, column.id, index + 1);
                  close();
                }}
              >
                Move right
              </MenuItem>
              <MenuSeparator />
              <MenuItem
                danger
                onClick={() => {
                  if (
                    column.cardIds.length === 0 ||
                    confirm(
                      `Delete "${column.title}" and its ${column.cardIds.length} cards?`,
                    )
                  ) {
                    actions.deleteColumn(boardId, column.id);
                  }
                  close();
                }}
              >
                Delete column
              </MenuItem>
            </>
          )}
        </Menu>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            boardId={boardId}
            columnId={column.id}
            card={card}
            labels={labels}
            columns={columns}
            onOpen={() => onOpenCard(card.id)}
          />
        ))}
        {cards.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-zinc-600">
            {filtered ? "No cards match the filter" : "Drop cards here"}
          </p>
        ) : null}
      </div>

      <div className="border-t border-zinc-800 p-2">
        <AddCardForm boardId={boardId} columnId={column.id} />
      </div>

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Edit column"
        footer={
          <>
            <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveSettings}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
              Title
            </span>
            <Input
              className="w-full"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
              WIP limit
            </span>
            <Input
              className="w-full"
              type="number"
              min={0}
              placeholder="No limit"
              value={wipLimit}
              onChange={(event) => setWipLimit(event.target.value)}
            />
            <span className="text-xs text-zinc-500">
              Leave empty for no limit. Going over the limit turns the count amber.
            </span>
          </label>
        </div>
      </Modal>
    </section>
  );
}

function DropLine({ position }: { position: string }) {
  return (
    <div className={cn("absolute inset-y-0 z-10 w-0.5 rounded bg-indigo-500", position)} />
  );
}
