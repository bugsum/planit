import type { Metadata } from "next";
import { BoardList } from "@/components/kanban/BoardList";
import { baseOpenGraph, socialImage } from "@/helpers/seo";

const description =
  "Free Kanban boards for planning projects. Custom columns, labels, priorities, keyboard shortcuts and undo, saved privately in your browser.";

export const metadata: Metadata = {
  title: "Kanban boards",
  description,
  alternates: { canonical: "/kanban" },
  openGraph: {
    ...baseOpenGraph,
    title: "Kanban boards · Plan It",
    description,
    url: "/kanban",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kanban boards · Plan It",
    description,
    images: [socialImage],
  },
};

export default function KanbanPage() {
  return <BoardList />;
}
