import type { Mindmap, MindmapNode } from "@/types/mindmap";

export type Side = "root" | "left" | "right";

export type LaidOutNode = {
  id: string;
  node: MindmapNode;
  /** Top-left corner in layout space. */
  x: number;
  y: number;
  width: number;
  height: number;
  side: Side;
  depth: number;
  hasChildren: boolean;
};

export type LaidOutEdge = {
  id: string;
  path: string;
  side: Exclude<Side, "root">;
};

export type Layout = {
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
  bounds: { minX: number; minY: number; width: number; height: number };
};

const CHAR_WIDTH = 7.4;
const PADDING_X = 28;
const MIN_WIDTH = 96;
const MAX_WIDTH = 240;
const LINE_HEIGHT = 20;
const PADDING_Y = 20;
const GAP_X = 64;
const GAP_Y = 14;
const MAX_LINE_CHARS = 26;

/** Greedy word wrap; the canvas renders the same lines, so measured height matches. */
export function wrapText(text: string, maxChars = MAX_LINE_CHARS) {
  const words = (text.trim() || "Untitled").split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    if (!line) line = word;
    else if (line.length + 1 + word.length <= maxChars) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
    }
    while (line.length > maxChars) {
      lines.push(line.slice(0, maxChars));
      line = line.slice(maxChars);
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 6);
}

export function nodeSize(text: string) {
  const lines = wrapText(text);
  const longest = lines.reduce((max, line) => Math.max(max, line.length), 0);
  const width = Math.min(
    MAX_WIDTH,
    Math.max(MIN_WIDTH, Math.round(longest * CHAR_WIDTH) + PADDING_X),
  );
  const height = lines.length * LINE_HEIGHT + PADDING_Y;
  return { width, height, lines };
}

function visibleChildren(map: Mindmap, node: MindmapNode) {
  if (node.collapsed) return [];
  return node.childIds.map((id) => map.nodes[id]).filter(Boolean);
}

/** Height a subtree occupies, so siblings can be stacked without overlapping. */
function subtreeHeight(map: Mindmap, node: MindmapNode): number {
  const own = nodeSize(node.text).height;
  const children = visibleChildren(map, node);
  if (children.length === 0) return own;
  const total =
    children.reduce((sum, child) => sum + subtreeHeight(map, child), 0) +
    GAP_Y * (children.length - 1);
  return Math.max(own, total);
}

function edgePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  side: Exclude<Side, "root">,
) {
  const delta = (to.x - from.x) * (side === "right" ? 0.5 : 0.5);
  return `M ${from.x} ${from.y} C ${from.x + delta} ${from.y}, ${to.x - delta} ${to.y}, ${to.x} ${to.y}`;
}

/**
 * Classic mindmap layout: the root sits in the middle and its branches alternate
 * left and right, each laid out as a tidy tree growing outwards. Positions are
 * derived from the tree, so nothing to store and nothing can overlap.
 */
export function layoutMindmap(map: Mindmap): Layout {
  const nodes: LaidOutNode[] = [];
  const edges: LaidOutEdge[] = [];
  const root = map.nodes[map.rootId];
  if (!root) return { nodes, edges, bounds: { minX: 0, minY: 0, width: 0, height: 0 } };

  const rootSize = nodeSize(root.text);
  nodes.push({
    id: root.id,
    node: root,
    x: -rootSize.width / 2,
    y: -rootSize.height / 2,
    width: rootSize.width,
    height: rootSize.height,
    side: "root",
    depth: 0,
    hasChildren: root.childIds.length > 0,
  });

  const place = (
    node: MindmapNode,
    side: Exclude<Side, "root">,
    depth: number,
    parentBox: LaidOutNode,
    centerY: number,
  ) => {
    const size = nodeSize(node.text);
    const x =
      side === "right" ? parentBox.x + parentBox.width + GAP_X : parentBox.x - GAP_X - size.width;
    const box: LaidOutNode = {
      id: node.id,
      node,
      x,
      y: centerY - size.height / 2,
      width: size.width,
      height: size.height,
      side,
      depth,
      hasChildren: node.childIds.length > 0,
    };
    nodes.push(box);

    edges.push({
      id: `${parentBox.id}:${node.id}`,
      side,
      path: edgePath(
        {
          x: side === "right" ? parentBox.x + parentBox.width : parentBox.x,
          y: parentBox.y + parentBox.height / 2,
        },
        { x: side === "right" ? box.x : box.x + box.width, y: centerY },
        side,
      ),
    });

    stack(node, side, depth + 1, box);
  };

  const stack = (
    parent: MindmapNode,
    side: Exclude<Side, "root">,
    depth: number,
    parentBox: LaidOutNode,
  ) => {
    const children = visibleChildren(map, parent);
    if (children.length === 0) return;

    const heights = children.map((child) => subtreeHeight(map, child));
    const total = heights.reduce((sum, h) => sum + h, 0) + GAP_Y * (children.length - 1);
    let cursor = parentBox.y + parentBox.height / 2 - total / 2;

    children.forEach((child, index) => {
      const height = heights[index];
      place(child, side, depth, parentBox, cursor + height / 2);
      cursor += height + GAP_Y;
    });
  };

  // Root children alternate sides so the map stays balanced as it grows.
  const rootBox = nodes[0];
  const rootChildren = visibleChildren(map, root);
  const sides: Array<Exclude<Side, "root">> = rootChildren.map((_, index) =>
    index % 2 === 0 ? "right" : "left",
  );

  for (const side of ["right", "left"] as const) {
    const branch = rootChildren.filter((_, index) => sides[index] === side);
    if (branch.length === 0) continue;
    const heights = branch.map((child) => subtreeHeight(map, child));
    const total = heights.reduce((sum, h) => sum + h, 0) + GAP_Y * (branch.length - 1);
    let cursor = -total / 2;
    branch.forEach((child, index) => {
      place(child, side, 1, rootBox, cursor + heights[index] / 2);
      cursor += heights[index] + GAP_Y;
    });
  }

  const minX = Math.min(...nodes.map((n) => n.x));
  const minY = Math.min(...nodes.map((n) => n.y));
  const maxX = Math.max(...nodes.map((n) => n.x + n.width));
  const maxY = Math.max(...nodes.map((n) => n.y + n.height));

  return { nodes, edges, bounds: { minX, minY, width: maxX - minX, height: maxY - minY } };
}
