# Testing checklist

Run `bun run dev` and work through this. Every item is unchecked after the
UI refresh; tick them as you go.

## Branding

- [ ] Browser tab shows the blue "P" favicon (Chrome/Edge/Firefox use the SVG,
      older browsers the .ico)
- [ ] Top bar and homepage footer show the logo mark next to "Plan It"
- [ ] Accent color is the brand blue across buttons, selection rings and links;
      small accent text stays readable on the dark background
- [ ] iOS "Add to Home Screen" uses the Apple icon and the name "Plan It"
- [ ] Chrome "Install app": name "Plan It", dark splash, blue icon
- [ ] `/manifest.webmanifest` lists the 192 and 512 icons
- [ ] Mobile browser UI (address bar) is tinted to the dark canvas color
- [ ] README on GitHub shows the logo above the title

## SEO and social previews

Run these against the deployed site (https://planit.iamsamarth.xyz).

- [ ] `/robots.txt` allows everything and points to the sitemap
- [ ] `/sitemap.xml` lists `/` and `/kanban`
- [ ] View source on `/`: canonical, description, Open Graph and Twitter tags,
      and a JSON-LD script (WebSite, Organization, SoftwareApplication)
- [ ] `/kanban` has its own title, description, canonical and social image
- [ ] A board URL has `<meta name="robots" content="noindex, follow">`
- [ ] Share the homepage link in Slack/Discord/X: large card with the logo image
- [ ] https://www.opengraph.xyz or LinkedIn Post Inspector shows the preview
- [ ] Google Rich Results Test parses the JSON-LD without errors
- [ ] Submit the sitemap in Google Search Console

## Reliability

- [ ] Open the same board in two tabs; edit in one, switch to the other — it
      shows the change within a moment, and nothing gets overwritten
- [ ] After a change arrives from the other tab, undo/redo start fresh
- [ ] Storage full: DevTools → Application → Storage → "Simulate custom storage
      quota" at ~1 KB, then edit a card — the red "Couldn't save" banner appears
      and can be dismissed
- [ ] Creating or importing a board asks for persistent storage (Firefox shows a
      prompt once; Chrome grants silently — check `await navigator.storage.persisted()`)
- [ ] `/does-not-exist` shows the branded 404 with links to boards and home
- [ ] Error page: throw inside a component temporarily — "Something broke" with
      a working Try again

## Command palette

- [ ] `Ctrl/⌘ + K` opens it from any page, including while typing in a field
- [ ] Top bar search button opens it; shows `⌘K` / `Ctrl+K`
- [ ] Empty query on a board: "This board" commands first, then navigation,
      general and the five most recent boards
- [ ] On `/kanban`: "Boards list" commands, and "New board" opens the template modal
- [ ] "New board" from the homepage lands on `/kanban` with the modal open
- [ ] Typing fuzzy-matches (e.g. "nwcol" finds "New column"); card titles from
      every board appear with "Board · Column" underneath
- [ ] Picking a card on the current board opens it in place
- [ ] Picking a card on another board navigates there and opens it; the URL
      ends up without `?card=`
- [ ] ↑/↓ wrap, Enter runs, Esc and clicking the backdrop close
- [ ] Disabled actions (e.g. Undo with no history) don't appear
- [ ] Switching boards via the palette starts with no filters or open card

## Checklists and notes

- [ ] Add item, type, Enter adds the next one below and focuses it
- [ ] Backspace on an empty item removes it and focuses the neighbour
- [ ] Alt + ↑/↓ reorders and keeps focus
- [ ] Leaving an item empty (click away) removes it
- [ ] Progress bar and card badge show done/total; both turn green at 100%
- [ ] Undo reverses a check, a rename (as one step), an add and a delete
- [ ] Duplicating a card copies its checklist
- [ ] Description renders markdown: headings, lists, `**bold**`, code, tables,
      task lists, links (open in a new tab)
- [ ] `<script>alert(1)</script>` in a description shows as text, never runs
- [ ] Click the preview (not a link) to edit; first Esc returns to preview,
      second Esc closes the dialog
- [ ] Cards with notes show the small lines icon
- [ ] Boards saved before this update load fine and gain empty checklists
- [ ] Exported JSON includes checklists; a v1 export still imports

## Quick-add and templates

- [ ] Composer hint shows `#label  !high  @tomorrow` until a token matches
- [ ] `Fix login #bug !high @tomorrow` → title "Fix login", Bug label, High,
      tomorrow's date; chips preview it before submitting
- [ ] Multi-word labels match without spaces (`#nicetohave`)
- [ ] Unknown `#tag` and invalid `@2026-02-30` stay in the title
- [ ] `!1`–`!4` and `!low/!med/!high/!urgent` both work
- [ ] `@fri` means the next Friday (a week out when today is Friday)
- [ ] Only tokens (e.g. `#bug !low`) → Add is disabled
- [ ] Due dates show the correct day in a timezone west of UTC
- [ ] New board modal lists 5 templates with column chips and WIP limits;
      arrow keys move between them
- [ ] Each template creates the right columns, WIP limits and labels;
      Classic matches the old defaults

## Homepage

- [ ] Hero, principles, features, keyboard, planners, how-it-works and closing
      CTA render in order with no layout jumps
- [ ] Hero text and buttons fade up once on load; with reduced motion enabled
      in the OS they appear instantly
- [ ] "Start planning" and the Kanban planner card go to `/kanban`
- [ ] GitHub links open the repo in a new tab
- [ ] Mock board: 2 columns on mobile, 4 on desktop; the floating menu only
      shows on large screens
- [ ] Keyboard section shows ⌘ on macOS and Ctrl elsewhere
- [ ] Pressing `?` on the homepage opens the shortcut guide
- [ ] No horizontal scroll at 375px width

## Top bar

- [ ] Stays pinned while scrolling the homepage
- [ ] Kanban link is highlighted on `/kanban` and on a board
- [ ] Shortcuts button opens the guide; the label and `?` chip hide on small screens

## Shortcut guide

- [ ] `?` opens it from any page, Esc closes it
- [ ] Groups: General, Board, Navigate, Cards, Boards list
- [ ] `?` does nothing while typing in a field

## Boards list (`/kanban`)

- [ ] Empty state shows "Start your first plan." with Create and Import
- [ ] `N` opens the New board modal; Enter creates and navigates to the board
- [ ] `Ctrl/⌘ + O` opens the file picker for import
- [ ] Board tiles show a thumbnail of their columns, colored by each card's first label
- [ ] Right-click a tile: Open, Open in new tab, Rename, Duplicate, Export, Delete
- [ ] Right-click empty space: New board, Import, Keyboard shortcuts
- [ ] The ⋮ button on a tile opens the same menu, and clicking it again closes it
- [ ] Clicking a tile (outside the ⋮ button) opens the board

## Board layout

- [ ] Page never scrolls vertically; columns scroll inside, board scrolls sideways
- [ ] Board title click → inline rename; Enter saves, Esc cancels
- [ ] Header stats show columns, cards, "N shown" while filtering, and last edit time
- [ ] Footer hint bar is visible on desktop and hidden on mobile
- [ ] Mobile (≤640px): columns are full width and snap; dialogs go full screen
- [ ] Long card and column titles wrap or truncate without breaking layout

## Context menus

- [ ] Right-click a card: selects it, opens Open / Duplicate / Move up / Move down /
      Move to → / Delete
- [ ] Right-click a column (header or empty area): Add card, Edit column, Move
      left/right, Delete column
- [ ] Right-click empty board space: New column, Search, Rename, Undo, Redo,
      Export, Duplicate, Shortcuts, Delete board
- [ ] Menus open at the cursor and flip or shift to stay on screen near edges
- [ ] Arrow keys move the highlight, Enter runs it, Esc or Tab closes
- [ ] Clicking outside, scrolling, resizing or switching windows closes the menu
- [ ] Right-click inside an input, textarea or any dialog shows the browser's
      own menu (copy/paste still works)
- [ ] Android long-press on a card opens the card menu

## Keyboard (board page)

- [ ] Arrow keys or H/J/K/L: first press selects the first card, then moves the
      selection; left/right skip empty columns
- [ ] Selected card has an accent ring and scrolls into view
- [ ] Enter opens the selected card
- [ ] Shift + ↑/↓ reorders; Shift + ←/→ moves to the neighbouring column at the
      same row
- [ ] With a filter active, Shift + ↑/↓ swaps with the visible neighbour and
      hidden cards keep their order
- [ ] `Ctrl/⌘ + D` duplicates the card below itself and selects the copy
- [ ] Delete / Backspace deletes the card and selects its neighbour
- [ ] 0–4 set priority: none, low, medium, high, urgent
- [ ] `N` opens the composer in the selected card's column (first column if none)
- [ ] `Shift + N` opens the add-column input
- [ ] `/` and `Ctrl/⌘ + F` focus search (the browser find bar does not open);
      Esc clears the query, a second Esc leaves the field
- [ ] `Ctrl/⌘ + Shift + E` downloads the board JSON
- [ ] `Shift + F10` or the Menu key opens the selected card's menu at the card
- [ ] Esc clears the selection
- [ ] No shortcut fires while typing in any field or while a dialog is open

## Undo / redo

- [ ] `Ctrl/⌘ + Z` undoes, `Ctrl/⌘ + Shift + Z` and `Ctrl/⌘ + Y` redo
- [ ] Header undo/redo buttons disable when there is nothing to undo/redo
- [ ] Typing a card title or description undoes as one step, not per keystroke
- [ ] Undo restores a deleted card, a deleted column (with its cards) and a
      deleted label (on every card)
- [ ] A new edit after undo clears the redo stack
- [ ] History is per board and resets on reload (by design)

## Columns

- [ ] Add column from the header button, the trailing placeholder, and `Shift + N`
- [ ] Edit column (menu or double-click the header): rename, set and clear a WIP limit
- [ ] Over the WIP limit turns the count amber
- [ ] Drag a column by its header; an accent line shows the drop side
- [ ] Delete column confirms when it holds cards

## Cards

- [ ] Add card: Enter submits and keeps the composer open, Shift + Enter adds a
      newline, Esc closes, clicking away with an empty field closes it
- [ ] Click a card to open it; the ⋮ button opens the menu instead
- [ ] Dialog: edit title, description, priority, due date; toggle labels
- [ ] Add a label with a color; Enter in the label field adds it
- [ ] Edit labels → × deletes a label from every card after confirming
- [ ] High and urgent cards show a colored stripe on the left edge
- [ ] Past due dates render amber

## Drag and drop

- [ ] Card between columns, within a column, and onto an empty column
- [ ] The dropped card becomes the selection
- [ ] Drag with a filter active lands where dropped
- [ ] Auto-scroll when dragging to the edge of a wide board
- [ ] Drag works right after a hard reload of a board URL

## Filters

- [ ] Search matches title and description
- [ ] `/` hint in the search box hides on focus or when it has text
- [ ] Priority select and label chips (multiple = match any)
- [ ] Clear filters resets everything
- [ ] Columns with no matches show "No cards match the filter"

## Persistence and import/export

- [ ] Reload keeps everything (localStorage key `planit.kanban.v1`)
- [ ] No hydration warning in the console on any page
- [ ] Export from the tile menu, board menu and shortcut
- [ ] Import lands as a new board; a malformed file shows an inline error

## Accessibility

- [ ] Tab through every page: all controls show a visible focus ring
- [ ] Menus announce as menus (screen reader) and restore focus when closed
