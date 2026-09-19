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
import { cardMenu } from "@/components/kanban/menus";
import { Badge } from "@/components/ui/Badge";
import { MenuButton, openContextMenu } from "@/components/ui/ContextMenu";
import { CalendarIcon } from "@/components/ui/Icons";
import {
  LABEL_CLASSES,
  PRIORITY_CLASSES,
  PRIORITY_LABELS,
  formatDate,
  isOverdue,
} from "@/helpers/board";
import { cn } from "@/helpers/cn";
import { cardDragData, isCardData } from "@/helpers/dnd";
import { getBoard } from "@/store/boards";
import type { Card, Label } from "@/types/kanban";

type Props = {
  boardId: string;
  columnId: string;
  card: Card;
  labels: Label[];
  selected: boolean;
  onSelect: (cardId: string) => void;
  onOpen: () => void;
};

const PRIORITY_STRIPE: Partial<Record<Card["priority"], string>> = {
  high: "bg-orange-400",
  urgent: "bg-red-400",
};

export function CardItem({
  boardId,
  columnId,
  card,
  labels,
  selected,
  onSelect,
  onOpen,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [edge, setEdge] = useState<Edge | null>(null);

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

  const entries = () => {
    const board = getBoard(boardId);
    return board ? cardMenu(board, card.id, { onOpen, onSelect }) : [];
  };

  const cardLabels = card.labelIds
    .map((id) => labels.find((label) => label.id === id))
    .filter((label): label is Label => Boolean(label));
  const overdue = isOverdue(card.dueDate);
  const stripe = PRIORITY_STRIPE[card.priority];

  return (
    <div className="relative" data-card-id={card.id}>
      {edge === "top" ? <DropLine position="-top-[5px]" /> : null}
      <div
        ref={ref}
        onClick={onOpen}
        onContextMenu={(event) => {
          onSelect(card.id);
          openContextMenu(event, entries());
        }}
        aria-selected={selected}
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-lg border bg-raised px-3 py-2.5 shadow-sm shadow-black/30 transition-[border-color,box-shadow,opacity]",
          selected
            ? "border-accent-light ring-3 ring-accent/30"
            : "border-line hover:border-line-strong",
          dragging && "opacity-40",
        )}
      >
        {stripe ? <span className={cn("absolute inset-y-0 left-0 w-[3px]", stripe)} /> : null}

        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
            className="min-w-0 flex-1 cursor-pointer text-left text-[13.5px] leading-snug font-semibold break-words text-zinc-100"
          >
            {card.title}
          </button>
          <MenuButton
            label={`Actions for ${card.title}`}
            entries={entries}
            className="-mt-1 -mr-1.5 h-7 w-7 group-hover:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100 [@media(hover:hover)]:opacity-0"
          />
        </div>

        {cardLabels.length > 0 || card.priority !== "none" || card.dueDate ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
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
                className={cn(
                  "border-line-strong bg-white/[0.03] text-zinc-400",
                  overdue && "border-amber-500/30 bg-amber-500/15 text-amber-300",
                )}
              >
                <CalendarIcon width={11} height={11} />
                {formatDate(card.dueDate)}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>
      {edge === "bottom" ? <DropLine position="-bottom-[5px]" /> : null}
    </div>
  );
}

function DropLine({ position }: { position: string }) {
  return (
    <div
      className={cn("absolute inset-x-1 z-10 h-0.5 rounded-full bg-accent-light", position)}
    />
  );
}
