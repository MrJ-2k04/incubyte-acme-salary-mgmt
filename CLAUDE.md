# CLAUDE.md

Working rules for AI agents in this repo. The product is a salary management tool for ACME's HR manager (10,000 employees, many countries). Read `docs/requirements.md` and `docs/architecture.md` before changing behaviour.

## Layout

- `backend/`: FastAPI, SQLAlchemy 2.0, Alembic, pytest, managed with `uv`
- `frontend/`: React, Vite, TypeScript, TanStack Query, MUI, Vitest
- `docs/`: requirements, architecture, AI workflow log, planning notes

## How to work

- **TDD always.** Write one failing test, make it pass with the least code, then refactor. Each step is small enough to commit on its own.
- **Commit in small steps.** Lowercase Conventional Commits, imperative, outcome not mechanism, no trailing period. Example: `feat: archive employees instead of deleting them`. Subject only by default. Never add an AI co-author trailer.
- **Ask before committing, pushing or branching.** Stage and show the diff first.
- **Keep the layers.** Routers handle HTTP only. Services hold rules. Repositories are the only place with queries.
- **Pay changes only in two service methods.** `change_salary` for one person and `raise_salaries` for a group. If HR wants salary history, it is added in those two places.
- **Server-side everything for lists.** Never return unpaged employee lists.

## Code style

- Comments are one line, only for a non-obvious why. No banner blocks, no references to docs or ticket IDs.
- No magic strings. Paths, status values and reference lists are named constants.
- No safeguards, fallbacks or compatibility layers nobody asked for.
- Smallest change that solves the problem. Extract a helper only when a second caller exists.

## Tests

- Fast and deterministic. No network, no real clock, no random data without a fixed seed.
- Service tests run against a fresh in-memory SQLite database per test.
- API tests use FastAPI's `TestClient`. Frontend tests use React Testing Library with MSW.
- Test names read as behaviour: `test_archived_employees_are_excluded_from_insights`.

## Writing

- Plain, simple language. No semicolons in docs, comments or commit messages.
- Commands handed to the user are PowerShell.
