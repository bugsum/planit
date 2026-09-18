# Architecture

Plan It is a set of planning surfaces. Kanban is the first; Mindmap and Roadmap
are placeholders on the home page. Nothing in the shared layers is Kanban
specific.

## Layout

```
src/
  app/                 routes only (thin server components)
  components/ui/       generic primitives (Button, Field, Modal, Menu, Badge)
  components/app/      shell pieces (TopBar, PlannerCard)
  components/kanban/   the Kanban feature
  store/               zustand stores, one per planner
  helpers/             pure utilities + the persistence adapter
  types/               shared types
```

Adding a planner means adding `app/<planner>/`, `components/<planner>/` and
`store/<planner>.ts`. Nothing else moves.

## Data model (`src/types/kanban.ts`)

A `Board` owns its `columns`, `cards` and `labels`. Cards are stored in a
`Record<id, Card>` for O(1) edits; `column.cardIds` is the only source of card
order. Labels are per board.

## State (`src/store/boards.ts`)

One zustand store holds `{ boards, boardOrder }`, wrapped in `persist(immer(...))`.
All mutations are store actions — components never rewrite board objects
themselves. Every mutation bumps `board.updatedAt` through the internal `touch`
helper.

Components read through narrow selectors (`useBoard`, `useColumn`, `useCard`) and
call actions through `useBoardActions()`, which returns the action functions
without subscribing to state.

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
  and a draggable via its header handle.
- `BoardView` runs the single `monitorForElements` that turns a drop into one
  `moveCard` / `moveColumn` call, plus horizontal auto-scroll.

Pragmatic ships no keyboard dragging, so every card menu carries **Move up**,
**Move down** and **Move to →**, and every column menu has **Move left/right**.
Those compute positions from the stored column order, so they stay correct while
a filter hides cards.

## Import / export (`src/helpers/transfer.ts`)

Boards export as `{ app, kind, version, board }` JSON. Import validates and
repairs the shape, then `importBoard` re-issues every id so an imported or
duplicated board can never collide with an existing one.
