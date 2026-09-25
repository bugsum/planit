import type { LabelColor } from "@/types/kanban";

export type NodeColor = LabelColor;

export type MindmapNode = {
  id: string;
  parentId: string | null;
  text: string;
  /** Markdown, shown in the node dialog. */
  notes: string;
  color: NodeColor | null;
  collapsed: boolean;
  childIds: string[];
};

export type Mindmap = {
  id: string;
  name: string;
  rootId: string;
  nodes: Record<string, MindmapNode>;
  createdAt: string;
  updatedAt: string;
};
