"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Menu, MenuItem, MenuSeparator } from "@/components/ui/Menu";
import { Modal } from "@/components/ui/Modal";
import { countCards, formatRelative } from "@/helpers/board";
import { downloadBoard, parseBoardFile } from "@/helpers/transfer";
import { useHydrated } from "@/helpers/use-hydrated";
import { useBoardActions, useBoardList, useBoardsStore } from "@/store/boards";

export function BoardList() {
  const router = useRouter();
  const hydrated = useHydrated(useBoardsStore);
  const boards = useBoardList();
  const store = useBoardActions();
  const fileInput = useRef<HTMLInputElement>(null);

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [error, setError] = useState("");

  function handleCreate() {
    const id = store.createBoard(name);
    setName("");
    setCreating(false);
    router.push(`/kanban/${id}`);
  }

  async function handleImport(file: File) {
    const result = parseBoardFile(await file.text());
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    router.push(`/kanban/${store.importBoard(result.board)}`);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kanban boards</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Every board is saved in this browser. Export one to move it elsewhere.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => fileInput.current?.click()}>Import</Button>
          <Button variant="primary" onClick={() => setCreating(true)}>
            New board
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
          if (file) void handleImport(file);
        }}
      />

      {error ? (
        <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {!hydrated ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-28 animate-pulse rounded-lg bg-zinc-900" />
          ))}
        </div>
      ) : boards.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-zinc-800 px-6 py-16 text-center">
          <p className="text-zinc-300">No boards yet.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Create one to start shaping your backlog.
          </p>
          <Button variant="primary" className="mt-5" onClick={() => setCreating(true)}>
            New board
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <div
              key={board.id}
              className="group relative rounded-lg border border-zinc-800 bg-zinc-900/60 transition-colors hover:border-zinc-700"
            >
              <Link href={`/kanban/${board.id}`} className="block p-5">
                <h2 className="pr-8 font-medium">{board.name}</h2>
                <p className="mt-2 text-sm text-zinc-500">
                  {board.columns.length} columns · {countCards(board)} cards
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Updated {formatRelative(board.updatedAt)}
                </p>
              </Link>
              <div className="absolute top-3 right-3">
                <Menu label={`Board options for ${board.name}`}>
                  {(close) => (
                    <>
                      <MenuItem
                        onClick={() => {
                          setRenaming(board.id);
                          setName(board.name);
                          close();
                        }}
                      >
                        Rename
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          store.duplicateBoard(board.id);
                          close();
                        }}
                      >
                        Duplicate
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          downloadBoard(board);
                          close();
                        }}
                      >
                        Export JSON
                      </MenuItem>
                      <MenuSeparator />
                      <MenuItem
                        danger
                        onClick={() => {
                          if (confirm(`Delete "${board.name}"? This cannot be undone.`)) {
                            store.deleteBoard(board.id);
                          }
                          close();
                        }}
                      >
                        Delete
                      </MenuItem>
                    </>
                  )}
                </Menu>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New board"
        footer={
          <>
            <Button onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate}>
              Create
            </Button>
          </>
        }
      >
        <Input
          autoFocus
          className="w-full"
          placeholder="Board name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleCreate()}
        />
      </Modal>

      <Modal
        open={renaming !== null}
        onClose={() => setRenaming(null)}
        title="Rename board"
        footer={
          <>
            <Button onClick={() => setRenaming(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (renaming) store.renameBoard(renaming, name);
                setRenaming(null);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <Input
          autoFocus
          className="w-full"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || !renaming) return;
            store.renameBoard(renaming, name);
            setRenaming(null);
          }}
        />
      </Modal>
    </div>
  );
}
