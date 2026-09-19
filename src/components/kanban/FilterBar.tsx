"use client";

import type { Ref } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { SearchIcon } from "@/components/ui/Icons";
import { Kbd } from "@/components/ui/Kbd";
import { LABEL_DOT_CLASSES, PRIORITIES, PRIORITY_LABELS, isFilterActive } from "@/helpers/board";
import { cn } from "@/helpers/cn";
import type { BoardFilters, Label, Priority } from "@/types/kanban";

type Props = {
  labels: Label[];
  filters: BoardFilters;
  onChange: (filters: BoardFilters) => void;
  searchRef?: Ref<HTMLInputElement>;
};

export const NO_FILTERS: BoardFilters = { query: "", labelIds: [], priority: "all" };

export function FilterBar({ labels, filters, onChange, searchRef }: Props) {
  function toggleLabel(labelId: string) {
    const labelIds = filters.labelIds.includes(labelId)
      ? filters.labelIds.filter((id) => id !== labelId)
      : [...filters.labelIds, labelId];
    onChange({ ...filters, labelIds });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-64">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-500" />
        <Input
          ref={searchRef}
          type="search"
          placeholder="Search cards"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            if (filters.query) onChange({ ...filters, query: "" });
            else event.currentTarget.blur();
          }}
          className="peer h-9 pr-9 pl-9"
        />
        <Kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
          /
        </Kbd>
      </div>

      <Select
        aria-label="Filter by priority"
        value={filters.priority}
        onChange={(event) =>
          onChange({ ...filters, priority: event.target.value as Priority | "all" })
        }
        className="h-9 w-auto min-w-36"
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
            aria-pressed={active}
            onClick={() => toggleLabel(label.id)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] font-semibold transition-colors",
              active
                ? "border-accent/60 bg-accent/10 text-zinc-100"
                : "border-line text-zinc-400 hover:border-line-strong hover:text-zinc-200",
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", LABEL_DOT_CLASSES[label.color])} />
            {label.name}
          </button>
        );
      })}

      {isFilterActive(filters) ? (
        <Button size="sm" variant="ghost" onClick={() => onChange(NO_FILTERS)}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
