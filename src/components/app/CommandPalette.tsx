"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon } from "@/components/ui/Icons";
import { Kbd } from "@/components/ui/Kbd";
import { countCards } from "@/helpers/board";
import { cn } from "@/helpers/cn";
import { fuzzyScore } from "@/helpers/fuzzy";
import { SHORTCUTS, formatCombo } from "@/helpers/shortcuts";
import { useIsMac } from "@/helpers/use-hotkeys";
import { useHydrated } from "@/helpers/use-hydrated";
import { useBoardList, useBoardsStore } from "@/store/boards";
import { useMindmapList, useMindmapsStore } from "@/store/mindmaps";
import { openShortcuts, useUiStore } from "@/store/ui";
import type { Command } from "@/types/ui";

const MAX_RESULTS = 50;
const RECENT_BOARDS = 5;

export function CommandPalette() {
  const open = useUiStore((state) => state.paletteOpen);
  const setOpen = useUiStore((state) => state.setPaletteOpen);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label="Command palette"
      onClose={() => setOpen(false)}
      onClick={(event) => {
        if (event.target === ref.current) setOpen(false);
      }}
      className="mx-auto mt-[12vh] mb-auto w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-2xl border border-line-strong bg-surface p-0 text-zinc-100 shadow-2xl shadow-black/70 backdrop:bg-black/60 backdrop:backdrop-blur-sm open:animate-pop-in"
    >
      {open ? <PaletteBody onDone={() => setOpen(false)} /> : null}
    </dialog>
  );
}

function PaletteBody({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const mac = useIsMac();
  useHydrated(useBoardsStore);
  useHydrated(useMindmapsStore);
  const boards = useBoardList();
  const maps = useMindmapList();
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  // Snapshot the page's commands when the palette opens, so enabled states are current.
  const [pageCommands] = useState(() => useUiStore.getState().commandProvider?.() ?? []);

  const baseCommands = useMemo(() => {
    const go = (href: string) => () => router.push(href);
    const global: Command[] = [
      {
        id: "nav:home",
        title: "Go to home",
        group: "Navigation",
        keywords: "landing start",
        run: go("/"),
      },
      {
        id: "nav:boards",
        title: "Go to boards",
        group: "Navigation",
        keywords: "kanban list",
        run: go("/kanban"),
      },
      {
        id: "nav:maps",
        title: "Go to mindmaps",
        group: "Navigation",
        keywords: "mindmap maps ideas",
        run: go("/mindmap"),
      },
      {
        id: "map:new",
        title: "New mindmap",
        group: "General",
        keywords: "create mindmap idea",
        run: () => {
          useUiStore.setState({ pendingNewMap: true });
          router.push("/mindmap");
        },
      },
      {
        id: "board:new",
        title: "New board",
        group: "General",
        keywords: "create kanban",
        run: () => {
          useUiStore.setState({ pendingNewBoard: true });
          router.push("/kanban");
        },
      },
      {
        id: "help:shortcuts",
        title: "Keyboard shortcuts",
        group: "General",
        keywords: "help keys hotkeys",
        shortcut: SHORTCUTS.help.keys[0],
        run: openShortcuts,
      },
    ];

    // Page commands win over global ones with the same title ("New board" on the list page).
    const taken = new Set(pageCommands.map((command) => command.title.toLowerCase()));
    return [
      ...pageCommands,
      ...global.filter((command) => !taken.has(command.title.toLowerCase())),
    ].filter((command) => !command.disabled);
  }, [pageCommands, router]);

  const boardCommands = useMemo(
    () =>
      [...boards]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map<Command>((board) => ({
          id: `board:${board.id}`,
          title: board.name,
          subtitle: `${board.columns.length} columns · ${countCards(board)} cards`,
          group: "Boards",
          keywords: "open board",
          run: () => router.push(`/kanban/${board.id}`),
        })),
    [boards, router],
  );

  const mapCommands = useMemo(
    () =>
      [...maps]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map<Command>((map) => ({
          id: `map:${map.id}`,
          title: map.name,
          subtitle: `${Object.keys(map.nodes).length} nodes`,
          group: "Mindmaps",
          keywords: "open mindmap map",
          run: () => router.push(`/mindmap/${map.id}`),
        })),
    [maps, router],
  );

  const cardCommands = useMemo(
    () =>
      boards.flatMap((board) =>
        board.columns.flatMap((column) =>
          column.cardIds.flatMap<Command>((cardId) => {
            const card = board.cards[cardId];
            if (!card) return [];
            const labels = card.labelIds
              .map((id) => board.labels.find((label) => label.id === id)?.name)
              .filter(Boolean)
              .join(" ");
            return [
              {
                id: `card:${card.id}`,
                title: card.title,
                subtitle: `${board.name} · ${column.title}`,
                group: "Cards",
                keywords: labels,
                run: () => {
                  const opener = useUiStore.getState().cardOpener;
                  if (opener?.boardId === board.id) opener.open(card.id);
                  else router.push(`/kanban/${board.id}?card=${encodeURIComponent(card.id)}`);
                },
              },
            ];
          }),
        ),
      ),
    [boards, router],
  );

  const trimmed = query.trim();
  const results = useMemo(() => {
    if (!trimmed) {
      return [
        ...baseCommands,
        ...boardCommands.slice(0, RECENT_BOARDS),
        ...mapCommands.slice(0, RECENT_BOARDS),
      ];
    }
    return [...baseCommands, ...boardCommands, ...mapCommands, ...cardCommands]
      .map((command) => ({
        command,
        score: Math.max(
          fuzzyScore(trimmed, command.title),
          fuzzyScore(trimmed, command.keywords ?? "") * 0.5,
        ),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map((entry) => entry.command);
  }, [trimmed, baseCommands, boardCommands, mapCommands, cardCommands]);

  const current = Math.min(active, Math.max(results.length - 1, 0));

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${current}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [current]);

  function run(command: Command | undefined) {
    if (!command) return;
    onDone();
    command.run();
  }

  return (
    <div className="flex max-h-[min(70vh,560px)] flex-col">
      <div className="flex items-center gap-3 border-b border-line px-4">
        <SearchIcon className="shrink-0 text-zinc-500" />
        <input
          autoFocus
          aria-label="Search commands, boards and cards"
          placeholder="Search commands, boards and cards…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              const step = event.key === "ArrowDown" ? 1 : -1;
              setActive((current + step + results.length) % Math.max(results.length, 1));
            } else if (event.key === "Enter") {
              event.preventDefault();
              run(results[current]);
            }
          }}
          className="h-14 flex-1 bg-transparent text-[15px] font-medium text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
        />
        <Kbd>Esc</Kbd>
      </div>

      <div
        ref={listRef}
        role="listbox"
        aria-label="Results"
        className="flex-1 overflow-y-auto p-1.5"
      >
        {results.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-zinc-500">
            Nothing matches “{trimmed}”.
          </p>
        ) : (
          results.map((command, index) => {
            const header = !trimmed && (index === 0 || results[index - 1].group !== command.group);
            return (
              <div key={command.id}>
                {header ? (
                  <p className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                    {command.group === "Boards"
                      ? "Recent boards"
                      : command.group === "Mindmaps"
                        ? "Recent maps"
                        : command.group}
                  </p>
                ) : null}
                <button
                  type="button"
                  role="option"
                  aria-selected={index === current}
                  data-index={index}
                  onMouseMove={() => setActive(index)}
                  onClick={() => run(command)}
                  className={cn(
                    "flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-left",
                    index === current && "bg-white/[0.07]",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-zinc-100">
                      {command.title}
                    </span>
                    {command.subtitle ? (
                      <span className="block truncate text-xs text-zinc-500">
                        {command.subtitle}
                      </span>
                    ) : null}
                  </span>
                  {command.shortcut ? (
                    <span className="shrink-0 font-mono text-[11px] text-zinc-500">
                      {formatCombo(command.shortcut, mac)}
                    </span>
                  ) : trimmed ? (
                    <span className="shrink-0 text-[11px] font-semibold text-zinc-600">
                      {command.group}
                    </span>
                  ) : null}
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-4 border-t border-line px-4 py-2 text-[11px] font-medium text-zinc-500">
        <span className="inline-flex items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> Navigate
        </span>
        <span className="inline-flex items-center gap-1">
          <Kbd>Enter</Kbd> Run
        </span>
        <span className="ml-auto">Search card titles across every board</span>
      </div>
    </div>
  );
}
