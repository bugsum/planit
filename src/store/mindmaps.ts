"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";
import { moveInArray } from "@/helpers/board";
import { newId } from "@/helpers/id";
import {
  branchIds,
  createMindmap as buildMindmap,
  createNode,
  isDescendant,
} from "@/helpers/mindmap";
import { planitStorage, subscribeToExternalChanges } from "@/helpers/storage";
import type { Mindmap, MindmapNode } from "@/types/mindmap";

const STORAGE_KEY = "planit.mindmap.v1";
const HISTORY_LIMIT = 100;
const COALESCE_MS = 1000;

type History = { past: Mindmap[]; future: Mindmap[]; lastKey: string | null; lastAt: number };

type MindmapsState = {
  maps: Record<string, Mindmap>;
  mapOrder: string[];
  history: Record<string, History>;
  createMap: (name: string) => string;
  renameMap: (mapId: string, name: string) => void;
  deleteMap: (mapId: string) => void;
  duplicateMap: (mapId: string) => string | null;
  importMap: (map: Mindmap) => string;
  addChild: (mapId: string, parentId: string, text?: string) => string | null;
  addSibling: (mapId: string, nodeId: string, text?: string) => string | null;
  updateNode: (
    mapId: string,
    nodeId: string,
    patch: Partial<Pick<MindmapNode, "text" | "notes" | "color" | "collapsed">>,
  ) => void;
  deleteNode: (mapId: string, nodeId: string) => void;
  moveNode: (mapId: string, nodeId: string, toParentId: string, toIndex?: number) => void;
  reorderNode: (mapId: string, nodeId: string, offset: number) => void;
  toggleCollapse: (mapId: string, nodeId: string) => void;
  undo: (mapId: string) => void;
  redo: (mapId: string) => void;
};

/** Return `false` for "nothing changed": no history entry, no timestamp bump. */
type Recipe = (map: Mindmap) => void | false;

export const useMindmapsStore = create<MindmapsState>()(
  persist(
    immer<MindmapsState>((set, get) => {
      // Mirrors the editor in store/boards.ts: one place that records undo history.
      const edit = (mapId: string, recipe: Recipe, key?: string) => {
        const before = get().maps[mapId];
        if (!before) return;

        set((state) => {
          const map = state.maps[mapId];
          if (recipe(map) === false) return;
          map.updatedAt = new Date().toISOString();

          const history = (state.history[mapId] ??= {
            past: [],
            future: [],
            lastKey: null,
            lastAt: 0,
          });
          const now = Date.now();
          const coalesce =
            key !== undefined && key === history.lastKey && now - history.lastAt < COALESCE_MS;
          if (!coalesce) {
            history.past.push(before);
            if (history.past.length > HISTORY_LIMIT) history.past.shift();
          }
          history.future = [];
          history.lastKey = key ?? null;
          history.lastAt = now;
        });
      };

      const addMap = (map: Mindmap) => {
        set((state) => {
          state.maps[map.id] = map;
          state.mapOrder.unshift(map.id);
        });
        return map.id;
      };

      return {
        maps: {},
        mapOrder: [],
        history: {},

        createMap: (name) => addMap(buildMindmap(name)),

        renameMap: (mapId, name) =>
          edit(mapId, (map) => {
            const next = name.trim();
            if (!next || next === map.name) return false;
            map.name = next;
          }),

        deleteMap: (mapId) =>
          set((state) => {
            delete state.maps[mapId];
            delete state.history[mapId];
            state.mapOrder = state.mapOrder.filter((id) => id !== mapId);
          }),

        duplicateMap: (mapId) => {
          const source = get().maps[mapId];
          return source ? addMap(cloneMap(source, `${source.name} (copy)`)) : null;
        },

        importMap: (map) => addMap(cloneMap(map, map.name)),

        addChild: (mapId, parentId, text = "") => {
          const node = createNode(text, parentId);
          let added = false;
          edit(mapId, (map) => {
            const parent = map.nodes[parentId];
            if (!parent) return false;
            parent.collapsed = false;
            map.nodes[node.id] = node;
            parent.childIds.push(node.id);
            added = true;
          });
          return added ? node.id : null;
        },

        addSibling: (mapId, nodeId, text = "") => {
          const current = get().maps[mapId]?.nodes[nodeId];
          if (!current?.parentId) return null;
          const node = createNode(text, current.parentId);
          let added = false;
          edit(mapId, (map) => {
            const parent = map.nodes[node.parentId as string];
            if (!parent) return false;
            map.nodes[node.id] = node;
            parent.childIds.splice(parent.childIds.indexOf(nodeId) + 1, 0, node.id);
            added = true;
          });
          return added ? node.id : null;
        },

        updateNode: (mapId, nodeId, patch) =>
          edit(
            mapId,
            (map) => {
              const node = map.nodes[nodeId];
              if (!node) return false;
              const unchanged = Object.entries(patch).every(
                ([key, value]) => node[key as keyof MindmapNode] === value,
              );
              if (unchanged) return false;
              Object.assign(node, patch);
            },
            patch.text !== undefined || patch.notes !== undefined
              ? `node:${nodeId}:${Object.keys(patch).sort().join(",")}`
              : undefined,
          ),

        deleteNode: (mapId, nodeId) =>
          edit(mapId, (map) => {
            const node = map.nodes[nodeId];
            if (!node || nodeId === map.rootId) return false;
            for (const id of branchIds(map, nodeId)) delete map.nodes[id];
            const parent = node.parentId ? map.nodes[node.parentId] : undefined;
            if (parent) parent.childIds = parent.childIds.filter((id) => id !== nodeId);
          }),

        moveNode: (mapId, nodeId, toParentId, toIndex) =>
          edit(mapId, (map) => {
            const node = map.nodes[nodeId];
            const target = map.nodes[toParentId];
            // A node can never become a child of its own branch.
            if (!node || !target || nodeId === map.rootId) return false;
            if (nodeId === toParentId || isDescendant(map, toParentId, nodeId)) return false;

            const from = node.parentId ? map.nodes[node.parentId] : undefined;
            if (from) from.childIds = from.childIds.filter((id) => id !== nodeId);
            node.parentId = toParentId;
            target.collapsed = false;
            const index = Math.max(
              0,
              Math.min(toIndex ?? target.childIds.length, target.childIds.length),
            );
            target.childIds.splice(index, 0, nodeId);
          }),

        reorderNode: (mapId, nodeId, offset) =>
          edit(mapId, (map) => {
            const parentId = map.nodes[nodeId]?.parentId;
            const parent = parentId ? map.nodes[parentId] : undefined;
            if (!parent) return false;
            const from = parent.childIds.indexOf(nodeId);
            const to = Math.max(0, Math.min(from + offset, parent.childIds.length - 1));
            if (from === to) return false;
            parent.childIds = moveInArray(parent.childIds, from, to);
          }),

        toggleCollapse: (mapId, nodeId) =>
          edit(mapId, (map) => {
            const node = map.nodes[nodeId];
            if (!node || node.childIds.length === 0) return false;
            node.collapsed = !node.collapsed;
          }),

        undo: (mapId) => {
          const current = get().maps[mapId];
          const past = get().history[mapId]?.past;
          const previous = past?.[past.length - 1];
          if (!current || !previous) return;
          set((state) => {
            const history = state.history[mapId];
            history.past.pop();
            history.future.push(current);
            history.lastKey = null;
            state.maps[mapId] = previous;
          });
        },

        redo: (mapId) => {
          const current = get().maps[mapId];
          const future = get().history[mapId]?.future;
          const next = future?.[future.length - 1];
          if (!current || !next) return;
          set((state) => {
            const history = state.history[mapId];
            history.future.pop();
            history.past.push(current);
            history.lastKey = null;
            state.maps[mapId] = next;
          });
        },
      };
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => planitStorage),
      skipHydration: true,
      partialize: (state) => ({ maps: state.maps, mapOrder: state.mapOrder }) as MindmapsState,
      migrate: (persisted) => persisted as MindmapsState,
    },
  ),
);

/** Re-issues every id so imported or duplicated maps can never collide. */
function cloneMap(source: Mindmap, name: string): Mindmap {
  const now = new Date().toISOString();
  const ids = new Map(Object.keys(source.nodes).map((id) => [id, newId("node")]));
  const nodes: Record<string, MindmapNode> = {};

  for (const [oldId, node] of Object.entries(source.nodes)) {
    const id = ids.get(oldId) as string;
    nodes[id] = {
      ...node,
      id,
      parentId: node.parentId ? (ids.get(node.parentId) ?? null) : null,
      childIds: node.childIds
        .map((childId) => ids.get(childId))
        .filter((childId): childId is string => Boolean(childId)),
    };
  }

  return {
    id: newId("map"),
    name,
    rootId: ids.get(source.rootId) as string,
    nodes,
    createdAt: now,
    updatedAt: now,
  };
}

export function useMindmap(mapId: string) {
  return useMindmapsStore((state) => state.maps[mapId]);
}

export function useMindmapList() {
  return useMindmapsStore(
    useShallow((state) => state.mapOrder.map((id) => state.maps[id]).filter(Boolean)),
  );
}

export function useMindmapUndoState(mapId: string) {
  return useMindmapsStore(
    useShallow((state) => ({
      canUndo: (state.history[mapId]?.past.length ?? 0) > 0,
      canRedo: (state.history[mapId]?.future.length ?? 0) > 0,
    })),
  );
}

export function useMindmapActions() {
  return useMindmapsStore.getState();
}

export function mindmapActions() {
  return useMindmapsStore.getState();
}

export function getMindmap(mapId: string): Mindmap | undefined {
  return useMindmapsStore.getState().maps[mapId];
}

/** Reloads maps when another tab saves, like useBoardsSync. */
export function useMindmapsSync() {
  useEffect(
    () =>
      subscribeToExternalChanges(STORAGE_KEY, () => {
        void Promise.resolve(useMindmapsStore.persist.rehydrate()).then(() =>
          useMindmapsStore.setState({ history: {} }),
        );
      }),
    [],
  );
}
