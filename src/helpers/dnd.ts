export type CardDragData = { kind: "card"; cardId: string; columnId: string };
export type ColumnDragData = { kind: "column"; columnId: string };
export type ColumnDropData = { kind: "column-drop"; columnId: string };

type UnknownData = Record<string | symbol, unknown>;

export function cardDragData(cardId: string, columnId: string): CardDragData {
  return { kind: "card", cardId, columnId };
}

export function columnDragData(columnId: string): ColumnDragData {
  return { kind: "column", columnId };
}

export function columnDropData(columnId: string): ColumnDropData {
  return { kind: "column-drop", columnId };
}

export function isCardData(data: UnknownData): data is CardDragData {
  return data.kind === "card";
}

export function isColumnData(data: UnknownData): data is ColumnDragData {
  return data.kind === "column";
}

export function isColumnDropData(data: UnknownData): data is ColumnDropData {
  return data.kind === "column-drop";
}
