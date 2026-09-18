"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FieldLabel, Input, Select, TextArea } from "@/components/ui/Field";
import { CloseIcon } from "@/components/ui/Icons";
import { Modal } from "@/components/ui/Modal";
import {
  LABEL_COLORS,
  LABEL_DOT_CLASSES,
  PRIORITIES,
  PRIORITY_LABELS,
  formatRelative,
} from "@/helpers/board";
import { cn } from "@/helpers/cn";
import { useBoardActions } from "@/store/boards";
import type { Card, Label, LabelColor, Priority } from "@/types/kanban";

type Props = {
  boardId: string;
  card: Card;
  labels: Label[];
  onClose: () => void;
};

export function CardDialog({ boardId, card, labels, onClose }: Props) {
  const actions = useBoardActions();
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState<LabelColor>("indigo");
  const [managingLabels, setManagingLabels] = useState(false);

  const update = (patch: Partial<Card>) => actions.updateCard(boardId, card.id, patch);

  function toggleLabel(labelId: string) {
    const next = card.labelIds.includes(labelId)
      ? card.labelIds.filter((id) => id !== labelId)
      : [...card.labelIds, labelId];
    update({ labelIds: next });
  }

  function removeLabel(label: Label) {
    if (confirm(`Delete the "${label.name}" label from every card on this board?`)) {
      actions.deleteLabel(boardId, label.id);
    }
  }

  function addLabel() {
    if (!newLabel.trim()) return;
    actions.addLabel(boardId, newLabel, newColor);
    setNewLabel("");
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={<span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Card</span>}
      footer={
        <>
          <Button
            variant="danger"
            className="mr-auto"
            onClick={() => {
              actions.deleteCard(boardId, card.id);
              onClose();
            }}
          >
            Delete card
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <input
            aria-label="Card title"
            value={card.title}
            onChange={(event) => update({ title: event.target.value })}
            className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 -mx-2 text-2xl font-extrabold tracking-tight text-zinc-50 transition-colors hover:border-line focus:border-accent/70 focus:outline-none"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Created {formatRelative(card.createdAt)} · edited {formatRelative(card.updatedAt)}
          </p>
        </div>

        <Field label="Description">
          <TextArea
            rows={5}
            placeholder="Notes, acceptance criteria, links…"
            value={card.description}
            onChange={(event) => update({ description: event.target.value })}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Priority">
            <Select
              value={card.priority}
              onChange={(event) => update({ priority: event.target.value as Priority })}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Due date">
            <Input
              type="date"
              value={card.dueDate ?? ""}
              onChange={(event) => update({ dueDate: event.target.value || null })}
            />
          </Field>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <FieldLabel>Labels</FieldLabel>
            {labels.length > 0 ? (
              <button
                type="button"
                onClick={() => setManagingLabels((value) => !value)}
                className="text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-200"
              >
                {managingLabels ? "Done editing" : "Edit labels"}
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {labels.map((label) => {
              const active = card.labelIds.includes(label.id);
              return (
                <span key={label.id} className="inline-flex">
                  <button
                    type="button"
                    aria-pressed={active}
                    disabled={managingLabels}
                    onClick={() => toggleLabel(label.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold transition-colors",
                      managingLabels ? "rounded-l-md border-r-0" : "rounded-md",
                      active
                        ? "border-accent/60 bg-accent/10 text-zinc-100"
                        : "border-line-strong text-zinc-400 hover:border-zinc-600",
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", LABEL_DOT_CLASSES[label.color])} />
                    {label.name}
                  </button>
                  {managingLabels ? (
                    <button
                      type="button"
                      aria-label={`Delete label ${label.name}`}
                      onClick={() => removeLabel(label)}
                      className="inline-flex items-center rounded-r-md border border-line-strong px-1.5 text-zinc-500 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <CloseIcon width={12} height={12} />
                    </button>
                  ) : null}
                </span>
              );
            })}
            {labels.length === 0 ? (
              <p className="text-xs text-zinc-500">No labels on this board yet.</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Input
              placeholder="New label"
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addLabel();
              }}
              className="h-9 flex-1"
            />
            <Select
              aria-label="Label color"
              value={newColor}
              onChange={(event) => setNewColor(event.target.value as LabelColor)}
              className="h-9 w-28 capitalize"
            >
              {LABEL_COLORS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </Select>
            <Button size="sm" className="h-9" disabled={!newLabel.trim()} onClick={addLabel}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
