import { BoardView } from "@/components/kanban/BoardView";

export default async function BoardPage({ params }: PageProps<"/kanban/[boardId]">) {
  const { boardId } = await params;
  return <BoardView boardId={boardId} />;
}
