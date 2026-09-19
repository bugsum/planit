import { newId } from "@/helpers/id";
import type { Board, Card, ChecklistItem, Column, Label } from "@/types/kanban";

// v2 added card checklists; v1 files import with empty checklists.
const FILE_VERSION = 2;

type BoardFile = {
  app: "plan-it";
  kind: "board";
  version: number;
  board: Board;
};

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "board"
  );
}

export function downloadBoard(board: Board) {
  const payload: BoardFile = {
    app: "plan-it",
    kind: "board",
    version: FILE_VERSION,
    board,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `planit-${slugify(board.name)}-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

type ParseResult = { ok: true; board: Board } | { ok: false; error: string };

/**
 * Accepts an exported Plan It file and normalizes it into a Board. Unknown or
 * malformed fields are repaired rather than trusted, so a bad file can never
 * put the store into an unusable shape.
 */
export function parseBoardFile(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file is not valid JSON." };
  }

  const file = data as Partial<BoardFile>;
  const raw = (file.kind === "board" ? file.board : data) as Partial<Board> | undefined;

  if (!raw || typeof raw !== "object" || !Array.isArray(raw.columns) || !raw.cards) {
    return { ok: false, error: "That file is not a Plan It board export." };
  }

  const now = new Date().toISOString();
  const cards: Record<string, Card> = {};
  for (const [id, value] of Object.entries(raw.cards as Record<string, Partial<Card>>)) {
    if (!value || typeof value.title !== "string") continue;
    cards[id] = {
      id,
      title: value.title,
      description: typeof value.description === "string" ? value.description : "",
      checklist: repairChecklist(value.checklist),
      labelIds: Array.isArray(value.labelIds) ? value.labelIds : [],
      priority: value.priority ?? "none",
      dueDate: typeof value.dueDate === "string" ? value.dueDate : null,
      createdAt: value.createdAt ?? now,
      updatedAt: value.updatedAt ?? now,
    };
  }

  const columns: Column[] = (raw.columns as Partial<Column>[])
    .filter((column) => column && typeof column.title === "string")
    .map((column) => ({
      id: String(column.id ?? ""),
      title: column.title as string,
      cardIds: (Array.isArray(column.cardIds) ? column.cardIds : []).filter(
        (cardId) => cardId in cards,
      ),
      wipLimit: typeof column.wipLimit === "number" ? column.wipLimit : null,
    }));

  if (columns.length === 0) {
    return { ok: false, error: "That board has no columns." };
  }

  const labels: Label[] = (Array.isArray(raw.labels) ? raw.labels : []).filter(
    (label): label is Label => Boolean(label?.id && label?.name && label?.color),
  );

  return {
    ok: true,
    board: {
      id: String(raw.id ?? ""),
      name: typeof raw.name === "string" && raw.name.trim() ? raw.name : "Imported board",
      columns,
      cards,
      labels,
      createdAt: raw.createdAt ?? now,
      updatedAt: now,
    },
  };
}

function repairChecklist(value: unknown): ChecklistItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Partial<ChecklistItem> => typeof item === "object" && item !== null)
    .map((item) => ({
      id: typeof item.id === "string" && item.id ? item.id : newId("item"),
      text: typeof item.text === "string" ? item.text : "",
      done: item.done === true,
    }));
}
