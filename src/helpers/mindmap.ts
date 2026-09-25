import { newId } from "@/helpers/id";
import type { Mindmap, MindmapNode, NodeColor } from "@/types/mindmap";

export const NODE_COLORS: NodeColor[] = ["indigo", "sky", "green", "amber", "red", "pink", "slate"];

/** Static classes: Tailwind cannot resolve names built at runtime. */
export const NODE_CLASSES: Record<NodeColor, string> = {
  slate: "border-slate-400/50 bg-slate-500/15",
  red: "border-red-400/50 bg-red-500/15",
  amber: "border-amber-400/50 bg-amber-500/15",
  green: "border-green-400/50 bg-green-500/15",
  sky: "border-sky-400/50 bg-sky-500/15",
  indigo: "border-indigo-400/50 bg-indigo-500/15",
  pink: "border-pink-400/50 bg-pink-500/15",
};

/** Edge and export colors, matching NODE_CLASSES. */
export const NODE_STROKES: Record<NodeColor, string> = {
  slate: "#94a3b8",
  red: "#f87171",
  amber: "#fbbf24",
  green: "#4ade80",
  sky: "#38bdf8",
  indigo: "#818cf8",
  pink: "#f472b6",
};

export function createNode(text = "", parentId: string | null = null): MindmapNode {
  return {
    id: newId("node"),
    parentId,
    text,
    notes: "",
    color: null,
    collapsed: false,
    childIds: [],
  };
}

export function createMindmap(name: string): Mindmap {
  const now = new Date().toISOString();
  const root = createNode(name.trim() || "Central idea");
  return {
    id: newId("map"),
    name: name.trim() || "Untitled map",
    rootId: root.id,
    nodes: { [root.id]: root },
    createdAt: now,
    updatedAt: now,
  };
}

export function countNodes(map: Mindmap) {
  return Object.keys(map.nodes).length;
}

/** The node and everything under it, depth first. */
export function branchIds(map: Mindmap, nodeId: string): string[] {
  const node = map.nodes[nodeId];
  if (!node) return [];
  return [nodeId, ...node.childIds.flatMap((childId) => branchIds(map, childId))];
}

export function isDescendant(map: Mindmap, nodeId: string, maybeAncestorId: string): boolean {
  let current = map.nodes[nodeId]?.parentId;
  while (current) {
    if (current === maybeAncestorId) return true;
    current = map.nodes[current]?.parentId ?? null;
  }
  return false;
}

/** Nodes reachable without expanding anything, in reading order. */
export function visibleIds(map: Mindmap, fromId = map.rootId): string[] {
  const node = map.nodes[fromId];
  if (!node) return [];
  if (node.collapsed) return [fromId];
  return [fromId, ...node.childIds.flatMap((childId) => visibleIds(map, childId))];
}

export function siblingsOf(map: Mindmap, nodeId: string) {
  const parentId = map.nodes[nodeId]?.parentId;
  return parentId ? (map.nodes[parentId]?.childIds ?? []) : [];
}

/** Plain-text outline, used for the Kanban handoff and previews. */
export function outline(map: Mindmap, nodeId: string, depth = 0): string[] {
  const node = map.nodes[nodeId];
  if (!node) return [];
  return [
    `${"  ".repeat(depth)}- ${node.text || "Untitled"}`,
    ...node.childIds.flatMap((childId) => outline(map, childId, depth + 1)),
  ];
}
