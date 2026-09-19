import type { Label, Priority } from "@/types/kanban";

export type QuickAdd = {
  title: string;
  labelIds: string[];
  priority: Priority | null;
  dueDate: string | null;
};

const PRIORITY_TOKENS: Record<string, Priority> = {
  low: "low",
  "1": "low",
  med: "medium",
  medium: "medium",
  "2": "medium",
  high: "high",
  "3": "high",
  urgent: "urgent",
  "4": "urgent",
};

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const TOKEN = /(^|\s)([#!@]\S+)/g;

export const QUICK_ADD_HINT = "#label  !high  @tomorrow";

function toIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** `today`, `tomorrow`, a weekday (its next occurrence, never today) or `YYYY-MM-DD`. */
function parseDate(value: string, today: Date) {
  const word = value.toLowerCase();
  if (word === "today") return toIsoDate(today);
  if (word === "tomorrow" || word === "tmr") return toIsoDate(addDays(today, 1));

  const weekday = WEEKDAYS.findIndex((name) => word.length >= 3 && name.startsWith(word));
  if (weekday >= 0) {
    const ahead = (weekday - today.getDay() + 7) % 7 || 7;
    return toIsoDate(addDays(today, ahead));
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(word)) {
    const parsed = new Date(`${word}T00:00:00`);
    if (!Number.isNaN(parsed.getTime()) && toIsoDate(parsed) === word) return word;
  }
  return null;
}

/**
 * Pulls `#label`, `!priority` and `@date` tokens out of a card title. Only
 * tokens that resolve are consumed: an unknown `#tag` stays in the title, so a
 * typo never creates a label behind the user's back.
 */
export function parseQuickAdd(input: string, labels: Label[], today = new Date()): QuickAdd {
  const labelIds: string[] = [];
  let priority: Priority | null = null;
  let dueDate: string | null = null;

  const consume = (token: string) => {
    const value = token.slice(1);
    if (token.startsWith("#")) {
      const key = value.toLowerCase();
      const label = labels.find((l) => l.name.toLowerCase().replace(/\s+/g, "") === key);
      if (!label) return false;
      if (!labelIds.includes(label.id)) labelIds.push(label.id);
      return true;
    }
    if (token.startsWith("!")) {
      const match = PRIORITY_TOKENS[value.toLowerCase()];
      if (!match) return false;
      priority = match;
      return true;
    }
    const date = parseDate(value, today);
    if (!date) return false;
    dueDate = date;
    return true;
  };

  const title = input
    .replace(TOKEN, (match, lead: string, token: string) => (consume(token) ? lead : match))
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  return { title, labelIds, priority, dueDate };
}
