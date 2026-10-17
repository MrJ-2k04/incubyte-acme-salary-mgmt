# ACME Salary Management

A web tool for ACME's HR team to manage salaries for about 10,000 employees across countries, replacing a hand-kept Excel sheet. It covers employee records, pay insights by country and role, and CSV import and export.

**Status:** planning. Clarifying questions are out with HR, and the build follows the working assumptions until answers arrive.

## Stack

- **API:** Python, FastAPI, SQLAlchemy, Alembic, Postgres (Neon)
- **UI:** React, Vite, TypeScript, TanStack Query, MUI
- **Tests:** pytest, Vitest, React Testing Library, MSW
- **Hosting:** Render (API), Vercel (UI)

## Docs

- [Kickoff brief](docs/planning/kickoff-brief.md): context, locked stack and open items
- [Clarifying questions](docs/planning/Clarifying%20Questions%20for%20Payroll%20Mgmt%20Tool.pdf): questions and assumptions sent to HR
