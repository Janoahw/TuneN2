# TuneN2

Music marketplace monorepo: artists upload and sell songs, fans discover, buy, and download them.

- `backend/` — Express + Prisma + PostgreSQL + Redis + BullMQ
- `mobile/` — Expo / React Native / Expo Router
- `admin/` — React + Vite web dashboard
- `packages/shared` — cross-app types and Zod schemas

Package manager is `pnpm` (workspaces + Turborepo). Node `>=22`.

## Working agreements

- **Plan before implementing.** For any feature or non-trivial change, lay out the plan and get confirmation before writing code.
- **Design is a contract.** Never invent a screen layout — check `design/tuneN2-mobile.pen` first. See the Pencil instructions below.
- **Keep the trackers current.** `docs/sprint_progress.md` after any sprint work, `redesign_work.md` after mobile UI work, `docs/test_suite.md` after any test work.

## Project instructions (always apply)

@.github/instructions/sprint-workflow.instructions.md
@.github/instructions/backend-conventions.instructions.md
@.github/instructions/mobile-conventions.instructions.md
@.github/instructions/pencil-design.instructions.md
@.github/instructions/error-fix-template.instructions.md

## Key docs

| Doc | Purpose |
|---|---|
| `docs/plan.md` | Product decisions, roles, permissions |
| `docs/mvp_scope.md` | What ships in MVP vs deferred |
| `docs/build_plan.md` | Sprint-by-sprint task breakdown (S0–S12) |
| `docs/sprint_progress.md` | Live status of every sprint |
| `docs/system_design.md` | Architecture and data model |
| `docs/design_system.md` | Colors, typography, spacing tokens |
| `docs/screens.md` | Full screen inventory (mobile + admin) |
| `docs/test_suite.md` | Test + security coverage tracker |
| `redesign_work.md` | Mobile redesign implementation tracker |
