import { menuItem, menuLabel, menuSeparator } from "@/helpers/menu";
import { NODE_COLORS } from "@/helpers/mindmap";
import {
  downloadMindmap,
  downloadMindmapPng,
  downloadMindmapSvg,
} from "@/helpers/mindmap-transfer";
import { SHORTCUTS } from "@/helpers/shortcuts";
import { mindmapActions } from "@/store/mindmaps";
import { openShortcuts } from "@/store/ui";
import type { Mindmap } from "@/types/mindmap";
import type { MenuEntry } from "@/types/ui";

const hint = (shortcut: { keys: string[] }) => shortcut.keys[0];

export function nodeMenu(
  map: Mindmap,
  nodeId: string,
  handlers: {
    onAddChild: () => void;
    onAddSibling: () => void;
    onRename: () => void;
    onNotes: () => void;
    onSendToBoard: () => void;
  },
): MenuEntry[] {
  const actions = mindmapActions();
  const node = map.nodes[nodeId];
  if (!node) return [];
  const isRoot = nodeId === map.rootId;
  const siblings = node.parentId ? (map.nodes[node.parentId]?.childIds ?? []) : [];
  const index = siblings.indexOf(nodeId);

  return [
    menuItem("Add child", handlers.onAddChild, { shortcut: hint(SHORTCUTS.addChild) }),
    menuItem("Add sibling", handlers.onAddSibling, {
      disabled: isRoot,
      shortcut: hint(SHORTCUTS.addSibling),
    }),
    menuItem("Rename", handlers.onRename, { shortcut: hint(SHORTCUTS.renameNode) }),
    menuItem("Notes…", handlers.onNotes, { shortcut: hint(SHORTCUTS.nodeNotes) }),
    menuSeparator,
    menuItem(
      node.collapsed ? "Expand branch" : "Collapse branch",
      () => actions.toggleCollapse(map.id, nodeId),
      {
        disabled: node.childIds.length === 0,
        shortcut: hint(SHORTCUTS.collapseNode),
      },
    ),
    menuItem("Move up", () => actions.reorderNode(map.id, nodeId, -1), {
      disabled: isRoot || index <= 0,
      shortcut: hint(SHORTCUTS.nodeUp),
    }),
    menuItem("Move down", () => actions.reorderNode(map.id, nodeId, 1), {
      disabled: isRoot || index === siblings.length - 1,
      shortcut: hint(SHORTCUTS.nodeDown),
    }),
    menuSeparator,
    menuLabel("Color"),
    menuItem("None", () => actions.updateNode(map.id, nodeId, { color: null })),
    ...NODE_COLORS.map((color) =>
      menuItem(color.charAt(0).toUpperCase() + color.slice(1), () =>
        actions.updateNode(map.id, nodeId, { color }),
      ),
    ),
    menuSeparator,
    menuItem("Send branch to a board…", handlers.onSendToBoard, {
      shortcut: hint(SHORTCUTS.sendToBoard),
    }),
    menuSeparator,
    menuItem("Delete branch", () => actions.deleteNode(map.id, nodeId), {
      danger: true,
      disabled: isRoot,
      shortcut: hint(SHORTCUTS.deleteNode),
    }),
  ];
}

export function mapMenu(
  map: Mindmap,
  handlers: {
    onFit: () => void;
    onRename: () => void;
    onDeleted: () => void;
  },
): MenuEntry[] {
  const actions = mindmapActions();
  const history = mindmapActions().history[map.id];

  return [
    menuItem("Fit on screen", handlers.onFit, { shortcut: hint(SHORTCUTS.fitMap) }),
    menuItem("Rename map", handlers.onRename),
    menuSeparator,
    menuItem("Undo", () => actions.undo(map.id), {
      disabled: !history?.past.length,
      shortcut: hint(SHORTCUTS.undo),
    }),
    menuItem("Redo", () => actions.redo(map.id), {
      disabled: !history?.future.length,
      shortcut: hint(SHORTCUTS.redo),
    }),
    menuSeparator,
    menuItem("Export as JSON", () => downloadMindmap(map)),
    menuItem("Export as PNG", () => void downloadMindmapPng(map)),
    menuItem("Export as SVG", () => downloadMindmapSvg(map)),
    menuItem("Duplicate map", () => actions.duplicateMap(map.id)),
    menuItem("Keyboard shortcuts", openShortcuts, { shortcut: hint(SHORTCUTS.help) }),
    menuSeparator,
    menuItem(
      "Delete map",
      () => {
        if (confirm(`Delete "${map.name}"? This cannot be undone.`)) {
          actions.deleteMap(map.id);
          handlers.onDeleted();
        }
      },
      { danger: true },
    ),
  ];
}

export function mapTileMenu(
  map: Mindmap,
  handlers: { onOpen: () => void; onRename: () => void },
): MenuEntry[] {
  const actions = mindmapActions();

  return [
    menuItem("Open", handlers.onOpen),
    menuItem("Open in new tab", () => {
      window.open(`/mindmap/${map.id}`, "_blank", "noopener");
    }),
    menuItem("Rename", handlers.onRename),
    menuItem("Duplicate", () => actions.duplicateMap(map.id)),
    menuItem("Export as JSON", () => downloadMindmap(map)),
    menuItem("Export as PNG", () => void downloadMindmapPng(map)),
    menuSeparator,
    menuItem(
      "Delete map",
      () => {
        if (confirm(`Delete "${map.name}"? This cannot be undone.`)) actions.deleteMap(map.id);
      },
      { danger: true },
    ),
  ];
}

export function mapListMenu(handlers: { onNewMap: () => void; onImport: () => void }): MenuEntry[] {
  return [
    menuItem("New mindmap", handlers.onNewMap, { shortcut: hint(SHORTCUTS.newMap) }),
    menuItem("Import from JSON", handlers.onImport, { shortcut: hint(SHORTCUTS.importBoard) }),
    menuSeparator,
    menuItem("Keyboard shortcuts", openShortcuts, { shortcut: hint(SHORTCUTS.help) }),
  ];
}
