"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/helpers/cn";
import { boardActions, useBoardList } from "@/store/boards";
import type { Mindmap, MindmapNode } from "@/types/mindmap";

type Mode = "checklist" | "cards";

type Props = {
  map: Mindmap;
  node: MindmapNode;
  onClose: () => void;
};

function childrenOf(map: Mindmap, node: MindmapNode) {
  return node.childIds.map((id) => map.nodes[id]).filter(Boolean);
}

/**
 * Turns a branch into Kanban work: either one card whose checklist is the
 * branch, or a card per child (its own children become that card's checklist).
 */
export function SendToBoardDialog({ map, node, onClose }: Props) {
  const router = useRouter();
  const boards = useBoardList();
  const [boardId, setBoardId] = useState(boards[0]?.id ?? "");
  const board = boards.find((candidate) => candidate.id === boardId) ?? boards[0];
  const [columnId, setColumnId] = useState(board?.columns[0]?.id ?? "");
  const [mode, setMode] = useState<Mode>("checklist");

  const children = childrenOf(map, node);
  const column = board?.columns.find((candidate) => candidate.id === columnId) ?? board?.columns[0];

  function send() {
    const actions = boardActions();
    if (!board || !column) return;

    const addCard = (source: MindmapNode) => {
      const cardId = actions.addCard(board.id, column.id, source.text || "Untitled");
      if (source.notes.trim()) actions.updateCard(board.id, cardId, { description: source.notes });
      for (const child of childrenOf(map, source)) {
        actions.addChecklistItem(board.id, cardId, child.text || "Untitled");
      }
    };

    if (mode === "checklist") addCard(node);
    else for (const child of children) addCard(child);

    onClose();
    router.push(`/kanban/${board.id}`);
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Send branch to a board"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!board || !column} onClick={send}>
            Create {mode === "checklist" ? "card" : `${children.length || 1} cards`}
          </Button>
        </>
      }
    >
      {boards.length === 0 ? (
        <p className="text-sm text-zinc-400">
          You have no Kanban boards yet. Create one first, then send this branch to it.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Board">
              <Select
                value={board?.id ?? ""}
                onChange={(event) => {
                  setBoardId(event.target.value);
                  const next = boards.find((candidate) => candidate.id === event.target.value);
                  setColumnId(next?.columns[0]?.id ?? "");
                }}
              >
                {boards.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Column">
              <Select
                value={column?.id ?? ""}
                onChange={(event) => setColumnId(event.target.value)}
              >
                {(board?.columns ?? []).map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.title}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="space-y-2">
            {(
              [
                {
                  value: "checklist" as const,
                  title: "One card, children as checklist",
                  body: `"${node.text || "Untitled"}" becomes the card; its ${children.length} ${
                    children.length === 1 ? "child" : "children"
                  } become checklist items.`,
                },
                {
                  value: "cards" as const,
                  title: "A card per child",
                  body:
                    children.length > 0
                      ? `${children.length} ${children.length === 1 ? "card" : "cards"}, each with its own children as a checklist.`
                      : "This node has no children yet.",
                },
              ] satisfies Array<{ value: Mode; title: string; body: string }>
            ).map((option) => (
              <label key={option.value} className="block cursor-pointer">
                <input
                  type="radio"
                  name="send-mode"
                  value={option.value}
                  checked={mode === option.value}
                  disabled={option.value === "cards" && children.length === 0}
                  onChange={() => setMode(option.value)}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "block rounded-xl border border-line bg-canvas/40 p-3.5 transition-colors",
                    "peer-checked:border-accent-light peer-checked:bg-accent/[0.08]",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-accent-light",
                    "peer-disabled:opacity-40 hover:border-line-strong",
                  )}
                >
                  <span className="block text-sm font-extrabold tracking-tight">
                    {option.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-zinc-400">{option.body}</span>
                </span>
              </label>
            ))}
          </div>

          <p className="text-xs text-zinc-500">
            Node notes become the card description. The map itself stays as it is.
          </p>
        </div>
      )}
    </Modal>
  );
}
