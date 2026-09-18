import type { Metadata } from "next";
import { BoardList } from "@/components/kanban/BoardList";

export const metadata: Metadata = {
  title: "Kanban",
};

export default function KanbanPage() {
  return <BoardList />;
}
