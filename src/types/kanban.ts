export type Priority = "none" | "low" | "medium" | "high" | "urgent";

export type LabelColor =
  | "slate"
  | "red"
  | "amber"
  | "green"
  | "sky"
  | "indigo"
  | "pink";

export type Label = {
  id: string;
  name: string;
  color: LabelColor;
};

export type Card = {
  id: string;
  title: string;
  description: string;
  labelIds: string[];
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Column = {
  id: string;
  title: string;
  cardIds: string[];
  wipLimit: number | null;
};

export type Board = {
  id: string;
  name: string;
  columns: Column[];
  cards: Record<string, Card>;
  labels: Label[];
  createdAt: string;
  updatedAt: string;
};

export type BoardFilters = {
  query: string;
  labelIds: string[];
  priority: Priority | "all";
};
