# Kanban MVP — testing checklist

Run `bun run dev` and work through this. Items marked ✅ were verified in a
browser during implementation; the rest are yours.

## Boards

- ✅ `/kanban` shows an empty state, then the board grid after creating one
- ✅ New board → modal → Create navigates to the board with 4 default columns
- [ ] Enter in the New board modal creates the board
- [ ] Rename board from the list menu and from the board header (click the title)
- [ ] Duplicate board copies columns, cards and labels, and the copy edits
      independently of the original
- [ ] Delete board asks for confirmation and returns you to `/kanban`

## Columns

- ✅ Add column (header button and the trailing "+ Add column" placeholder)
- [ ] Edit column: rename, set a WIP limit, clear the limit (empty = no limit)
- ✅ Over the WIP limit turns the count amber
- ✅ Move left / Move right from the column menu; ends are disabled
- ✅ Drag a column by its header to reorder; indigo line shows the drop position
- [ ] Delete column confirms when it still holds cards, and removes those cards

## Cards

- ✅ Add card (Enter submits, Shift+Enter newline, Escape closes the composer)
- ✅ Open a card, edit title/description/priority/due date, toggle labels
- ✅ Add a new label with a color from inside the card dialog
- [ ] Delete a label from a card and confirm it disappears from other cards too
- ✅ Past due dates render amber
- ✅ Delete card from the card menu and from the card dialog

## Drag and drop

- ✅ Card between columns
- ✅ Card reorder inside a column
- [ ] Card onto an empty column
- [ ] Drag with a filter active — the card lands where you dropped it, and the
      hidden cards keep their relative order
- [ ] Auto-scroll: drag a card to the right edge on a board wider than the screen
- ✅ Keyboard/touch fallback: card menu Move up / Move down / Move to →

## Filters

- ✅ Text search matches title and description
- [ ] Priority filter
- [ ] Label chips (multiple selected = match any)
- ✅ Clear resets everything
- [ ] Columns with no matches show "No cards match the filter"

## Persistence

- ✅ Reload keeps everything (localStorage key `planit.kanban.v1`)
- [ ] No hydration flash or console warning on reload
- [ ] Open a second tab — it loads the same data on refresh (no live sync yet)
- [ ] Private window / storage blocked: the app still works for the session

## Import / export

- [ ] Export JSON from the board list menu and from the board menu
- [ ] Import that file — it lands as a new board, original untouched
- [ ] Import a malformed JSON file — inline error, nothing breaks

## Layout

- ✅ Desktop: columns fill the viewport height, board scrolls horizontally, page
      itself never scrolls vertically
- [ ] Mobile (≤640px): columns are full width and snap, dialogs are full screen
- [ ] Long card titles and long column titles truncate or wrap without breaking
      the layout
- [ ] Tab through the board: every control has a visible focus ring
