"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FieldLabel, Input, TextArea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/helpers/cn";
import { NODE_COLORS, NODE_STROKES, outline } from "@/helpers/mindmap";
import { useMindmapActions } from "@/store/mindmaps";
import type { Mindmap, MindmapNode } from "@/types/mindmap";

const Markdown = dynamic(() => import("@/components/kanban/Markdown").then((mod) => mod.Markdown));

type Props = {
  map: Mindmap;
  node: MindmapNode;
  onClose: () => void;
  onSendToBoard: () => void;
};

export function NodeDialog({ map, node, onClose, onSendToBoard }: Props) {
  const actions = useMindmapActions();
  const [notesMode, setNotesMode] = useState<"preview" | "edit" | "empty">(
    node.notes.trim() ? "preview" : "empty",
  );

  const update = (patch: Partial<MindmapNode>) => actions.updateNode(map.id, node.id, patch);
  const childCount = node.childIds.length;

  return (
    <Modal
      open
      onClose={onClose}
      title={<span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Node</span>}
      footer={
        <>
          {node.id !== map.rootId ? (
            <Button
              variant="danger"
              className="mr-auto"
              onClick={() => {
                actions.deleteNode(map.id, node.id);
                onClose();
              }}
            >
              Delete branch
            </Button>
          ) : null}
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Text">
          <Input value={node.text} onChange={(event) => update({ text: event.target.value })} />
        </Field>

        <div className="space-y-2">
          <FieldLabel>Color</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              aria-pressed={node.color === null}
              onClick={() => update({ color: null })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors",
                node.color === null
                  ? "border-accent-light bg-accent/10 text-zinc-100"
                  : "border-line-strong text-zinc-400 hover:border-zinc-600",
              )}
            >
              Default
            </button>
            {NODE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={color}
                aria-pressed={node.color === color}
                onClick={() => update({ color })}
                className={cn(
                  "h-7 w-7 rounded-md border transition-transform",
                  node.color === color ? "scale-110 border-zinc-100" : "border-line-strong",
                )}
                style={{ background: NODE_STROKES[color] }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <FieldLabel>Notes</FieldLabel>
            {notesMode === "preview" ? (
              <button
                type="button"
                onClick={() => setNotesMode("edit")}
                className="text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-200"
              >
                Edit
              </button>
            ) : (
              <span className="text-[11px] text-zinc-600">Markdown supported</span>
            )}
          </div>
          {notesMode === "preview" ? (
            <div
              role="button"
              tabIndex={0}
              aria-label="Edit notes"
              onClick={(event) => {
                if (!(event.target as Element).closest("a")) setNotesMode("edit");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  setNotesMode("edit");
                }
              }}
              className="-mx-3 cursor-text rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-line"
            >
              <Markdown>{node.notes}</Markdown>
            </div>
          ) : (
            <TextArea
              autoFocus={notesMode === "edit"}
              rows={6}
              placeholder="Detail that would clutter the canvas…"
              value={node.notes}
              onChange={(event) => update({ notes: event.target.value })}
              onBlur={() => {
                if (node.notes.trim()) setNotesMode("preview");
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape" && node.notes.trim()) {
                  event.preventDefault();
                  setNotesMode("preview");
                }
              }}
            />
          )}
        </div>

        <div className="rounded-xl border border-line bg-canvas/50 p-4">
          <p className="text-sm font-semibold text-zinc-200">
            {childCount === 0
              ? "This node has no children yet."
              : `This branch holds ${childCount} direct ${childCount === 1 ? "child" : "children"}.`}
          </p>
          {childCount > 0 ? (
            <pre className="mt-2 max-h-28 overflow-y-auto font-mono text-[11px] leading-relaxed text-zinc-500">
              {outline(map, node.id).slice(0, 12).join("\n")}
            </pre>
          ) : null}
          <Button size="sm" className="mt-3" onClick={onSendToBoard}>
            Send branch to a board…
          </Button>
        </div>
      </div>
    </Modal>
  );
}
