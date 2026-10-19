# Salary Management Assessment — Kickoff Brief

Hand this to the agent in the new workspace as the first message, along with the assessment doc
(`Salary Management Assessment- Candidates.docx`, same folder).

## Context
- Take-home for Incubyte, role: Software Craftsperson (Python/React/AI) III.
- Graded on: engineering judgment, product thinking, TDD, incremental commits, and *visible, intentional* AI use.
- Speed matters: earlier submissions get prioritised.
- Persona: HR manager at ACME, 10,000 employees across multiple countries, currently on Excel.

## Deliverables (from the brief)
1. One-page requirements doc **before** any code: goal, scope & features, deliberate exclusions with reasons.
2. End-to-end app: Python backend + relational DB, React UI.
3. Seed script for 10,000 employees.
4. Deployed app + video demo.
5. Meaningful, fast, deterministic unit tests.
6. Incremental commit history showing evolution.
7. Committed artifacts: planning/design notes, architecture diagram, AI prompts/instructions, trade-offs, performance notes.

## Locked decisions
- Repo: `e:\Projects\Clients\Portfolio\salary-management`
- Deploy: API on Render, UI on Vercel (configure CORS for the exact Vercel origin only).
- No AI co-author trailer on commits. AI workflow documented in `CLAUDE.md` and `docs/ai-workflow.md` (prompt log).

## Locked stack
| Layer | Choice | Why |
|---|---|---|
| API | FastAPI + Pydantic v2 | Validation and OpenAPI docs from type hints, lighter than Django, less wiring than Flask |
| ORM / migrations | SQLAlchemy 2.0 + Alembic | Mature, typed, dialect-neutral, versioned schema history |
| Layering | controller → service → repository | Services unit-testable without HTTP or a real DB, one reason to change per file |
| DB prod | Postgres on Neon | Free and persistent, Render free disk is wiped on spin-down |
| DB tests/local | SQLite in-memory | Fresh DB per test in milliseconds, no Docker |
| Dialect safety | CI job running API tests on a Postgres service container | Catches SQLite/Postgres drift before deploy instead of just noting it |
| Money | Integer whole units of annual salary, currency derived from country | Exact, fast aggregates, identical on SQLite and Postgres (SQLite `Numeric` is float-backed). Annual salaries are never quoted in cents |
| FX | Fixed, versioned FX table to USD | Reproducible, testable cross-country insights, no live network dependency |
| Indexes | country, job title | Insights group and filter on these |
| Seed | Batched bulk inserts, fixed random seed | 10k rows in seconds, deterministic demos and perf numbers |
| UI | React + Vite + TypeScript | Role requirement, fast dev server, types generated from OpenAPI |
| Server state | TanStack Query | Caching, loading/error states and invalidation without hand-rolled effects |
| Components | MUI, DataGrid (server mode), X Charts | Accessible components out of the box, paged and sorted on the server, never 10k rows in the browser |
| Filtering | Custom filter bar → query params | Free DataGrid allows one filter only (multi-filter is Pro), keeps filter logic server-side and testable |
| Tests | pytest (service + API), Vitest + React Testing Library + MSW | Fast, deterministic, behaviour-focused |
| Tooling | uv, ruff, GitHub Actions | Reproducible installs, one lint/format tool, CI on every push |
| Hosting | Render (API), Vercel (UI) | Free tiers, CORS restricted to the exact Vercel origin, cold starts noted in README |
| Layout | Monorepo: `backend/`, `frontend/`, `docs/` | One CI workflow, separate jobs |

## Performance principles
- Server-side pagination, sorting and filtering. Never ship 10k rows to the browser.
- Insights as SQL `GROUP BY` aggregates, indexed on country and job title.
- Seed with batched bulk inserts and a fixed random seed (deterministic data).

## Likely feature core
- Employee CRUD (full name, job title, country, currency, salary, plus fields confirmed by HR).
- Insights: min / max / average salary by country, average salary by job title within a country, headcount, distribution.

## Workflow rules
- TDD: red → green → refactor, committed in small steps.
- Ask before committing. Stage and show the diff first.
- Commit messages: lowercase Conventional Commits subject, optional short `-` bullet body.
- Concise one-line comments, no magic strings, no unasked safeguards.
- Every command handed to the user must be PowerShell.

## Open items
1. ~~Confirm Neon Postgres for prod~~ Resolved: Neon Postgres.
2. Clarifying questions sent to HR on 2026-10-17 (`docs/planning/Clarifying Questions for Payroll Mgmt Tool.pdf`). Five questions plus three working assumptions. Awaiting reply. Build continues on the assumptions.

## First step in the new workspace
Write `docs/requirements.md` (one page) and `docs/architecture.md` (diagram + trade-offs), then make the first commit before any code.
