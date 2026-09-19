<!--
Title: Conventional Commits, lowercase — e.g. "feat(kanban): add swimlanes" or
"fix: keep selection after undo". It becomes the squash commit on master.
-->

## What & why

<!-- A sentence or two. PR checks fail while this section is empty. -->

## Screenshots (UI changes)

## Checklist

- [ ] Notes added under `## [Unreleased]` in `CHANGELOG.md`, then `bun run version:bump <major|minor|patch>`
- [ ] `bun run lint`, `bun run typecheck` and `bun run build` pass
- [ ] Walked through the relevant parts of `docs/testing-checklist.md` (and updated it if behavior changed)
- [ ] Linked the issue this closes, if there is one
