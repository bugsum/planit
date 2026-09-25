import type { Metadata } from "next";
import { MapList } from "@/components/mindmap/MapList";
import { baseOpenGraph, socialImage } from "@/helpers/seo";

const description =
  "Free mindmaps for shaping ideas before they become tasks. Keyboard-first branches, notes, and one click to send a branch to a Kanban board.";

export const metadata: Metadata = {
  title: "Mindmaps",
  description,
  alternates: { canonical: "/mindmap" },
  openGraph: {
    ...baseOpenGraph,
    title: "Mindmaps · Plan It",
    description,
    url: "/mindmap",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mindmaps · Plan It",
    description,
    images: [socialImage],
  },
};

export default function MindmapPage() {
  return <MapList />;
}
