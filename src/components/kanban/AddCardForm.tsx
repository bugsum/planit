"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";
import { CalendarIcon, PlusIcon } from "@/components/ui/Icons";
import { LABEL_CLASSES, PRIORITY_CLASSES, PRIORITY_LABELS, formatDate } from "@/helpers/board";
import { QUICK_ADD_HINT, parseQuickAdd } from "@/helpers/quick-add";
import { useBoardActions } from "@/store/boards";
import type { Label } from "@/types/kanban";

type Props = {
  boardId: string;
  columnId: string;
  labels: Label[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddCardForm({ boardId, columnId, labels, open, onOpenChange }: Props) {
  const actions = useBoardActions();
  const [input, setInput] = useState("");

  const parsed = parseQuickAdd(input, labels);
  const parsedLabels = parsed.labelIds
    .map((id) => labels.find((label) => label.id === id))
    .filter((label): label is Label => Boolean(label));
  const hasTokens = parsedLabels.length > 0 || parsed.priority !== null || parsed.dueDate !== null;

  function submit() {
    if (!parsed.title) return;
    actions.addCard(boardId, columnId, parsed.title, {
      labelIds: parsed.labelIds,
      ...(parsed.priority ? { priority: parsed.priority } : {}),
      ...(parsed.dueDate ? { dueDate: parsed.dueDate } : {}),
    });
    setInput("");
  }

  function close() {
    setInput("");
    onOpenChange(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
      >
        <PlusIcon width={14} height={14} />
        Add card
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <TextArea
        autoFocus
        rows={2}
        placeholder="What needs doing?"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onBlur={() => {
          if (!input.trim()) close();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
          if (event.key === "Escape") close();
        }}
      />

      {hasTokens ? (
        <div className="flex flex-wrap items-center gap-1.5" aria-live="polite">
          {parsed.priority ? (
            <Badge className={PRIORITY_CLASSES[parsed.priority]}>
              {PRIORITY_LABELS[parsed.priority]}
            </Badge>
          ) : null}
          {parsedLabels.map((label) => (
            <Badge key={label.id} className={LABEL_CLASSES[label.color]}>
              {label.name}
            </Badge>
          ))}
          {parsed.dueDate ? (
            <Badge className="border-line-strong bg-white/[0.03] text-zinc-400">
              <CalendarIcon width={11} height={11} />
              {formatDate(parsed.dueDate)}
            </Badge>
          ) : null}
        </div>
      ) : (
        <p className="px-0.5 font-mono text-[11px] text-zinc-600">{QUICK_ADD_HINT}</p>
      )}

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="primary"
          disabled={!parsed.title}
          onMouseDown={(event) => event.preventDefault()}
          onClick={submit}
        >
          Add card
        </Button>
        <Button size="sm" variant="ghost" onClick={close}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
