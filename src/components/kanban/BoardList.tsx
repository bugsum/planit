"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { boardListMenu, boardTileMenu } from "@/components/kanban/menus";
import { Button } from "@/components/ui/Button";
import { MenuButton, openContextMenu } from "@/components/ui/ContextMenu";
import { Field, Input } from "@/components/ui/Field";
import { PlusIcon, UploadIcon } from "@/components/ui/Icons";
import { Combo, Kbd } from "@/components/ui/Kbd";
import { Modal } from "@/components/ui/Modal";
import { LABEL_DOT_CLASSES, countCards, findLabel, formatRelative } from "@/helpers/board";
import { cn } from "@/helpers/cn";
import { commandsFromMenu } from "@/helpers/menu";
import { SHORTCUTS } from "@/helpers/shortcuts";
import { requestPersistentStorage } from "@/helpers/storage";
import { TEMPLATES } from "@/helpers/templates";
import { parseBoardFile } from "@/helpers/transfer";
import { useHotkeys } from "@/helpers/use-hotkeys";
import { useHydrated } from "@/helpers/use-hydrated";
import { useBoardActions, useBoardList, useBoardsStore } from "@/store/boards";
import { useRegisterCommands, useUiStore } from "@/store/ui";
import type { Board } from "@/types/kanban";

export function BoardList() {
  const router = useRouter();
  const hydrated = useHydrated(useBoardsStore);
  const boards = useBoardList();
  const actions = useBoardActions();
  const fileInput = useRef<HTMLInputElement>(null);

  const [creating, setCreating] = useState(false);
  // "New board" from the palette on another page arrives as a pending request.
  const pendingNewBoard = useUiStore((state) => state.pendingNewBoard);
  const createOpen = creating || pendingNewBoard;
  const [renaming, setRenaming] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [error, setError] = useState("");

  function startCreate() {
    setName("");
    setTemplateId(TEMPLATES[0].id);
    setCreating(true);
  }

  function closeCreate() {
    setCreating(false);
    useUiStore.setState({ pendingNewBoard: false });
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
    const id = actions.createBoard(name, templateId);
    closeCreate();
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

  const listActions = () => boardListMenu({ onNewBoard: startCreate, onImport: startImport });

  useHotkeys([
    { keys: SHORTCUTS.newBoard.keys, handler: startCreate },
    { keys: SHORTCUTS.importBoard.keys, handler: startImport },
  ]);
  useRegisterCommands(() => commandsFromMenu(listActions(), "Boards list"));

  return (
    <div
      className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14"
      onContextMenu={(event) =>
        openContextMenu(event, listActions())
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
        open={createOpen}
        onClose={closeCreate}
        title="New board"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeCreate}>
              Cancel
            </Button>
            <Button variant="primary" onClick={create}>
              Create board
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Name">
            <Input
              autoFocus
              placeholder="e.g. Portfolio relaunch"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") create();
              }}
            />
          </Field>

          <fieldset>
            <legend className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
              Template
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {TEMPLATES.map((template) => (
                <label key={template.id} className="block cursor-pointer">
                  <input
                    type="radio"
                    name="template"
                    value={template.id}
                    checked={templateId === template.id}
                    onChange={() => setTemplateId(template.id)}
                    className="peer sr-only"
                  />
                  <span className="block h-full rounded-xl border border-line bg-canvas/40 p-3.5 transition-colors peer-checked:border-accent-light peer-checked:bg-accent/[0.08] peer-focus-visible:ring-2 peer-focus-visible:ring-accent-light hover:border-line-strong">
                    <span className="block text-sm font-extrabold tracking-tight">
                      {template.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-400">
                      {template.description}
                    </span>
                    <span className="mt-2.5 flex flex-wrap gap-1">
                      {template.columns.map((column) => (
                        <span
                          key={column.title}
                          className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400"
                        >
                          {column.title}
                          {column.wipLimit ? ` · ${column.wipLimit}` : ""}
                        </span>
                      ))}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
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
