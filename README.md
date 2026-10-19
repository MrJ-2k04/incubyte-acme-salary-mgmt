# ACME Salary Management

A web tool for ACME's HR team to manage salaries for about 10,000 employees across countries, replacing a hand-kept Excel sheet. It covers employee records, pay insights by country and role, and CSV import and export.

**Status:** all "must have" features plus CSV import and export are built and tested. Bulk raise is next. Clarifying questions are out with HR, and the build follows the working assumptions until answers arrive.

## Seed data

```powershell
cd backend
uv run alembic upgrade head
uv run python -m app.seed   # replaces all employees with 10,000 generated ones
```

## Stack

- **API:** Python, FastAPI, SQLAlchemy, Alembic, Postgres (Neon)
- **UI:** React, Vite, TypeScript, TanStack Query, MUI
- **Tests:** pytest, Vitest, React Testing Library, MSW
- **Hosting:** Render (API), Vercel (UI)

## Run locally

Needs [uv](https://docs.astral.sh/uv/) and Node 24.

```powershell
# API on http://localhost:8000 (docs at /docs)
cd backend
uv sync
uv run uvicorn app.main:app --reload

# UI on http://localhost:5173
cd frontend
npm install
npm run dev
```

## Test

```powershell
cd backend; uv run pytest
cd frontend; npm test
```

## Branches

- `develop`: day-to-day work. CI runs on every push.
- `production`: what is deployed. Changes arrive by pull request from `develop`, and deploy only after CI passes.

## Docs

- [Requirements](docs/requirements.md): goal, scope, assumptions and what is left out
- [Architecture](docs/architecture.md): diagrams, data model, API, trade-offs and performance
- [AI workflow](docs/ai-workflow.md): how AI tools are used, with a prompt log
- [Kickoff brief](docs/planning/kickoff-brief.md): context, locked stack and open items
- [Clarifying questions](docs/planning/Clarifying%20Questions%20for%20Payroll%20Mgmt%20Tool.pdf): questions and assumptions sent to HR
