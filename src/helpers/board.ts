import { newId } from "@/helpers/id";
import type {
  Board,
  BoardFilters,
  Card,
  Column,
  Label,
  LabelColor,
  Priority,
} from "@/types/kanban";

export const LABEL_COLORS: LabelColor[] = [
  "slate",
  "red",
  "amber",
  "green",
  "sky",
  "indigo",
  "pink",
];

/** Static map: Tailwind cannot resolve class names built at runtime. */
export const LABEL_CLASSES: Record<LabelColor, string> = {
  slate: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  red: "bg-red-500/15 text-red-300 border-red-500/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  green: "bg-green-500/15 text-green-300 border-green-500/30",
  sky: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  pink: "bg-pink-500/15 text-pink-300 border-pink-500/30",
};

export const LABEL_DOT_CLASSES: Record<LabelColor, string> = {
  slate: "bg-slate-400",
  red: "bg-red-400",
  amber: "bg-amber-400",
  green: "bg-green-400",
  sky: "bg-sky-400",
  indigo: "bg-indigo-400",
  pink: "bg-pink-400",
};

export const PRIORITIES: Priority[] = ["none", "low", "medium", "high", "urgent"];

export const PRIORITY_LABELS: Record<Priority, string> = {
  none: "No priority",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_CLASSES: Record<Priority, string> = {
  none: "bg-zinc-800 text-zinc-400 border-zinc-700",
  low: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  high: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  urgent: "bg-red-500/15 text-red-300 border-red-500/30",
};

const DEFAULT_COLUMNS = ["Backlog", "To Do", "In Progress", "Done"];

const DEFAULT_LABELS: Array<Pick<Label, "name" | "color">> = [
  { name: "Feature", color: "indigo" },
  { name: "Bug", color: "red" },
  { name: "Idea", color: "amber" },
];

export function createColumn(title: string): Column {
  return { id: newId("col"), title, cardIds: [], wipLimit: null };
}

export function createCard(title: string): Card {
  const now = new Date().toISOString();
  return {
    id: newId("card"),
    title,
    description: "",
    labelIds: [],
    priority: "none",
    dueDate: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function createBoard(name: string): Board {
  const now = new Date().toISOString();
  return {
    id: newId("board"),
    name,
    columns: DEFAULT_COLUMNS.map(createColumn),
    cards: {},
    labels: DEFAULT_LABELS.map((label) => ({ ...label, id: newId("label") })),
    createdAt: now,
    updatedAt: now,
  };
}

export function countCards(board: Board) {
  return Object.keys(board.cards).length;
}

export function findLabel(board: Board, labelId: string) {
  return board.labels.find((label) => label.id === labelId);
}

export function matchesFilters(card: Card, filters: BoardFilters) {
  const query = filters.query.trim().toLowerCase();
  if (query) {
    const haystack = `${card.title} ${card.description}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (filters.priority !== "all" && card.priority !== filters.priority) return false;
  if (filters.labelIds.length > 0) {
    const hasLabel = filters.labelIds.some((id) => card.labelIds.includes(id));
    if (!hasLabel) return false;
  }
  return true;
}

export function isFilterActive(filters: BoardFilters) {
  return (
    filters.query.trim().length > 0 ||
    filters.labelIds.length > 0 ||
    filters.priority !== "all"
  );
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelative(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

export function isOverdue(dueDate: string | null) {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${dueDate}T00:00:00`).getTime() < today.getTime();
}

export function moveInArray<T>(items: T[], from: number, to: number) {
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
