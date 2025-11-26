# Repository Guidelines

## Project Structure & Module Organization
- Monorepo root: `packages/` (core library `viyv-claude-plugin-core`), `apps/portal/` (Next.js docs site), `examples/` (basic-usage, full-coverage), `docs/` (markdown guides).
- Core source: `packages/core/src/`; tests live beside in `packages/core/tests/`.
- Portal pages/components: `apps/portal/src/app/`, `apps/portal/src/components/`.
- Shared configs: `tsconfig.base.json`, `pnpm-workspace.yaml`, root `package.json`.

## Build, Test, and Development Commands
- Install deps: `pnpm install`
- Build all: `pnpm build` (runs `pnpm -r build`)
- Core only: `pnpm --filter viyv-claude-plugin-core build`
- Portal: `pnpm --filter portal build`
- Tests (all): `pnpm test`
- Core tests + coverage: `pnpm --filter viyv-claude-plugin-core test -- --coverage`
- Dev portal: `pnpm --filter portal dev`

## Coding Style & Naming Conventions
- TypeScript first; modules are ESM.
- Indent 2 spaces; avoid trailing whitespace.
- Use descriptive kebab-case for plugin IDs and file paths (e.g., `skills/add/SKILL.md`).
- Lint/format: `eslint` + `prettier`; prefer `pnpm lint` / `pnpm format` if defined, otherwise run `eslint .` and `prettier --check .`.

## Testing Guidelines
- Framework: Vitest in `packages/core`.
- Aim to keep coverage at or above current baseline (~99% lines for core); add tests for new paths and error cases.
- Name tests with `.spec.ts` under `packages/core/tests/`; keep Arrange/Act/Assert clear.
- Run `pnpm --filter viyv-claude-plugin-core test -- --coverage` before PRs affecting core logic.

## Commit & Pull Request Guidelines
- Commit messages: concise imperative style (e.g., `Add adapter coverage`, `Fix portal hero copy`).
- Include scope in body if change spans multiple packages (core/portal/examples).
- PRs should contain: brief summary, affected packages, test results (command output), and screenshots for portal UI changes.
- Link related issues/tickets when available; keep PRs focused and small when possible.

## Security & Configuration Tips
- No secrets in repo; prefer env vars for any future API keys. Check `.env*` into `.gitignore`.
- For CI or local overrides, set `CLAUDE_PLUGIN_ROOT` to an isolated path to avoid writing to user home during tests.
