"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { boardListMenu, boardTileMenu } from "@/components/kanban/menus";
import { Button } from "@/components/ui/Button";
import { MenuButton, openContextMenu } from "@/components/ui/ContextMenu";
import { Input } from "@/components/ui/Field";
import { PlusIcon, UploadIcon } from "@/components/ui/Icons";
import { Combo, Kbd } from "@/components/ui/Kbd";
import { Modal } from "@/components/ui/Modal";
import { LABEL_DOT_CLASSES, countCards, findLabel, formatRelative } from "@/helpers/board";
import { cn } from "@/helpers/cn";
import { SHORTCUTS } from "@/helpers/shortcuts";
import { requestPersistentStorage } from "@/helpers/storage";
import { parseBoardFile } from "@/helpers/transfer";
import { useHotkeys } from "@/helpers/use-hotkeys";
import { useHydrated } from "@/helpers/use-hydrated";
import { useBoardActions, useBoardList, useBoardsStore } from "@/store/boards";
import type { Board } from "@/types/kanban";

export function BoardList() {
  const router = useRouter();
  const hydrated = useHydrated(useBoardsStore);
  const boards = useBoardList();
  const actions = useBoardActions();
  const fileInput = useRef<HTMLInputElement>(null);

  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function startCreate() {
    setName("");
    setCreating(true);
  }

  function startImport() {
    fileInput.current?.click();
  }

  function startRename(board: Board) {
    setName(board.name);
    setRenaming(board.id);
  }

  function create() {
    requestPersistentStorage();
    const id = actions.createBoard(name);
    setCreating(false);
    router.push(`/kanban/${id}`);
  }

  function rename() {
    if (renaming) actions.renameBoard(renaming, name);
    setRenaming(null);
  }

  async function importFile(file: File) {
    const result = parseBoardFile(await file.text());
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    requestPersistentStorage();
    router.push(`/kanban/${actions.importBoard(result.board)}`);
  }

  useHotkeys([
    { keys: SHORTCUTS.newBoard.keys, handler: startCreate },
    { keys: SHORTCUTS.importBoard.keys, handler: startImport },
  ]);

  return (
    <div
      className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14"
      onContextMenu={(event) =>
        openContextMenu(event, boardListMenu({ onNewBoard: startCreate, onImport: startImport }))
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-accent-light uppercase">Kanban</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Your boards</h1>
          <p className="mt-3 max-w-md text-[15px] text-zinc-400">
            Saved in this browser. Right-click anywhere for actions, or press{" "}
            <Kbd>?</Kbd> for every shortcut.
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
            New board
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
            <div key={key} className="h-48 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      ) : boards.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line-strong px-6 py-20 text-center">
          <p className="text-3xl font-extrabold tracking-tight">Start your first plan.</p>
          <p className="mx-auto mt-3 max-w-sm text-[15px] text-zinc-400">
            A board starts with Backlog, To Do, In Progress and Done. Rename or replace any of
            them.
          </p>
          <div className="mt-8 flex justify-center gap-2">
            <Button variant="primary" size="lg" onClick={startCreate}>
              <PlusIcon />
              Create a board
            </Button>
            <Button size="lg" onClick={startImport}>
              Import JSON
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <BoardTile
              key={board.id}
              board={board}
              onOpen={() => router.push(`/kanban/${board.id}`)}
              onRename={() => startRename(board)}
            />
          ))}
          <button
            type="button"
            onClick={startCreate}
            className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong text-sm font-bold text-zinc-500 transition-colors hover:border-accent/50 hover:bg-accent/[0.04] hover:text-zinc-200"
          >
            <PlusIcon width={20} height={20} />
            New board
          </button>
        </div>
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New board"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={create}>
              Create board
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
      </Modal>

      <Modal
        open={renaming !== null}
        onClose={() => setRenaming(null)}
        title="Rename board"
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

function BoardTile({
  board,
  onOpen,
  onRename,
}: {
  board: Board;
  onOpen: () => void;
  onRename: () => void;
}) {
  const entries = () => boardTileMenu(board, { onOpen, onRename });

  return (
    <div
      onContextMenu={(event) => openContextMenu(event, entries())}
      className="group relative flex min-h-48 flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong hover:bg-raised"
    >
      <Link
        href={`/kanban/${board.id}`}
        aria-label={`Open ${board.name}`}
        className="absolute inset-0 rounded-2xl"
      />
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg leading-tight font-extrabold tracking-tight break-words">
          {board.name}
        </h2>
        <MenuButton
          label={`Actions for ${board.name}`}
          entries={entries}
          className="relative z-10 -mt-1 -mr-2"
        />
      </div>

      <BoardThumb board={board} />

      <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs font-medium text-zinc-500">
        <span>
          {board.columns.length} columns · {countCards(board)} cards
        </span>
        <span>{formatRelative(board.updatedAt)}</span>
      </div>
    </div>
  );
}

function BoardThumb({ board }: { board: Board }) {
  return (
    <div className="mt-4 flex h-20 gap-1.5 overflow-hidden rounded-lg border border-line bg-canvas/60 p-1.5">
      {board.columns.slice(0, 6).map((column) => (
        <div key={column.id} className="flex flex-1 flex-col gap-1 rounded bg-white/[0.03] p-1">
          {column.cardIds.slice(0, 4).map((cardId) => {
            const labelId = board.cards[cardId]?.labelIds[0];
            const label = labelId ? findLabel(board, labelId) : undefined;
            return (
              <div
                key={cardId}
                className={cn(
                  "h-2 shrink-0 rounded-sm",
                  label ? cn(LABEL_DOT_CLASSES[label.color], "opacity-60") : "bg-zinc-600/50",
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
