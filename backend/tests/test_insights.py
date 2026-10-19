import pytest

from app.employees.service import EmployeeService
from app.insights.router import INSIGHTS_PATH
from app.insights.service import InsightsService
from app.reference import Department
from tests.factories import employee_data


@pytest.fixture
def staff(session):
    employees = EmployeeService(session)
    people = [
        ("IN", "Software Engineer", 2_000_000),
        ("IN", "Software Engineer", 3_000_000),
        ("IN", "Accountant", 1_000_000),
        ("US", "Software Engineer", 150_000),
        ("US", "Designer", 100_000),
        ("FR", "Designer", 60_000),
    ]
    created = [
        employees.create(
            employee_data(
                email=f"person{index}@acmecorp.com",
                country_code=country,
                job_title=title,
                department=Department.ENGINEERING,
                salary=salary,
            )
        )
        for index, (country, title, salary) in enumerate(people)
    ]
    employees.archive(created[-1].id)
    return InsightsService(session)


def test_country_insights_summarise_active_pay_per_country(staff):
    rows = {row.country_code: row for row in staff.by_country()}

    assert set(rows) == {"IN", "US"}
    india = rows["IN"]
    assert (india.headcount, india.min_salary, india.max_salary) == (3, 1_000_000, 3_000_000)
    assert india.avg_salary == 2_000_000
    assert india.avg_salary_usd == 24_000
    assert india.currency == "INR"


def test_country_insights_list_largest_headcount_first(staff):
    assert [row.country_code for row in staff.by_country()] == ["IN", "US"]


def test_job_title_insights_within_a_country(staff):
    rows = staff.by_job_title("IN")

    assert [(r.job_title, r.headcount, r.avg_salary) for r in rows] == [
        ("Software Engineer", 2, 2_500_000),
        ("Accountant", 1, 1_000_000),
    ]


def test_summary_reports_org_wide_totals_in_usd(staff):
    summary = staff.summary()

    assert summary.headcount == 5
    assert summary.countries == 2
    assert summary.total_payroll_usd == 322_000
    assert summary.avg_salary_usd == 64_400


def test_distribution_for_a_country_uses_local_currency(staff):
    result = staff.distribution("US")

    assert result.currency == "USD"
    assert sum(b.count for b in result.buckets) == 2
    assert result.buckets[0].lower == 100_000
    assert result.buckets[-1].upper == 150_000
    assert result.buckets[0].count == result.buckets[-1].count == 1


def test_distribution_for_the_whole_org_counts_everyone_in_usd(staff):
    result = staff.distribution()

    assert result.currency == "USD"
    assert sum(b.count for b in result.buckets) == 5


def test_distribution_is_empty_when_nobody_matches(staff):
    assert staff.distribution("JP").buckets == []


def test_insights_endpoints(client, staff):
    assert client.get(f"{INSIGHTS_PATH}/countries").json()[0]["country_code"] == "IN"
    assert client.get(f"{INSIGHTS_PATH}/countries/IN/job-titles").json()[0]["headcount"] == 2
    assert client.get(f"{INSIGHTS_PATH}/summary").json()["headcount"] == 5
    assert client.get(f"{INSIGHTS_PATH}/distribution", params={"country": "US"}).status_code == 200
