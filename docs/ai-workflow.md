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

### 7. Branches and CI/CD

> I'd like to have production as the prod branch and develop as the development branch.

> If I give you the cli access of both vercel and render, can you do every configuration?

**Outcome:** two long-lived branches, `develop` (default) and `production`. I logged in to the Render, Vercel and Neon CLIs myself, and the agent did the rest:
- Created the Render service, the Vercel project and the Neon database, all in Singapore.
- Picked the Render workspace with no live free service, so the always-on API stays inside the free hours.

Problems found on the way, and how they were solved:
- **Agent mistake:** Git Bash on Windows rewrote `/health` into `/Program Files/Git/health` when passed to the Render CLI. The deploy hung on a failing health check. The agent read the logs, found the cause and fixed it. It now disables path conversion for CLI calls.
- **GitHub did not start CI on push.** The agent traced it to GitHub not recording push events for this repo. It added a manual trigger and runs CI that way until this is resolved.
- **Some setup was blocked on purpose.** The agent tried to read the Render CLI's stored token to call the API directly, and Claude Code's safety check refused. The two settings that needed it were left for me to set in the dashboards.

### 8. Building while waiting for HR

> Do as much as you can, then I'll take the driver seat later

**Outcome:** the backend and UI for every "must have" were built test-first, in red and green commits:
- **Employees:** create, edit, archive and restore. Rules: unknown countries are rejected, and emails are unique ignoring case.
- **Employee list:** paged, searchable, filterable and sortable.
- **Insights:** pay by country, by job title within a country, an org summary in USD, and salary distribution.
- **Seed:** 10,000 employees from a fixed seed.
- **UI:** an employee table with a form dialog, and an insights page with charts.

Agent decisions I reviewed:
- **Dropped the MUI DataGrid** for a plain table. The free grid allows one filter at a time and does not render rows in jsdom tests.
- **Wrote API types by hand,** because `openapi-typescript` does not support TypeScript 6 yet.
- **Bucketed salaries with `CASE` sums** instead of `floor()`, so the same SQL runs on SQLite and Postgres.

Agent mistakes caught by tooling:
- A commit missed a lint fix. CI caught it, and the agent now runs the full lint before every commit.
- A test matched a label exactly, and MUI adds " *" to required fields. The test failed, and the agent switched to matching labels by their start.

### 9. First production release, and a slow seed

> The script was taking long so I pressed ctrl+c and it failed.

**Outcome:** the agent first checked the data, not the error text:
- **No damage.** The seed runs in one transaction, so the cancelled run had rolled back and the table was empty.
- **Measured the cause.** Row-by-row inserts cost a network trip each against Neon: 5.0 s per 1,000 rows. One multi-row INSERT took 0.4 s for the same rows.
- **Fixed and seeded.** After the change, the full seed took 4 seconds.

The local SQLite tests could not show this, because there is no network locally. The lesson went into the import design that came next.

### 10. CSV import and export

> Add the CSV import / exports.

**Outcome:** both built test-first:
- **Export** downloads the list exactly as filtered and sorted.
- **Import** adds every valid row and reports each bad row by line number and reason. It checks emails with one query for the whole file.

One test issue came up. Reading an uploaded file body through MSW hangs under jsdom. The agent showed this by removing the body read and seeing the test pass. The frontend test now checks that the upload is multipart, and the backend tests cover parsing the file.

### 11. A modern UI on its own branch

> Lets make the UI super modern and sexy. Create a worktree and a feature branch for the ui, lets see it working in the localhost so we can go back and forth before actual deployment or merge.

> Centralize the theme so I can change the color palettes any time. Don't use purple. Make the dark mode a little less dark. Make the insights the first page and call it dashboard, and open the employee list when an insight is clicked. Think more creatively about archived employees. Add a product tour for new visitors. Keep the theme switch and the user details at the foot of the sidebar like Vercel.

**Outcome:** the work ran in a separate git worktree on `feature/modern-ui`, so `develop` stayed untouched while I reviewed it on localhost. Each change landed as its own commit, with a test commit first wherever behaviour changed:
- **One palette file.** Every colour comes from `theme/palettes.ts`. Changing one line swaps the whole app between petrol teal, cobalt and graphite. Dark mode is charcoal, not black.
- **Dashboard first.** Countries, chart bars, job titles and the headcount card all open the employee list already filtered. Filters live in the address, so these links are also shareable.
- **Archive as a product feature.** The "Show archived" switch became Active, Archived and All views with live counts. Archiving shows an Undo toast, and an empty archive explains why archiving beats deleting. The API swapped `include_archived` for `status`.
- **Sidebar and tour.** The theme choice (light, dark or system, system by default) and the user sit at the foot of the sidebar. First-time visitors get a spotlight tour across both pages, and can replay it from the top bar.

Agent decisions I reviewed:
- **Built the tour by hand** instead of adding a tour library. It follows the app theme, needs no new dependency, and the tests can drive it.
- **Counted each view with a one-row query,** so the tab counts come from the same filtered SQL as the list.

Agent mistakes caught by tooling:
- A Python edit on Windows wrote one character in the wrong encoding. The linter refused the file, and the agent fixed the byte and moved to UTF-8 edits.
- A tour check passed when both sides were empty, then crashed. The tour tests failed, and the agent fixed the check.

### 12. Polishing the employee screen

> Remove double scroll from employees table. Have a footer showing copyright of webwizards.in. The department should come first and based on that, the job title options are configured. Keep the email text a bit secondary. Actions like archiving should ask for confirmations. While searching, add some debounce, or at least don't steal the focus on each character. Show the theme settings only behind three dots, like Vercel.

**Outcome:** each item landed as its own commit, test first where behaviour changed:
- **Department first.** The API now returns job titles grouped by department, and both the filter bar and the form offer only the titles of the chosen department. Picking another department clears a title that no longer fits.
- **Search waits for a pause.** The box keeps its own text and updates the address 300 ms after typing stops, so it never loses focus and partial words never reach the API.
- **Archiving asks first,** and the Undo toast stays as a second safety net.
- **Account menu.** The theme switch and the tour moved behind a "⋯" button next to the user, as in Vercel.

Agent mistakes caught by tooling:
- The delayed search used the address from the render that started the timer, which wiped a country picked in between. An existing filter test failed, and the agent made the timer use the latest address.
