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
import { Badge } from "@/components/ui/Badge";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/Menu";
import {
  LABEL_CLASSES,
  PRIORITY_CLASSES,
  PRIORITY_LABELS,
  formatDate,
  isOverdue,
} from "@/helpers/board";
import { cn } from "@/helpers/cn";
import { cardDragData, isCardData } from "@/helpers/dnd";
import { useBoardActions } from "@/store/boards";
import type { Card, Column, Label } from "@/types/kanban";

type Props = {
  boardId: string;
  columnId: string;
  card: Card;
  labels: Label[];
  columns: Column[];
  onOpen: () => void;
};

export function CardItem({
  boardId,
  columnId,
  card,
  labels,
  columns,
  onOpen,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [edge, setEdge] = useState<Edge | null>(null);
  const actions = useBoardActions();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return combine(
      draggable({
        element,
        getInitialData: () => ({ ...cardDragData(card.id, columnId) }),
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) => isCardData(source.data) && source.data.cardId !== card.id,
        getData: ({ input }) =>
          attachClosestEdge(
            { ...cardDragData(card.id, columnId) },
            { element, input, allowedEdges: ["top", "bottom"] },
          ),
        onDrag: ({ self }) => setEdge(extractClosestEdge(self.data)),
        onDragLeave: () => setEdge(null),
        onDrop: () => setEdge(null),
      }),
    );
  }, [card.id, columnId]);

  // Positions come from the stored column, not the rendered list, so the move
  // actions stay correct while a filter hides some cards.
  const column = columns.find((item) => item.id === columnId);
  const index = column ? column.cardIds.indexOf(card.id) : 0;
  const count = column ? column.cardIds.length : 0;

  const cardLabels = card.labelIds
    .map((id) => labels.find((label) => label.id === id))
    .filter((label): label is Label => Boolean(label));
  const overdue = isOverdue(card.dueDate);

  return (
    <div className="relative">
      {edge === "top" ? <DropLine position="-top-1" /> : null}
      <div
        ref={ref}
        className={cn(
          "group rounded-md border border-zinc-800 bg-zinc-900 p-3 transition-colors hover:border-zinc-700",
          dragging && "opacity-40",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="flex-1 cursor-pointer text-left text-sm leading-snug text-zinc-100"
          >
            {card.title}
          </button>
          <Menu label={`Card options for ${card.title}`}>
            {(close) => (
              <>
                <MenuItem
                  onClick={() => {
                    onOpen();
                    close();
                  }}
                >
                  Open
                </MenuItem>
                <MenuItem
                  disabled={index === 0}
                  onClick={() => {
                    actions.moveCard(boardId, card.id, columnId, index - 1);
                    close();
                  }}
                >
                  Move up
                </MenuItem>
                <MenuItem
                  disabled={index === count - 1}
                  onClick={() => {
                    actions.moveCard(boardId, card.id, columnId, index + 1);
                    close();
                  }}
                >
                  Move down
                </MenuItem>
                {columns.length > 1 ? (
                  <>
                    <MenuSeparator />
                    <MenuLabel>Move to</MenuLabel>
                    {columns
                      .filter((column) => column.id !== columnId)
                      .map((column) => (
                        <MenuItem
                          key={column.id}
                          onClick={() => {
                            actions.moveCard(
                              boardId,
                              card.id,
                              column.id,
                              column.cardIds.length,
                            );
                            close();
                          }}
                        >
                          {column.title}
                        </MenuItem>
                      ))}
                  </>
                ) : null}
                <MenuSeparator />
                <MenuItem
                  danger
                  onClick={() => {
                    actions.deleteCard(boardId, card.id);
                    close();
                  }}
                >
                  Delete
                </MenuItem>
              </>
            )}
          </Menu>
        </div>

        {cardLabels.length > 0 || card.priority !== "none" || card.dueDate ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {card.priority !== "none" ? (
              <Badge className={PRIORITY_CLASSES[card.priority]}>
                {PRIORITY_LABELS[card.priority]}
              </Badge>
            ) : null}
            {cardLabels.map((label) => (
              <Badge key={label.id} className={LABEL_CLASSES[label.color]}>
                {label.name}
              </Badge>
            ))}
            {card.dueDate ? (
              <Badge
                className={
                  overdue
                    ? "border-amber-500/30 bg-amber-500/15 text-amber-300"
                    : "border-zinc-700 bg-zinc-800 text-zinc-400"
                }
              >
                {formatDate(card.dueDate)}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>
      {edge === "bottom" ? <DropLine position="-bottom-1" /> : null}
    </div>
  );
}

function DropLine({ position }: { position: string }) {
  return (
    <div className={cn("absolute inset-x-0 z-10 h-0.5 rounded bg-indigo-500", position)} />
  );
}
