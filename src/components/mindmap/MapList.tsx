"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { mapListMenu, mapTileMenu } from "@/components/mindmap/menus";
import { Button } from "@/components/ui/Button";
import { MenuButton, openContextMenu } from "@/components/ui/ContextMenu";
import { Input } from "@/components/ui/Field";
import { MindmapIcon, PlusIcon, UploadIcon } from "@/components/ui/Icons";
import { Combo, Kbd } from "@/components/ui/Kbd";
import { Modal } from "@/components/ui/Modal";
import { formatRelative } from "@/helpers/board";
import { cn } from "@/helpers/cn";
import { commandsFromMenu } from "@/helpers/menu";
import { NODE_STROKES, countNodes } from "@/helpers/mindmap";
import { parseMindmapFile } from "@/helpers/mindmap-transfer";
import { SHORTCUTS } from "@/helpers/shortcuts";
import { requestPersistentStorage } from "@/helpers/storage";
import { useHotkeys } from "@/helpers/use-hotkeys";
import { useHydrated } from "@/helpers/use-hydrated";
import { useMindmapActions, useMindmapList, useMindmapsStore } from "@/store/mindmaps";
import { useRegisterCommands, useUiStore } from "@/store/ui";
import type { Mindmap } from "@/types/mindmap";

export function MapList() {
  const router = useRouter();
  const hydrated = useHydrated(useMindmapsStore);
  const maps = useMindmapList();
  const actions = useMindmapActions();
  const fileInput = useRef<HTMLInputElement>(null);

  const [creating, setCreating] = useState(false);
  // "New mindmap" from the palette on another page arrives as a pending request.
  const pendingNewMap = useUiStore((state) => state.pendingNewMap);
  const createOpen = creating || pendingNewMap;
  const [renaming, setRenaming] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function startCreate() {
    setName("");
    setCreating(true);
  }

  function closeCreate() {
    setCreating(false);
    useUiStore.setState({ pendingNewMap: false });
  }

  function startImport() {
    fileInput.current?.click();
  }

  function startRename(map: Mindmap) {
    setName(map.name);
    setRenaming(map.id);
  }

  function create() {
    requestPersistentStorage();
    const id = actions.createMap(name);
    closeCreate();
    router.push(`/mindmap/${id}`);
  }

  function rename() {
    if (renaming) actions.renameMap(renaming, name);
    setRenaming(null);
  }

  async function importFile(file: File) {
    const result = parseMindmapFile(await file.text());
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    requestPersistentStorage();
    router.push(`/mindmap/${actions.importMap(result.map)}`);
  }

  const listActions = () => mapListMenu({ onNewMap: startCreate, onImport: startImport });

  useHotkeys([
    { keys: SHORTCUTS.newMap.keys, handler: startCreate },
    { keys: SHORTCUTS.importBoard.keys, handler: startImport },
  ]);
  useRegisterCommands(() => commandsFromMenu(listActions(), "Mindmaps"));

  return (
    <div
      className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14"
      onContextMenu={(event) => openContextMenu(event, listActions())}
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-accent-light uppercase">Mindmap</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Your maps</h1>
          <p className="mt-3 max-w-md text-[15px] text-zinc-400">
            Branch out an idea, then send a branch straight to a Kanban board. Press <Kbd>?</Kbd>{" "}
            for every shortcut.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={startImport}>
            <UploadIcon width={14} height={14} />
            Import
            <Combo combo={SHORTCUTS.importBoard.keys[0]} className="ml-1 hidden sm:inline-flex" />
          </Button>
          <Button variant="primary" onClick={startCreate}>
            <PlusIcon width={14} height={14} />
            New map
            <span className="ml-1 rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-[11px] leading-none">
              N
            </span>
          </Button>
        </div>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void importFile(file);
        }}
      />

      {error ? (
        <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
          {error}
        </p>
      ) : null}

      {!hydrated ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-44 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      ) : maps.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line-strong px-6 py-20 text-center">
          <p className="text-3xl font-extrabold tracking-tight">Start with one idea.</p>
          <p className="mx-auto mt-3 max-w-sm text-[15px] text-zinc-400">
            A map starts as a single node. Press Tab to branch out, Enter for the next thought.
          </p>
          <div className="mt-8 flex justify-center gap-2">
            <Button variant="primary" size="lg" onClick={startCreate}>
              <PlusIcon />
              Create a map
            </Button>
            <Button size="lg" onClick={startImport}>
              Import JSON
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {maps.map((map) => (
            <MapTile
              key={map.id}
              map={map}
              onOpen={() => router.push(`/mindmap/${map.id}`)}
              onRename={() => startRename(map)}
            />
          ))}
          <button
            type="button"
            onClick={startCreate}
            className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong text-sm font-bold text-zinc-500 transition-colors hover:border-accent/50 hover:bg-accent/[0.04] hover:text-zinc-200"
          >
            <PlusIcon width={20} height={20} />
            New map
          </button>
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title="New mindmap"
        footer={
          <>
            <Button variant="ghost" onClick={closeCreate}>
              Cancel
            </Button>
            <Button variant="primary" onClick={create}>
              Create map
            </Button>
          </>
        }
      >
        <Input
          autoFocus
          placeholder="e.g. Portfolio relaunch"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") create();
          }}
        />
        <p className="mt-2 text-xs text-zinc-500">
          The name becomes the central node; you can rename it later.
        </p>
      </Modal>

      <Modal
        open={renaming !== null}
        onClose={() => setRenaming(null)}
        title="Rename map"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={rename}>
              Save
            </Button>
          </>
        }
      >
        <Input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") rename();
          }}
        />
      </Modal>
    </div>
  );
}

function MapTile({
  map,
  onOpen,
  onRename,
}: {
  map: Mindmap;
  onOpen: () => void;
  onRename: () => void;
}) {
  const entries = () => mapTileMenu(map, { onOpen, onRename });
  const branches = (map.nodes[map.rootId]?.childIds ?? [])
    .map((id) => map.nodes[id])
    .filter(Boolean)
    .slice(0, 5);

  return (
    <div
      onContextMenu={(event) => openContextMenu(event, entries())}
      className="group relative flex min-h-44 flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong hover:bg-raised"
    >
      <Link
        href={`/mindmap/${map.id}`}
        aria-label={`Open ${map.name}`}
        className="absolute inset-0 rounded-2xl"
      />
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg leading-tight font-extrabold tracking-tight break-words">
          {map.name}
        </h2>
        <MenuButton
          label={`Actions for ${map.name}`}
          entries={entries}
          className="relative z-10 -mt-1 -mr-2"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {branches.length === 0 ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600">
            <MindmapIcon width={13} height={13} />
            Just the central idea
          </span>
        ) : (
          branches.map((node) => (
            <span
              key={node.id}
              className="inline-flex max-w-full items-center gap-1.5 truncate rounded-md border border-line bg-canvas/60 px-2 py-1 text-[11px] font-semibold text-zinc-300"
            >
              <span
                className={cn("h-1.5 w-1.5 shrink-0 rounded-full")}
                style={{ background: node.color ? NODE_STROKES[node.color] : "#52525b" }}
              />
              {node.text || "Untitled"}
            </span>
          ))
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs font-medium text-zinc-500">
        <span>{countNodes(map)} nodes</span>
        <span>{formatRelative(map.updatedAt)}</span>
      </div>
    </div>
  );
}
