# Architecture

Plan It is a set of planning surfaces. Kanban is the first; Mindmap and Roadmap
are placeholders on the home page. Nothing in the shared layers is Kanban
specific.

## Layout

```
src/
  app/                 routes only (thin server components)
  components/ui/       generic primitives (Button, Field, Modal, ContextMenu, Kbd, Icons)
  components/app/      app shell (TopBar, ShortcutsDialog, AppOverlays)
  components/home/     homepage sections (static server components)
  components/kanban/   the Kanban feature, including its menus and keybindings
  store/               zustand stores: one per planner, plus ui.ts for app chrome
  helpers/             pure utilities, hooks, the shortcut registry, the storage adapter
  types/               shared types
```

Adding a planner means adding `app/<planner>/`, `components/<planner>/` and
`store/<planner>.ts`, then registering its shortcuts in `helpers/shortcuts.ts`.
The context menu, shortcut guide and hotkey plumbing are reused as-is.

## Data model (`src/types/kanban.ts`)

A `Board` owns its `columns`, `cards` and `labels`. Cards are stored in a
`Record<id, Card>` for O(1) edits; `column.cardIds` is the only source of card
order. Labels are per board.

## State (`src/store/boards.ts`)

One zustand store holds `{ boards, boardOrder, history }`, wrapped in
`persist(immer(...))`. Only `boards` and `boardOrder` are persisted.

Every board mutation goes through the internal `edit(boardId, recipe, key?)`:

- It snapshots the board before the change and pushes it onto that board's
  undo stack (capped at 100), clears the redo stack and bumps `updatedAt`.
- A recipe returns `false` when nothing changed, so no-op moves or renames
  never create empty undo steps.
- Edits sharing a `key` within a second coalesce. `updateCard` keys on card id
  plus the patched fields, so typing a title is one undo step.

Immer's structural sharing keeps snapshots cheap: unchanged columns and cards
are shared between history entries.

Components read through narrow selectors (`useBoard`, `useBoardList`,
`useUndoState`) and call actions through `useBoardActions()` / `boardActions()`,
which return the action functions without subscribing. Event handlers that build
menus read the latest board with `getBoard(id)`.

## UI state (`src/store/ui.ts`)

App chrome state that is not data: the open context menu and whether the
shortcut guide is open. Plain zustand, not persisted.

## Keyboard (`src/helpers/shortcuts.ts`, `src/helpers/use-hotkeys.ts`)

`SHORTCUTS` is the single registry of keybindings. It feeds both the bindings
and the shortcut guide, so they can never drift apart. Combos are written as
`mod+shift+z`; `mod` resolves to ⌘ on macOS and Ctrl elsewhere.

`useHotkeys(list)` binds on `window` through `useEffectEvent`, so handlers always
see current props without re-binding. It ignores key presses while focus is in
an input, textarea, select or contenteditable, and while any `<dialog>` is open.

`useBoardKeys` (in `components/kanban/`) implements board control. Selection is
a card id held by `BoardView`; navigation walks the visible (filtered) lanes.
Moves anchor on the neighbouring visible card and translate that into stored
order, so hidden cards keep their relative positions.

## Context menus (`src/components/ui/ContextMenu.tsx`)

One `ContextMenuHost` is mounted in the root layout via `AppOverlays`. Anything
can open it with `openContextMenu(event, entries)` or `openMenuAtElement(el,
entries)`; the ⋮ buttons use `MenuButton`, which opens the same host anchored
to the button. Entries are plain data (`MenuEntry` in `types/ui.ts`), built by
functions in `components/kanban/menus.ts`, so a right-click and the ⋮ button on
the same thing always show identical actions.

The host positions itself inside the viewport, owns the keyboard while open
(arrows, Home/End, Enter, Esc, Tab), stops key events from reaching board
shortcuts, and restores focus on close. Inputs, textareas and open dialogs keep
the browser's native menu.

## Persistence (`src/helpers/storage.ts`)

`planitStorage` is the only place that touches `localStorage`. It implements
zustand's `StateStorage` interface, so swapping in an API-backed driver later
means rewriting three methods — no component or store changes.

The store uses `skipHydration`, and `useHydrated()` kicks off the read on mount.
That keeps server markup and the first client render identical; pages show a
skeleton until hydration finishes.

## Drag and drop

`@atlaskit/pragmatic-drag-and-drop` (the maintained successor to
react-beautiful-dnd). Drag payloads and type guards live in `src/helpers/dnd.ts`.

- `CardItem` is both a draggable and a drop target, using the hitbox package's
  closest-edge helpers to decide above/below.
- `ColumnView` is a drop target for cards (empty column and end-of-list drops)
  and a draggable via its header.
- `BoardView` runs the single `monitorForElements` that turns a drop into one
  `moveCard` / `moveColumn` call, plus horizontal auto-scroll. It binds once the
  board has hydrated, so it also works after a hard reload of a board URL.

Pragmatic ships no keyboard dragging; the keyboard moves above and the card and
column menus cover that.

## Styling and branding

Tailwind v4 with design tokens in `src/app/globals.css` (`canvas`, `surface`,
`raised`, `line`, `line-strong`, `accent`, `accent-hover`, `accent-light`).
Global element styles sit in `@layer base` so utilities can override them.
Animations respect `prefers-reduced-motion`.

`accent` is the brand blue `#0A4BFE`, used for fills (white text on it passes
AA). On the dark canvas it is too dark for small text, so text, focus outlines
and selection rings use `accent-light` instead.

Name, tagline, colors and repo URL live in `src/helpers/site.ts`. The logo is a
vector in `components/app/Logo.tsx`, mirrored by `src/app/icon.svg`.

Icons use Next's file conventions, which generate the `<head>` tags:

- `src/app/favicon.ico` (16/32/48) for legacy browsers
- `src/app/icon.svg` for modern browsers
- `src/app/apple-icon.png` (180px) for iOS
- `src/app/manifest.ts` pointing at `public/icon-192.png` and `public/icon-512.png`

The PNGs are rendered from the SVG so every size matches.

The homepage is fully static server components; the only client code it ships
is the platform-aware key chips and the app-wide overlays.

## Import / export (`src/helpers/transfer.ts`)

Boards export as `{ app, kind, version, board }` JSON. Import validates and
repairs the shape, then `importBoard` re-issues every id so an imported or
duplicated board can never collide with an existing one.
