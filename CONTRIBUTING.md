# Contributing to Plan It

Thanks for helping out! Bug reports, ideas and pull requests are all welcome.

## Setup

Requires [Bun](https://bun.com).

```bash
git clone https://github.com/bugsum/planit.git
cd planit
bun install      # also installs the git hooks
bun run dev      # http://localhost:3000
```

## Scripts

| Command                                      | What it does                                    |
| -------------------------------------------- | ----------------------------------------------- |
| `bun run lint`                               | ESLint (Next rules plus the project rules)      |
| `bun run format` / `format:check`            | Prettier, including Tailwind class sorting      |
| `bun run typecheck`                          | Generates Next route types, then `tsc --noEmit` |
| `bun run build`                              | Production build                                |
| `bun run version:bump <major\|minor\|patch>` | Bumps the version and dates the changelog       |

## Git hooks

Installed by `bun install` (Husky):

- **pre-commit**: ESLint `--fix` and Prettier on staged files. Commits with lint
  errors or warnings are rejected.
- **commit-msg**: the message must follow [Conventional Commits](https://www.conventionalcommits.org/).
- **pre-push**: type check.

Don't bypass them with `--no-verify`; CI runs the same checks and will fail.

## Commits and PR titles

Conventional Commits with a lowercase subject, at most 100 characters:

```
feat(kanban): add swimlanes
fix: keep the selection after undo
docs: explain the storage adapter
```

Types: `feat`, `fix`, `perf`, `refactor`, `style`, `test`, `docs`, `build`,
`ci`, `chore`, `revert`. Add `!` for breaking changes (`feat!: ...`).

Pull requests are **squash-merged**, so the PR title becomes the commit on
`master` and has to follow the same format.

## Versioning

Every change that lands on `master` bumps the version ([SemVer](https://semver.org/)):

- `feat` → minor
- `fix`, `perf`, `refactor`, `docs`, `chore` and the rest → patch
- breaking (`!`) → major (minor while the version is below 1.0)

In your branch, add notes under `## [Unreleased]` in `CHANGELOG.md`
([Keep a Changelog](https://keepachangelog.com/en/1.1.0/) sections: Added,
Changed, Fixed, Removed), then run `bun run version:bump <level>`. The script
moves the notes under the new version with today's date. When the PR merges, a
workflow tags `v<version>` and publishes a GitHub release with those notes.

## Pull requests

1. Open an issue first for anything large, so we can agree on direction.
2. Fork and branch from `master` (`feat/...`, `fix/...`, `docs/...`).
3. Keep PRs focused. Fill in "What & why", and add screenshots for UI changes.

Required checks before merge:

- **Quality**: lint (zero warnings), formatting, types and build.
- **PR hygiene**: Conventional title, a version bump that matches the change
  type, a changelog entry for it, and a filled-in description.

Plus an approving review from the code owner, with all conversations resolved.
PRs inactive for 21 days are marked stale and closed 7 days later.

## Code guidelines

- TypeScript, no `any`. Type-only imports use `import type`.
- Persistence goes through `src/helpers/storage.ts` only; ESLint blocks
  `localStorage`/`sessionStorage` anywhere else.
- No `console.log` in app code (`console.warn`/`console.error` are fine).
- Keep the structure flat: `app/` routes, `components/<feature>/`, `store/`,
  `helpers/`, `types/`. Read [docs/architecture.md](docs/architecture.md)
  before adding a planner.
- Next.js 16 differs from older versions; check `node_modules/next/dist/docs/`
  when unsure.
- UI changes: update [docs/testing-checklist.md](docs/testing-checklist.md).

By contributing you agree your work is released under the [MIT License](LICENSE).
