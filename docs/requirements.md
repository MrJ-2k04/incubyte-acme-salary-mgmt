# Requirements

## Goal

ACME's HR manager keeps salary data for 10,000 employees across several countries in Excel by hand. This tool replaces that sheet with a web app where HR can keep salary records correct and answer "how do we pay people?" in seconds.

**Success looks like:** a pay question that used to need a pivot table is answered on one screen, and no salary is ever lost to a bad edit or a stale copy.

## User

One HR manager, the only person who uses the tool. They know the data well and are comfortable with Excel, but are not technical.

## Scope and features

**Must have**

1. **Employee records.** Add, view, edit and archive employees. Fields: full name, email, job title, department, country, annual salary and hire date. Currency comes from the country, so it can never mismatch.
2. **Find anyone fast.** Search by name or email. Filter by country, job title and department. Sort by any column. Pages of results, never all 10,000 rows at once.
3. **Pay insights.**
   - Per country: headcount and min, max and average salary.
   - Per job title within a country: headcount and average salary.
   - Salary distribution as a chart, for one country or the whole org.
   - Org-wide totals in one reporting currency (USD).
4. **Valid data only.** Required fields, a valid email that is unique, a salary above zero, and countries and departments from fixed lists.
5. **Seed data.** A script that loads 10,000 realistic employees. The same data every run.

**Should have**

6. **CSV import** of the existing sheet, with a row-by-row report of anything rejected.
7. **CSV export** of the current filtered list.
8. **Bulk raise.** Apply a percentage raise to a filtered group, with a preview before saving.

## Working assumptions

Clarifying questions went to HR on 2026-10-17. Until answers come back, the build follows these assumptions. Each one is cheap to change later.

| Question | Assumption |
|---|---|
| Which pay questions matter most? | The insights listed above |
| What does one employee row look like? | The fields listed above |
| Who uses the tool? | Only the HR manager |
| Fixed or live exchange rates? | Fixed rates, stored with the app |
| Is the old salary needed after a change? | No. Only the current salary is kept |

Employees who leave are archived, not deleted, and are left out of insights.

## Deliberately left out

| Left out | Reason |
|---|---|
| Logins and roles | One trusted user is assumed. It can be added as a layer around the API if HR says otherwise. |
| Salary history | Assumed not needed. Every salary change goes through one place in the code, so history can be added there without a rewrite. |
| Live exchange rates | Fixed rates keep reports stable and tests repeatable. Swapping in a live source changes one component. |
| Payroll, payslips and tax | That is a separate product. The problem is managing salary data, not paying it. |
| Bonus, equity and allowances | Base salary is what the problem describes. More pay parts can be added as new fields. |
| Approval workflows and audit log | Not needed for a single user. |
| Integrations with other HR systems | No system was named. The API is documented, so it can be connected later. |
