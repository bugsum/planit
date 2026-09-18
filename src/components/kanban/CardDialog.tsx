"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, TextArea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import {
  LABEL_COLORS,
  LABEL_DOT_CLASSES,
  PRIORITIES,
  PRIORITY_LABELS,
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

  const update = (patch: Partial<Card>) => actions.updateCard(boardId, card.id, patch);

  function toggleLabel(labelId: string) {
    const next = card.labelIds.includes(labelId)
      ? card.labelIds.filter((id) => id !== labelId)
      : [...card.labelIds, labelId];
    update({ labelIds: next });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Card"
      footer={
        <>
          <Button
            variant="danger"
            onClick={() => {
              actions.deleteCard(boardId, card.id);
              onClose();
            }}
          >
            Delete
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title">
          <Input
            className="w-full"
            value={card.title}
            onChange={(event) => update({ title: event.target.value })}
          />
        </Field>

        <Field label="Description">
          <TextArea
            className="w-full"
            rows={5}
            placeholder="Notes, acceptance criteria, links…"
            value={card.description}
            onChange={(event) => update({ description: event.target.value })}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Priority">
            <Select
              className="w-full"
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
              className="w-full"
              type="date"
              value={card.dueDate ?? ""}
              onChange={(event) => update({ dueDate: event.target.value || null })}
            />
          </Field>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
            Labels
          </p>
          <div className="flex flex-wrap gap-1.5">
            {labels.map((label) => {
              const active = card.labelIds.includes(label.id);
              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs transition-colors",
                    active
                      ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600",
                  )}
                >
                  <span
                    className={cn("h-2 w-2 rounded-full", LABEL_DOT_CLASSES[label.color])}
                  />
                  {label.name}
                </button>
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
              className="h-9 flex-1"
            />
            <Select
              aria-label="Label color"
              value={newColor}
              onChange={(event) => setNewColor(event.target.value as LabelColor)}
              className="h-9 w-28"
            >
              {LABEL_COLORS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              disabled={!newLabel.trim()}
              onClick={() => {
                actions.addLabel(boardId, newLabel, newColor);
                setNewLabel("");
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
