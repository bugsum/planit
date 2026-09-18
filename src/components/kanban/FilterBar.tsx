"use client";

import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { LABEL_DOT_CLASSES, PRIORITIES, PRIORITY_LABELS, isFilterActive } from "@/helpers/board";
import { cn } from "@/helpers/cn";
import type { BoardFilters, Label, Priority } from "@/types/kanban";

type Props = {
  labels: Label[];
  filters: BoardFilters;
  onChange: (filters: BoardFilters) => void;
};

export function FilterBar({ labels, filters, onChange }: Props) {
  function toggleLabel(labelId: string) {
    const labelIds = filters.labelIds.includes(labelId)
      ? filters.labelIds.filter((id) => id !== labelId)
      : [...filters.labelIds, labelId];
    onChange({ ...filters, labelIds });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="search"
        placeholder="Search cards…"
        value={filters.query}
        onChange={(event) => onChange({ ...filters, query: event.target.value })}
        className="h-9 w-full sm:w-56"
      />

      <Select
        aria-label="Filter by priority"
        value={filters.priority}
        onChange={(event) =>
          onChange({ ...filters, priority: event.target.value as Priority | "all" })
        }
        className="h-9 w-40"
      >
        <option value="all">Any priority</option>
        {PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {PRIORITY_LABELS[priority]}
          </option>
        ))}
      </Select>

      {labels.map((label) => {
        const active = filters.labelIds.includes(label.id);
        return (
          <button
            key={label.id}
            type="button"
            onClick={() => toggleLabel(label.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded border px-2 py-1.5 text-xs transition-colors",
              active
                ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-600",
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", LABEL_DOT_CLASSES[label.color])} />
            {label.name}
          </button>
        );
      })}

      {isFilterActive(filters) ? (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onChange({ query: "", labelIds: [], priority: "all" })}
        >
          Clear
        </Button>
      ) : null}
    </div>
  );
}
