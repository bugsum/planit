"use client";

import type { Side } from "@/helpers/mindmap-layout";
import { SHORTCUTS } from "@/helpers/shortcuts";
import { useHotkeys } from "@/helpers/use-hotkeys";
import { getMindmap, mindmapActions } from "@/store/mindmaps";

type Options = {
  mapId: string;
  selected: string | null;
  select: (nodeId: string | null) => void;
  sides: Record<string, Side>;
  onEdit: (nodeId: string) => void;
  onNotes: (nodeId: string) => void;
  onSendToBoard: (nodeId: string) => void;
  onNodeMenu: (nodeId: string) => void;
  onFit: () => void;
  onZoom: (factor: number) => void;
};

/**
 * Keyboard control for a map. Arrow keys follow the drawing: on a left-hand
 * branch, Left walks towards the leaves and Right back towards the root.
 */
export function useMapKeys({
  mapId,
  selected,
  select,
  sides,
  onEdit,
  onNotes,
  onSendToBoard,
  onNodeMenu,
  onFit,
  onZoom,
}: Options) {
  const actions = mindmapActions();

  const current = () => {
    const map = getMindmap(mapId);
    if (!map) return null;
    const nodeId = selected && map.nodes[selected] ? selected : map.rootId;
    return { map, nodeId, node: map.nodes[nodeId] };
  };

  function addChild() {
    const context = current();
    if (!context) return;
    const id = actions.addChild(mapId, context.nodeId);
    if (id) {
      select(id);
      onEdit(id);
    }
  }

  function addSibling() {
    const context = current();
    if (!context) return;
    const id =
      context.nodeId === context.map.rootId
        ? actions.addChild(mapId, context.nodeId)
        : actions.addSibling(mapId, context.nodeId);
    if (id) {
      select(id);
      onEdit(id);
    }
  }

  function remove() {
    const context = current();
    if (!context || context.nodeId === context.map.rootId) return;
    select(context.node.parentId);
    actions.deleteNode(mapId, context.nodeId);
  }

  function goDeeper() {
    const context = current();
    if (!context) return;
    const { node } = context;
    if (node.childIds.length === 0) return;
    if (node.collapsed) actions.toggleCollapse(mapId, node.id);
    select(node.childIds[0]);
  }

  function goToParent() {
    const context = current();
    if (context?.node.parentId) select(context.node.parentId);
  }

  function horizontal(direction: "left" | "right") {
    const context = current();
    if (!context) return;
    const side = sides[context.nodeId] ?? "root";
    if (side === "root") {
      // Pick the first child that the layout placed on that side.
      const child = context.node.childIds.find((id) => sides[id] === direction);
      if (child) select(child);
      else if (context.node.childIds.length > 0 && !context.node.collapsed) goDeeper();
      return;
    }
    if (side === direction) goDeeper();
    else goToParent();
  }

  function sibling(offset: number) {
    const context = current();
    if (!context?.node.parentId) return;
    const siblings = context.map.nodes[context.node.parentId]?.childIds ?? [];
    const index = siblings.indexOf(context.nodeId);
    const next = siblings[index + offset];
    if (next) select(next);
  }

  const withSelected = (run: (nodeId: string) => void) => () => {
    const context = current();
    if (context) run(context.nodeId);
  };

  useHotkeys([
    { keys: SHORTCUTS.addChild.keys, handler: addChild },
    { keys: SHORTCUTS.addSibling.keys, handler: addSibling },
    { keys: SHORTCUTS.renameNode.keys, handler: withSelected(onEdit) },
    { keys: SHORTCUTS.nodeNotes.keys, handler: withSelected(onNotes) },
    { keys: SHORTCUTS.sendToBoard.keys, handler: withSelected(onSendToBoard) },
    { keys: SHORTCUTS.menu.keys, handler: withSelected(onNodeMenu) },
    { keys: SHORTCUTS.deleteNode.keys, handler: remove },
    {
      keys: SHORTCUTS.collapseNode.keys,
      handler: withSelected((nodeId) => actions.toggleCollapse(mapId, nodeId)),
    },
    {
      keys: SHORTCUTS.nodeUp.keys,
      handler: withSelected((id) => actions.reorderNode(mapId, id, -1)),
    },
    {
      keys: SHORTCUTS.nodeDown.keys,
      handler: withSelected((id) => actions.reorderNode(mapId, id, 1)),
    },
    { keys: SHORTCUTS.up.keys, handler: () => sibling(-1) },
    { keys: SHORTCUTS.down.keys, handler: () => sibling(1) },
    { keys: SHORTCUTS.left.keys, handler: () => horizontal("left") },
    { keys: SHORTCUTS.right.keys, handler: () => horizontal("right") },
    { keys: SHORTCUTS.undo.keys, handler: () => actions.undo(mapId) },
    { keys: SHORTCUTS.redo.keys, handler: () => actions.redo(mapId) },
    { keys: SHORTCUTS.fitMap.keys, handler: onFit },
    { keys: SHORTCUTS.zoomIn.keys, handler: () => onZoom(1.2) },
    { keys: SHORTCUTS.zoomOut.keys, handler: () => onZoom(1 / 1.2) },
    { keys: SHORTCUTS.escape.keys, handler: () => select(null) },
  ]);
}
