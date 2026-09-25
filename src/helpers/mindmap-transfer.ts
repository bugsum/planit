import { newId } from "@/helpers/id";
import { NODE_STROKES } from "@/helpers/mindmap";
import { layoutMindmap, wrapText } from "@/helpers/mindmap-layout";
import type { Mindmap, MindmapNode, NodeColor } from "@/types/mindmap";

const FILE_VERSION = 1;
const PADDING = 48;
const LINE_HEIGHT = 20;
const CANVAS = "#08080a";
const ACCENT = "#6d95ff";
const LINE = "#32323c";
const SURFACE = "#16161b";
const TEXT = "#f4f4f5";

type MindmapFile = { app: "plan-it"; kind: "mindmap"; version: number; map: Mindmap };

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "mindmap"
  );
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function filename(map: Mindmap, extension: string) {
  return `planit-${slugify(map.name)}-${new Date().toISOString().slice(0, 10)}.${extension}`;
}

export function downloadMindmap(map: Mindmap) {
  const payload: MindmapFile = { app: "plan-it", kind: "mindmap", version: FILE_VERSION, map };
  save(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    filename(map, "json"),
  );
}

type ParseResult = { ok: true; map: Mindmap } | { ok: false; error: string };

/**
 * Accepts an exported Plan It mindmap and repairs its shape: unknown parents are
 * dropped, orphans are re-attached to the root and cycles are broken, so a bad
 * file can never produce a map that fails to render.
 */
export function parseMindmapFile(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file is not valid JSON." };
  }

  const file = data as Partial<MindmapFile>;
  const raw = (file.kind === "mindmap" ? file.map : data) as Partial<Mindmap> | undefined;
  if (!raw || typeof raw !== "object" || !raw.nodes || typeof raw.rootId !== "string") {
    return { ok: false, error: "That file is not a Plan It mindmap export." };
  }

  const nodes: Record<string, MindmapNode> = {};
  for (const [id, value] of Object.entries(raw.nodes as Record<string, Partial<MindmapNode>>)) {
    if (!value || typeof value !== "object") continue;
    nodes[id] = {
      id,
      parentId: typeof value.parentId === "string" ? value.parentId : null,
      text: typeof value.text === "string" ? value.text : "",
      notes: typeof value.notes === "string" ? value.notes : "",
      color: (value.color ?? null) as NodeColor | null,
      collapsed: value.collapsed === true,
      childIds: Array.isArray(value.childIds)
        ? value.childIds.filter((id) => typeof id === "string")
        : [],
    };
  }

  const root = nodes[raw.rootId];
  if (!root) return { ok: false, error: "That mindmap has no root node." };
  root.parentId = null;

  // Keep only links that exist in both directions, then re-home anything orphaned.
  for (const node of Object.values(nodes)) {
    node.childIds = node.childIds.filter((childId) => nodes[childId] && childId !== node.id);
  }
  const claimed = new Set(Object.values(nodes).flatMap((node) => node.childIds));
  for (const node of Object.values(nodes)) {
    if (node.id === root.id) continue;
    if (!claimed.has(node.id)) {
      node.parentId = root.id;
      root.childIds.push(node.id);
      claimed.add(node.id);
      continue;
    }
    const parent = Object.values(nodes).find((candidate) => candidate.childIds.includes(node.id));
    node.parentId = parent?.id ?? root.id;
  }

  const now = new Date().toISOString();
  return {
    ok: true,
    map: {
      id: typeof raw.id === "string" ? raw.id : newId("map"),
      name: typeof raw.name === "string" && raw.name.trim() ? raw.name : "Imported map",
      rootId: root.id,
      nodes,
      createdAt: typeof raw.createdAt === "string" ? raw.createdAt : now,
      updatedAt: now,
    },
  };
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A standalone picture of the map, used for both the SVG and PNG downloads. */
export function mindmapToSvg(map: Mindmap) {
  const { nodes, edges, bounds } = layoutMindmap(map);
  const width = Math.round(bounds.width + PADDING * 2);
  const height = Math.round(bounds.height + PADDING * 2);
  const shiftX = PADDING - bounds.minX;
  const shiftY = PADDING - bounds.minY;

  const edgeMarkup = edges
    .map(
      (edge) =>
        `<path d="${edge.path}" fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round" />`,
    )
    .join("");

  const nodeMarkup = nodes
    .map((box) => {
      const stroke = box.node.color
        ? NODE_STROKES[box.node.color]
        : box.side === "root"
          ? ACCENT
          : LINE;
      const fill = box.side === "root" ? "#1a1b2e" : SURFACE;
      const lines = wrapText(box.node.text);
      const startY = box.y + box.height / 2 - ((lines.length - 1) * LINE_HEIGHT) / 2 + 5;
      const text = lines
        .map(
          (line, index) =>
            `<tspan x="${box.x + box.width / 2}" y="${startY + index * LINE_HEIGHT}">${escapeXml(line)}</tspan>`,
        )
        .join("");
      return (
        `<g><rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="${box.side === "root" ? 2 : 1.5}" />` +
        `<text font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="13" font-weight="${box.side === "root" ? 700 : 500}" fill="${TEXT}" text-anchor="middle">${text}</text></g>`
      );
    })
    .join("");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="${width}" height="${height}" fill="${CANVAS}" />` +
    `<g transform="translate(${shiftX} ${shiftY})">${edgeMarkup}${nodeMarkup}</g></svg>`
  );
}

export function downloadMindmapSvg(map: Mindmap) {
  save(new Blob([mindmapToSvg(map)], { type: "image/svg+xml" }), filename(map, "svg"));
}

/** Rasterizes the SVG through a canvas; no export service, nothing leaves the browser. */
export async function downloadMindmapPng(map: Mindmap, scale = 2) {
  const svg = mindmapToSvg(map);
  const width = Number(/width="(\d+)"/.exec(svg)?.[1] ?? 1200);
  const height = Number(/height="(\d+)"/.exec(svg)?.[1] ?? 800);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));

  try {
    const image = new Image();
    image.src = url;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable");
    context.scale(scale, scale);
    context.drawImage(image, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (blob) save(blob, filename(map, "png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}
