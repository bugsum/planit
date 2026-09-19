# Contributing to Plan It

Thanks for helping out! Bug reports, ideas and pull requests are all welcome.

## Setup
Requires [Bun](https://bun.com).

```bash
git clone https://github.com/bugsum/planit.git
cd planit
bun install
bun run dev      # http://localhost:3000
```

Before opening a PR: `bun run lint` and `bun run build` should both pass. Walk through [docs/testing-checklist.md](docs/testing-checklist.md) for anything touching the board UI.

## Workflow
1. Open an issue first for anything large, so we can agree on direction.
2. Fork, then branch from `master` (`feat/...`, `fix/...`, `docs/...`).
3. Keep PRs focused; describe what changed and why, with screenshots for UI changes.

## Guidelines
- TypeScript, no `any` without a reason.
- Persistence goes through `src/helpers/storage.ts` only.
- Read [docs/architecture.md](docs/architecture.md) before adding a new planner.
- Next.js 16 differs from older versions; check `node_modules/next/dist/docs/` when unsure.

By contributing you agree your work is released under the [MIT License](LICENSE).
