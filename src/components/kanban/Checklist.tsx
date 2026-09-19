"use client";

import { useRef, type KeyboardEvent } from "react";
import { FieldLabel } from "@/components/ui/Field";
import { CloseIcon, PlusIcon } from "@/components/ui/Icons";
import { cn } from "@/helpers/cn";
import { useBoardActions } from "@/store/boards";
import type { Card, ChecklistItem } from "@/types/kanban";

export function checklistProgress(card: Card) {
  const items = card.checklist.filter((item) => item.text.trim());
  return { done: items.filter((item) => item.done).length, total: items.length };
}

export function Checklist({ boardId, card }: { boardId: string; card: Card }) {
  const actions = useBoardActions();
  const inputs = useRef(new Map<string, HTMLInputElement>());
  // A just-added item isn't in the DOM yet; its ref callback picks up focus on mount.
  const pendingFocus = useRef<string | null>(null);
  const { done, total } = checklistProgress(card);

  const bindInput = (id: string) => (element: HTMLInputElement | null) => {
    if (!element) {
      inputs.current.delete(id);
      return;
    }
    inputs.current.set(id, element);
    if (pendingFocus.current === id) {
      pendingFocus.current = null;
      element.focus();
    }
  };

  function addItem(index?: number) {
    pendingFocus.current = actions.addChecklistItem(boardId, card.id, "", index);
  }

  function focusItem(id: string | undefined) {
    const element = id ? inputs.current.get(id) : undefined;
    if (!element) return;
    element.focus();
    element.setSelectionRange(element.value.length, element.value.length);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>, item: ChecklistItem, index: number) {
    if (event.key === "Enter") {
      event.preventDefault();
      addItem(index + 1);
    } else if (event.key === "Backspace" && item.text === "") {
      event.preventDefault();
      const neighbour = card.checklist[index - 1] ?? card.checklist[index + 1];
      actions.removeChecklistItem(boardId, card.id, item.id);
      focusItem(neighbour?.id);
    } else if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      actions.moveChecklistItem(
        boardId,
        card.id,
        item.id,
        index + (event.key === "ArrowUp" ? -1 : 1),
      );
      // Reordering moves the DOM node, which can drop focus.
      requestAnimationFrame(() => focusItem(item.id));
    }
  }

  const complete = total > 0 && done === total;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel>Checklist</FieldLabel>
        {total > 0 ? (
          <span
            className={cn(
              "font-mono text-xs font-semibold",
              complete ? "text-emerald-300" : "text-zinc-500",
            )}
          >
            {done}/{total}
          </span>
        ) : null}
      </div>

      {total > 0 ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={cn(
              "h-full rounded-full transition-[width]",
              complete ? "bg-emerald-400" : "bg-accent",
            )}
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      ) : null}

      {card.checklist.length > 0 ? (
        <ul className="space-y-0.5">
          {card.checklist.map((item, index) => (
            <li
              key={item.id}
              className="group flex items-center gap-2.5 rounded-lg px-2 transition-colors hover:bg-white/[0.03]"
            >
              <input
                type="checkbox"
                checked={item.done}
                aria-label={`Mark "${item.text || "item"}" as done`}
                onChange={(event) =>
                  actions.updateChecklistItem(boardId, card.id, item.id, {
                    done: event.target.checked,
                  })
                }
                className="h-4 w-4 shrink-0 cursor-pointer accent-accent"
              />
              <input
                ref={bindInput(item.id)}
                aria-label="Checklist item"
                value={item.text}
                placeholder="Item"
                onChange={(event) =>
                  actions.updateChecklistItem(boardId, card.id, item.id, {
                    text: event.target.value,
                  })
                }
                onKeyDown={(event) => onKeyDown(event, item, index)}
                onBlur={() => {
                  if (!item.text.trim()) actions.removeChecklistItem(boardId, card.id, item.id);
                }}
                className={cn(
                  "min-w-0 flex-1 bg-transparent py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none",
                  item.done && "text-zinc-500 line-through",
                )}
              />
              <button
                type="button"
                aria-label="Remove item"
                onClick={() => actions.removeChecklistItem(boardId, card.id, item.id)}
                className="rounded p-1 text-zinc-600 transition-colors group-hover:opacity-100 hover:text-zinc-200 focus-visible:opacity-100 [@media(hover:hover)]:opacity-0"
              >
                <CloseIcon width={12} height={12} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        onClick={() => addItem()}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
      >
        <PlusIcon width={14} height={14} />
        Add item
      </button>
      {card.checklist.length > 0 ? (
        <p className="px-2 text-[11px] text-zinc-600">
          Enter adds the next item · Backspace on an empty item removes it · Alt + ↑/↓ reorders
        </p>
      ) : null}
    </div>
  );
}
