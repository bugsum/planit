# Changelog

All notable changes are documented here. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [Unreleased]

## [0.2.1] - 2026-09-19

### Changed

- Updated React and React DOM to 19.3.0

## [0.2.0] - 2026-09-19

### Added

- Command palette (Ctrl/⌘ + K): fuzzy search across actions, boards and card titles on every board
- Card checklists with a progress bar and a done/total badge on the card
- Markdown in card descriptions (GitHub-flavored, raw HTML disabled)
- Quick-add syntax in the card composer: `#label`, `!priority`, `@date`
- Board templates: Classic, Sprint, Bug triage, Product launch, Personal project
- Open tabs stay in sync; a banner warns when the browser can't save
- The browser is asked to keep boards in persistent storage
- Branded 404 and error pages
- SEO: canonical URLs, sitemap, robots.txt, Open Graph and Twitter images, structured data
- Repository guards: Prettier, stricter ESLint, git hooks, CI, PR checks, release workflow,
  stale bot, Dependabot, CODEOWNERS and an importable ruleset for `master`

### Changed

- Switching boards starts fresh instead of carrying filters, selection and the open card over
- Stored boards moved to schema v2 (checklists); older data and v1 exports migrate automatically

### Fixed

- Due dates showed a day early in time zones west of UTC

## [0.1.0] - 2026-09-19

### Added

- Kanban planner: multiple boards, custom columns with optional WIP limits, cards with labels, priority and due dates
- Drag and drop for cards and columns
- Keyboard shortcuts and context menus
- Undo/redo, search and filter
- JSON export/import with local browser storage
- Branding and homepage

[Unreleased]: https://github.com/bugsum/planit/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/bugsum/planit/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/bugsum/planit/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/bugsum/planit/releases/tag/v0.1.0
