"use client";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { MapNode, isNodeDragData } from "@/components/mindmap/MapNode";
import { NodeDialog } from "@/components/mindmap/NodeDialog";
import { SendToBoardDialog } from "@/components/mindmap/SendToBoardDialog";
import { mapMenu, nodeMenu } from "@/components/mindmap/menus";
import { useMapKeys } from "@/components/mindmap/useMapKeys";
import { Button, IconButton } from "@/components/ui/Button";
import { MenuButton, openContextMenu, openMenuAtElement } from "@/components/ui/ContextMenu";
import { Input } from "@/components/ui/Field";
import { MouseIcon, PlusIcon, RedoIcon, UndoIcon } from "@/components/ui/Icons";
import { Kbd } from "@/components/ui/Kbd";
import { formatRelative } from "@/helpers/board";
import { commandsFromMenu } from "@/helpers/menu";
import { countNodes } from "@/helpers/mindmap";
import { layoutMindmap, type Side } from "@/helpers/mindmap-layout";
import { SHORTCUTS, formatCombo } from "@/helpers/shortcuts";
import { useHydrated } from "@/helpers/use-hydrated";
import { useIsMac, wantsNativeMenu } from "@/helpers/use-hotkeys";
import {
  getMindmap,
  useMindmap,
  useMindmapActions,
  useMindmapUndoState,
  useMindmapsStore,
} from "@/store/mindmaps";
import { useRegisterCommands } from "@/store/ui";

const PADDING = 80;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2.5;

type View = { x: number; y: number; zoom: number };

function nodeElement(nodeId: string) {
  return document.querySelector(`[data-node-id="${CSS.escape(nodeId)}"]`);
}

export function MapView({ mapId }: { mapId: string }) {
  const router = useRouter();
  const hydrated = useHydrated(useMindmapsStore);
  const map = useMindmap(mapId);
  const actions = useMindmapActions();
  const { canUndo, canRedo } = useMindmapUndoState(mapId);
  const mac = useIsMac();

  const canvasRef = useRef<HTMLDivElement>(null);
  const fitted = useRef(false);
  const panStart = useRef<{ x: number; y: number; view: View } | null>(null);

  const [view, setView] = useState<View>({ x: 0, y: 0, zoom: 1 });
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [notesFor, setNotesFor] = useState<string | null>(null);
  const [sendFrom, setSendFrom] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState("");

  const layout = useMemo(() => (map ? layoutMindmap(map) : null), [map]);
  const sides = useMemo(() => {
    const result: Record<string, Side> = {};
    for (const box of layout?.nodes ?? []) result[box.id] = box.side;
    return result;
  }, [layout]);

  function fit() {
    const element = canvasRef.current;
    if (!element || !layout || layout.nodes.length === 0) return;
    const { width, height } = element.getBoundingClientRect();
    const zoom = Math.min(
      MAX_ZOOM,
      Math.max(
        MIN_ZOOM,
        Math.min(
          (width - PADDING) / Math.max(layout.bounds.width, 1),
          (height - PADDING) / Math.max(layout.bounds.height, 1),
          1.4,
        ),
      ),
    );
    const centerX = layout.bounds.minX + layout.bounds.width / 2;
    const centerY = layout.bounds.minY + layout.bounds.height / 2;
    setView({ x: width / 2 - centerX * zoom, y: height / 2 - centerY * zoom, zoom });
  }

  function zoomBy(factor: number, origin?: { x: number; y: number }) {
    const element = canvasRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const point = origin ?? { x: rect.width / 2, y: rect.height / 2 };
    setView((current) => {
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current.zoom * factor));
      const scale = zoom / current.zoom;
      return {
        zoom,
        x: point.x - (point.x - current.x) * scale,
        y: point.y - (point.y - current.y) * scale,
      };
    });
  }

  const onWheelZoom = useEffectEvent((event: WheelEvent) => {
    const element = canvasRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    zoomBy(event.deltaY < 0 ? 1.1 : 1 / 1.1, {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  });
  const fitNow = useEffectEvent(() => fit());

  // Wheel has to be non-passive to zoom without scrolling the page.
  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      onWheelZoom(event);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  // Frame the whole map the first time it renders.
  useEffect(() => {
    if (!hydrated || !map || fitted.current || !layout) return;
    fitted.current = true;
    requestAnimationFrame(() => fitNow());
  }, [hydrated, map, layout]);

  useEffect(() => {
    return combine(
      monitorForElements({
        canMonitor: ({ source }) => isNodeDragData(source.data),
        onDrop: ({ source, location }) => {
          const target = location.current.dropTargets[0];
          if (!target || !isNodeDragData(source.data) || !isNodeDragData(target.data)) return;
          actions.moveNode(mapId, source.data.nodeId, target.data.nodeId);
          setSelected(source.data.nodeId);
        },
      }),
    );
  }, [mapId, actions]);

  function startEdit(nodeId: string) {
    setSelected(nodeId);
    setEditing(nodeId);
  }

  function commitEdit(nodeId: string, text: string) {
    actions.updateNode(mapId, nodeId, { text: text.trim() });
    setEditing(null);
  }

  function nodeEntries(nodeId: string) {
    const current = getMindmap(mapId);
    return current
      ? nodeMenu(current, nodeId, {
          onAddChild: () => {
            const id = actions.addChild(mapId, nodeId);
            if (id) startEdit(id);
          },
          onAddSibling: () => {
            const id = actions.addSibling(mapId, nodeId);
            if (id) startEdit(id);
          },
          onRename: () => startEdit(nodeId),
          onNotes: () => setNotesFor(nodeId),
          onSendToBoard: () => setSendFrom(nodeId),
        })
      : [];
  }

  function mapEntries() {
    const current = getMindmap(mapId);
    return current
      ? mapMenu(current, {
          onFit: fit,
          onRename: () => {
            setName(current.name);
            setRenaming(true);
          },
          onDeleted: () => router.push("/mindmap"),
        })
      : [];
  }

  function openNodeMenu(nodeId: string) {
    const element = nodeElement(nodeId);
    if (element) openMenuAtElement(element, nodeEntries(nodeId));
  }

  useMapKeys({
    mapId,
    selected,
    select: setSelected,
    sides,
    onEdit: startEdit,
    onNotes: setNotesFor,
    onSendToBoard: setSendFrom,
    onNodeMenu: openNodeMenu,
    onFit: fit,
    onZoom: (factor) => zoomBy(factor),
  });

  useRegisterCommands(() => [
    {
      id: "map:add-child",
      title: "Add a child node",
      group: "This map",
      shortcut: SHORTCUTS.addChild.keys[0],
      run: () => {
        const id = actions.addChild(mapId, selected ?? getMindmap(mapId)?.rootId ?? "");
        if (id) startEdit(id);
      },
    },
    {
      id: "map:send",
      title: "Send branch to a Kanban board",
      group: "This map",
      shortcut: SHORTCUTS.sendToBoard.keys[0],
      run: () => setSendFrom(selected ?? getMindmap(mapId)?.rootId ?? null),
    },
    ...commandsFromMenu(mapEntries(), "This map"),
  ]);

  if (!hydrated) {
    return (
      <div className="px-4 pt-8 sm:px-6">
        <div className="h-3 w-24 animate-pulse rounded bg-raised" />
        <div className="mt-3 h-8 w-64 animate-pulse rounded-lg bg-raised" />
        <div className="mt-8 h-[60vh] animate-pulse rounded-2xl bg-surface" />
      </div>
    );
  }

  if (!map || !layout) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-24 text-center">
        <p className="text-2xl font-extrabold tracking-tight">Map not found</p>
        <p className="mt-2 text-sm text-zinc-400">
          It may have been deleted, or it lives in another browser.
        </p>
        <Link
          href="/mindmap"
          className="mt-6 inline-block text-sm font-semibold text-accent-light hover:text-white"
        >
          ← Back to maps
        </Link>
      </div>
    );
  }

  const notesNode = notesFor ? map.nodes[notesFor] : undefined;
  const sendNode = sendFrom ? map.nodes[sendFrom] : undefined;

  function onCanvasPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.target !== event.currentTarget) return;
    setSelected(null);
    panStart.current = { x: event.clientX, y: event.clientY, view };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onCanvasPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = panStart.current;
    if (!start) return;
    setView({
      zoom: start.view.zoom,
      x: start.view.x + (event.clientX - start.x),
      y: start.view.y + (event.clientY - start.y),
    });
  }

  function endPan(event: PointerEvent<HTMLDivElement>) {
    if (!panStart.current) return;
    panStart.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function onCanvasMenu(event: MouseEvent<HTMLDivElement>) {
    if (wantsNativeMenu(event.target)) return;
    openContextMenu(event, mapEntries());
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col">
      <header className="shrink-0 px-4 pt-6 pb-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href="/mindmap"
              className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase transition-colors hover:text-zinc-300"
            >
              ← All maps
            </Link>
            {renaming ? (
              <Input
                autoFocus
                aria-label="Map name"
                value={name}
                className="mt-1 h-10 w-72 max-w-full text-xl font-extrabold tracking-tight"
                onChange={(event) => setName(event.target.value)}
                onBlur={() => {
                  actions.renameMap(mapId, name);
                  setRenaming(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                  if (event.key === "Escape") setRenaming(false);
                }}
              />
            ) : (
              <h1 className="mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setName(map.name);
                    setRenaming(true);
                  }}
                  title="Rename map"
                  className="max-w-full truncate text-left text-2xl font-extrabold tracking-tight transition-colors hover:text-white sm:text-3xl"
                >
                  {map.name}
                </button>
              </h1>
            )}
            <p className="mt-1 text-[13px] font-medium text-zinc-500">
              {countNodes(map)} nodes · edited {formatRelative(map.updatedAt)}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <IconButton
              aria-label="Undo"
              title={`Undo (${formatCombo(SHORTCUTS.undo.keys[0], mac)})`}
              disabled={!canUndo}
              onClick={() => actions.undo(mapId)}
            >
              <UndoIcon />
            </IconButton>
            <IconButton
              aria-label="Redo"
              title={`Redo (${formatCombo(SHORTCUTS.redo.keys[0], mac)})`}
              disabled={!canRedo}
              onClick={() => actions.redo(mapId)}
            >
              <RedoIcon />
            </IconButton>
            <span className="mx-1.5 h-5 w-px bg-line" />
            <Button
              size="sm"
              onClick={() => {
                const id = actions.addChild(mapId, selected ?? map.rootId);
                if (id) startEdit(id);
              }}
            >
              <PlusIcon width={14} height={14} />
              Node
            </Button>
            <MenuButton label="Map actions" entries={mapEntries} />
          </div>
        </div>
      </header>

      <div
        ref={canvasRef}
        onPointerDown={onCanvasPointerDown}
        onPointerMove={onCanvasPointerMove}
        onPointerUp={endPan}
        onPointerCancel={endPan}
        onContextMenu={onCanvasMenu}
        className="relative min-h-0 flex-1 cursor-grab overflow-hidden border-y border-line bg-grid active:cursor-grabbing"
      >
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
        >
          <svg
            className="pointer-events-none absolute overflow-visible"
            width={1}
            height={1}
            aria-hidden="true"
          >
            {layout.edges.map((edge) => (
              <path
                key={edge.id}
                d={edge.path}
                fill="none"
                stroke="var(--color-line-strong)"
                strokeWidth={2}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {layout.nodes.map((box) => (
            <MapNode
              key={box.id}
              box={box}
              isRoot={box.id === map.rootId}
              selected={box.id === selected}
              editing={box.id === editing}
              onSelect={() => setSelected(box.id)}
              onStartEdit={() => startEdit(box.id)}
              onCommitEdit={(text) => commitEdit(box.id, text)}
              onCancelEdit={() => setEditing(null)}
              onToggleCollapse={() => actions.toggleCollapse(mapId, box.id)}
              onContextMenu={(event) => {
                setSelected(box.id);
                openContextMenu(event, nodeEntries(box.id));
              }}
            />
          ))}
        </div>

        <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-xl border border-line bg-surface/90 p-1 backdrop-blur">
          <IconButton aria-label="Zoom out" onClick={() => zoomBy(1 / 1.2)}>
            −
          </IconButton>
          <span className="w-12 text-center font-mono text-[11px] text-zinc-500">
            {Math.round(view.zoom * 100)}%
          </span>
          <IconButton aria-label="Zoom in" onClick={() => zoomBy(1.2)}>
            +
          </IconButton>
          <Button size="sm" variant="ghost" onClick={fit}>
            Fit
          </Button>
        </div>
      </div>

      <footer className="hidden shrink-0 flex-wrap items-center gap-x-5 gap-y-1 px-6 py-2 text-[11px] font-medium text-zinc-500 md:flex">
        <Hint keys={["Tab"]} label="Child" />
        <Hint keys={["Enter"]} label="Sibling" />
        <Hint keys={["↑", "↓", "←", "→"]} label="Move around" />
        <Hint keys={["F2"]} label="Rename" />
        <Hint keys={["Space"]} label="Collapse" />
        <span className="inline-flex items-center gap-1.5">
          <MouseIcon width={13} height={13} />
          Drag a node onto another to re-parent
        </span>
        <span className="ml-auto">
          <Hint keys={["?"]} label="All shortcuts" />
        </span>
      </footer>

      {notesNode ? (
        <NodeDialog
          map={map}
          node={notesNode}
          onClose={() => setNotesFor(null)}
          onSendToBoard={() => {
            setSendFrom(notesNode.id);
            setNotesFor(null);
          }}
        />
      ) : null}

      {sendNode ? (
        <SendToBoardDialog map={map} node={sendNode} onClose={() => setSendFrom(null)} />
      ) : null}
    </div>
  );
}

function Hint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-0.5">
        {keys.map((key) => (
          <Kbd key={key}>{key}</Kbd>
        ))}
      </span>
      {label}
    </span>
  );
}
