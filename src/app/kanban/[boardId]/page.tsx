import type { Metadata } from "next";
import { BoardView } from "@/components/kanban/BoardView";

// Boards live in the visitor's own browser; their URLs mean nothing to a crawler.
export const metadata: Metadata = {
  title: "Board",
  robots: { index: false, follow: true },
};

export default async function BoardPage({ params, searchParams }: PageProps<"/kanban/[boardId]">) {
  const { boardId } = await params;
  const { card } = await searchParams;
  // Keyed by board so switching boards starts fresh (filters, selection, open card).
  return (
    <BoardView
      key={boardId}
      boardId={boardId}
      initialCardId={typeof card === "string" ? card : undefined}
    />
  );
}
