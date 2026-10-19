# AI Workflow

## Tools

- **Claude Code** (Claude Opus) in VS Code, as a pair: planning, drafting docs, writing tests and code, reviewing diffs.
- **Repo rules for the agent** live in `CLAUDE.md`. They hold the TDD loop, commit style and code style, so every session starts with the same rules.

## How AI is used

- **I decide, the agent proposes.** The agent drafts options with reasons. I accept, cut or redirect. Every commit is reviewed by me before it lands.
- **The agent is asked to push back.** It is told to recommend, not list options, and to flag risks in my own ideas.
- **Tests are the check on AI output.** Code is only accepted when a test written first goes from red to green.
- **Corrections become rules.** When I correct the agent's style or approach, the rule is saved to its memory or to `CLAUDE.md`, so the same mistake does not repeat.

## Prompt log

Key prompts and decisions, in order. Wording is trimmed but not changed in meaning.

### 1. Kickoff (planning workspace)

> So I applied in a company the other day that was offering a remote fullstack position and here's the reply I got from their HR. Check salary management assessment doc in Other docs under plan docs. Its an assessment to demonstrate how efficiently I used AI tools like you. Ideally we'd create a well engineered application that is simple yet coherent and cohesive with TDD being followed. I'd probably need to give supporting evidences as well to show my peak efficiency

**Outcome:** the agent read the brief and produced `docs/planning/kickoff-brief.md`: context, deliverables, a proposed stack, performance principles and open questions.

### 2. Stack review

> Explain each tech item and its "why"

**Outcome:** a one-line reason per tool. The agent suggested four changes, and I accepted all of them:
- Run tests on Postgres in CI as well as SQLite, to catch dialect gaps instead of just noting them.
- Store salaries as integers, because SQLite stores `Numeric` as a float.
- Build our own filter bar, because the free MUI DataGrid allows only one filter at a time.
- Use one repo with two folders.

### 3. Product questions

> Lets abstract away and think at a product level. Give me meaningful questions that I would genuinely need as a person who's directly interacting with the client before writing a single line of code.

**Outcome:** the agent wrote 19 questions. I cut them to 4 and gave a reason for each cut. Some were answered by other questions, some were over-engineering at this stage, and some I turned into defaults (archive leavers, CSV export, bulk raise).

The agent pushed back on two points:
- **Import matters more than export.** The first job is getting 10,000 rows out of Excel. I accepted, and CSV import with a row report became a "should have".
- **A keep-alive ping must not touch the database.** Otherwise the free Neon tier never sleeps and burns its compute hours. I accepted, so `/health` never calls the DB.

### 4. Clarifying questions PDF

> If you think there can be 1 more imp question, make a pdf of 5 questions and I'll send them to the HR while we lay the core foundation parallely

**Outcome:** a one-page PDF went through about ten review rounds. My corrections:
- Write in the third person, since the PDF is relayed through HR.
- Drop one question as weak, and add one on fixed versus live exchange rates.
- Add a "working assumptions" section.
- Use simple language with no semicolons.
- Reorder the questions by importance.

Sent on 2026-10-17 as `docs/planning/Clarifying Questions for Payroll Mgmt Tool.pdf`.

### 5. Build while waiting

> how much % of implementation can we do until we get a reply back?

**Outcome:** about 80% of the work does not depend on the answers. The only structural risk is salary history. It is handled by routing every salary change through one service method, so history can be added later in one place.

### 6. Foundation docs

> Let's proceed further until we hear back from the HR

**Outcome:** `docs/requirements.md`, `docs/architecture.md` and this log, plus `CLAUDE.md` for agent rules. While writing the architecture doc, the agent proposed storing salaries in whole currency units instead of cents, since annual salaries are never quoted in cents. I accepted.
