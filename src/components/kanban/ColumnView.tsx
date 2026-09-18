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
import { columnMenu } from "@/components/kanban/menus";
import { Button } from "@/components/ui/Button";
import { MenuButton, openContextMenu } from "@/components/ui/ContextMenu";
import { Field, Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/helpers/cn";
import { columnDragData, columnDropData, isCardData, isColumnData } from "@/helpers/dnd";
import { getBoard, useBoardActions } from "@/store/boards";
import type { Card, Column, Label } from "@/types/kanban";

type Props = {
  boardId: string;
  column: Column;
  cards: Card[];
  labels: Label[];
  filtered: boolean;
  selectedId: string | null;
  composerOpen: boolean;
  onComposerChange: (open: boolean) => void;
  onSelectCard: (cardId: string) => void;
  onOpenCard: (cardId: string) => void;
};

export function ColumnView({
  boardId,
  column,
  cards,
  labels,
  filtered,
  selectedId,
  composerOpen,
  onComposerChange,
  onSelectCard,
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
  const [wipLimit, setWipLimit] = useState("");

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

  function openSettings() {
    setTitle(column.title);
    setWipLimit(column.wipLimit?.toString() ?? "");
    setSettingsOpen(true);
  }

  function saveSettings() {
    actions.renameColumn(boardId, column.id, title);
    const parsed = Number.parseInt(wipLimit, 10);
    actions.setWipLimit(boardId, column.id, Number.isNaN(parsed) ? null : parsed);
    setSettingsOpen(false);
  }

  const entries = () => {
    const board = getBoard(boardId);
    return board
      ? columnMenu(board, column.id, {
          onAddCard: () => onComposerChange(true),
          onEdit: openSettings,
        })
      : [];
  };

  return (
    <section
      ref={rootRef}
      onContextMenu={(event) => openContextMenu(event, entries())}
      className={cn(
        "relative flex max-h-full w-[85vw] shrink-0 snap-start flex-col rounded-xl border bg-surface/80 transition-colors sm:w-[18.5rem]",
        cardOver ? "border-accent/50 bg-accent/[0.04]" : "border-line",
        dragging && "opacity-40",
      )}
    >
      {edge === "left" ? <DropLine position="-left-[7px]" /> : null}
      {edge === "right" ? <DropLine position="-right-[7px]" /> : null}

      <div
        ref={headerRef}
        onDoubleClick={openSettings}
        className="flex cursor-grab items-center justify-between gap-2 py-2.5 pr-2 pl-3.5 active:cursor-grabbing"
      >
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-[13px] font-extrabold tracking-wide text-zinc-100 uppercase">
            {column.title}
          </h2>
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold",
              overLimit ? "bg-amber-500/15 text-amber-300" : "bg-white/[0.05] text-zinc-500",
            )}
          >
            {column.cardIds.length}
            {column.wipLimit !== null ? `/${column.wipLimit}` : ""}
          </span>
        </div>
        <MenuButton label={`Actions for column ${column.title}`} entries={entries} />
      </div>

      <div className="flex min-h-16 flex-1 flex-col gap-2 overflow-y-auto px-2 pt-0.5 pb-2">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            boardId={boardId}
            columnId={column.id}
            card={card}
            labels={labels}
            selected={card.id === selectedId}
            onSelect={onSelectCard}
            onOpen={() => onOpenCard(card.id)}
          />
        ))}
        {cards.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs font-medium text-zinc-600">
            {filtered ? "No cards match the filter" : "Drop cards here"}
          </p>
        ) : null}
      </div>

      <div className="px-2 pb-2">
        <AddCardForm
          boardId={boardId}
          columnId={column.id}
          open={composerOpen}
          onOpenChange={onComposerChange}
        />
      </div>

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Edit column"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveSettings}>
              Save
            </Button>
          </>
        }
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveSettings();
          }}
        >
          <Field label="Title">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </Field>
          <Field label="WIP limit">
            <Input
              type="number"
              min={0}
              placeholder="No limit"
              value={wipLimit}
              onChange={(event) => setWipLimit(event.target.value)}
            />
          </Field>
          <p className="text-xs text-zinc-500">
            Leave the limit empty for none. Going over it turns the count amber.
          </p>
          <button type="submit" hidden />
        </form>
      </Modal>
    </section>
  );
}

function DropLine({ position }: { position: string }) {
  return (
    <div className={cn("absolute inset-y-2 z-10 w-0.5 rounded-full bg-accent", position)} />
  );
}
