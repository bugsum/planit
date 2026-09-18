"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";
import { useBoardActions } from "@/store/boards";

export function AddCardForm({
  boardId,
  columnId,
}: {
  boardId: string;
  columnId: string;
}) {
  const actions = useBoardActions();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  function submit() {
    if (!title.trim()) return;
    actions.addCard(boardId, columnId, title);
    setTitle("");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-500 transition-colors hover:bg-zinc-800/60 hover:text-zinc-300"
      >
        + Add card
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <TextArea
        className="w-full"
        autoFocus
        rows={2}
        placeholder="What needs doing?"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
          if (event.key === "Escape") {
            setTitle("");
            setOpen(false);
          }
        }}
      />
      <div className="flex items-center gap-2">
        <Button size="sm" variant="primary" onClick={submit}>
          Add
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setTitle("");
            setOpen(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
