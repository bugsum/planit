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
