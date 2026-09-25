"use client";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { NODE_CLASSES } from "@/helpers/mindmap";
import type { LaidOutNode } from "@/helpers/mindmap-layout";
import { wrapText } from "@/helpers/mindmap-layout";
import { cn } from "@/helpers/cn";

export type NodeDragData = { kind: "mindmap-node"; nodeId: string };

export function isNodeDragData(data: Record<string | symbol, unknown>): data is NodeDragData {
  return data.kind === "mindmap-node";
}

type Props = {
  box: LaidOutNode;
  isRoot: boolean;
  selected: boolean;
  editing: boolean;
  onSelect: () => void;
  onStartEdit: () => void;
  onCommitEdit: (text: string) => void;
  onCancelEdit: () => void;
  onToggleCollapse: () => void;
  onContextMenu: (event: MouseEvent<HTMLElement>) => void;
};

export function MapNode({
  box,
  isRoot,
  selected,
  editing,
  onSelect,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onToggleCollapse,
  onContextMenu,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [over, setOver] = useState(false);
  const [draft, setDraft] = useState(box.node.text);

  useEffect(() => {
    const element = ref.current;
    if (!element || editing) return;

    return combine(
      draggable({
        element,
        canDrag: () => !isRoot,
        getInitialData: (): NodeDragData => ({ kind: "mindmap-node", nodeId: box.id }),
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) => isNodeDragData(source.data) && source.data.nodeId !== box.id,
        onDragEnter: () => setOver(true),
        onDragLeave: () => setOver(false),
        onDrop: () => setOver(false),
      }),
    );
  }, [box.id, isRoot, editing]);

  const lines = wrapText(box.node.text);
  const palette = box.node.color ? NODE_CLASSES[box.node.color] : null;

  return (
    <div
      ref={ref}
      data-node-id={box.id}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        setDraft(box.node.text);
        onStartEdit();
      }}
      onContextMenu={onContextMenu}
      aria-selected={selected}
      className={cn(
        "absolute flex cursor-pointer items-center justify-center rounded-xl border px-3 text-center transition-colors",
        isRoot ? "border-accent-light bg-accent/15 font-extrabold" : "font-semibold",
        !isRoot && (palette ?? "border-line-strong bg-raised"),
        selected && "ring-3 ring-accent/40",
        over && "border-accent-light ring-3 ring-accent-light/40",
        dragging && "opacity-40",
      )}
      style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
    >
      {editing ? (
        <input
          autoFocus
          aria-label="Node text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => onCommitEdit(draft)}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "Enter") {
              event.preventDefault();
              onCommitEdit(draft);
            }
            if (event.key === "Escape") {
              event.preventDefault();
              onCancelEdit();
            }
          }}
          className="w-full bg-transparent text-center text-[13px] font-semibold text-zinc-50 focus:outline-none"
        />
      ) : (
        <span className="text-[13px] leading-5 text-zinc-100">
          {lines.map((line, index) => (
            <span key={index} className="block">
              {line}
            </span>
          ))}
        </span>
      )}

      {box.hasChildren ? (
        <button
          type="button"
          aria-label={box.node.collapsed ? "Expand branch" : "Collapse branch"}
          onClick={(event) => {
            event.stopPropagation();
            onToggleCollapse();
          }}
          className={cn(
            "absolute top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-canvas font-mono text-[11px] leading-none text-zinc-400 transition-colors hover:border-accent-light hover:text-zinc-100",
            box.side === "left" ? "-left-2.5" : "-right-2.5",
          )}
        >
          {box.node.collapsed ? "+" : "−"}
        </button>
      ) : null}

      {box.node.notes.trim() ? (
        <span
          title="Has notes"
          className="absolute -top-1.5 -right-1.5 h-2.5 w-2.5 rounded-full bg-accent-light"
        />
      ) : null}
    </div>
  );
}
