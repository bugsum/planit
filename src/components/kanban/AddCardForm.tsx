"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";
import { PlusIcon } from "@/components/ui/Icons";
import { useBoardActions } from "@/store/boards";

type Props = {
  boardId: string;
  columnId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddCardForm({ boardId, columnId, open, onOpenChange }: Props) {
  const actions = useBoardActions();
  const [title, setTitle] = useState("");

  function submit() {
    if (!title.trim()) return;
    actions.addCard(boardId, columnId, title);
    setTitle("");
  }

  function close() {
    setTitle("");
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
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onBlur={() => {
          if (!title.trim()) close();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
          if (event.key === "Escape") close();
        }}
      />
      <div className="flex items-center gap-2">
        <Button size="sm" variant="primary" onMouseDown={(event) => event.preventDefault()} onClick={submit}>
          Add card
        </Button>
        <Button size="sm" variant="ghost" onClick={close}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
